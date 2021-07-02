import React, { useState, useContext, useEffect, Fragment } from 'react';
import ItemInfoSchedules from './itemInfoSchedules';
import Skeleton from 'react-loading-skeleton';
import Show from '../../show'
import { escalafon } from '../../../services/apis';
import { Select } from 'semantic-ui-react';
import moment from 'moment';
moment.locale('es');


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


const Contratos = ({ work }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_infos, setCurrentInfos] = useState([]);
    const [page, setPage] = useState(1);
    const [estado, setEstado] = useState(1);
    const [current_total, setCurrenTotal] = useState(0);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [error, setError] = useState(false);

    // obtener contratos
    const getInfos = async (add = false) => {
        setCurrentLoading(true);
        let query_string = typeof estado == 'number' ? `estado=${estado}` : '';
        await escalafon.get(`works/${work.id}/infos?${query_string}`)
            .then(async res => {
                let { infos } = res.data;
                let payload = await infos?.data?.filter(i => i?.planilla?.principal == 1);
                setCurrentInfos(add ? [...current_infos, ...payload] : payload);
                setCurrenTotal(infos?.total);
                setPage(infos.current_page || 1);
                setCurrentLastPage(infos.last_pate || 0);
            }).catch(err => setError(true))
        setCurrentLoading(false);
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
            <h5 className="ml-3">Listado de Horarios activos</h5>
            <div className="col-md-3">
                <Select placeholder="Todos"
                    options={[
                        { key: "TODOS", value: "", text: "Todos" },
                        { key: "ENABLED", value: 1, text: "Activos" },
                        { key: "DISABLED", value: 0, text: "Terminados" },
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
                <ItemInfoSchedules info={i}/>
            </div>
        )}

        <Show condicion={current_loading}>
            <Placeholder/>
        </Show>
    </div>
}

// export 
export default Contratos;