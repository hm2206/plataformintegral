import React, { useRef, useEffect, useState, useMemo } from 'react';
import Fullcalendar from '../../fullcalendar';
import { Button } from 'semantic-ui-react';
import CardLoader from '../../cardLoader';
import Show from '../../show';
import moment from 'moment';
import CreateBallot from './createBallot';
import EditBallot from './editBallot';
import InfoProvider from '../../../providers/escalafon/InfoProvider';
moment.locale('es');

const options = {
    CREATE: "CREATE"
};

// providers
const infoProvider = new InfoProvider();

const ItemInfoSchedules = ({ info }) => {

    // ref
    const calendarRef = useRef();

    // estados
    const [current_date, setCurrentDate] = useState(moment().format('YYYY-MM-DD'));
    const [current_loading, setCurrentLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [current_ballot, setCurrentBallot] = useState({});
    const [option, setOption] = useState("");
    const isChurrentBallot = Object.keys(current_ballot).length;

    const toDay = moment().format('YYYY-MM-DD');

    // memo
    const displayDate = useMemo(() => {
        return moment(current_date).format('LL');
    }, [current_date]);

    const formatterEvent = (ballot) => {
        return {
            id: ballot.id,
            title: ballot.ballot_number,
            start: ballot.schedule?.date,
            className: "cursor-pointer",
            ballot
        }
    }

    const getPapeletas = async () => {
        setCurrentLoading(true);
        let year =  moment(current_date).year();
        let month = moment(current_date).month() + 1;
        await infoProvider.ballots(info.id, { year, month })
        .then(async res => {
            let { ballots } = res.data;
            let payload = [];
            await ballots?.forEach(ballot => {
                // add datos
                payload.push(formatterEvent(ballot));
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

    const handleEvent = ({ event }) => {
        let { ballot } = event.extendedProps;
        setCurrentBallot(ballot);
    }

    const onSave = (ballot) => {
        setEvents(prev => [...prev, formatterEvent(ballot)]);
        setOption("");
    }

    const onUpdate = async (ballot) => {
        await onDelete(ballot, false);
        await onSave(ballot);
        setCurrentBallot(prev => ({ ...prev, ...ballot }));
    }

    const onDelete = async (ballot, show = true) => {
        let newEvents = await events.filter(e => e.id != ballot.id);
        setEvents(newEvents);
        if (show) setCurrentBallot({});
    }

    useEffect(() => {
        if (current_date) getPapeletas();
    }, [current_date]);

    // render
    return (
        <div className="card">
            <div className="card-header uppercase">
                <div className="row">
                    <div className="col-9">
                        <i className="fas fa-info-circle mr-1"></i>  
                        <span className="badge badge-dark mr-2">{info?.planilla?.nombre || ""}</span> 
                        {info?.type_categoria?.descripcion || ""} - <span className="badge badge-primary">{info?.pap || ""}</span>
                    </div>
                    <Show condicion={info?.estado}
                        predeterminado={
                            <div className="col-3 text-right">
                                <i className="fas fa-circle text-muted"></i>
                            </div>
                        }
                    >
                        <div className="col-3 text-right">
                            <Button.Group size="mini">
                                <Button 
                                    onClick={() => setOption(options.CREATE)}
                                >
                                    <i className="fas fa-plus"></i>
                                </Button>
                            </Button.Group>
                            <i className="fas fa-circle text-success ml-3"></i>
                        </div>
                    </Show>
                </div>
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
                        eventClick={handleEvent}
                    />
                    {/* loader */}
                    <Show condicion={current_loading}>
                        <CardLoader/>
                    </Show>
                </div>

                {/* crear papeleta */}
                <Show condicion={option == options.CREATE}>
                    <CreateBallot
                        date={current_date}
                        onSave={onSave}
                        info={info}
                        onClose={() => setOption("")}
                    />
                </Show>

                {/* edit */}
                <Show condicion={isChurrentBallot}>
                    <EditBallot
                        ballot={current_ballot}
                        info={info}
                        onClose={() => setCurrentBallot({})}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                    />
                </Show>
            </div>
        </div>
    )
} 

export default ItemInfoSchedules;