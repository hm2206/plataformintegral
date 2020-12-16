import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button, Accordion, Icon, Form } from 'semantic-ui-react';
import Show from '../show';
import { projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import AddActivity from './addActivity';
import CoinActivity from './coinActivity';
import AddComponente from './addComponente';
import currencyFormatter from 'currency-formatter';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';


const defaultPaginate = {
    total: 0,
    last_page: 0,
    page: 1,
    data: []
};

const TabActivity = (props) => {

    // project
    let { project } = useContext(ProjectContext);
    let isProject = Object.keys(project).length;

    // estados
    const [componente, setComponente] = useState(defaultPaginate);
    const isComponent = componente.data.length;
    const [activity, setActivity] = useState(defaultPaginate);
    const [option, setOption] = useState("");
    const [current_objective, setCurrentObjective] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [indexActive, setIndexActive] = useState(undefined);

    // obtener componentes
    const getComponentes = async (nextPage = 1, up = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`project/${project.id}/objective?page=${nextPage}`)
            .then(({ data }) => {
                setComponente({ 
                    last_page: data.objectives.last_page,
                    total: data.objectives.total,
                    data: up ? [...componente.data, ...data.objectives.data] : data.objectives.data,
                    page: data.objectives.page
                });
            }).catch(err => console.log(err));
        setCurrentLoading(false);
    }
    
    // seleccionar objectivo
    const selectObjective = async (obj, index, option) => {
        obj.index = index;
        setCurrentObjective(obj);
        setOption(option);
    }

    // editar datos
    const handleEdit = (index, obj) => {
        let newComponent = Object.assign({}, componente);
        obj._edit = obj._edit ? false : true;
        if (obj._edit) {
            obj.current_title = obj.title;
        } else {
            obj.title = obj.current_title;
        }
        // setting
        newComponent.data[index] = obj;
        setComponente(newComponent);
    }

    // cambiar datos
    const handleInput = (index, obj, { name, value }) => {
        let newComponent = Object.assign({}, componente);
        obj[name] = value;
        newComponent.data[index] = obj;
        setComponente(newComponent);
    }

    // actualizar datos
    const updateObjective = async (index, obj) => {
        let answer = await Confirm('warning', '¿Deseas actualizar datos?', 'Actualizar');
        if (answer) {
            let datos = {};
            datos.title = obj.title;
            await projectTracking.post(`objective/${obj.id}/update`, datos)
                .then(res => {
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    Swal.fire({ icon: 'success', text: message });
                    let newComponent = Object.assign({},  componente);
                    obj._edit = false;
                    newComponent.data[index] = obj;
                    setComponente(newComponent);
                }).catch(err => {
                    try {
                        let { message, errors } = err.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message || err.message });
                    }
                })
        }
    }

    // primera carga
    useEffect(() => {
        if (project.id) getComponentes();
    }, []);

    // render
    return (
    <Fragment>
        <div className="row">

            <div className="col-md-12">
                <table className="table">
                    <tr>
                        <th width="20%">Objectivo General: </th>
                        <td>{project.general_object}</td>
                    </tr>
                    <tr>
                        <th width="20%">Palabras claves: </th>
                        <td>
                            {project.keywords && project.keywords.length && project.keywords.map((k, indexK) =>    
                                <small className="mr-2 badge badge-dark" key={`keyworks-${indexK}`}>{k}</small>    
                            )}
                        </td>
                    </tr>
                </table>
                <hr/>
            </div>

            <Show condicion={project.state != 'OVER'}>
                <div className="col-md-12 mb-4 text-right">
                    <Button color="teal"
                        onClick={(e) => setOption("add_componente")}
                    >
                        <i className="fas fa-plus"></i> Agregar Objectivo
                    </Button>
                </div>
            </Show>

            <Form className="col-md-12 mb-3">
            
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Objectivos Específicos</th>
                            <th>Presupuesto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {componente.data.map((c, indexC) => 
                            <tr key={`tr-project-${indexC}`}>
                                <td>
                                    <Show condicion={c._edit}
                                        predeterminado={<span><b>{indexC + 1}.</b> {c.title}</span>}
                                    >
                                        <textarea rows={2}
                                            name="title"
                                            value={c.title}
                                            onChange={({target}) => handleInput(indexC, c, target)}
                                        />
                                    </Show>
                                </td>
                                <td>
                                    {currencyFormatter.format(c.total, { code: 'PEN' })}
                                </td>
                                <td>
                                    <div className="group-btn text-center">
                                        <Show condicion={!c._edit}
                                            predeterminado={
                                                <Fragment>
                                                    <Button 
                                                        size="mini"
                                                        basic
                                                        color="red"
                                                        onClick={(e) => handleEdit(indexC, c)}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </Button>

                                                    <Button 
                                                        size="mini"
                                                        basic
                                                        color="teal"
                                                        onClick={(e) => updateObjective(indexC, c)}
                                                    >
                                                        <i className="fas fa-save"></i>
                                                    </Button>
                                                </Fragment>
                                        }>
                                            <Button size="mini"
                                                color="green"
                                                basic
                                                onClick={(e) => selectObjective(c, indexC, "add_activity")}
                                                className="mb-1"
                                            >
                                                <i className="fas fa-plus"></i>
                                            </Button>

                                            <Button size="mini"
                                                color="orange"
                                                basic
                                                onClick={(e) => selectObjective(c, indexC, "coin_activity")}
                                                className="mb-1"
                                            >
                                                <i className="fas fa-coins"></i>
                                            </Button>

                                            <Show condicion={project.state != 'OVER'}>
                                                <Button size="mini"
                                                    basic
                                                    color="blue"
                                                    onClick={(e) => handleEdit(indexC, c)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </Button>
                                            </Show>
                                        </Show>
                                    </div>
                                </td>
                            </tr>
                        )}
                        <Show condicion={!current_loading && componente && componente.data && !componente.data.length}>
                            <tr>
                                <td className="text-center" colSpan="3">No se encontrarón registros</td>
                            </tr>
                        </Show>
                    </tbody>
                </table>

            </Form>
        </div>

        <Show condicion={option == 'add_componente'}>
            <AddComponente 
                isClose={(e) => setOption("")}
                onCreate={(e) => getComponentes()}
            />
        </Show> 

        <Show condicion={option == 'add_activity'}>
            <AddActivity 
                isClose={(e) => setOption("")}
                objective={current_objective}
            />
        </Show> 

        <Show condicion={option == 'coin_activity'}>
            <CoinActivity 
                isClose={(e) => setOption("")}
                objective={current_objective}
                onCreate={(e) => getComponentes()}
            />
        </Show> 
    </Fragment>)
}

export default TabActivity;