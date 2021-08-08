import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Button, Form } from 'semantic-ui-react';
import CardLoader from '../../cardLoader';
import Show from '../../show';
import moment from 'moment';
import collect from 'collect.js';
import CreateConfigVacation from './createConfigVacation';
import EditConfigVacation from './editConfigVacation';
import InfoProvider from '../../../providers/escalafon/InfoProvider';
// import { SelectInfoConfigVacation } from '../../select/escalafon';
import Vacation from '../vacation/index';
moment.locale('es');

const options = {
    CREATE: "CREATE",
    EDIT: "EDIT",
};

// providers
const infoProvider = new InfoProvider();

const ItemInfoVacation = ({ info }) => {

    // estados
    const [current_config_vacation, setCurrentConfigVacation] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [option, setOption] = useState("");
    const [is_add, setIsAdd] = useState(false);
    const isCurrentConfigVacation = Object.keys(current_config_vacation).length;

    const formatterEvent = (ballot) => {
        return {
            id: ballot.id,
            title: ballot.ballot_number,
            start: ballot.schedule?.date,
            className: "cursor-pointer",
            ballot
        }
    }

    const handleConfigVacation = async (e, { value, options }) => {
        let allIndexs = collect(options).pluck('value').toArray();
        let index = allIndexs.indexOf(value);
        if (index < 0) return "";
        let tmpOption = options[index];
        setCurrentConfigVacation(tmpOption?.obj || {});
    }

    const onSave = () => {
        setIsAdd(true);
        setOption("");
    }

    const onUpdate = async (config_vacation) => {
        setCurrentConfigVacation(prev => ({ ...prev, ...config_vacation }));
        setIsAdd(true);
    }

    const onDelete = async (config_vacation) => {
        setCurrentConfigVacation({});
        setOption("");
        setIsAdd(true);
    }

    useEffect(() => {
        if (is_add) setIsAdd(false);
    }, [is_add]);

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
                                <Button onClick={() => setOption(options.CREATE)}>
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
                            {/* <SelectInfoConfigVacation
                                info_id={info.id}
                                name="config_vacation_id"
                                value={current_config_vacation?.id}
                                onChange={handleConfigVacation}
                                refresh={is_add}
                            /> */}
                        </div>

                        <div className="col-md-3 col-6 text-center">
                            <Button fluid 
                                color="black"
                                disabled={!current_config_vacation?.id}
                                basic
                                onClick={() => setOption(options.EDIT)}
                            >
                                <i className="fas fa-pencil-alt"></i>
                            </Button>
                        </div>
                    </div>
                </Form>
                {/* lista de vacaciones */}
                <Show condicion={isCurrentConfigVacation}>
                    <hr />
                    <Vacation info={info}
                        config_vacation={current_config_vacation} 
                    />
                </Show>
                {/* crear papeleta */}
                <Show condicion={option == options.CREATE}>
                    <CreateConfigVacation
                        onSave={onSave}
                        info={info}
                        onClose={() => setOption("")}
                    />
                </Show>

                {/* edit */}
                <Show condicion={option == options.EDIT}>
                    <EditConfigVacation
                        config_vacation={current_config_vacation}
                        info={info}
                        onClose={() => setOption("")}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                    />
                </Show>
            </div>
        </div>
    )
} 

export default ItemInfoVacation;