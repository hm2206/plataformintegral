import React, { useContext, useState, useEffect, Fragment, useMemo } from 'react';
import { microPlanilla } from '../../../services/apis';
import { Button, Form } from 'semantic-ui-react';
import Show from '../../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import Resume from './resume';
import useProcessCronograma from './hooks/useProcessCronograma';
import { toast } from 'react-toastify';
import ConfigDiscount from '../infos/config-infos/config-discount';

const PlaceHolderButton = ({ count = 1 }) => <Skeleton height="38px" count={count}/>

const PlaceholderDescuento = () => (
    <Fragment>
        <div className="col-md-3">
            <PlaceHolderButton count={3}/>
        </div>

        <div className="col-md-3">
            <PlaceHolderButton count={3}/>
        </div>

        <div className="col-md-3">
            <PlaceHolderButton count={3}/>
        </div>

        <div className="col-md-3">
            <PlaceHolderButton count={3}/>
        </div>
    </Fragment>
);

const ToggleEditDiscount = ({ isEdit = false, onToggle = null }) => {

  const toggleEdit = () => typeof onToggle == 'function' ? onToggle(!isEdit) : null;

  return (
    <span title={isEdit ? 'Edición habilitada' : 'Calculo Automático'}
      className={`toggle-edit badge badge-${isEdit ? 'primary' : 'light'} cursor-pointer`}
      onClick={toggleEdit}
    >
      <i className={`fas fa-${isEdit ? 'pencil-alt' : 'clock'}`}></i>
    </span>
  )
}

const ItemDiscount = ({ discount = {}, edit = false, onModify = null }) => {

  const [amount, setAmount] = useState(discount?.amount || 0);
  const [isEdit, setIsEdit] = useState(discount?.isEdit || false);

  const handleInput = ({ value }) => {
    let newValue = value;
    if (value) newValue = parseFloat(`${value}`);
    setAmount(newValue);
    onHandleInput(isEdit, newValue);
  }

  const handleEdit = (newEdit) => {
    setIsEdit(newEdit);
    onHandleInput(newEdit, amount);
  }

  const onHandleInput = (newEdit, newAmount) => {
    const obj = {
      id: discount?.id,
      isEdit: newEdit,
      amount: parseFloat(`${newAmount || 0}`)
    }
    // emitter
    if (typeof onModify == 'function') onModify(obj);
  }

  const canEdit = useMemo(() => { 
    return (isEdit && edit);
  }, [isEdit, edit])

  useEffect(() => {
    if (!edit) {
      setAmount(discount?.amount || 0);
      setIsEdit(discount?.isEdit || false);
    }
  }, [edit]);

  useEffect(() => {
    if (!isEdit) setAmount(discount?.amount || 0);
  }, [isEdit]);

  return (
    <div className="col-md-3 mb-3">
      <span>
        <span className={amount > 0 ? 'text-red' : ''}>
          {discount?.typeDiscount?.code}
        </span>
          .-
        <span className={amount > 0 ? 'text-primary' : ''}>
          {discount?.typeDiscount?.description}
        </span>
      </span>

      <Form.Field>
        {/* toggle */}
        <Show condicion={edit}>
          <ToggleEditDiscount
            isEdit={isEdit}
            onToggle={handleEdit}
          />
        </Show>
        {/* input */}
        <input type="number"
          step="any" 
          value={amount}
          className={canEdit ? 'input-active' : ''}
          disabled={!edit || !isEdit}
          onChange={({ target }) => handleInput(target)}
          min="0"
        />
      </Form.Field>
    </div>
  )
}

const Descuento = () => {

  // cronograma
  const { edit, setEdit, loading, send, historial, setBlock, setSend, cronograma, setIsEditable, setIsUpdatable, setRefresh } = useContext(CronogramaContext);
  const [current_loading, setCurrentLoading] = useState(true);
  const [descuentos, setDescuentos] = useState([]);
  const [error, setError] = useState(false);
  const [options, setOptions] = useState();
  const [form, setForm] = useState([]);
  const processCronograma = useProcessCronograma(cronograma);

  // app
  const app_context = useContext(AppContext);

  const objectOptions = {
    ADD_DISCOUNT: "ADD_DISCOUNT"
  }

  const headers = {
    CronogramaId: historial.cronogramaId
  }

  const findDescuento = async () => {
    setCurrentLoading(true);
    setBlock(true);
    await microPlanilla.get(`historials/${historial.id}/discounts?limit=100`)
      .then(({ data }) => {
        const { items } = data;
        setDescuentos(items || []);
      })
      .catch(() => {
        setDescuentos([]);
        setError(true);
      });
    setCurrentLoading(false);
    setBlock(false);
  }

  const handleProccess = () => {
    processCronograma.processing()
      .then(() => setRefresh(true))
      .catch(() => null)
  }

  const handleForm = (obj = {}) => {
    const newForm = form.filter(f => f.id != obj.id);
    // add
    newForm.push(obj);
    return setForm(newForm);
  }

  // primera entrada
  useEffect(() => {
    setIsEditable(true);
    setIsUpdatable(true);
    if (historial.id) findDescuento();
    return () => {}
  }, [historial.id]);

  // cancelar edit
  useEffect(() => {
    if (!edit && !send) setForm([]);
  }, [!edit]);

  // actualizar descuentos
  const updateDescuentos = async () => {
    toast.dismiss();
    // valdiar que se modificarón los datos
    if (!form.length) {
      toast.warning("No se encontraron cambios", { 
        hideProgressBar: true
      })
      // cancel
      setSend(false);
      setBlock(false);
      return;
    }
    // send changes
    app_context.setCurrentLoading(true);
    await microPlanilla.put(`historials/${historial.id}/discounts`, { discounts: form }, { headers })
    .then(() => {
      app_context.setCurrentLoading(false);
      toast.success(`Los cambios se guardarón correctamente!`)
      findDescuento();
      setEdit(false);
      setForm([]);
    }).catch(() => {
      app_context.setCurrentLoading(false);
      toast.error(`Ocurrio un error al guardar los datos!`, {
        hideProgressBar: true
      });
    });
    // enaled
    setSend(false);
    setBlock(false);
  }

  // update descuentos
  useEffect(() => {
    if (send) updateDescuentos();
  }, [send]);

  return (
    <Form className="row">
      <div className="col-md-12">
        <Resume
          id={historial?.id}
          refresh={current_loading}
          loading={loading}
        />
      </div>
          
      <div className="col-md-12">
        <hr/>
      </div>

      <Show condicion={!loading && !current_loading}
        predeterminado={<PlaceholderDescuento/>}
      >
        {descuentos.map((obj, index) => 
          <ItemDiscount
            key={`list-item-discount-${index}`}
            discount={obj}
            edit={edit}
            onModify={handleForm}
          />
        )}
      </Show>

      {/* open cronograma */}
      <Show condicion={cronograma?.state && edit}>
        <div className="col-md-3 mb-3">
          <Button fluid
            className='mt-4'
            onClick={() => setOptions(objectOptions.ADD_DISCOUNT)}>
            <i className="fas fa-cog"></i>
          </Button>
        </div>
      </Show>

      <div className="col-12 py-5"></div>

      {/* add remunerations */}
      <Show condicion={options == objectOptions.ADD_DISCOUNT}>
        <ConfigDiscount
          info={historial?.info || {}}
          onClose={() => setOptions()}
          onSave={handleProccess}
        />
      </Show>
    </Form>
  )
}

export default Descuento;