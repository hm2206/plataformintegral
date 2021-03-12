import React, { useContext, useState, useEffect } from 'react';
import { Button, Form, Checkbox } from 'semantic-ui-react';
import Modal from '../modal'
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';
import Show from '../show';
import moment from 'moment';
import AddMetaToActivity from './addMetaToActivity';
import TableMeses from './tableMes';

// agregar actividad
const AddActivity = ({ objective, isClose, onCreate }) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [next, setNext] = useState(false);   
    const [refresh_table, setRefreshTable] = useState(false); 
    const [activity, setActivity] = useState({ page: 1, last_page: 0, total: 0, data: [] });
    const [old, setOld] = useState({ page: 1, last_page: 0, total: 0, data: [] });
    const [current_loading, setCurrentLoading] = useState(false);
    const [cancel, setCancel] = useState(false);
    const [edit, setEdit] = useState(false);
 
    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // habilitar edición
    const toggleEdit = (index, obj) => {
        obj._edit = obj._edit ? false : true;
        if (obj._edit) {
            obj.current_title = obj.title;
            obj.current_programado = JSON.parse(JSON.stringify(obj.programado));
        } else {
            obj.title = obj.current_title;
            obj.programado = JSON.parse(JSON.stringify(obj.current_programado));
        }
        // setting
        let newActivity = JSON.parse(JSON.stringify(activity));
        newActivity.data[index] = obj;
        setActivity(newActivity);
    }

    // obtener el checked
    const onChecked = async ({ count, data = [], start, over }) => {
        setNext(count ? true : false);
        let datos = [];
        await data.map(async d => await datos.push(d.value))
        setForm({ ...form, programado: datos });
    }

    // obtener activities
    const getActivities = async (nextPage = 1, up = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`objective/${objective.id}/activity?page=${nextPage}`)
            .then(({ data }) => {
                let payload = { 
                    last_page: data.activities.last_page,
                    total: data.activities.total,
                    data: up ? [...activity.data, ...data.objectives.data] : data.activities.data,
                    page: data.activities.page
                };
                setActivity(payload);
                setOld(JSON.parse(JSON.stringify(payload)));
            }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // crear actividad
    const createActivity = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en guardar los datos?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = Object.assign({}, form);
            datos.objective_id = objective.id;
            datos.programado = JSON.stringify(form.programado);
            await projectTracking.post(`activity`, datos)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                    setErrors({});
                    setRefreshTable(true);
                    getActivities();
                    if (typeof onCreate == 'function') onCreate();
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { errors, message } = err.response.data;
                        Swal.fire({ icon: 'warning', text: message });
                        setErrors(errors);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: err.message });
                    }
                });
            setRefreshTable(false);
        }
    }

    // editar acvtividades
    const handleActivity = async (index, { name, value }) => {
        let newActivity = Object.assign({}, activity);
        let newData = JSON.parse(JSON.stringify(activity.data));
        newData[index][name] = value;
        newActivity.data = newData;
        setActivity(newActivity);
        setEdit(true);
    }

    // seleccionar check de las actividades
    const handleCheckActivity = async (index, { count, data, start, over }) => {
        let newActivity = Object.assign({}, activity);
        let newData = JSON.parse(JSON.stringify(newActivity.data));
        let payload = [];
        await data.map(d => payload.push(d.value));
        newData[index].programado = payload;
        newActivity.data = newData;
        setActivity(newActivity);
        setEdit(true);
    }

    // actualizar activities
    const updateActivity = async (index, obj) => {
        let answer = await Confirm("warning", `¿Deseas guardar los datos?`, 'Guardar');
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = Object.assign({}, obj);
            datos.programado = JSON.stringify(datos.programado);
            await projectTracking.post(`activity/${obj.id}/update`,  datos)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    let newActivity = JSON.parse(JSON.stringify(activity));
                    obj._edit = false;
                    newActivity.data[index] = obj;
                    setOld(JSON.parse(JSON.stringify(newActivity)));
                    setActivity(newActivity);
                    setEdit(false);
                })
                .catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { message } = err.response.data;
                        Swal.fire({ icon: 'error', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                });
        }
    }

    // cancelar edicion
    useEffect(() => {
        if (cancel) {
            setActivity(JSON.parse(JSON.stringify(old)))
            setCancel(false);
            setEdit(false);
        }
    }, [cancel]);

    // obtener actividades
    useEffect(() => {
        getActivities();
    }, []);

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-plus"></i> Agregar Actividad</span>}
            isClose={isClose}
            md="12"
        >  
            <Form className="card-body">
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
                                    {activity.data.map((act, indexA) => 
                                        <tr key={`result-activity-${indexA}`}>
                                            <td>
                                                <textarea
                                                    placeholder="Titulo de la actividad"
                                                    name="title"
                                                    value={act.title || ""}
                                                    rows="2"
                                                    disabled={!act._edit}
                                                    onChange={(e) => handleActivity(indexA, e.target)}
                                                />
                                            </td>
                                            <td>
                                                <TableMeses 
                                                    refresh={!act._edit}
                                                    rows={project.duration}
                                                    isHeader={false}
                                                    defaultPosition={act.programado}
                                                    onChecked={(obj) => handleCheckActivity(indexA, obj)}
                                                    disabled={!act._edit}
                                                />
                                            </td>
                                            <Show condicion={project.state != 'OVER' && project.state != 'PREOVER'}>
                                                <td>
                                                    <div className="btn-group">
                                                        <button className={`btn btn-sm btn-outline-${act._edit ? 'red' : 'primary'}`}
                                                            onClick={(e) => toggleEdit(indexA, act)}
                                                        >
                                                            <i className={`fas fa-${act._edit ? 'times' : 'edit'}`}></i>
                                                        </button>
                                            
                                                        <Show condicion={act._edit}
                                                            predeterminado={
                                                                <button className="btn btn-sm btn-outline-red">
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            }
                                                        >
                                                            <button className="btn btn-sm btn-outline-success"
                                                                onClick={(e) => updateActivity(indexA, act)}
                                                            >
                                                                <i className="fas fa-save"></i>
                                                            </button>
                                                        </Show>
                                                    </div>
                                                </td>
                                            </Show>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="col-md-12">
                        <hr/>
                    </div>

                    <div className="col-md-12">
                        <AddMetaToActivity
                            objective={objective}
                        />
                    </div>
                </div>
            </Form>
        </Modal>
    )
}

export default AddActivity;