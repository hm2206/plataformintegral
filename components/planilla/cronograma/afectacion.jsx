import React, { useContext, useState, useEffect } from 'react';
import { unujobs, microPlanilla } from '../../../services/apis';
import { Form, Checkbox } from 'semantic-ui-react';
import Show from '../../show';
import Swal from 'sweetalert2';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import Skeleton from 'react-loading-skeleton';
import { useMemo } from 'react';

const PlaceHolderInput = ({ count = 1, height = "38px" }) => <Skeleton height={height} count={count}/>

const InputCustom = ({ type = 'text', title, value, name, errors = {}, md = "3", readOnly = false, onChange = null, children = null }) => {
  const displayError = (text) => {
    return errors?.[text]?.[0] || '';
  }

  return (
    <Form.Field className={`col-md-${md} mb-2`}
      error={displayError(name) ? true : false}
    >
      <b>{title}</b>
      {children
        ? children :
        <input type={type}
          className={readOnly ? null : 'input-active'}
          name={name}
          readOnly={readOnly}
          onChange={({ target }) => typeof onChange == 'function' ? onChange(target) : null}
          value={value}
        />
      }
      <label>{displayError(name)}</label>
    </Form.Field>
  )
}

const CheckboxCustom = ({ title, checked, name, errors, readOnly, onChange = null, md = "3" }) => {

  return (
    <InputCustom
      title={title}
      errors={errors}
      md={md}
    >
      <div className='mt-2'>
        <Checkbox toggle
          name={name}
          disabled={readOnly}
          onChange={(e, obj) => typeof onChange == 'function'
            ? onChange({ ...obj, value: obj.checked })
            : null
          }
          checked={checked}
        />
      </div>
    </InputCustom>
  )
}

const TexareaCustom = ({ title, value, name, errors, readOnly, onChange = null, md = "9" }) => {
  return (
    <InputCustom
      title={title}
      errors={errors}
      md={md}
    >
      <textarea rows={4}
        name={name}
        value={value}
        readOnly={readOnly}
        onChange={({ target }) => typeof onChange == 'function' ? onChange(target) : null}
      />
    </InputCustom>
  )
}

