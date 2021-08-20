import React, { useContext, useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import Modal from '../modal'
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';
import Show from '../show';
import moment from 'moment';
import AddMetaToActivity from './addMetaToActivity';
import TableMeses from './tableMes';
import ItemActivity from './itemActivity';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';
import Skeleton from 'react-loading-skeleton';

const Placeholder = () => {
    const datos = [1, 2, 3, 4, 5, 6];
    return datos.map(d => 
        <tr key={`list-item-placeholder-activity-${d}`}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>    
    )
}

// agregar actividad
const AddActivity = ({ objective, isClose, plan_trabajo = {}, onSave = null }) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project, activities, dispatch } = useContext(ProjectContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [next, setNext] = useState(false);   
    const [refresh_table, setRefreshTable] = useState(false); 
    const [current_loading, setCurrentLoading] = useState(false);
    const isPlanTrabajo = Object.keys(plan_trabajo || {}).length
 
    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // obtener el checked
    const onChecked = async ({ count, data = [], start, over }) => {
        setNext(count ? true : false);
        let datos = [];
        await data.map(async d => await datos.push(d.value))
        setForm({ ...form, programado: datos });
    }

    // obtener activities
    const getActivities = async (add = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`objective/${objective.id}/activity?page=${activities.page || 1}&principal=${isPlanTrabajo ? 0 : 1}`)
            .then(({ data }) => {
                let payload = { 
                    last_page: data.activities.lastPage,
                    total: data.activities.total,
                    data: add ? [...activities.data, ...data.objectives.data] : data.activities.data
                };
                // setting data
                dispatch({ type: projectTypes.SET_ACTIVITIES, payload });
            }).catch(err => dispatch({ type: projectTypes.SET_ACTIVITIES, payload: { page: 1, data: [] } }));
        setCurrentLoading(false);
    }

    // crear actividad
    const createActivity = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en guardar los datos?`);
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        let datos = Object.assign({}, form);
        datos.objective_id = objective.id;
        datos.programado = JSON.stringify(form.programado);
        datos.plan_trabajo_id = plan_trabajo?.id || null;
        await projectTracking.post(`activity`, datos)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message, activity } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
            setRefreshTable(true);
            getActivities();
            if (typeof onSave == 'function') onSave(activity)
        }).catch(err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
        setRefreshTable(false);
    }

    // obtener actividades
    useEffect(() => {
        getActivities();
    }, []);

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-clock"></i> Control de Actividad</span>}
            isClose={isClose}
            md="12"
            height="80vh"
        >  
            <div className="card-body">
                <div className="row">
                    <div className="col-md-12">

                    </div>

                    <div className="col-md-12">
                        <div className="table-responsive">
                            <table className="table table-bordered font-12">
                                <thead className="text-center font-12" style={{ background: 'rgba(0, 0, 0, 0.05)' }}>
                                    <tr>
                                        <th width="35%">Actividad</th>
                                        <th>Duración <b className="badge badge-warning font-13">{moment(project.date_start).format('YYYY/MM/DD')}</b> al <b className="badge badge-warning font-13">{moment(project.date_over).format('YYYY/MM/DD')}</b></th>
                                        <Show condicion={project.state != 'OVER' && project.state != 'PREOVER'}>
                                            <th width="5%">Opción</th>
                                        </Show>
                                    </tr>
                                </thead>
                                <tbody>
                                    <Show condicion={project.state != 'OVER' && project.state != 'PREOVER'}>
                                        <tr>
                                            <td>
                                                <textarea
                                                    placeholder="Titulo de la actividad"
                                                    name="title"
                                                    value={form.title || ""}
                                                    rows="3"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </td>
                                            <td>
                                                <TableMeses 
                                                    dateInitial={project.date_start}
                                                    refresh={refresh_table}
                                                    rows={project.duration}
                                                    onChecked={onChecked}
                                                />
                                            </td>
                                            
                                            <td>
                                                <Button color="green"
                                                    basic
                                                    disabled={!next || !form.title}
                                                    onClick={createActivity}
                                                >
                                                    <i className="fas fa-plus"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    </Show>
                                    {/* listar actividades */}
                                    <Show condicion={!current_loading}
                                        predeterminado={<Placeholder/>}
                                    >
                                        {activities?.data?.map((act, indexA) => 
                                            <ItemActivity  key={`result-activity-${indexA}`}
                                                plan_trabajo={plan_trabajo}
                                                activity={act}
                                            />
                                        )}
                                        {/* no hay regístros */}
                                        <Show condicion={!activities?.data?.length}>
                                            <tr>
                                                <th className="text-center" colSpan="3">
                                                    No hay regístros disponibles
                                                </th>
                                            </tr>
                                        </Show>
                                    </Show>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Show condicion={!isPlanTrabajo}>
                        <div className="col-md-12">
                            <hr/>
                        </div>

                        <div className="col-md-12">
                            <AddMetaToActivity
                                objective={objective}
                            />
                        </div>
                    </Show>
                </div>
            </div>
        </Modal>
    )
}

export default AddActivity;