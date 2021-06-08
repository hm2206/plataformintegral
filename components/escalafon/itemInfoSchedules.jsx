import React, { useRef, useEffect, useState, useMemo } from 'react';
import Fullcalendar from '../fullcalendar';
import { Button } from 'semantic-ui-react';
import CardLoader from '../cardLoader';
import Show from '../show';
import moment from 'moment';
import InfoProvider from '../../providers/escalafon/InfoProvider';
moment.locale('es');

// [
//     {
//       title  : 'event1',
//       start  : '2021-06-01'
//     }
// ]

// providers
const infoProvider = new InfoProvider();

const ItemInfoSchedules = ({ info }) => {

    // ref
    const calendarRef = useRef();

    // estados
    const [current_date, setCurrentDate] = useState(moment().format('YYYY-MM-DD'));
    const [current_loading, setCurrentLoading] = useState(false);
    const [events, setEvents] = useState([]);

    const toDay = moment().format('YYYY-MM-DD');

    // memo
    const displayDate = useMemo(() => {
        return moment(current_date).format('LL');
    }, [current_date]);

    const getSchedules = async () => {
        setCurrentLoading(true);
        let year =  moment(current_date).year();
        let month = moment(current_date).month() + 1;
        await infoProvider.schedules(info.id, { year, month })
        .then(async res => {
            let { schedules } = res.data;
            let payload = [];
            await schedules.forEach(schedule => {
                let displayStart = moment(`${schedule.date} ${schedule.time_start}`).format('HH:mm A');
                // add datos
                payload.push({
                    id: schedule.id,
                    title: `${displayStart}`,
                    start: schedule.date,
                    schedule
                });
            });
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

    useEffect(() => {
        if (current_date) getSchedules();
    }, [current_date]);

    // render
    return (
        <div className="card">
            <div className="card-header uppercase">
                <i className="fas fa-info-circle"></i>  {info?.type_categoria?.descripcion || ""} - <span className="badge badge-primary">{info?.pap || ""}</span>
            </div>
            <div className="card-body">
                <div className="row mb-4">
                    <div className="col-md-9 col-6">
                        <h3>{displayDate}</h3>
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
                        // eventClick={handleDelete}
                    />
                    {/* loader */}
                    <Show condicion={current_loading}>
                        <CardLoader/>
                    </Show>
                </div>
            </div>
        </div>
    )
} 

export default ItemInfoSchedules;