import React, { useContext, useState, useEffect, Fragment } from 'react';
import { microPlanilla } from '../../../services/apis';
import { Button, Form, Input, Icon } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Show from '../../show';
import { Confirm } from '../../../services/utils';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import Resume from './resume';
import useProcessCronograma from './hooks/useProcessCronograma';
import { ToastContainer } from 'react-toastify';
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

const ItemDiscount = ({ loading = false, discount = {}, cronograma = {}, historial = {}, edit = false }) => {

  const [amount, setAmount] = useState(discount?.amount || 0);

  const handleInput = ({ value }) => {
    let newValue = value;
    if (value) newValue = parseInt(`${value}`);
    setAmount(newValue);
  }

  return (
    <div className="col-md-3 mb-3">
      <span className={amount > 0 ? 'text-red' : ''}>
        {discount?.typeDiscount?.code}
      </span>
        .-
      <span className={amount > 0 ? 'text-primary' : ''}>
        {discount?.typeDiscount?.description}
      </span>
              
      <Show condicion={discount.isEdit && !discount.isSync}>
        <span className={`ml-1 ${edit ? 'cursor-pointer' : 'disabled'} font-9 badge badge-${discount.isSync ? 'dark' : 'danger'}`}
          title={`Sincronizar descuento global ${!discount.isSync ? '(Modificado)' : ''}`}
        >
          <i className="fas fa-sync"></i>
        </span>
      </Show>

      <Form.Field>
        <div className="row justify-aligns-center mt-1">
          <Show condicion={discount.isEdit}>
            <div className={!cronograma.remanente && edit ? 'col-md-9 col-9' : 'col-md-12 col-12'}>
              <input type="number"
                step="any" 
                className={edit ? 'input-active' : ''}
                value={amount}
                readOnly={!edit}
                min="0"
              />
            </div>

            <Show condicion={!cronograma.remanente && edit}>
              <div className="col-md-3 col-3">
                <Button 
                  icon="asl"
                  style={{ width: "100%", height: "100%" }}
                  size="small"
                  basic
                  readOnly={loading || !edit || !historial.isPay}>
                </Button>
              </div>
            </Show>
          </Show>

          <Show condicion={!discount.isEdit}>
            <Show condicion={!edit}>
              <div className="col-md-12 col-12">
                <Input icon='wait' iconPosition='left' 
                  value={amount || 0} 
                  readOnly
                />
              </div>
            </Show>

            <Show condicion={edit}>
              <div className="col-md-9 col-9">
                <input type="number"
                  step="any" 
                  value={amount}
                  readOnly
                  min="0"
                />
              </div>
              <div className="col-md-3 col-3">
                <Button 
                  icon="wait"
                  style={{ width: "100%", height: "100%" }}
                  size="small"
                  disabled={loading || !edit}>
                </Button>
              </div>
            </Show>
          </Show>
        </div>
      </Form.Field>
    </div>
  )
}

const Descuento = () => {

  // cronograma
  const { edit, setEdit, loading, send, historial, setBlock, setSend, cronograma, setIsEditable, setIsUpdatable, setRefresh } = useContext(CronogramaContext);
  const [current_loading, setCurrentLoading] = useState(true);
  const [descuentos, setDescuentos] = useState([]);
  const [old, setOld] = useState([]);
  const [error, setError] = useState(false);
  const [options, setOptions] = useState();
  const processCronograma = useProcessCronograma(cronograma);

  // app
  const app_context = useContext(AppContext);

  const objectOptions = {
    ADD_DISCOUNT: "ADD_DISCOUNT"
  }

  const findDescuento = async () => {
    setCurrentLoading(true);
    setBlock(true);
    await microPlanilla.get(`historials/${historial.id}/discounts?limit=100`)
      .then(({ data }) => {
        const { items } = data;
        setDescuentos(items || []);
        setOld(items || []);
      })
      .catch(() => {
        setDescuentos([]);
        setOld([]);
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

  // primera entrada
  useEffect(() => {
    setIsEditable(true);
    setIsUpdatable(true);
    if (historial.id) findDescuento();
    return () => {}
  }, [historial.id]);

  // cancelar edit
  useEffect(() => {
    if (!edit && !send) setDescuentos(old);
  }, [!edit]);

  // actualizar descuentos
  const updateDescuentos = async () => {
    const form = new FormData();
    let datos = await descuentos.filter(des => des.send == true);
    form.append('_method', 'PUT');
    form.append('descuentos', JSON.stringify(datos));
    // valdiar que se modificarón los datos
    if (!datos.length) return await Swal.fire({ icon: 'warning', text: 'No se encontraron cambios' });
    // send changes
    else {
      app_context.setCurrentLoading(true);
      await unujobs.post(`descuento/${historial.id}/all`, form, { headers: { CronogramaID: historial.cronograma_id } })
      .then(async res => {
        app_context.setCurrentLoading(false);
        let { success, message } = res.data;
        if (!success) throw new Error(message);
        await Swal.fire({ icon: 'success', text: message });
        setEdit(false);
        await findDescuento();
      })
      .catch(err => {
        app_context.setCurrentLoading(false);
        Swal.fire({ icon: 'error', text: err.message })
      });
    }
    setSend(false);
    setBlock(false);
  }

  // editar descuento
  const handleEdit = async (obj, edit = 0) => {
    let answer = await Confirm("warning", `Deseas ${edit ? 'Desactivar' : 'Activar'} el calculo automático para "${obj.descripcion}"`, "Confirmar");
    if (answer) {
      app_context.setCurrentLoading(true);
      setBlock(true);
      await unujobs.post(`descuento/${obj.id}/edit`, { _method: 'PUT', edit }, { headers: { CronogramaID: cronograma.id, EntityId: cronograma.entity_id } })
      .then(async res => { 
        app_context.setCurrentLoading(false);
        let { success, message } = res.data;
        if (!success) throw new Error(message);
        await Swal.fire({ icon: 'success', text: message });
        setEdit(false);
        setRefresh(true);
      }).catch(err => {
        app_context.setCurrentLoading(false);
        Swal.fire({ icon: 'error', text: err.message })
      })
      setSend(false);
      setBlock(false);
    }
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
          refresh={send}
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
            cronograma={cronograma}
            historial={historial}
          />
        )}
      </Show>

      {/* open cronograma */}
      <Show condicion={cronograma?.state && edit}>
        <div className="col-md-3 mb-3">
          <Button fluid
            className='mt-4'
            onClick={() => setOptions(objectOptions.ADD_DISCOUNT)}>
            <i className="fas fa-plus"></i>
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
          disabled={true}
        />
      </Show>
      {/* toast */}
      <ToastContainer/>
    </Form>
  )
}


export default Descuento;