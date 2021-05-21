import React, { useEffect, useState, useContext, createRef } from 'react';
import { EntityContext } from '../../contexts/EntityContext';
import { Confirm } from '../../services/utils';
import collect from 'collect.js';
import moment from 'moment';
import Fullcalendar from '../fullcalendar';
import ConfigAssistanceProvider from '../../providers/escalafon/ConfigAssistanceProvider';
import { AppContext } from '../../contexts';
import Swal from 'sweetalert2';
moment.locale('es');

// providers
const configAssistanceProvider = new ConfigAssistanceProvider();

const schemaEvent = {
    id: "",
    title: "Asistencia",
    date: ""
}

const ListAssistance = () => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const { entity_id } = useContext(EntityContext);

    // ref
    const calendarRef = createRef();

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false); 
    const [is_ready, setIsReady] = useState(false);
    const [events, setEvents] = useState([]);
    const [current_date, setCurrentDate] = useState("");

    // config
    const options = {
        headers: { EntityId: entity_id }
    }

    const getAssistances = () => {
        let year = moment(current_date).year();
        let month = moment(current_date).month() + 1;
        configAssistanceProvider.index({ page: 1, year, month }, options)
        .then(res => {
            let { config_assistances } = res.data;
            let payload = [];
            for(let d of config_assistances.data) {
                payload.push({
                    ...schemaEvent,
                    id: d.id,
                    date: d.date
                });
            }
            // set datos
            setEvents(payload);
            setIsError(false);
            handleBtnChange();
        }).catch(err => setIsError(true));
    }

    const handleClick = async (info) => {
        let newEvents = collect(events);
        let current_year = moment().format('YYYY');
        let current_month = moment().format('MM');
        let select_year = moment(info.dateStr).format('YYYY');
        let select_month = moment(info.dateStr).format('MM');
        if (!(current_year <= select_year)) return false;
        if (!(current_month <= select_month)) return false;
        // validar que ya existe
        let is_exists = await newEvents.where('date', info.dateStr).count();
        if (is_exists) return false;
        return handleSave(info);
    }

    const handleSave = async (info) => {
        let answer = await Confirm('info', `¿Estás seguro en agregar la fecha ${info.dateStr}?`, 'Agregar');
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await configAssistanceProvider.store({ date: info.dateStr }, options)
        .then(res => {
            app_context.setCurrentLoading(false);
            let { message, config_assistance } = res.data;
            Swal.fire({ icon: 'success', text: message });
            let payload = Object.assign({}, schemaEvent);
            payload.id = config_assistance.id;
            payload.date = info.dateStr;
            // guardar event
            setEvents([ ...events, payload ]);
            handleBtnChange();
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: err.message })
        });
    }

    const handleDelete = async (info) => {
        let { event } = info;
        let answer = await Confirm('warning', `¿Estás seguro en quitar la configuración de asistencia?`, 'Quitar');
        if (!answer) return false;
        // eliminar evento
        app_context.setCurrentLoading(true);
        await configAssistanceProvider.delete(event.id, {}, options)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message, config_assistance } = res.data;
            Swal.fire({ icon: 'success', text: message });
            let newEvents = await events.filter(e => e.id != config_assistance.id);
            setEvents(newEvents);
            handleBtnChange();
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: err.message });
        })
    }

    const handleBtnChange = () => {
        let [btnToday] = document.getElementsByClassName('fc-today-button') || {};
        let [btnPrev] = document.getElementsByClassName('fc-prev-button') || {};
        let [btnNext] = document.getElementsByClassName('fc-next-button') || {};
        // today
        btnToday?.addEventListener('click', () => {
            let nextDate = moment().format('YYYY-MM-DD');
            setCurrentDate(nextDate);
        });
        // prev
        btnPrev?.addEventListener('click', () => {
            let prevDate = moment(current_date).subtract('month', 1).format('YYYY-MM-DD');
            setCurrentDate(prevDate);
        });
        // next 
        btnNext?.addEventListener('click', () => {
            let nextDate = moment(current_date).add('month', 1).format('YYYY-MM-DD');
            setCurrentDate(nextDate);
        });
    }

    useEffect(() => {
        setCurrentDate(moment().format('YYYY-MM-DD'));
    }, []);

    useEffect(() => {
        if (is_ready) handleBtnChange();
    }, [is_ready, current_date]);

    useEffect(() => {
        if (current_date && entity_id) getAssistances();
    }, [entity_id, current_date]);

    // render
    return (
        <div className="card">
            <div className="card-body">
                <div className="table-responsive">
                    <Fullcalendar 
                        defaultView='dayGridMonth' 
                        locale="es"
                        events={events}
                        dateClick={handleClick}
                        eventClick={handleDelete}
                        eventColor="#d32f2f"
                        eventTextColor="#ffffff"
                        myRef={calendarRef}
                        onReady={(e) => setIsReady(true)}
                    />
                </div>
            </div>
        </div>
    );
}

export default ListAssistance;