import React, { useContext, useState, useEffect, Fragment, useMemo } from 'react';
import { microPlanilla } from '../../../services/apis';
import { Form, Button } from 'semantic-ui-react';
import Show from '../../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import Resume from './resume';
import ConfigRemuneration from '../infos/config-infos/config-remuneracion';
import useProcessCronograma from './hooks/useProcessCronograma';
import { toast } from 'react-toastify';

const PlaceHolderButton = ({ count = 1 }) => <Skeleton height="38px" count={count}/>

const PlaceholderRemuneracion = () => (
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

const ToggleEditRemuneration = ({ isEdit = false, onToggle = null }) => {

  const toggleEdit = () => typeof onToggle == 'function' ? onToggle(!isEdit) : null;

  return (
    <span title={isEdit ? 'Edición habilitada' : 'Automatico'}
      className={`toggle-edit badge badge-${isEdit ? 'primary' : 'light'} cursor-pointer`}
      onClick={toggleEdit}
    >
      <i className={`fas fa-${isEdit ? 'pencil-alt' : 'clock'}`}></i>
    </span>
  )
}

const ItemRemuneration = ({ remuneration = {}, edit = false, onModify = null }) => {

  const [amount, setAmount] = useState(remuneration?.amount || 0);
  const [isEdit, setIsEdit] = useState(remuneration?.isEdit || false);

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
      id: remuneration?.id,
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
      setAmount(remuneration?.amount || 0);
      setIsEdit(remuneration?.isEdit || false);
    }
  }, [edit]);

  useEffect(() => {
    if (!isEdit) setAmount(remuneration?.amount || 0);
  }, [isEdit]);

  return (
    <div className="col-md-3 mb-3">
      <span>
        <span className={remuneration?.amount > 0 ? 'text-red' : ''}>
          {remuneration?.typeRemuneration?.code}
        </span>
          .-
        <span className={remuneration?.amount > 0 ? 'text-primary' : ''}>
          {remuneration?.typeRemuneration?.name}
        </span>
      </span>

      <Show condicion={remuneration?.isBase}>
        <b className="ml-1 badge badge-dark mb-1" title="Calculable a la Base imponible">
          <i className="fas fa-calculator"></i>
        </b>
      </Show>

      <Show condicion={remuneration?.pimId}>
        <b className="ml-1 badge badge-warning mb-1" title="PIM">
          Meta {remuneration?.pim?.code || ''} [{remuneration?.pim?.cargo?.extension || ''}]
        </b>
      </Show>

      <Form.Field>
        {/* toggle */}
        <Show condicion={edit}>
          <ToggleEditRemuneration
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

const Remuneracion = () => {

  // cronograma
  const { cronograma, setRefresh, edit, setEdit, send, setSend, loading, historial, setBlock, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
  const [current_loading, setCurrentLoading] = useState(true);
  const [remuneraciones, setRemuneraciones] = useState([]);
  const [error, setError] = useState(false);
  const [options, setOptions] = useState();
  const [form, setForm] = useState([]);
  const processCronograma = useProcessCronograma(cronograma);

  // app
  const app_context = useContext(AppContext);

  const objectOptions = {
    ADD_REMUNERATION: "ADD_REMUNERATION"
  }

  const headers = {
    CronogramaId: historial.cronogramaId
  }

  const findRemuneracion = async () => {
    setCurrentLoading(true);
    setBlock(true);
    await microPlanilla.get(`historials/${historial.id}/remunerations?limit=100`)
      .then(({ data }) => {
        let { items } = data;
        setRemuneraciones(items);
      })
      .catch(() => {
        setRemuneraciones([]);
        setError(true);
      });
    setCurrentLoading(false);
    setBlock(false);
  }

  const handleForm = (obj = {}) => {
    const newForm = form.filter(f => f.id != obj.id);
    // add
    newForm.push(obj);
    return setForm(newForm);
  }

  const updateRemuneraciones = async () => {
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
    await microPlanilla.put(`historials/${historial.id}/remunerations`, { remunerations: form }, { headers })
    .then(() => {
      app_context.setCurrentLoading(false);
      toast.success(`Los cambios se guardarón correctamente!`)
      findRemuneracion();
      setEdit(false);
      setForm([])
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

  const handleProccess = () => {
    processCronograma.processing()
      .then(() => setRefresh(true))
      .catch(() => null)
  }

  useEffect(() => {
    setIsEditable(true);
    setIsUpdatable(true);
    if (historial.id) findRemuneracion();
    return () => {}
  }, [historial.id]);

  useEffect(() => {
    if (!edit && !send) setForm([]);
  }, [edit]);

  // update remuneraciones
  useEffect(() => {
      if (send) updateRemuneraciones();
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
        <hr />
      </div>

      <Show condicion={!loading && !current_loading}
        predeterminado={<PlaceholderRemuneracion/>}
      >
        {remuneraciones.map((obj, index) => 
          <ItemRemuneration
            key={`remuneracion-${obj.id}-${index}`}
            remuneration={obj}
            edit={edit}
            onModify={handleForm}
          />
        )}
      </Show>   

      {/* open remunerations */}
      <Show condicion={cronograma?.state && edit}>
        <div className="col-md-3 mb-3">
          <Button fluid
            className='mt-4'
            onClick={() => setOptions(objectOptions.ADD_REMUNERATION)}>
            <i className="fas fa-cog"></i>
          </Button>
        </div>
      </Show>
      
      <div className="col-12 py-5"></div>
     
      {/* add remunerations */}
      <Show condicion={options == objectOptions.ADD_REMUNERATION}>
        <ConfigRemuneration
          info={historial?.info || {}}
          onClose={() => setOptions()}
          onSave={handleProccess}
        />
      </Show>
    </Form>
  )
}

export default Remuneracion;


