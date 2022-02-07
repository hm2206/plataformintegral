import React, { useContext, useState, useEffect } from 'react';
import { microPlanilla } from '../../../services/apis';
import { Form, Checkbox } from 'semantic-ui-react';
import { SelectPim } from '../../select/micro-planilla';
import Swal from 'sweetalert2';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import Skeleton from 'react-loading-skeleton';
import { useMemo } from 'react';
import Show from '../../show';

const PlaceHolderInput = ({ count = 1, height = "38px" }) => <Skeleton height={height} count={count}/>

const InputCustom = ({ type = 'text', title, value, name, errors = {}, md = "3", readOnly = false, onChange = null, children = null, loading = false }) => {
  const displayError = (text) => {
    return errors?.[text]?.[0] || '';
  }

  return (
    <Form.Field className={`col-md-${md} mb-2`}
      error={displayError(name) ? true : false}
    >
      <b>{title}</b>
      <Show condicion={!loading}
        predeterminado={<PlaceHolderInput/>}
      >
        {children
          ? children :
          <input type={type}
            className={readOnly ? null : 'input-active'}
            name={name}
            readOnly={readOnly}
            onChange={({ target }) => typeof onChange == 'function' ? onChange(target) : null}
            value={value || ''}
          />
        }
        <label>{displayError(name)}</label>
      </Show>
    </Form.Field>
  )
}

