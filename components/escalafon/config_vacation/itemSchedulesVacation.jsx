import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Button, Form } from 'semantic-ui-react';
import CardLoader from '../../cardLoader';
import Show from '../../show';
import moment from 'moment';
import CreateConfigVacation from './createConfigVacation';
import EditBallot from './editVacation';
import InfoProvider from '../../../providers/escalafon/InfoProvider';
moment.locale('es');

const options = {
    CREATE: "CREATE"
};

// providers
const infoProvider = new InfoProvider();

const ItemInfoVacation = ({ info }) => {

    // ref
    const calendarRef = useRef();

    // estados
    const [current_config_vacation, setCurrentConfigVacation] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [current_ballot, setCurrentBallot] = useState({});
    const [option, setOption] = useState("");
    const isChurrentBallot = Object.keys(current_ballot).length;

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
        await infoProvider.ballots(info.id)
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
                <Form>
                    <div className="row mb-4">
                        <div className="col-md-9 col-6">
                            <input type="number" 
                                name="year"
                                placeholder="Ingrese el periodo anual"
                                value={current_config_vacation?.id}
                            />
                        </div>

                        <div className="col-md-3 col-6 text-center">
                            <Button fluid basic>
                                <i className="fas fa-pencil-alt"></i>
                            </Button>
                        </div>
                    </div>
                </Form>
                {/* crear papeleta */}
                <Show condicion={option == options.CREATE}>
                    <CreateConfigVacation
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

export default ItemInfoVacation;