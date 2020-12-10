import React, { useContext, useState, useEffect, Fragment } from 'react';
import { Button, Form, Checkbox } from 'semantic-ui-react';
import Modal from '../modal'
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { projectTracking } from '../../services/apis';
import AddGasto from './addGasto';
import AddDetalle from './addDetalle';
import ListDetalle from './listDetalle';
import Swal from 'sweetalert2';
import Show from '../show';
import currencyFormatter from 'currency-formatter';
import { SelectPresupuesto, SelectMedida } from '../select/project_tracking';


// agregar actividad
const CoinActivity = ({ objective, isClose, onCreate }) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);

    // estados
    const [activity, setActivity] = useState({ page: 1, last_page: 0, total: 0, data: [] });
    const [current_activity, setCurrentActivity] = useState({});
    const [current_gasto, setCurrentGasto] = useState({});
    const [old, setOld] = useState({ page: 1, last_page: 0, total: 0, data: [] });
    const [cancel, setCancel] = useState(false);
    const [edit, setEdit] = useState(false);
    const [option, setOption] = useState("");
    const [gastos, setGastos] = useState([]);
    const [current_loading, setCurrentLoading] = useState(false);

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

    // obtener gastos
    const getGastos = async (nextPage = 1, add = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`activity/${current_activity.id}/gasto?page=${nextPage}`)
            .then(async res => {
                let { lastPage, data } = res.data.gastos;
                setGastos(add ? [...gastos, ...data] : data);
                if (lastPage >= nextPage + 1) await getGastos(nextPage + 1, true);
            })
            .catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // actualizar gastos
    const onCreateGasto = async (gasto) => {
        await getGastos()
        let newActivity = Object.assign({}, activity);
        let newData = JSON.parse(JSON.stringify(newActivity.data));
        let newObj = newData[current_activity.index];
        newObj.total += gasto.total;
        newActivity.data = newData;
        setActivity(newActivity);
    }

    // habilitar edicion
    const toggleEdit = (index, obj) => {
        let newGastos = JSON.parse(JSON.stringify(gastos));
        obj.edit = obj.edit ? false : true;
        // validar datos
        if (obj.edit) {
            obj.current_monto = obj.monto;
            obj.current_cantidad = obj.cantidad;
            obj.current_total = obj.total;
        } else {
            obj.monto = obj.current_monto;
            obj.cantidad = obj.current_cantidad;
            obj.total = obj.current_total;
        }
        // setting gastos
        newGastos[index] = obj;
        setGastos(newGastos);
    }

    // modificar gasto
    const handleEditGasto = (index, obj, { name, value }) => {
        obj[name] = value;
        let newGasto = JSON.parse(JSON.stringify(gastos));
        newGasto[index] = obj;
        setGastos(newGasto);
    }

    // eliminar gasto
    const handleDeleteGasto = async (index, obj, indexParent, parent) => {
        let answer = await Confirm('warning', '¿Estas seguro en eliminar el gasto?');
        if (answer) {
            app_context.fireLoading(true);
            await projectTracking.post(`gasto/${obj.id}/delete`, obj)
                .then(res => {
                    app_context.fireLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    let newGastos = JSON.parse(JSON.stringify(gastos));
                    newGastos.splice(index, 1);
                    setGastos(newGastos);
                    // actualizar actividad
                    let newActividad = JSON.parse(JSON.stringify(activity));
                    parent.total = parseFloat(parent.total) - parseFloat(obj.total);
                    newActividad.data[indexParent] = parent;
                    setActivity(newActividad);
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let { message, errors } = err.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                });
        }
    }

    // actuliazar gasto
    const updateGasto = async (index, obj) => {
        let answer = await Confirm('warning', '¿Estas seguro en actualizar el gasto?')
        if (answer) {
            app_context.fireLoading(true);
            await projectTracking.post(`gasto/${obj.id}/update`, obj)
                .then(res => {
                    app_context.fireLoading(false);
                    let { message, gasto } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    obj = gasto;
                    let newGastos = JSON.parse(JSON.stringify(gastos));
                    newGastos[index] = obj;
                    setGastos(newGastos);
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let { message, errors } = err.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
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

    // executar gastos
    useEffect(() => {
        if (current_activity.id) {
            setGastos([]);
            getGastos();
        }
    }, [current_activity.id]);

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-coins"></i> Programación de Gastos</span>}
            isClose={isClose}
            md="12"
        >  
            <Form className="card-body">
                <div className="row">
                    <div className="col-md-12">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead className="text-center uppercase font-11" style={{ background: 'rgba(0, 0, 0, 0.05)' }}>
                                    <tr>
                                        <th>Descripción</th>
                                        <th width="10%">Ext Pres.</th>
                                        <th width="7%">Unidad</th>
                                        <th width="7%">Costo unitario(S./)</th>
                                        <th width="7%">Cantidad</th>
                                        <th width="7%">Costo Total(S./)</th>
                                        <th width="7%">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="7">
                                            <b>Objectivo Específico {objective.index + 1}: </b> {objective.title} 
                                        </td>
                                    </tr>
                                    {activity.data.map((act, indexA) => 
                                        <Fragment key={`presupuesto-${indexA}`}> 
                                            <tr style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                                                <th colSpan="5" className={`hover-basic ${current_activity && current_activity.id == act.id ? 'focus-basic' : ''}`} 
                                                    onClick={() => !current_loading ? setCurrentActivity({ ...act, index: indexA }) : null}
                                                >
                                                    Actividad {objective.index + 1}.{indexA + 1} : {act.title}
                                                </th>
                                                <td className="text-right">
                                                    {currencyFormatter.format(act.total, { code: 'PEN' })}
                                                </td>
                                                <td width="5%" className="text-center">
                                                    <Button size="mini"
                                                        basic
                                                        color="green"
                                                        disabled={current_loading}
                                                        onClick={(e) => {
                                                            setCurrentActivity({ ...act, index: indexA })
                                                            setOption("add_gasto")
                                                        }}
                                                    >
                                                        <i className="fas fa-plus"></i>
                                                    </Button>
                                                </td>
                                            </tr>  
                                            {/* body */}
                                            <Show condicion={act.id == current_activity.id}>
                                                {gastos.map((gas, indexG) => 
                                                    <tr key={`gastos-${gas.id}-activity-${act.id}-index-${indexG}`} 
                                                        className={`font-12`}
                                                    >
                                                        <th>
                                                            {gas.description}
                                                        </th>
                                                        <th className="text-center">
                                                            <Show condicion={gas.edit}
                                                                predeterminado={gas && gas.presupuesto && gas.presupuesto.ext_pptto || ""}
                                                            >
                                                                <SelectPresupuesto
                                                                    text="ext_pptto"
                                                                    execute={true}
                                                                    name="presupuesto_id"
                                                                    value={gas.presupuesto_id}
                                                                    onChange={(e, obj) => handleEditGasto(indexG, gas, obj)}
                                                                />
                                                            </Show>
                                                        </th>
                                                        <th className="text-center">
                                                            <Show condicion={gas.edit}
                                                                predeterminado={gas && gas.medida && gas.medida.name_short || ""}
                                                            >
                                                                <SelectMedida
                                                                    execute={true}
                                                                    name="medida_id"
                                                                    value={gas.medida_id}
                                                                    onChange={(e, obj) => handleEditGasto(indexG, gas, obj)}
                                                                />
                                                            </Show>
                                                        </th>
                                                        <th className="text-right">
                                                            <Show condicion={gas.edit}
                                                                predeterminado={currencyFormatter.format(gas.monto, { code: 'PEN' })}
                                                            >
                                                                <input type="number"
                                                                    name="monto"
                                                                    step="any"
                                                                    value={gas.monto || ""}
                                                                    onChange={(e) => handleEditGasto(indexG, gas, e.target)}
                                                                />
                                                            </Show>
                                                        </th>
                                                        <th className="text-center">
                                                            <Show condicion={gas.edit}
                                                                predeterminado={gas.cantidad}
                                                            >
                                                                <input type="number"
                                                                    name="cantidad"
                                                                    step="any"
                                                                    value={gas.cantidad || ""}
                                                                    onChange={(e) => handleEditGasto(indexG, gas, e.target)}
                                                                />
                                                            </Show>
                                                        </th>
                                                        <th className="text-right">{currencyFormatter.format(gas.total, { code: 'PEN' })}</th>
                                                        <td width="5%" className="text-center">
                                                            <div className="btn-group">
                                                                <button className={`btn btn-sm btn-outline-${gas.edit ? 'red' : 'primary'}`}
                                                                    onClick={(e) => toggleEdit(indexG, gas)}
                                                                >
                                                                    <i className={`fas fa-${gas.edit ? 'times' : 'edit'}`}></i>
                                                                </button>

                                                                <Show condicion={!gas.edit} 
                                                                    predeterminado={
                                                                        <button className="btn btn-sm btn-outline-success"
                                                                            onClick={(e) => updateGasto(indexG, gas)}
                                                                        >
                                                                            <i className="fas fa-save"></i>
                                                                        </button>
                                                                    }
                                                                >
                                                                    <Show condicion={gas.detalles && !gas.detalles.length}>
                                                                        <button className="btn btn-sm btn-outline-red"
                                                                            onClick={(e) => handleDeleteGasto(indexG, gas, indexA, act)}
                                                                        >
                                                                            <i className="fas fa-trash"></i>
                                                                        </button>
                                                                    </Show>
                                                                </Show>
                                                            </div>
                                                        </td>
                                                    </tr>     
                                                )}
                                            </Show> 
                                        </Fragment>  
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Show condicion={edit}>
                        <div className="col-md-12 text-right">
                            <hr/>
                            <Button color="red" onClick={(e) => setCancel(true)}>
                                <i className="fas fa-times"></i> Cancelar
                            </Button>

                            <Button color="teal">
                                <i className="fas fa-save"></i> Guardar Cambios
                            </Button>
                        </div>
                    </Show>
                </div>
            </Form>

            <Show condicion={option == 'add_gasto'}>
                <AddGasto
                    activity={current_activity}
                    isClose={() => setOption("")}
                    onCreate={onCreateGasto}
                />
            </Show>
        </Modal>
    )
}

export default CoinActivity;