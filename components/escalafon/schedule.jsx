import React, { useState, useContext, useEffect, Fragment } from 'react';
import ItemInfoSchedules from '../../components/escalafon/itemInfoSchedules';
import Skeleton from 'react-loading-skeleton';
import Show from '../show'
import { escalafon } from '../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
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
    const [current_total, setCurrenTotal] = useState(0);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [error, setError] = useState(false);

    // primera carga
    useEffect(() => {
        getInfos();
        return () => {
            setCurrentInfos([]);
            setPage(1);
            setCurrenTotal(0);
            setCurrentLastPage(0);
        }
    }, []);

    // obtener contratos
    const getInfos = async (add = false) => {
        setCurrentLoading(true);
        await escalafon.get(`works/${work.id}/infos?estado=1`)
            .then(res => {
                let { success, infos, message } = res.data;
                if (!success) throw new Error(message);
                setCurrentInfos(add ? [...current_infos, ...infos.data] : infos.data);
                setCurrenTotal(infos.total || 0);
                setPage(infos.current_page || 1);
                setCurrentLastPage(infos.last_pate || 0);
            }).catch(err => setError(true))
        setCurrentLoading(false);
    }

    // render
    return <div className="row justify-content-center">
        <div className="col-md-12">
            <h5>Listado de Horarios activos</h5>
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