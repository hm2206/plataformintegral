import React, { Fragment, useState, useContext, useEffect } from 'react';
import { microPlanilla } from '../../../services/apis';
import { Button, Form, Icon } from 'semantic-ui-react';
import Show from '../../show';
import Swal from 'sweetalert2';
import {  Confirm } from '../../../services/utils';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import AddObligacion from './addObligacion';
import ItemObligation from './itemObligation';

const PlaceHolderButton = ({ count = 1, height = "38px" }) => <Skeleton height={height} count={count}/>

const PlaceholderObligaciones = () => (
  <Fragment>
    <div className="col-md-2 col-6 mb-3">
      <PlaceHolderButton/>
    </div>

    <div className="col-md-2 col-6 mb-3">
      <PlaceHolderButton/>
    </div>

    <div className="col-md-4 col-12 mb-3">
      <PlaceHolderButton/>
    </div>

    <div className="col-md-2 col-6 mb-3">
      <PlaceHolderButton/>
    </div>

    <div className="col-md-2 col-6 mb-3">
      <PlaceHolderButton/>
    </div>

    <div className="col-md-8 col-12 mb-3">
      <PlaceHolderButton height="100px"/>
    </div>

    <div className="col-md-2 col-6 mb-3">
      <PlaceHolderButton/>
    </div>
  </Fragment>
);

const Obligacion = () => {

  // cronograma
  const { edit, setEdit, loading, send, historial, setBlock, setSend, cronograma, setIsEditable, setIsUpdatable, cancel } = useContext(CronogramaContext);
  const [current_loading, setCurrentLoading] = useState(true);
  const [obligaciones, setObligaciones] = useState([]);
  const [old, setOld] = useState([]);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({});
  const [current_option, setCurrentOption] = useState("");

  // app
  const app_context = useContext(AppContext);

  // obtener descuentos detallados
  const findObligaciones = async () => {
    setCurrentLoading(true);
    setBlock(true);
    await microPlanilla.get(`historials/${historial.id}/obligations?limit=100`)
      .then(({ data }) => {
        let { items } = data;
        setObligaciones(items || []);
        setOld(items || []);
      })
      .catch(() => {
        setObligaciones([]);
        setOld([]);
        setError(true);
      });
    setCurrentLoading(false);
    setBlock(false);
  }

  // primera carga
  useEffect(() => {
    setIsEditable(true);
    setIsUpdatable(true);
    if (historial.id) findObligaciones();
    return () => {}
  }, [historial.id]);

  // modificar obligaciones del cronograma
  const handleInput = ({ name, value }, index = 0) => {
    let newObligaciones = JSON.parse(JSON.stringify(obligaciones));
    let newObject = Object.assign({}, newObligaciones[index]);
    newObject[name] = value;
    newObligaciones[index] = newObject;
    setObligaciones(newObligaciones);
  }

  // actualizar las obligaciones del cronograma
  const updateObligacion = async () => {
    app_context.setCurrentLoading(true);
    let form = new FormData;
    form.append('obligaciones', JSON.stringify(obligaciones));
    await unujobs.post(`obligacion/${historial.id}/all`, form, { headers: { CronogramaID: historial.cronograma_id } })
    .then(async res => {
      app_context.setCurrentLoading(false);
      let { success, message } = res.data;
      if (!success) throw new Error(message);
      await Swal.fire({ icon: 'success', text: message });
      findObligaciones();
      setEdit(false);
    })
    .catch(err => {
      app_context.setCurrentLoading(true);
      Swal.fire({ icon: 'error', text: err.message })
    });
    setBlock(false);
    setSend(false);
  }

  // cancelar cambios en las obligaciones
  const cancelObligacion = async () => {
    setObligaciones(JSON.parse(JSON.stringify(old)));
  }

  // quitar del cronograma la obligacion
  const deleteObligacion = async (id) => {
    let answer = await Confirm('warning', '¿Deseas eliminar la obligación judicial?', 'Confirmar')
    if (answer) {
      app_context.setCurrentLoading(true);
      await unujobs.post(`obligacion/${id}`, { _method: 'DELETE' }, { headers: { CronogramaID: historial.cronograma_id } })
      .then(async res => {
        app_context.setCurrentLoading(false);
        let { success, message } = res.data;
        if (!success) throw new Error(message);
        await Swal.fire({ icon: 'success', text: message });
        findObligaciones();
        setEdit(false);
      }).catch(err => {
        app_context.setCurrentLoading(false);
        Swal.fire({ icon: 'error', text: err.message })
      });
      setBlock(false);
      setSend(false);
    }
  }

  // update obligaciones
  useEffect(() => {
    if (send) updateObligacion();
  }, [send]);
    
  // cancelar edicion
  useEffect(() => {
    if (cancel) cancelObligacion();
  }, [cancel]);

  // render
  return (
    <Form className="row">
      <div className="col-md-3">
        <Show condicion={!loading && !current_loading}
          predeterminado={<PlaceHolderButton/>}
        >
          <Button color="green"
            fluid
            disabled={!edit}
            onClick={(e) => setCurrentOption("create")}
          >
            <i className="fas fa-plus"></i>
          </Button>
        </Show>
      </div>

      <div className="col-md-12">
        <hr/>
      </div>

      <Show condicion={!loading && !current_loading}
        predeterminado={
          <div className="col-md-12">
              <div className="row">
                  <div className="col-md-4 col-5">
                      <Skeleton/>
                  </div>

                  <div className="col-md-2 col-3">
                      <Skeleton/>
                  </div>
              </div>
          </div>
        }
      >
        <h4 className="col-md-12 mt-1">
          <Icon name="list alternate" /> Lista de Obligaciones Judiciales:
        </h4>
      </Show>

      <Show condicion={!loading && !current_loading}
        predeterminado={<PlaceholderObligaciones/>}
      >
        {obligaciones.map((obl, index) =>
          <ItemObligation
            key={`item-obligation-${index}`}
            obligation={obl}
            edit={edit}
          />
        )}
      </Show>

      <Show condicion={current_option == 'create'}>
        <AddObligacion
          isClose={(e) => setCurrentOption("")}
          onSave={(e) => findObligaciones()}
          info_id={historial.info_id}
          historial_id={historial.id}
        />
      </Show>
    </Form>
  )
}


export default Obligacion;