import React, { useRef, useEffect, useState, useMemo } from 'react';
import Fullcalendar from '../../fullcalendar';
import { Button } from 'semantic-ui-react';
import CardLoader from '../../cardLoader';
import Show from '../../show';
import moment from 'moment';
import EditSchedule from './editSchedule';
import CreateSchedule from './createSchedule';
import SyncScheduleInfos from './syncScheduleInfos';
import InfoProvider from '../../../providers/escalafon/InfoProvider';
moment.locale('es');

const options = {
    SYNC_INFOS: "SYNC_INFOS"
};

const modoStyles = {
    ALL: { backgroundColor: "#2887f3", borderColor: "#2887f3", display: 'time_start' },
    ENTRY: { backgroundColor: "#f7c46c", borderColor: "#f7c46c", textColor: '#000000', display: 'time_start' },
    EXIT: { backgroundColor: "#ea6759", borderColor: "#ea6759", display: 'time_over' },
}

// providers
const infoProvider = new InfoProvider();

const ItemInfoSchedules = ({ info }) => {

    // ref
    const calendarRef = useRef();

    // estados
    const [current_date, setCurrentDate] = useState(moment().format('YYYY-MM-DD'));
    const [current_loading, setCurrentLoading] = useState(false);
    const [select_date, setSelectDate] = useState();
    const [events, setEvents] = useState([]);
    const [add, setAdd] = useState(false);
    const [current_schedule, setCurrentSchedule] = useState({});
    const [option, setOption] = useState("");
    const isChurrentSchedule = Object.keys(current_schedule).length;

    const toDay = moment().format('YYYY-MM-DD');

    // memo
    const displayDate = useMemo(() => {
        let date = moment(current_date)
        let mes = date.format('MMMM');
        return `${mes} - ${date.year()}`;
    }, [current_date]);

    const formatterEvent = (obj) => {
        let current_style = modoStyles[obj.modo] || {};
        // mostrar display
        let displayTitle = moment(`${obj[current_style.display]}`, 'HH:mm:ss').format('HH:mm A');
        return {
            id: obj.id,
            title: `${displayTitle}`,
            start: obj.date,
            className: "cursor-pointer",
            schedule: obj,
            ...current_style
        }
    }

    const getSchedules = async () => {
        setCurrentLoading(true);
        let year =  moment(current_date).year();
        let month = moment(current_date).month() + 1;
        await infoProvider.schedules(info.id, { year, month })
        .then(async res => {
            // agregar schedules
            let { schedules } = res.data;
            let payload = [];
            await schedules.forEach(schedule => payload.push(formatterEvent(schedule)));
            // agregar eventos
            setEvents(payload);
        })
        .catch(err => console.log(err));
        setCurrentLoading(false);
    }

    const changeToDay = () => {
        let calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return;
        calendarApi.gotoDate(toDay);
        setCurrentDate(toDay);
    }

    const changeNext = () => {
        let calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return;
        let next = moment(current_date).add(1, 'month').format('YYYY-MM-DD');
        calendarApi.gotoDate(next);
        setCurrentDate(next);
    }

    const changePrev = () => {
        let calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return;
        let next = moment(current_date).subtract(1, 'month').format('YYYY-MM-DD');
        calendarApi.gotoDate(next);
        setCurrentDate(next);
    }

    const handleEvent = ({ event }) => {
        let { schedule } = event.extendedProps;
        setCurrentSchedule(schedule);
    }

    const handleAdd = (args) => {
        let current_fecha = moment();
        let select_fecha = moment(`${moment(args.dateStr).format('YYYY-MM')}-01`);
        let isDeny = current_fecha.diff(select_fecha, 'months').valueOf();
        if (isDeny >= 1) return;
        setSelectDate(args.dateStr);
        setAdd(true);
    }

    const onAdd = (schedule) => {
        setEvents((prev) => [...prev, formatterEvent(schedule)]);
        setAdd(false);
    }

    const onReplicar = async (schedules = []) => {
        let payload = [];
        await schedules.map(schedule => payload.push(formatterEvent(schedule)));
        // add
        setEvents(prev => [...prev, ...payload]);
        setCurrentSchedule({});
    }

    const onDelete = async (schedule, show = true) => {
        let newEvents = await events.filter(e => e.id != schedule.id);
        setEvents(newEvents);
        if (show) setCurrentSchedule({});
    }

    const onUpdate = async (schedule) => {
        await onDelete(schedule, false);
        await onAdd(schedule);
        setCurrentSchedule(prev => ({ ...prev, ...schedule }));
    }

    useEffect(() => {
        if (current_date) getSchedules();
    }, [info?.id, current_date]);

    // render
    return (
        <div className="card">
            <div className="card-body">
                <div className="row mb-4">
                    <div className="col-md-9 col-6">
                        <h3 className="capitalize">{displayDate}</h3>
                    </div>

                    <div className="col-md-3 col-6 text-center">
                        <Button.Group size="mini">
                            <Button basic 
                                onClick={changePrev}
                                icon="arrow left"
                                color="black"
                            />

                            <Button basic={toDay != current_date}
                                color="black"
                                onClick={changeToDay}
                            > 
                                Hoy
                            </Button>

                            <Button basic 
                                onClick={changeNext}
                                icon="arrow right" 
                                color="black"
                            />

                            <Show condicion={info?.estado}>
                                <Button icon="random" 
                                    color="black"
                                    basic
                                    onClick={() => setOption(options.SYNC_INFOS)}
                                />
                            </Show>
                        </Button.Group>
                    </div>
                </div>
                
                <div>
                    <Fullcalendar 
                        myRef={calendarRef}
                        defaultView='dayGridMonth' 
                        locale="es"
                        header={false}
                        defaultDate={current_date}
                        events={events}
                        eventTextColor="#ffffff"
                        eventClick={handleEvent}
                        dateClick={info?.estado ? handleAdd : null}
                    />
                    {/* loader */}
                    <Show condicion={current_loading}>
                        <CardLoader/>
                    </Show>

                    {/* crear */}
                    <Show condicion={add}>
                        <CreateSchedule
                            onSave={onAdd}
                            date={select_date}
                            info={info}
                            onClose={() => setAdd(false)}
                        />
                    </Show>

                    {/* edit */}
                    <Show condicion={isChurrentSchedule}>
                        <EditSchedule
                            info={info}
                            schedule={current_schedule}
                            onClose={(e) => setCurrentSchedule({})}
                            onReplicar={onReplicar}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                        />
                    </Show>

                    {/* sincronizar horarios filtrando contratos */}
                    <Show condicion={option == options.SYNC_INFOS}>
                        <SyncScheduleInfos info={info}
                            date={current_date}
                            onClose={() => setOption("")}
                        />
                    </Show>
                </div>
            </div>
        </div>
    )
} 

export default ItemInfoSchedules;