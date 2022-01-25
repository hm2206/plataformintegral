import React, { useState, useEffect, useMemo, useContext } from 'react';
import Skeletor from 'react-loading-skeleton';
import { Form, List, Button, Image } from 'semantic-ui-react';
import Show from '../../show';
import { SelectPim } from '../../select/micro-planilla';
import { microPlanilla } from '../../../services/apis';
import { BtnFloat } from '../../Utils';
import { AppContext } from '../../../contexts';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';

const PlaceholderInput = ({ height = '38px', width = "100%", circle = false }) => <Skeletor height={height} width={width} circle={circle}/>

const PlaceholderInfos = () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <>
      {array.map(iter => 
        <div className="row mb-3" key={`add-info-${iter}`}>
          <div className="ml-3 col-xs">
            <PlaceholderInput circle={true} width="50px" height="50px"/>
          </div>
          <div className="col-md-9 col-8">
            <PlaceholderInput width="100%"/>
          </div>
          <div className="col-md-1 text-right col-2">
            <PlaceholderInput/>
          </div>
        </div>   
      )}
    </>
  )
}

const ItemHistorial = ({ historial = {}, isCheck = false, onToggleCheck = null }) => {

  const displayContract = useMemo(() => {
    return historial?.info?.contract || {}
  }, [historial]);

  const handleToggleCheck = () => {
    if (typeof onToggleCheck == 'function') {
      onToggleCheck(historial?.id, !isCheck);
    }
  }

  const displayFullname = useMemo(() => {
    return `${displayContract?.work?.person?.lastname} ${displayContract?.work?.person?.name}`;
  }, [displayContract]);

  return (
    <List.Item>
      <List.Content floated='right'>
        <Button color={'red'}
          basic={!isCheck}
          className="mt-1"
          onClick={handleToggleCheck}
        >
          <i className={`fas fa-${isCheck ? 'trash' : 'plus'}`}></i>
        </Button>
      </List.Content>
      <Image avatar src={'/img/base.png'} 
        style={{ objectFit: 'cover' }}
      />
      <List.Content>
        <span className="uppercase mt-1">
          {displayFullname || ''}
        </span>
        <br/>
        <span className="badge badge-dark mt-1 mb-2">
          {displayContract?.typeCategory?.name} - {displayContract?.condition}
        </span>
      </List.Content>
    </List.Item>
  )
}

const RemoveHistorial = ({ cronograma = {} }) => {

  // states
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentLoading, setCurrentLoading] = useState(false);
  const [isChecked, setIsChecked] = useState([]);
  const [isRefresh, setIsRefresh] = useState(true);
  const [form, setForm] = useState({ 
    querySearch: "",
    pimId: "",
  });

  const app_context = useContext(AppContext);

  const handleInput = ({ name, value }) => {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const getHistorials = async (add = false) => {
    if (!add) setIsChecked([]);
    setCurrentLoading(true);
    const params = new URLSearchParams;
    params.set('page', page);
    if (form?.querySearch) params.set('querySearch', form?.querySearch);
    await microPlanilla.get(`cronogramas/${cronograma?.id}/historials`, { params })
      .then(({ data }) => {
        const newItems = data?.items || [];
        const meta = data?.meta || {}
        setItems(prev => add ? [...prev, ...newItems] : newItems);
        setLastPage(meta?.totalPages || 1);
        setTotal(meta?.totalItems || 0);
      }).catch(() => {
        setItems([]);
        setLastPage(0);
        setTotal(0);
        setPage(prev => (prev > 1 ? prev - 1 : 1))
      })
    setCurrentLoading(false);
  }

  const handleToggleCheck = (id, isCheck) => {
    // leave
    if (!isCheck) {
      const ids = isChecked.filter(c => c != id);
      return setIsChecked(ids);
    }
    // add
    setIsChecked(prev => ([...prev, id]));
  }

  const handleDelete = async () => {
    const answer = await Confirm('warning',
      '¿Estás seguro en eliminar a los trabajadores de planilla?',
      'Eliminar');
    if (!answer) return;
    // send
    app_context.setCurrentLoading(true);
    const payload = {};
    payload.ids = isChecked;
    await microPlanilla.delete(`cronogramas/${cronograma.id}/historials`, { data: payload })
      .then(async () => {
        app_context.setCurrentLoading(false);
        await Swal.fire({
          icon: 'success',
          text: 'Los regístros se eliminaron correctamente!'
        })
        // reload
        setIsRefresh(true);
      }).catch(() => {
        app_context.setCurrentLoading(false);
        Swal.fire({
          icon: 'error',
          text: 'No se pudó eliminar los regístros'
        })
    })
  }

  useEffect(() => {
    if (isRefresh) getHistorials();
  }, [isRefresh]);

  useEffect(() => {
    if (isRefresh) setIsRefresh(false);
  }, [isRefresh]);

  useEffect(() => {
    if (page > 1) getHistorials(true);
  }, [page]);
  
  return (
    <Form className="card-body">
      <div className="row">
        <div className="col-md-6 mb-1">
          <Form.Field>
            <input type="text" 
              placeholder="Buscar por: Apellidos y Nombres"
              name="querySearch"
              value={form.querySearch || ""}
              disabled={currentLoading}
              onChange={({ target }) => handleInput(target)}
            />
          </Form.Field>
        </div>

        <div className="col-md-4 mb-1">
          <Form.Field>
            <SelectPim
              year={cronograma?.year}
              name="pimId"
              value={form?.pimId || ''}
              onChange={(e, obj) => handleInput(obj)}
            />
          </Form.Field>
        </div>

        <div className="col-md-2 col-12">
          <Button color="blue"
            fluid
            onClick={() => setIsRefresh(true)}
            disabled={currentLoading}
          >
            <i className="fas fa-search"></i>
          </Button>
        </div>

        <div className="col-md-12">
          <hr />
          Resultados: {total}
        </div>

        <div className="col-md-12 mt-3">
          <List divided verticalAlign='middle'>
            <Show condicion={!currentLoading}
              predeterminado={<PlaceholderInfos/>}
            >
              {items.map((obj, index) => 
                <ItemHistorial
                  historial={obj}
                  key={`list-info-add-${index}`}
                  onToggleCheck={handleToggleCheck}
                  isCheck={isChecked.includes(obj?.id)}
                />
              )}
            </Show>
          </List>    
        </div>

        <Show condicion={!items?.length && !currentLoading}>
          <div className="col-md-12 text-center pt-5 pb-5">
            <h4 className="text-muted">No se encontraron regístros</h4>
          </div>
        </Show>

        <div className="col-md-12 mt-3">
          <Button fluid
            onClick={() => setPage(prev => prev + 1)}
            disabled={!(lastPage > page) || currentLoading}
          >
              Obtener más registros
          </Button>
        </div>
      </div>

      {/* checked */}
      <Show condicion={isChecked.length}>
        <BtnFloat theme="btn-danger"
          onClick={handleDelete}
        >
          <i className="fas fa-trash"></i>
        </BtnFloat>
      </Show>
    </Form>
  );
}

export default RemoveHistorial;