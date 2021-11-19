import React, { useState, useEffect, useContext } from 'react';
import collect from 'collect.js';
import { SelectWorkConfigVacation } from '../../select/escalafon';
import CreateConfigVacation from './createConfigVacation';
import EditConfigVacation from './editConfigVacation';
import { Button } from 'semantic-ui-react'
import moment from 'moment';
import Show from '../../show'
import Vacation from '../vacation/index';
import { Confirm } from '../../../services/utils';
import WorkProvider from '../../../providers/escalafon/WorkProvider';
import { AppContext } from '../../../contexts/AppContext';
import Swal from 'sweetalert2';
import Visualizador from '../../visualizador'
moment.locale('es');

const workProvider = new WorkProvider();

const options = {
    CREATE: 'create',
    VIEW_FILE: 'edit'
}


const ConfigVacation = ({ work }) => {

    // app
    const app_context = useContext(AppContext);

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

    const handleReport = async (type = 'pdf', extname = 'pdf') => {
        let answer = await Confirm('info', `¿Estas seguro en generar el reporte de vacaciones?`, 'Generar');
        if (!answer) return;
        app_context.setCurrentLoading(true);
        await workProvider.reportVacations(work.id, { type })
        .then(res => {
            app_context.setCurrentLoading(false);
            let file = new File([res.data], `reporte-vacacion.${extname}`);
            let url = URL.createObjectURL(res.data);
            setCurrentFile({
                name: file.name,
                extname: extname,
                url,
                size: file?.size
            });
            setOption(options.VIEW_FILE);
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: 'No se pudó generar el reporte' });
        })
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

                        <Show condicion={true}>
                            <div className="col-md-1 col-1 mb-2">
                                <Button color="red" 
                                    fluid 
                                    basic
                                    onClick={handleReport}
                                >
                                    <i className="fas fa-file-pdf"></i>
                                </Button>
                            </div>

                            <div className="col-md-1 col-1 mb-2">
                                <Button color="olive" 
                                    fluid 
                                    basic
                                    onClick={() => handleReport('excel', 'xlsx')}
                                >
                                    <i className="fas fa-file-excel"></i>
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
        </>
    )
}

// export 
export default ConfigVacation;