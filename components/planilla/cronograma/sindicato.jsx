import React, { useContext, useEffect, useState, Fragment } from 'react';
import { microPlanilla } from '../../../services/apis';
import { Button, Form } from 'semantic-ui-react';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import Show from '../../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import { SelectTypeSindicato } from '../../select/cronograma';
import { useMemo } from 'react';

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

const SindicatoItem = ({ affiliation = {}, edit = false }) => {

  const [amount, setAmount] = useState(affiliation?.amount);
  const [isPercent, setIsPercent] = useState(affiliation?.isPercent);
  const [percent, setPersent] = useState(affiliation?.percent);
  const [isEdit, setIsEdit] = useState(affiliation?.isEdit);

  const displayTypeAffiliation = useMemo(() => {
    return `${affiliation?.infoTypeAffiliation?.typeAffiliation?.name || ''}`;
  }, [affiliation]);

  const displayTypeAffiliationDate = useMemo(() => {
    return `${affiliation?.infoTypeAffiliation?.terminationDate}`;
  }, [affiliation]);

  const isOver = useMemo(() => {
    return affiliation?.infoTypeAffiliation?.isOver;
  }, [affiliation]);

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
              className={`
                ml-2 badge
                badge-${isEdit ? 'primary cursor-pointer' : 'light'
              }`}
            >
              {percent}%
            </span>
          </Show>
        </div>
        {/* monto */}
        <div className='col-10'>
          <Show condicion={!isPercent && isEdit}
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
              readOnly={!edit}
              value={amount || 0}
            />
          </Show>
        </div>
        {/* delete */}
        <div className='col-2 text-right'> 
          <Button color='red'
            fluid
            disabled={!edit}
            icon="trash"
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
  const { edit, setEdit, loading, historial, setBlock, cronograma, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
  const [current_loading, setCurrentLoading] = useState(true);
  const [sindicatos, setSindicatos] = useState([]);
  const [old, setOld] = useState([]);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({});
  
  // app
  const app_context = useContext(AppContext);

  // obtener descuentos detallados
  const findSindicato = async () => {
    setCurrentLoading(true);
    setBlock(true);
    await microPlanilla.get(`historials/${historial.id}/affiliations`)
      .then(({ data }) => {
        let { items } = data;
        setSindicatos(items || []);
        setOld(JSON.parse(JSON.stringify(items || [])));
        setBlock(false);
      }).catch(() => {
        setSindicatos([]);
        setOld([]);
        setError(true);
        setBlock(false);
      });
    setCurrentLoading(false);
  }
    
  // primera carga
  useEffect(() => {
    setIsEditable(true);
    setIsUpdatable(false);
    if (historial.id) findSindicato();
    return () => {}
  }, [historial.id]);

  // cambios en el form
  const handleInput = ({ name, value }) => {
    let newForm = Object.assign({}, JSON.parse(JSON.stringify(form)));
    newForm[name] = value;
    setForm(newForm);
  }

  // crear sindicato
  const createSindicato = async () => {
    let answer = await Confirm('warning', '¿Deseas guardar el Sindicato/Afiliación?');
    if (answer) {
      app_context.setCurrentLoading(true);
      let payload = {
        historial_id: historial.id,
        type_sindicato_id: form.type_sindicato_id
      };
      // send
      await unujobs.post('sindicato', payload, { headers: { CronogramaID: historial.cronograma_id } })
      .then(async res => {
        app_context.setCurrentLoading(false);
        let { success, message } = res.data;
        if (!success) throw new Error(message);
        await Swal.fire({ icon: 'success', text: message });
        await findSindicato();
        setEdit(false);
        setForm({});
      }).catch(err => {
        app_context.setCurrentLoading(false);
        Swal.fire({ icon: 'error', text: err.message })
      });
      setBlock(false);
    }
  }

  // eliminar sindicato
  const deleteSindicato = async (id, index) => {
    let answer = await Confirm('warning', '¿Deseas eliminar el Sindicato/Afiliación?');
    if (answer) {
      app_context.setCurrentLoading(true);
      setBlock(true);
      await unujobs.post(`sindicato/${id}`, { _method: 'DELETE' }, { headers: { CronogramaID: historial.cronograma_id } })
      .then(async res => {
        app_context.setCurrentLoading(false);
        let { success, message } = res.data;
        if (!success) throw new Error(message);
        await Swal.fire({ icon: 'success', text: message });
        let newSindicatos = JSON.parse(JSON.stringify(sindicatos));
        await newSindicatos.splice(index, 1);
        setSindicatos(newSindicatos);
        setOld(JSON.parse(JSON.stringify(newSindicatos)));
      })
      .catch(err => {
        app_context.setCurrentLoading(false);
        Swal.fire({ icon: 'error', text: err.message })
      });
      setBlock(false);
    }
  }
 
  return (
    <Form className="row">
      <div className="col-md-12">
        <div className="row">
          <div className="col-md-8 col-lg-5 col-10 mb-1">       
            <SelectTypeSindicato
              name="type_sindicato_id"
              disabled={!edit || loading || current_loading}
              value={form.type_sindicato_id || ""}
              onChange={(e, obj) => handleInput(obj)}
            />
          </div>
                
          <div className="col-xs col-md-4 col-lg-2 col-2">
            <Show condicion={!loading && !current_loading}
              predeterminado={<PlaceHolderButton/>}
            >
              <Button color="green"
                disabled={!form.type_sindicato_id || !edit}   
                onClick={createSindicato} 
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
          />
        )}
      </Show>
    </Form>
  )
}


export default Sindicato;