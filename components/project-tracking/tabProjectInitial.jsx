import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Form, Button } from 'semantic-ui-react';
import Show from '../show';
import { projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';
import AddObjective from './addObjective';
import InfoObjective from './infoObjective';
import ListExtension from './listExtension';
import Skeleton from 'react-loading-skeleton';
import { BtnFloat } from '../Utils';

const Placeholder = () => {
    const datos = [1, 2, 3, 4];
    return datos.map(d => 
        <tr key={`list-item-placeholder-objective-${d}`}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>
    );
}

const TabActivity = (props) => {

    // project
    let { project, dispatch, objectives } = useContext(ProjectContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [option, setOption] = useState("");

    // obtener componentes
    const getObjectives = async (add = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`project/${project.id}/objective?page=${objectives?.page || 1}&principal=1`)
        .then(({ data }) => {
            let payload = {
                last_page: data.objectives.lastPage,
                total: data.objectives.total,
                data: add ? [...objectives.data, ...data.objectives.data] : data.objectives.data
            }
            // setting objectives
            dispatch({ type: projectTypes.SET_OBJECTIVES, payload });
        }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        if (project?.id) getObjectives();
    }, [project]);

    // render
    return (
        <Fragment>
            <div className="row">
                <div className="col-md-12">
                    <table className="table">
                        <tbody>
                            <tr>
                                <th width="20%">Objectivo General: </th>
                                <td>{project?.general_object}</td>
                            </tr>
                            <tr>
                                <th width="20%">Palabras claves: </th>
                                <td>
                                    {project?.keywords?.map((k, indexK) =>    
                                        <small className="mr-2 badge badge-dark" key={`keyworks-${indexK}`}>{k}</small>    
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <th width="20%">Ampliaciones: </th>
                                <td>
                                    <Button icon="server"
                                        color="black"
                                        size="mini"
                                        basic
                                        onClick={() => setOption('extension')}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <hr/>
                </div>

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
                            {objectives?.data?.map((obj, indexC) => 
                                <InfoObjective
                                    key={`list-item-objective-${indexC}`} 
                                    objective={obj}
                                />
                            )}
                            {/* no hay registros */}
                            <Show condicion={!objectives?.data?.length}>
                                <tr>
                                    <td className="text-center" colSpan="3">No se encontrarón registros</td>
                                </tr>
                            </Show>
                            {/* preloading */}
                            <Show condicion={current_loading}>
                                <Placeholder/>
                            </Show>
                        </tbody>
                    </table>
                </Form>
            </div>
            {/* btn crear */}
            <Show condicion={project?.state != 'OVER'}>
                <BtnFloat onClick={() => setOption("create")}>
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </Show>
            {/* crear objective */}
            <Show condicion={option == 'create'}>
                <AddObjective isClose={(e) => setOption("")}/>
            </Show> 
            {/* list extensiones */}
            <Show condicion={option == 'extension'}>
                <ListExtension
                    onClose={() => setOption("")}
                />
            </Show>
        </Fragment>
    )
}

export default TabActivity;