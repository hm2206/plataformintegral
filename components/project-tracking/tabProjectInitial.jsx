import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button, Accordion, Icon } from 'semantic-ui-react';
import Show from '../show';
import { projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import AddActivity from './addActivity';
import CoinActivity from './coinActivity';
import AddComponente from './addComponente';


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
    const [area, setArea] = useState(defaultPaginate);
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

    // obtener areas
    const getAreas = async (nextPage = 1, up = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`project/${project.id}/area?page=${nextPage}`)
            .then(({ data }) => {
                setArea({ 
                    last_page: data.areas.last_page,
                    total: data.areas.total,
                    data: up ? [...area.data, ...data.areas.data] : data.areas.data,
                    page: data.areas.page
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

    // primera carga
    useEffect(() => {
        if (project.id) {
            getComponentes();
            getAreas();
        }
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
                        <th width="20%">Monto Inicial: </th>
                        <td>{project.monto}</td>
                    </tr>
                    <tr>
                        <th width="20%">Palabras claves: </th>
                        <td>
                            {project.keywords && project.keywords.length && project.keywords.map((k, indexK) => 
                                <small className="ml-2 badge badge-dark" key={`keyworks-${indexK}`}>{k}</small>    
                            )}
                        </td>
                    </tr>
                    <tr>
                        <th width="20%">Línea de Investigación: </th>
                        <td>
                            {area && area.data.length && area.data.map((a, indexA) => 
                                <small className="ml-2 badge badge-warning" key={`linea-de-investigacion-${indexA}`}>{a.description}</small>    
                            )}
                        </td>
                    </tr>
                </table>
                <hr/>
            </div>

            <div className="col-md-12 mb-4 text-right">
                <Button color="teal"
                    onClick={(e) => setOption("add_componente")}
                >
                    <i className="fas fa-plus"></i> Agregar Objectivo
                </Button>
            </div>

            <div className="col-md-12 mb-3">
            
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
                                <b>{indexC + 1}.</b> {c.title}
                                </td>
                                <td>
                                    {c.total}
                                </td>
                                <td>
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

                                    <Button size="mini"
                                        basic
                                        color="red"
                                    >
                                        <i className="fas fa-times"></i>
                                    </Button>
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

            </div>
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
            />
        </Show> 
    </Fragment>)
}

export default TabActivity;