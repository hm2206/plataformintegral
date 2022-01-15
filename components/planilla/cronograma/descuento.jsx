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

const ItemDiscount = ({ loading = false, discount = {}, cronograma = {}, edit = false }) => {

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
          // onClick={(e) => syncDescuento(obj)}
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
                value={amount}
                readOnly={!edit}
                // onChange={({target}) => handleMonto(index, target.value, obj)}
                min="0"
              />
            </div>

            <Show condicion={!cronograma.remanente && edit}>
              <div className="col-md-3 col-3">
                <Button 
                  icon="asl"
                  // onClick={(e) => handleEdit(obj, 0)}
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
                  // onClick={(e) => handleEdit(obj, 1)}
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
  const [total_bruto, setTotalBruto] = useState(0);
  const [total_desct, setTotalDesct] = useState(0);
  const [base, setBase] = useState(0);
  const [total_neto, setTotalNeto] = useState(0);
  const [current_loading, setCurrentLoading] = useState(true);
  const [descuentos, setDescuentos] = useState([]);
  const [old, setOld] = useState([]);
  const [error, setError] = useState(false);

  // app
  const app_context = useContext(AppContext);

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

  // cambiar montos
  const handleMonto = (index, value, obj) => {
    let newMonto = Object.assign({}, obj);
    let newDescuentos = JSON.parse(JSON.stringify(descuentos));
    newMonto.send = true;
    newMonto.monto = value;
    newDescuentos[index] = newMonto;
    setDescuentos(newDescuentos);
  }
    
  // sincronizar descuentos
  const syncDescuento = async (obj) => {
    if (!edit) return false;
    let answer = await Confirm(`warning`, `¿Estas seguro en sincronizar ${obj.descripcion}?`, 'Estoy seguro');
    if (!answer) return false;
    const form = {};
    form.monto = obj.monto;
    form._method = 'PUT';
    // send changes
    app_context.setCurrentLoading(true);
    await unujobs.post(`descuento/${obj.id}/sync`, form, { headers: { CronogramaID: historial.cronograma_id } })
    .then(async res => {
        app_context.setCurrentLoading(false);
        let { success, message } = res.data;
        if (!success) throw new Error(message);
        await Swal.fire({ icon: 'success', text: message });
        setEdit(false);
        await findDescuento();
    }).catch(err => {
        app_context.setCurrentLoading(false);
        Swal.fire({ icon: 'error', text: err.message })
    });
    setSend(false);
    setBlock(false);
  }

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
          />
        )}
      </Show>
    </Form>
  )
}


export default Descuento;