const Afectacion = () => {

  const { cronograma, historial, setHistorial, setBlock, edit, setEdit, send, setSend, setIsEditable, setIsUpdatable, loading, cancel, setRefresh } = useContext(CronogramaContext);
  const [old, setOld] = useState({});
  const [errors, setErrors] = useState({});
  const [currentContract, setCurrentContract] = useState({});
  const [currentPim, setCurrentPim] = useState({});
  const [currentTypeCargo, setCurrentTypeCargo] = useState({});
  
  // app
  const app_context = useContext(AppContext);

  // memos
  const displayAfp = useMemo(() => {
    if (!historial?.afp?.private) return historial?.afp?.name;
    return `${historial?.afp?.name} ${historial?.afp?.typeAfp}`;
  }, [historial?.afp]);

  const displayPim = useMemo(() => {
    return `Meta ${currentPim?.code} [${currentPim?.cargo?.extension}]`;
  }, [currentPim]);

  const displayMeta = useMemo(() => {
    return `${currentPim?.code}.- ${currentPim?.meta?.name}`;
  }, [currentPim]);

  const displayPayToDay = useMemo(() => {
    return `${historial?.days} / ${cronograma?.numberOfDays}`;
  }, [historial]);

  // change inputs
  const handleInput = ({ name, value }) => {
    let newForm = Object.assign({}, historial);
    newForm[name] = value;
    setHistorial(newForm);
    let newErrors = Object.assign({}, errors);
    newErrors[name] = [];
    setErrors(newErrors);
  }

  // actualizar historial
  const updateHistorial = async () => {
    app_context.setCurrentLoading(true);
    let form = Object.assign({}, historial);
    form._method = 'PUT';
    await unujobs.post(`historial/${historial.id}`, form, { headers: { CronogramaID: historial.cronograma_id } })
      .then(async res => {
        app_context.setCurrentLoading(false);
        let { success, message } = res.data;
        if (!success) throw new Error(message);
        await Swal.fire({ icon: 'success', text: message });
        setEdit(false);
        setErrors({});
        setRefresh(true);
      }).catch(err => {
        try {
          app_context.setCurrentLoading(false);
          let { message, errors } = err.response.data;
          setErrors(errors);
          Swal.fire({ icon: 'warning', text: 'Datos incorrectos' });
        } catch (error) {
          Swal.fire({ icon: 'error', text: err.message });
        }
      });
    setSend(false);
    setBlock(false);
  }

  // obtener datos
  const findContract = async () => {
    await microPlanilla.get(`contracts/${historial?.info?.contractId}`)
      .then(async res => {
        const contract = res.data;
        setCurrentContract(contract);
        await findTypeCargoToContract(contract?.typeCategory?.typeCargoId);
      })
      .catch(() => setCurrentContract({}))
  }

  // obtener pim
  const findPim = async () => {
    await microPlanilla.get(`pims/${historial?.pimId}`)
      .then(res => setCurrentPim(res.data))
      .catch(() => setCurrentPim({}))
  }

  // obtener typeCargo
  const findTypeCargoToContract = async (id) => {
    await microPlanilla.get(`typeCargos/${id}`)
      .then(res => setCurrentTypeCargo(res.data))
      .catch(() => setCurrentTypeCargo({}))
  }

  // obtener contract
  useEffect(() => {
    if (!historial?.id) {
      setCurrentContract({});
      setCurrentPim({});
      return;
    }
    // default
    findContract();
    findPim()
  }, [historial?.id])

  // primera carga o cada cambio de historial
  useEffect(() => {
    setIsEditable(true);
    setIsUpdatable(true);
    if(historial.id) {
      setBlock(false);
      setOld(JSON.parse(JSON.stringify(historial)));
    }
  }, [historial.id]);

  // cancelar edit
  useEffect(() => {
    if (cancel) setHistorial(old);
  }, [cancel]);

  // update historial
  useEffect(() => {
    if (send) updateHistorial();
  }, [send]);

  // render
  return (
    <Form className="row" id="form-afectacion">
      <InputCustom
        title="Ley Social"
        name="leySocial"
        value={displayAfp}
        readOnly={true}
      />

      <InputCustom
        title="N° Cussp"
        name="numberOfCussp"
        value={historial?.numberOfCussp}
        errors={errors}
        readOnly={!edit}
        onChange={handleInput}
      />

      <InputCustom
        type="date"
        title="Fecha de Afiliación"
        name="affiliationOfDate"
        value={historial?.affiliationOfDate}
        errors={errors}
        readOnly={!edit}
        onChange={handleInput}
      />

      <CheckboxCustom
        title="Prima Seguro"
        name="isPrimaSeguro"
        checked={historial?.isPrimaSeguro}
        onChange={handleInput}
        readOnly={!edit}
      />

      <InputCustom
        type="date"
        title="Fecha de Ingreso"
        name="dateOfAdmission"
        value={currentContract?.dateOfAdmission}
        readOnly={true}
      />

      <InputCustom
        type="date"
        title="Fecha de Cese"
        name="terminationDate"
        value={currentContract?.terminationDate}
        readOnly={true}
      />

      <InputCustom
        title="N° Autogenerado"
        name="numberOfEssalud"
        value={historial?.numberOfEssalud}
        errors={errors}
        readOnly={!edit}
        onChange={handleInput}
      />

      <InputCustom
        title="Plaza"
        name="plaza"
        value={historial?.plaza || null}
        errors={errors}
        readOnly={!edit}
        onChange={handleInput}
      />

      <InputCustom
        title="Tip. Trabajador"
        name="name"
        value={currentTypeCargo?.name}
        readOnly={true}
      />

      <InputCustom
        title="Condición"
        name="condition"
        value={currentContract?.condition}
        readOnly={true}
      />

      <InputCustom
        title="Tip. Categoría"
        name="name"
        value={currentContract?.typeCategory?.name}
        readOnly={true}
      />

      <InputCustom
        title="PIM"
        name="pim"
        value={displayPim}
        readOnly={true}
      />

      <InputCustom
        title="Meta"
        name="meta"
        value={displayMeta}
        readOnly={true}
      />

      <InputCustom
        md="6"
        title="Partición Presup."
        name="description"
        value={currentPim?.cargo?.description}
        readOnly={true}
      />

      <InputCustom
        title="Extensión Presup."
        name="extension"
        value={currentPim?.cargo?.extension}
        readOnly={true}
      />

      <InputCustom
        md="6"
        title="Dependencia/Oficina"
        name="name"
        value={currentContract?.dependency?.name}
        readOnly={true}
      />

      <InputCustom
        title="Perfil Laboral"
        name="name"
        value={currentContract?.profile?.name}
        readOnly={true}
      />

      <InputCustom
        title="Dias Lab."
        name="extension"
        value={displayPayToDay}
        readOnly={true}
      />

      <InputCustom
        title="Banco"
        name="name"
        value={historial?.bank?.name}
        readOnly={true}
      />

      <InputCustom
        md="6"
        title="N° Cuenta"
        name="numberOrAccount"
        value={historial?.numberOrAccount || null}
        readOnly={!edit}
        onChange={handleInput}
      />

      <CheckboxCustom
        title="Pago en cheque"
        name="isCheck"
        checked={historial?.isCheck}
        onChange={handleInput}
        readOnly={!edit}
      />

      <div className="col-12">
        <div className="row">
          <div className="col-md-9">
            <TexareaCustom
              md="12"
              title="Observación"
              name="observation"
              value={historial?.observation || null}
              readOnly={!edit}
              onChange={handleInput}
            />
          </div>
          <div className="col-md-3">
            <CheckboxCustom
              md="12"
              title="Remunerado"
              name="isPay"
              checked={historial?.isPay}
              onChange={handleInput}
              readOnly={!edit}
            />
            
            <CheckboxCustom
              md="12"
              title="Enviar a correo"
              name="isPay"
              checked={historial?.info?.isEmail}
              readOnly={true}
            />
          </div>
        </div>
      </div>

    </Form>
  )
}


export default Afectacion;
