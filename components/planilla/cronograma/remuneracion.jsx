import React, { useContext, useState, useEffect, Fragment, useMemo } from 'react';
import { microPlanilla } from '../../../services/apis';
import { Form, Button } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Show from '../../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import Resume from './resume';
import ConfigRemuneration from '../infos/config-infos/config-remuneracion';
import useProcessCronograma from './hooks/useProcessCronograma';
import { ToastContainer } from 'react-toastify';

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

const ItemRemuneration = ({ remuneration = {}, edit = false }) => {

  const [amount, setAmount] = useState(remuneration?.amount || 0);

  const handleInput = ({ value }) => {
    let newValue = value;
    if (value) newValue = parseInt(`${value}`);
    setAmount(newValue);
  }

  const canEdit = useMemo(() => { 
    return (remuneration?.isEdit && edit);
  }, [remuneration, edit])

  return (
    <div className="col-md-3 mb-3">
      <span className={remuneration?.amount > 0 ? 'text-red' : ''}>
        {remuneration?.typeRemuneration?.code}
      </span>
        .-
      <span className={remuneration?.amount > 0 ? 'text-primary' : ''}>
        {remuneration?.typeRemuneration?.name}
      </span>

      <Show condicion={remuneration?.isBase}>
        <b className="ml-1 badge badge-dark mb-1" title="Calculable a la Base imponible">
          <i className="fas fa-calculator"></i>
        </b>
      </Show>

      <Form.Field>
        <input type="number"
          step="any" 
          value={amount}
          className={canEdit ? 'input-active' : ''}
          disabled={!remuneration?.isEdit || !edit}
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
  const [old, setOld] = useState([]);
  const [error, setError] = useState(false);
  const [options, setOptions] = useState();
  const processCronograma = useProcessCronograma(cronograma);

  // app
  const app_context = useContext(AppContext);

  const objectOptions = {
    ADD_REMUNERATION: "ADD_REMUNERATION"
  }

  const findRemuneracion = async () => {
    setCurrentLoading(true);
    setBlock(true);
    await microPlanilla.get(`historials/${historial.id}/remunerations?limit=100`)
      .then(({ data }) => {
        let { items } = data;
        setRemuneraciones(items);
        setOld(items);
      })
      .catch(() => {
        setRemuneraciones([]);
        setOld([]);
        setError(true);
      });
    setCurrentLoading(false);
    setBlock(false);
  }

  useEffect(() => {
    setIsEditable(true);
    setIsUpdatable(true);
    if (historial.id) findRemuneracion();
    return () => {}
  }, [historial.id]);

  useEffect(() => {
    if (!edit && !send) setRemuneraciones(old);
  }, [edit]);
  
  const updateRemuneraciones = async () => {
    const form = new FormData();
    let datos = await remuneraciones.filter(rem => rem.send == true);
    form.append('_method', 'PUT');
    form.append('remuneraciones', JSON.stringify(datos));
    // valdiar que se modificarón los datos
    if (!datos.length)  await Swal.fire({ icon: 'warning', text: 'No se encontraron cambios' });
    // send changes
    else {app_context.setCurrentLoading(true);
        await unujobs.post(`remuneracion/${historial.id}/all`, form, { headers: { CronogramaID: historial.cronograma_id } })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            setEdit(false);
            await findRemuneracion();
        })
        .catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: err.message })
        });
    }   
    setSend(false);
    setBlock(false);
  }

  const handleProccess = () => {
    processCronograma.processing()
      .then(() => setRefresh(true))
      .catch(() => null)
  }

  // update remuneraciones
  useEffect(() => {
      if (send) updateRemuneraciones();
  }, [send]);
 
  return (
    <Form className="row">
      <div className="col-md-12">
        <Resume
          id={historial?.id}
          refresh={send}
          loading={loading}
        />
      </div>
        
      <div className="col-md-12">
        <hr/>
      </div>

      <Show condicion={!loading && !current_loading}
        predeterminado={<PlaceholderRemuneracion/>}
      >
        {remuneraciones.map((obj, index) => 
          <ItemRemuneration
            key={`remuneracion-${obj.id}-${index}`}
            remuneration={obj}
            edit={edit}
          />
        )}
      </Show>   

      {/* open cronograma */}
      <Show condicion={cronograma?.state && edit}>
        <div className="col-md-3 mb-3">
          <Button fluid
            className='mt-4'
            onClick={() => setOptions(objectOptions.ADD_REMUNERATION)}>
            <i className="fas fa-plus"></i>
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
          disabled={true}
        />
      </Show>
      {/* toast */}
      <ToastContainer/>
    </Form>
  )
}


export default Remuneracion;


