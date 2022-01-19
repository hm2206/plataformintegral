import React, { useState, useEffect, Fragment } from 'react';
import Skeleton from 'react-loading-skeleton';
import Show from '../../show'
import { microPlanilla } from '../../../services/apis';
import { Select } from 'semantic-ui-react'
import { BtnFloat } from '../../Utils';
import CreateInfo from './create-contract';
import ItemInfo from './item-contract';
import EditContract from './edit-contract';

const Placeholder = () => {

    const datos = [1, 2, 3, 4];

    return <Fragment>
        <div className="col-md-12"></div>
        {datos.map((d, indexD) => 
            <div className="col-md-6 mb-3" key={`placeholder-contrato-${indexD}`}>
                <Skeleton height="50px"/>
                <Skeleton height="150px"/>
            </div>
        )}
    </Fragment>
}

const Infos = ({ work }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_infos, setCurrentInfos] = useState([]);
    const [page, setPage] = useState(1);
    const [current_total, setCurrenTotal] = useState(0);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [error, setError] = useState(false);
    const [estado, setEstado] = useState(true);
    const [option, setOption] = useState();
    const [current_info, setCurrentInfo] = useState({})

    // obtener contratos
    const getInfos = async (add = false) => {
      setCurrentLoading(true);
      const params = new URLSearchParams();
      if (estado !== "") params.set('state', estado)
      await microPlanilla.get(`works/${work.id}/contracts`, { params })
          .then(res => {
              const { items, meta } = res.data;
              setCurrentInfos(add ? [...current_infos, ...items] : items);
              setCurrenTotal(meta.totalItems || 0);
              setPage(meta.currentPage || 1);
              setCurrentLastPage(meta.totalPages || 0);
          }).catch(err => setError(true))
      setCurrentLoading(false);
    }

    const handleAdd = (obj) => {
      setCurrentInfo(obj);
      setOption('CREATE');
    }

    const handleEdit = (obj) => {
      setCurrentInfo(obj);
      setOption('EDIT');
    }

    const handleSave = () => {
      setOption("");
      getInfos();
    }

    // primera carga
    useEffect(() => {
      getInfos();
      return () => {
          setCurrentInfos([]);
          setPage(1);
          setCurrenTotal(0);
          setCurrentLastPage(0);
      }
    }, [estado]);

    // render
    return <div className="row">
        <div className="col-md-12">
            <h5 className="ml-3">Listado de Contratos y/o Nombramientos</h5>
            <div className="col-md-3">
                <Select placeholder="Todos"
                    options={[
                        { key: "TODOS", value: "", text: "Todos" },
                        { key: "ENABLED", value: true, text: "Activos" },
                        { key: "DISABLED", value: false, text: "Terminados" },
                    ]}
                    value={estado}
                    disabled={current_loading}
                    onChange={(e, obj) => setEstado(obj.value)}
                />
            </div>
            <hr/>
        </div>
        
        {current_infos.map((i, indexI) => 
            <div className="col-md-6" key={`info-list-${i.id}-${indexI}`}>
                <ItemInfo info={i} 
                    onEdit={() => handleEdit(i)}
                    onAdd={() => handleAdd(i)}
                />
            </div>
        )}

        <Show condicion={current_loading}>
            <Placeholder/>
        </Show>

        {/*  crear info */}
        <BtnFloat theme="btn-success"
            style={{ bottom: '50px' }}
            onClick={() => setOption("CREATE")}>
            <i className="fas fa-plus"></i>
        </BtnFloat>

        <Show condicion={option == 'CREATE'}>
            <CreateInfo 
                infoDefault={current_info}
                onClose={() => setOption()}
                work={work}
                onSave={handleSave}
            />
        </Show>

        <Show condicion={option == 'EDIT'}>
            <EditContract 
                infoDefault={current_info}
                onClose={() => setOption()}
                work={work}
                onSave={handleSave}
            />
        </Show>
    </div>
}

// export 
export default Infos;