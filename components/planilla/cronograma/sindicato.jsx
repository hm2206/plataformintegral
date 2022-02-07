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
import NotRegister from './not-register';

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

const ToggleEditDiscount = ({ isEdit = false, onToggle = null }) => {

  const toggleEdit = () => typeof onToggle == 'function' ? onToggle(!isEdit) : null;

  return (
    <span title={isEdit ? 'Edición habilitada' : 'Calculo Automático'}
      className={`toggle-edit toggle-input badge badge-${isEdit ? 'primary' : 'light'} cursor-pointer`}
      onClick={toggleEdit}
    >
      <i className={`fas fa-${isEdit ? 'pencil-alt' : 'percent'}`}></i>
    </span>
  )
}

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

const SindicatoItem = ({ affiliation = {}, edit = false, onDelete = null, onUpdate = null }) => {

  const [amount, setAmount] = useState(affiliation?.amount);
  const [isPercent, setIsPercent] = useState(affiliation?.isPercent);
  const [percent, setPercent] = useState(affiliation?.percent);
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

  const handleIsPercent = (newIsPercent = false) => {
    setIsPercent(newIsPercent);
    if (newIsPercent) {
      setAmount(affiliation.isPercent ? affiliation?.amount : 0);
      setPercent(affiliation?.percent || 0);
      return;
    } 
    // amount
    setAmount(affiliation?.amount);
    setPercent(affiliation?.percent)
  }

  const handleSave = async () => {
    const answer = await Confirm('warning', '¿Estás seguro guardar los cambios?');
    if (!answer) return;
    setCurrentLoading(true);
    const payload = {};
    payload.isPercent = isPercent == true;
    payload.amount = isPercent ? parseFloat(`${percent}`) : parseFloat(`${amount}`);
    await microPlanilla.put(`affiliations/${affiliation?.id}`, payload)
    .then(() => {
      toast.success(`El regístro se actualizó correctamente!`)
      if (typeof onUpdate == 'function') onUpdate(affiliation);
    }).catch(() => {
      toast.error(`No se pudó actualizar el regístro!`)
    });
    setCurrentLoading(false)
  }

  useEffect(() => {
    if (!edit) {
      setAmount(affiliation?.amount || 0);
      setIsPercent(affiliation?.isPercent || false);
      setPercent(affiliation?.percent || 0);
    }
  }, [edit]);

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
              {amount}
            </span>
          </Show>
        </div>
        {/* monto */}
        <div className='col-12'>
          {/* toggle edit */}
          <Show condicion={edit}>
            <ToggleEditDiscount
              isEdit={!isPercent}
              onToggle={() => handleIsPercent(!isPercent)}
            />
          </Show>
          {/* campos */}
          <Show condicion={!isPercent}
            predeterminado={
              <input type="number"
                className={`mb-2 ${edit ? 'input-active' : ''}`}
                disabled={!edit || currentLoading}
                value={percent || 0}
                onChange={({ target }) => setPercent(target.value)}
              />
            }
          >
            <input type="number"
              className={`mb-2 ${edit ? 'input-active' : ''}`}
              disabled={!edit || currentLoading}
              value={amount || 0}
              onChange={({ target }) => setAmount(target.value)}
            />
          </Show>
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
        {/* options */}
        <Show condicion={edit}>
          <div className='col-12 text-right'> 
            <Button.Group>
              <Show condicion={!currentLoading}
                predeterminado={
                  <Button
                    label="Cargando"
                    loading
                  />
                }
              >
                <Button color='blue'
                  disabled={!edit}
                  basic
                  icon="save"
                  onClick={handleSave}
                />
                <Button color='red'
                  disabled={!edit}
                  icon="trash"
                  onClick={handleDelete}
                />
              </Show>
            </Button.Group>
          </div>
        </Show>
        <hr />
      </div>  
    </div>
  )
}

const Sindicato = () => {

  // cronograma
  const { edit, setRefresh, loading, historial, setBlock, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
  const [current_loading, setCurrentLoading] = useState(true);
  const [sindicatos, setSindicatos] = useState([]);
  const [total, setTotal] = useState(0);
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
        let { items, meta } = data;
        setSindicatos(items || []);
        setBlock(false);
        setTotal(meta?.totalItems || 0);
      }).catch(() => {
        setSindicatos([]);
        setTotal(0);
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
    return () => { }
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
            onUpdate={handleSave}
          />
        )}
      </Show>

      {/* no hay regístros */}
      <Show condicion={!total && !current_loading}>
        <div className="col-12">
          <NotRegister/>
        </div>
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