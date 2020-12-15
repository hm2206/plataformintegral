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

// componente de tabla de meses seún duración
const TableMeses = ({ rows = 1, onChecked, isHeader = true, refresh = false, disabled = false, defaultPosition = [], onReady, dateInitial = moment().format('YYYY-MM-DD') }) => {

    const isDefault = defaultPosition.length;
    
    // estados
    const [current_rows, setCurrentRows] = useState([]);

    // generar filas
    const generateRows = async () => {
        let newRows = [];
        for(let i = 0; i < rows; i++) {
            if (isDefault) {
                let value = i + 1;
                console.log(defaultPosition.includes(value) ? true : false);
                // add
                await  newRows.push({
                    index: i,
                    value,
                    checked: defaultPosition.includes(value) ? true : false
                });
            } else {
                await  newRows.push({
                    index: i,
                    value: i + 1,
                    checked: false
                });
            }
        }
        // assignar
        setCurrentRows(newRows);
        // listo
        if (typeof onReady == 'function') onReady(newRows);
    }

    // seleccionar casillero
    const handleCheck = async (index, checked) => {
        let newCurrentRows = JSON.parse(JSON.stringify(current_rows));
        let newObj = newCurrentRows[index];
        newObj.checked = checked;
        newCurrentRows[index] = newObj;
        let range_start = {};
        let range_over = {};
        // filtrar solo checked
        let obj_checked = await newCurrentRows.filter(e => e.checked);
        let is_checked = obj_checked.length
        // validar rango de selección
        // if (is_checked) {
        //     // rangos de selección
        //     range_start = obj_checked[0];
        //     range_over = obj_checked[is_checked - 1];
        //     // validar selección masiva
        //     if (range_start.index < newObj.index && range_over.index > newObj.index) {
        //         // deseleccionar
        //         for(let initial = newObj.index; initial <= range_over.index; initial++) {
        //             obj_checked.splice(initial, 1);
        //             newCurrentRows[initial].checked = false;
        //         }
        //         // validar ultimo valor
        //         obj_checked.pop();
        //         // nuevo ultimo valor
        //         range_over = obj_checked[obj_checked.length - 1];
        //     } else {
        //         // seleccionar masivamente
        //         if (range_start.index + 1 < range_over.index) {
        //             for(let initial = range_start.index; initial < range_over.index; initial++) {
        //                 newCurrentRows[initial].checked = true;
        //             }
        //         }
        //     }
        // }
        // disparar checked
        if (typeof onChecked == 'function') onChecked({ count: is_checked, data: obj_checked, start: range_start.value, over: range_over.value });
        setCurrentRows(newCurrentRows);
    }

    // generar filas cada vez que se modifique el row
    useEffect(() => {
        if (rows) generateRows();
    }, [rows]);

    // refrescar el generador de filas
    useEffect(() => {
        if (refresh) generateRows();
    }, [refresh]);

    // render
    return <div className="table-responsive">
        <table className="w-100">
            <tbody>
                <Show condicion={isHeader}>
                    <tr>
                        {current_rows.map(r => 
                            <th key={`table-rows-select-header-${r.index}`} width="5%">{`${moment(dateInitial).add(r.index, "month").format("LL")}`.substr(0, 3)}</th>    
                        )}
                    </tr>
                    <tr>
                        {current_rows.map(r => 
                            <th key={`table-rows-select-header-${r.index}`} width="5%">{r.value}</th>    
                        )}
                    </tr>
                </Show>
                <tr>
                    {current_rows.map(r => 
                        <td key={`table-rows-select-body-${r.index}`} width="5%" className={r.checked ? 'bg-primary' : ''}>
                            <Checkbox checked={r.checked} onChange={(e, obj) => handleCheck(r.index, obj.checked)} disabled={disabled}/>
                        </td>    
                    )}
                </tr>
            </tbody>
        </table>
    </div>
}

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
    const [cancel_table, setCancelTable] = useState(false);
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
            app_context.fireLoading(true);
            let datos = Object.assign({}, form);
            datos.objective_id = objective.id;
            datos.programado = JSON.stringify(form.programado);
            await projectTracking.post(`activity`, datos)
                .then(res => {
                    app_context.fireLoading(false);
                    let { success, message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                    setErrors({});
                    setRefreshTable(true);
                    getActivities();
                    if (typeof onCreate == 'function') onCreate();
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
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
        newData[index].start = start;
        newData[index].over = over;
        newActivity.data = newData;
        setActivity(newActivity);
        setEdit(true);
    }

    // actualizar activities
    const updateActivities = async () => {
        let answer = await Confirm("warning", `¿Deseas guardar los datos?`, 'Guardar');
        if (answer) {
            let activities = JSON.stringify(activity.data);
            await projectTracking.post(`activity/${objective.id}/update_all`, { activities })
                .then(res => {
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setOld(JSON.parse(JSON.stringify(activity)));
                    setEdit(false);
                })
                .catch(err => {
                    try {
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
            setCancelTable(true);
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
                                        <th width="5%">Agregar</th>
                                    </tr>
                                </thead>
                                <tbody>
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
                                                    refresh={cancel_table}
                                                    rows={project.duration}
                                                    isHeader={false}
                                                    defaultPosition={act.programado}
                                                    onChecked={(obj) => handleCheckActivity(indexA, obj)}
                                                    onReady={(e) => setCancelTable(false)}
                                                    disabled={!act._edit}
                                                />
                                            </td>
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
                                                            onClick={(e) => toggleEdit(indexA, act)}
                                                        >
                                                            <i className="fas fa-save"></i>
                                                        </button>
                                                    </Show>
                                                </div>
                                            </td>
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

                    <Show condicion={edit}>
                        <div className="col-md-12 text-right">
                            <hr/>
                            <Button color="red" onClick={(e) => setCancel(true)}>
                                <i className="fas fa-times"></i> Cancelar
                            </Button>

                            <Button color="teal" onClick={updateActivities}>
                                <i className="fas fa-save"></i> Guardar Cambios
                            </Button>
                        </div>
                    </Show>
                </div>
            </Form>
        </Modal>
    )
}

export default AddActivity;