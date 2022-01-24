import React, { Fragment, useState, useContext, useEffect } from 'react';
import { microPlanilla } from '../../../services/apis';
import { Button, Form, Icon } from 'semantic-ui-react';
import Show from '../../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import AddObligacion from './addObligacion';
import ItemObligation from './itemObligation';
import NotRegister from './not-register';

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
  const { edit, loading, historial, setBlock, setIsEditable, setIsUpdatable, cancel } = useContext(CronogramaContext);
  const [current_loading, setCurrentLoading] = useState(true);
  const [obligaciones, setObligaciones] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(false);
  const [current_option, setCurrentOption] = useState("");

  // obtener descuentos detallados
  const findObligaciones = async () => {
    setCurrentLoading(true);
    setBlock(true);
    await microPlanilla.get(`historials/${historial.id}/obligations?limit=100`)
      .then(({ data }) => {
        let { items, meta } = data;
        setObligaciones(items || []);
        setTotal(meta?.totalItems || 0)
      })
      .catch(() => {
        setObligaciones([]);
        setTotal(0)
        setError(true);
      });
    setCurrentLoading(false);
    setBlock(false);
  }

  const handleSave = () => {
    setCurrentOption();
    findObligaciones();
  }

  const handleDelete = (obligation = {}) => {
    const newObligation = obligaciones
      .filter(obl => obl.id != obligation.id);
    setObligaciones(newObligation);
  }

  // primera carga
  useEffect(() => {
    setIsEditable(true);
    setIsUpdatable(false);
    if (historial.id) findObligaciones();
    return () => {}
  }, [historial.id]);

  // render
  return (
    <Form className="row">
      <div className="col-md-9"></div>
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
      />

      <Show condicion={!loading && !current_loading}
        predeterminado={<PlaceholderObligaciones/>}
      >
        {obligaciones.map((obl, index) =>
          <ItemObligation
            key={`item-obligation-${index}`}
            obligation={obl}
            edit={edit}
            onDelete={handleDelete}
            onUpdate={handleSave}
          />
        )}

        {/* no hay regístros */}
        <Show condicion={!total}>
          <div className="col-12">
            <NotRegister/>
          </div>
        </Show>
      </Show>

      <Show condicion={current_option == 'create'}>
        <AddObligacion
          onClose={() => setCurrentOption()}
          onSave={handleSave}
          info={historial?.info}
        />
      </Show>
    </Form>
  )
}

export default Obligacion;