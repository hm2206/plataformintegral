import React, { useContext, useEffect, useState, Fragment } from 'react';
import { microPlanilla } from '../../../services/apis';
import { Button, Form, Input } from 'semantic-ui-react';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import Show from '../../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import ConfigAportation from '../infos/config-infos/config-aportation';
import { toast } from 'react-toastify';

const PlaceHolderButton = ({ count = 1, height = "38px" }) => <Skeleton height={height} count={count}/>

const FragmentAportacion = () => (
  <div className="col-md-4 mb-3">
    <div className="row">
      <div className="col-md-9 col-lg-10 col-10">
        <PlaceHolderButton/>
      </div>

      <div className="col-md-3 col-lg-2 col-2">
        <PlaceHolderButton/>
      </div>
    </div>
  </div>
)

const PlaceholderAportacion = () => {

  const datos = [1, 2, 3, 4];

  return (
    <Fragment>
      {datos.map(d => <Fragment key={`aportacion-placeholder-${d}`}>
        <FragmentAportacion/>
        <FragmentAportacion/>
        <FragmentAportacion/>
      </Fragment>)}
    </Fragment>
  );
}

const ItemAportation = ({ aportation = {}, edit = false, onDelete = null }) => {

  const [currentLoading, setCurrentLoading] = useState(false);

  const deleteAportacion = async () => {
    let answer = await Confirm("warning", `¿Deseas elminar la aportacion del empleador?`);
    if (!answer) return;
    setCurrentLoading(true);
    await microPlanilla.delete(`aportations/${aportation.id}`)
    .then(() => {
      toast.success(`El regístro se elimino correctamante!`)
      if (typeof onDelete == 'function') onDelete(aportation);
    }).catch(() => {
      toast.error(`No se pudo eliminar el regístro`);
    });
    setCurrentLoading(false);
  }

  return (
    <div className="col-md-12 mb-1 col-lg-4">
      <b className='mb-2'>
        {aportation?.typeAportation?.code}.-{aportation?.typeAportation?.name}
      </b>
      <div className='mb-2'>
        <Input readOnly
          fluid
          value={aportation?.amount}
        />
      </div>

      <div className="mb-2">
        <Input readOnly
          fluid
          value={`META ${aportation?.pim?.code || ''} - ${aportation?.pim?.meta?.name || ''}`}
        />
      </div>

      <div className="mb-2">
        <Input readOnly
          fluid
          value={`Extensión [${aportation?.pim?.cargo?.extension || ''}] - ${aportation?.pim?.cargo?.name || ''}`}
        />
      </div>

      <div className="mb-2 text-right">
        <Button color="red"
          onClick={deleteAportacion}
          disabled={!edit || currentLoading}
        >
          <i className="fas fa-trash"></i>
        </Button>
      </div>
    </div>
  )
}

const Aportacion = () => {

  // cronograma
  const { edit, setRefresh, loading, historial, setBlock, cronograma, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
  const [current_loading, setCurrentLoading] = useState(true);
  const [aportaciones, setAportaciones] = useState([]);
  const [old, setOld] = useState([]);
  const [error, setError] = useState(false);
  const [options, setOptions] = useState();
    
  // app
  const app_context = useContext(AppContext);

  const objectOptions = {
    ADD_APORTATION: "ADD_APORTATION"
  }

  // obtener aportacion empleador
  const findAportacion = async () => {
    setCurrentLoading(true);
    setBlock(true);
    await microPlanilla.get(`historials/${historial.id}/aportations`)
      .then(({ data }) => {
        const { items } = data;
        setAportaciones(items || []);
        setOld(JSON.parse(JSON.stringify(items || [])));
        setBlock(false);
      }).catch(err => {
        setAportaciones([]);
        setOld([]);
        setError(true);
        setBlock(false);
      });
    setCurrentLoading(false);
  }

  const handleSave = () => {
    setRefresh(true);
    setOptions();
  }

  const handleDelete = (aportation = {}) => {
    const newAportations = aportaciones.filter(a => a.id != aportation.id);
    setAportaciones(newAportations);
  }
    
  // primera carga
  useEffect(() => {
    setIsEditable(true);
    setIsUpdatable(false);
    if (historial.id)  findAportacion();
    return () => {}
  }, [historial.id]);

  return (
    <Form className="row">
      <div className="col-md-12">
        <div className="row">
          <div className="col-md-8 col-12"></div>

          <div className="col-xs col-lg-2 col-md-4 col-12">
            <Show condicion={!loading && !current_loading}
              predeterminado={<PlaceHolderButton/>}
            >
              <Button color="green"
                fluid
                disabled={!edit}
                onClick={() => setOptions(objectOptions.ADD_APORTATION)}    
              >
                <i className="fas fa-plus"></i>
              </Button>
            </Show>
          </div>
        </div>
      </div>
                
      <div className="col-md-12">
        <hr/>
      </div>

      <Show condicion={!loading && !current_loading}
        predeterminado={<PlaceholderAportacion/>}
      >
        {aportaciones.map((obj, index) => 
          <ItemAportation
            key={`remuneracion-${obj.id}-${index}`}
            aportation={obj}
            edit={edit}
            onDelete={handleDelete}
          />
        )}
      </Show>
     
      {/* add obligations */}
      <Show condicion={options == objectOptions.ADD_APORTATION}>
        <ConfigAportation
          info={historial?.info || {}}
          onClose={() => setOptions()}
          onSave={handleSave}
        />
      </Show>
    </Form>)
}

export default Aportacion;