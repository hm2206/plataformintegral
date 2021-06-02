import React, { useState, useContext, useEffect, Fragment } from 'react';
import Skeleton from 'react-loading-skeleton';
import Show from '../show'
import { escalafon } from '../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import { collect } from 'collect.js';
import moment from 'moment';

moment.locale('es');

const itemDays = {
    0: "Domingo",
    1: "Lunes",
    2: "Martes",
    3: "Miercoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado"
}


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

const ItemContrato = ({ info }) => {

    const [schedules, setSchedules] = useState([]);

    const DrawHour = ({ schedule }) => {
        let date = moment(`${(new Date).toDateString()} ${schedule?.time_start}`);
        let format = date.format('HH:SS A');
        let type = date.format('A');
        let option = `${schedule?.config_schedule?.name || 'Personalizado'}`.toLowerCase();
        let is_config = schedule?.config_schedule?.name ? true : false;
        // render
        return (
            <>
                <i className={`fas fa-${type == 'AM' ? 'sun' : 'moon'} mr-1`}></i> 
                {format}
                <span className={`badge badge-${is_config ? 'info' : 'light'} capitalize badge-sm ml-1`}>{option}</span>
            </>
        );
    }

    const settingSchedules = async () => {
        let payload = [];
        let config_schedules = info?.config_schedule?.schedules || [];
        let datos = info?.schedules || [];
        datos.push(...config_schedules)
        let newSchedules = collect(datos).groupBy('index');
        let current_config_schedule = info?.config_schedule || {};
        // add format
        for (let attr in newSchedules.items) {
            let items = newSchedules.items[attr].sortBy('time_start').toArray();
            // add config
            await items?.map(i => {
                if (i.object_type == 'App/Models/ConfigSchedule') i.config_schedule = current_config_schedule;
                return i;
            });
            // agregar
            await payload.push({
                day: attr,
                data: items
            });
        }
        // setting
        setSchedules(payload);
    }

    useEffect(() => {
        settingSchedules();
    }, [info?.id]);

    // render
    return (
        <div className={`card font-13`}>
            <div className="card-header">
                Planilla: {info?.planilla?.nombre || ""}
            </div>
            <div className="card-body">
                <div className="row content-widget">
                    {schedules?.map((s, indexS) => 
                        <div className="col-md-3 col-xl-3 col-6 mb-2 mt-2"
                            key={`list-item-schedule-${indexS}`}
                        >
                            <div className="card card-body">
                                <h4 className="mb-1"><i className="fas fa-table"></i> {itemDays[s.day] || ''}</h4>
                                <hr />
                                <ul className="pl-1">
                                    {s?.data?.map((d, indexD) => 
                                        <li key={`item-day-${indexD}`} style={{ listStyle: 'none' }}>
                                            {<DrawHour schedule={d}/>}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
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
    }, []);

    // obtener contratos
    const getInfos = async (add = false) => {
        setCurrentLoading(true);
        await escalafon.get(`works/${work.id}/schedules`)
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
    return <div className="row">
        <div className="col-md-12">
            <h5>Listado de Horarios activos</h5>
            <hr/>
        </div>
        
        {current_infos.map((i, indexI) => 
            <div className="col-md-12" key={`info-list-${i.id}-${indexI}`}>
                <ItemContrato info={i}/>
            </div>
        )}

        <Show condicion={current_loading}>
            <Placeholder/>
        </Show>
    </div>
}

// export 
export default Contratos;