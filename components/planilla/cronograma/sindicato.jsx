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
import { AppContext } from '../../../contexts';

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

const SindicatoItem = ({ affiliation = {}, edit = false, onDelete = null, onEdit = null }) => {

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

  const handleOnEdit = () => {
    const obj = {
      id: affiliation.id,
      isPercent,
      amount: isPercent ? percent : amount
    }
    // send 
    if (typeof onEdit == 'function') onEdit(obj);
  }

  useEffect(() => {
    if (!edit) {
      setAmount(affiliation?.amount || 0);
      setIsPercent(affiliation?.isPercent || false);
      setPercent(affiliation?.percent || 0);
    }
  }, [edit]);

  useEffect(() => {
    if (edit) handleOnEdit();
  }, [amount, isPercent, percent]);

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
        <div className='col-10'>
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
  const { edit, setEdit, setRefresh, loading, historial, setBlock, cronograma, send, setSend, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
  const [current_loading, setCurrentLoading] = useState(true);
  const [sindicatos, setSindicatos] = useState([]);
  const [error, setError] = useState(false);
  const [options, setOptions] = useState();
  const [form, setForm] = useState([]);

  const app_context = useContext(AppContext);

  const switchOptions = {
    CREATE: "CREATE"
  }

  const headers = {
    CronogramaId: historial.cronogramaId
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

  const handleForm = (obj = {}) => {
    const newForm = form.filter(f => f.id != obj.id);
    // add
    newForm.push(obj);
    return setForm(newForm);
  }

  const updateAffiliations = async () => {
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
    await microPlanilla.put(`historials/${historial.id}/affiliations`, { affiliations: form }, { headers })
      .then(() => {
        app_context.setCurrentLoading(false);
        toast.success(`Los cambios se guardarón correctamente!`)
        findSindicato();
        setEdit(false);
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
    
  // primera carga
  useEffect(() => {
    setIsEditable(true);
    setIsUpdatable(true);
    if (historial.id) findSindicato();
    return () => { }
  }, [historial.id]);
  
  // update affiliations
  useEffect(() => {
    if (send) updateAffiliations();
  }, [send]);

  useEffect(() => {
    if (!edit) setForm([]);
  }, [edit])

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
            onEdit={handleForm}
          />
        )}
      </Show>

      {JSON.stringify(form)}

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