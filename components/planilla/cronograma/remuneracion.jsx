import React, { useContext, useState, useEffect, Fragment } from 'react';
import { microPlanilla } from '../../../services/apis';
import { Form } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Show from '../../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import Resume from './resume';

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
  const { edit, setEdit, send, setSend, loading, historial, setBlock, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
  const [total_bruto, setTotalBruto] = useState(0);
  const [total_desct, setTotalDesct] = useState(0);
  const [base, setBase] = useState(0);
  const [total_neto, setTotalNeto] = useState(0);
  const [current_loading, setCurrentLoading] = useState(true);
  const [remuneraciones, setRemuneraciones] = useState([]);
  const [old, setOld] = useState([]);
  const [error, setError] = useState(false);

  // app
  const app_context = useContext(AppContext);

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

  const handleMonto = async (index, value, obj) => {
    let newMonto = Object.assign({}, obj);
    let newRemuneraciones = JSON.parse(JSON.stringify(remuneraciones));
    newMonto.send = true;
    newMonto.monto = value;
    newRemuneraciones[index] = newMonto;
    setRemuneraciones(newRemuneraciones);
  }
  
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
            key={`remuneracion-${obj.id}`}
            remuneration={obj}
            edit={edit}
          />
        )}
      </Show>   
      
      <div className="col-12 py-5"></div>
    </Form>
  )
}


export default Remuneracion;


