import React, { useContext, useEffect, useState, Fragment } from 'react';
import { microPlanilla } from '../../../services/apis';
import { Button, Form } from 'semantic-ui-react';
import Show from '../../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { useMemo } from 'react';
import CreateAffiliation from './create-affiliation';
import { Confirm } from '../../../services/utils';
import { toast } from 'react-toastify';

const PlaceHolderButton = ({ count = 1, height = "38px" }) => <Skeleton height={height} count={count}/>

const FragmentSindicato = () => (
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

const PlaceholderSindicato = () => {

  const datos = [1, 2, 3, 4];

  return (
    <Fragment>
      {datos.map(d => <Fragment key={`sindicator-placeholder-${d}`}>
        <FragmentSindicato/>
        <FragmentSindicato/>
        <FragmentSindicato/>
      </Fragment>)}
    </Fragment>
  );
}

const SindicatoItem = ({ affiliation = {}, edit = false, onDelete = null }) => {

  const [amount, setAmount] = useState(affiliation?.amount);
  const [isPercent, setIsPercent] = useState(affiliation?.isPercent);
  const [percent, setPersent] = useState(affiliation?.percent);
  const [currentLoading, setCurrentLoading] = useState(false);

  const displayTypeAffiliation = useMemo(() => {
    return `${affiliation?.infoTypeAffiliation?.typeAffiliation?.name || ''}`;
  }, [affiliation]);

  const displayTypeAffiliationDate = useMemo(() => {
    return `${affiliation?.infoTypeAffiliation?.terminationDate}`;
  }, [affiliation]);

  const isOver = useMemo(() => {
    return affiliation?.infoTypeAffiliation?.isOver;
  }, [affiliation]);

  const handleDelete = async () => {
    const answer = await Confirm('warning', '¿Estás seguro en eliminar?', 'Eliminar');
    if (!answer) return;
    setCurrentLoading(true);
    await microPlanilla.delete(`affiliations/${affiliation?.id}`)
    .then(() => {
      toast.success(`El regístro se elimino correctamente!`)
      if (typeof onDelete == 'function') onDelete(affiliation);
    }).catch(() => {
      toast.error(`No se pudó eliminar el regístro!`)
    });
    setCurrentLoading(false)
  }

  return (
    <div className="col-md-6 col-lg-3 mb-2 col-12">
      <div className="mb-3 row pl-2 pr-2">
        <div className="col-12">
          <b>
            <span className='text-red mr-1 mb-2'>
              {affiliation?.discount?.typeDiscount?.code}.-
            </span>
            <span className='text-primary'>
              {affiliation?.discount?.typeDiscount?.description}
            </span>
          </b>
        </div>
        {/* descripcion */}
        <div className='mb-2 col-12'>
          <hr />
          {displayTypeAffiliation}
          <Show condicion={isPercent}>
            <span
              className={`ml-2 badge badge-light`}
            >
              {percent}%
            </span>
          </Show>
        </div>
        {/* monto */}
        <div className='col-10'>
          <Show condicion={!isPercent}
            predeterminado={
              <input type="number"
                className='mb-2'
                readOnly
                value={amount}
              />
            }
          >
            <input type="number"
              className='mb-2'
              disabled={!edit || currentLoading}
              value={amount || 0}
              onChange={({ target }) => setAmount(target.value)}
            />
          </Show>
        </div>
        {/* delete */}
        <div className='col-2 text-right'> 
          <Button color='red'
            fluid
            disabled={!edit || currentLoading}
            icon="trash"
            onClick={handleDelete}
          />
        </div>
        {/* fecha */}
        <Show condicion={isOver}>
          <div className="col-12">
            <input type="date"
              className='mb-2'
              value={displayTypeAffiliationDate}
            />
          </div>
        </Show>
        <hr />
      </div>  
    </div>
  )
}

const Sindicato = () => {

  // cronograma
  const { edit, setRefresh, loading, historial, setBlock, cronograma, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
  const [current_loading, setCurrentLoading] = useState(true);
  const [sindicatos, setSindicatos] = useState([]);
  const [error, setError] = useState(false);
  const [options, setOptions] = useState();

  const switchOptions = {
    CREATE: "CREATE"
  }

  // obtener descuentos detallados
  const findSindicato = async () => {
    setCurrentLoading(true);
    setBlock(true);
    await microPlanilla.get(`historials/${historial.id}/affiliations`)
      .then(({ data }) => {
        let { items } = data;
        setSindicatos(items || []);
        setBlock(false);
      }).catch(() => {
        setSindicatos([]);
        setError(true);
        setBlock(false);
      });
    setCurrentLoading(false);
  }

  const handleDelete = async (affiliation = {}) => {
    const newSindicatos = sindicatos.filter(sin => sin.id != affiliation.id);
    setSindicatos(newSindicatos);
  }

  const handleSave = () => {
    setRefresh(true);
    setOptions();
  }
    
  // primera carga
  useEffect(() => {
    setIsEditable(true);
    setIsUpdatable(false);
    if (historial.id) findSindicato();
    return () => {}
  }, [historial.id]);

  return (
    <Form className="row">
      <div className="col-md-12">
        <div className="row">
          <div className="col-md-8 col-lg-5 col-10 mb-1"></div>
                
          <div className="col-xs col-md-4 col-lg-2 col-2">
            <Show condicion={!loading && !current_loading}
              predeterminado={<PlaceHolderButton/>}
            >
              <Button color="green"
                disabled={!edit}   
                onClick={() => setOptions(switchOptions.CREATE)} 
                fluid
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
        predeterminado={<PlaceholderSindicato/>}
      >
        {sindicatos.map((obj, index) => 
          <SindicatoItem
            key={`affiliation-${obj?.id}-${index}`}
            edit={edit}
            affiliation={obj}
            onDelete={handleDelete}
          />
        )}
      </Show>

      {/* Crear */}
      <Show condicion={options == switchOptions.CREATE}>
        <CreateAffiliation
          info={historial?.info}
          onClose={() => setOptions()}
          onSave={handleSave}
        />
      </Show>
    </Form>
  )
}

export default Sindicato;