const CheckboxCustom = ({ title, checked, name, errors, readOnly, onChange = null, md = "3", loading = false }) => {

  return (
    <InputCustom
      title={title}
      errors={errors}
      md={md}
      loading={loading}
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

const TexareaCustom = ({ title, value, name, errors, readOnly, onChange = null, md = "9", loading = false }) => {
  return (
    <InputCustom
      title={title}
      errors={errors}
      md={md}
      loading={loading}
    >
      <textarea rows={4}
        className={readOnly ? '' : 'input-active'}
        name={name}
        value={value || ''}
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
  const [currentPim, setCurrentPim] = useState({});
  const [currentTypeCargo, setCurrentTypeCargo] = useState({});

  // app
  const app_context = useContext(AppContext);

  // memos
  const displayContract = useMemo(() => {
    return historial?.info?.contract || {}
  }, [historial])

  const displayAfp = useMemo(() => {
    return historial?.afp || {}
  }, [historial?.afp]);

  const displayPim = useMemo(() => {
    return `Meta ${currentPim?.code} [${currentPim?.cargo?.extension}]`;
  }, [currentPim]);

  const displayMeta = useMemo(() => {
    return `${currentPim?.code}.- ${currentPim?.meta?.name}`;
  }, [currentPim]);

  // change inputs
  const handleInput = ({ name, value }) => {
    let newForm = Object.assign({}, historial);
    newForm[name] = value;
    setHistorial(newForm);
    let newErrors = Object.assign({}, errors);
    newErrors[name] = [];
    setErrors(newErrors);
  }

  // change int
  const handleIntToInput = ({ name, value }) => {
    if (!value) return handleInput({ name, value });
    const newValue = parseInt(`${value}`);
    handleInput({ name, value: newValue });
  }

  // actualizar historial
  const updateHistorial = async () => {
    app_context.setCurrentLoading(true);
    let payload = Object.assign({}, {});
    payload.pimId = parseInt(`${historial?.pimId}`);
    payload.days = parseInt(`${historial?.days}`);
    payload.bankId = parseInt(`${historial?.bankId}`);
    payload.numberOfAccount = historial?.numberOfAccount || '';
    payload.isCheck = historial.isCheck == true;
    payload.isPay = historial.isPay == true;
    payload.observation = historial?.observation || '';
    await microPlanilla.put(`historials/${historial?.id}`, payload, { headers: { CronogramaId: cronograma.id } })
      .then(async () => {
        app_context.setCurrentLoading(false);
        await Swal.fire({
          icon: 'success',
          text: 'Los cambios se guardarón correctamente!'
        });
        // procesar cronograma
        setEdit(false);
        setErrors({});
        setRefresh(true);
      }).catch(err => {
        app_context.setCurrentLoading(false);
        setErrors(err?.response?.data?.errors || {});
        Swal.fire({
          icon: 'error',
          text: 'No se pudo guardar los datos'
        });
      });
    setSend(false);
    setBlock(false);
  }

  // obtener pim
  const findPim = async () => {
    await microPlanilla.get(`pims/${historial?.pimId}`)
      .then(res => setCurrentPim(res.data))
      .catch(() => setCurrentPim({}))
  }

  // obtener contract
  useEffect(() => {
    if (!historial?.id) {
      setCurrentPim({});
      return;
    }
    // default
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
        value={`${displayAfp.name} ${displayAfp.isPrivate ? displayAfp.typeAfp : ''}`}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        title="N° Cussp"
        name="numberOfCussp"
        value={historial?.numberOfCussp}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        type="date"
        title="Fecha de Afiliación"
        name="affiliationOfDate"
        value={historial?.affiliationOfDate}
        readOnly={true}
        loading={loading}
      />

      <CheckboxCustom
        title="Prima Seguro"
        name="isPrimaSeguro"
        checked={historial?.isPrimaSeguro}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        type="date"
        title="Fecha de Ingreso"
        name="dateOfAdmission"
        value={displayContract?.dateOfAdmission}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        type="date"
        title="Fecha de Cese"
        name="terminationDate"
        value={displayContract?.terminationDate}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        title="N° Autogenerado"
        name="numberOfEssalud"
        value={historial?.numberOfEssalud}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        title="Plaza"
        name="plaza"
        value={historial?.plaza}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        title="Tip. Trabajador"
        name="name"
        value={displayContract?.typeCategory?.typeCargo?.name}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        title="Condición"
        name="condition"
        value={displayContract?.condition}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        title="Tip. Categoría"
        name="name"
        value={displayContract?.typeCategory?.name}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        title="PIM"
        name="pim"
        value={displayPim}
        readOnly={true}
        loading={loading}
      >
        {edit
          ? <SelectPim
              onChange={(e, obj) => handleIntToInput(obj)}
              year={cronograma?.year}
              name="pimId"
              value={`${historial?.pimId}`}
              active={true}
            />
          : null}
      </InputCustom>
      
      <InputCustom
        title="Meta"
        name="meta"
        value={displayMeta}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        md="6"
        title="Partición Presup."
        name="description"
        value={currentPim?.cargo?.description}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        title="Extensión Presup."
        name="extension"
        value={currentPim?.cargo?.extension}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        md="6"
        title="Dependencia/Oficina"
        name="name"
        value={displayContract?.dependency?.name}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        title="Perfil Laboral"
        name="name"
        value={displayContract?.profile?.name}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        type="number"
        title={"Días Lab"}
        name="days"
        value={historial?.days}
        readOnly={!edit}
        onChange={handleInput}
        loading={loading}
      />

      <InputCustom
        title="Banco"
        name="name"
        value={historial?.bank?.name}
        readOnly={true}
        loading={loading}
      />

      <InputCustom
        md="6"
        title="N° Cuenta"
        name="numberOfAccount"
        value={historial?.numberOfAccount}
        readOnly={!edit}
        onChange={handleInput}
        loading={loading}
      />

      <CheckboxCustom
        title="Pago en cheque"
        name="isCheck"
        checked={historial?.isCheck}
        onChange={handleInput}
        readOnly={!edit}
        loading={loading}
      />

      <div className="col-12">
        <div className="row">
          <div className="col-md-9">
            <TexareaCustom
              md="12"
              title="Observación"
              name="observation"
              value={historial?.observation}
              readOnly={!edit}
              onChange={handleInput}
              loading={loading}
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
              loading={loading}
            />
            
            <CheckboxCustom
              md="12"
              title="Enviar a correo"
              name="isPay"
              checked={historial?.info?.isEmail}
              readOnly={true}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </Form>
  )
}


export default Afectacion;
