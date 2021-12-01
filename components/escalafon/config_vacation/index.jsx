import React, { useState, useEffect } from 'react';
import collect from 'collect.js';
import { SelectWorkConfigVacation } from '../../select/escalafon';
import CreateConfigVacation from './createConfigVacation';
import EditConfigVacation from './editConfigVacation';
import { Button } from 'semantic-ui-react'
import moment from 'moment';
import Show from '../../show'
import Vacation from '../vacation/index';
import Visualizador from '../../visualizador'
import DialogReport from './dialogReport';
moment.locale('es');

const options = {
    CREATE: 'create',
    VIEW_FILE: 'edit',
    VIEW_REPORT: 'report'
}


const ConfigVacation = ({ work }) => {

    // estados
    const [current_config_vacation, setCurrentConfigVacation] = useState({});
    const [option, setOption] = useState("");
    const [is_add, setIsAdd] = useState(true);
    const [current_file, setCurrentFile] = useState({});

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

    const handleFile = (file) => {
        setCurrentFile(file);
        setOption(options.VIEW_FILE);
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

                        <Show condicion={true}>
                            <div className="col-md-1 col-1 mb-2">
                                <Button color="red" 
                                    fluid 
                                    basic
                                    onClick={() => setOption(options.VIEW_REPORT)}
                                >
                                    <i className="fas fa-file-pdf"></i> Reportes
                                </Button>
                            </div>
                        </Show>
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
            {/* visualizador */}
            <Show condicion={option == options.VIEW_FILE}>
                <Visualizador
                    name={current_file?.name}
                    extname={current_file?.extname}
                    url={current_file?.url}
                    size={current_file?.size}
                    is_observation={false}
                    is_print={true}
                    onClose={() => setOption("")}
                />
            </Show>
            {/* reportes */}
            <Show condicion={option == options.VIEW_REPORT}>
                <DialogReport work={work}
                    onClose={() => setOption("")}
                    onFile={handleFile}
                /> 
            </Show>
        </>
    )
}

// export 
export default ConfigVacation;