import React, { useState, useEffect, Fragment } from 'react';
import collect from 'collect.js';
import { SelectWorkConfigVacation } from '../../select/escalafon';
import CreateConfigVacation from './createConfigVacation';
import EditConfigVacation from './editConfigVacation';
import Skeleton from 'react-loading-skeleton';
import { Button } from 'semantic-ui-react'
import moment from 'moment';
import Show from '../../show'
import Vacation from '../vacation/index';
moment.locale('es');

const options = {
    CREATE: 'create',
    EDIT: 'edit'
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


const ConfigVacation = ({ work }) => {

    // estados
    const [current_config_vacation, setCurrentConfigVacation] = useState({});
    const [option, setOption] = useState("");
    const [is_add, setIsAdd] = useState(true);

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
        <>
            <div className="row">
                <div className="col-md-12">
                    <h5 className="ml-3">Listado de Configuración de Vacaciones</h5>
                    <div className="row">
                        <div className="col-md-4 col-lg-3 col-10 mb-2">
                            <SelectWorkConfigVacation
                                displayText={(el) => el.year}
                                work_id={work.id}
                                value={current_config_vacation?.id}
                                onChange={handleConfigVacation}
                                refresh={is_add}
                            />
                        </div>

                        <div className="col-md-2 col-2 mb-2">
                            <Button color="green" fluid
                                onClick={() => setOption(options.CREATE)}
                            >
                                <i className="fas fa-plus"></i>
                            </Button>
                        </div>
                    </div>
                    <hr/>
                </div>

                <Show condicion={current_config_vacation?.id}>
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-header">
                                <i className="fas fa-cogs"></i> Configuración Vacaciones
                            </div>
                            <div className="card-body">
                                <EditConfigVacation
                                    config_vacation={current_config_vacation}
                                    work={work}
                                    onClose={() => setOption("")}
                                    onUpdate={onUpdate}
                                    onDelete={onDelete}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <Vacation work={work}
                            config_vacation={current_config_vacation}
                        />
                    </div>
                </Show>
            </div>
            {/* crear config vacation */}
            <Show condicion={option == options.CREATE}>
                <CreateConfigVacation
                    onSave={onSave}
                    work={work}
                    onClose={() => setOption("")}
                />
            </Show>
        </>
    )
}

// export 
export default ConfigVacation;