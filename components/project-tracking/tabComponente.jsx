import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';
import Show from '../show';
import { projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import AddComponente from './addComponente';
import { SelectProjectPlanTrabajo } from '../select/project_tracking'
import moment from 'moment';

const TabComponente = (props) => {

    // project
    let { project } = useContext(ProjectContext);
    let isProject = Object.keys(project).length;

    // estados
    const [componente, setComponente] = useState({ page: 1, total: 0, last_page: 0, data: [] });
    const isComponent = componente.data.length;
    const [option, setOption] = useState("");
    const [plan_trabajo_id, setPlanTrabajoID] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);

    // obtener componentes
    const getComponentes = async (nextPage = 1, up = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`plan_trabajo/${plan_trabajo_id}/objective?page=${nextPage}`)
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

    // primera carga
    useEffect(() => {
        if (plan_trabajo_id) getComponentes();
    }, [plan_trabajo_id]);

    // render
    return (
    <Fragment>
        <div className="col-md-3 mb-3">
            <SelectProjectPlanTrabajo 
                project_id={project.id}
                value={plan_trabajo_id}
                onChange={(e, obj) => {
                    setComponente({ page: 1, total: 0, last_page: 0, data: [] });
                    setPlanTrabajoID(obj.value);
                }}
            />
        </div>

        <Show condicion={plan_trabajo_id}
            predeterminado={
                <div className="mt-5 text-center">
                    <h4 style={{ fontSize: '1.5em', color: 'rgba(0,0,0,0.5)' }}>Seleccione un plan de trabajo</h4>
                </div>
            }
        >
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th className="text-center">Titulo</th>
                            <th className="text-center">Fecha Inicio</th>
                            <th className="text-center">Fecha Término</th>
                            <th width="5%">
                                <Button fluid basic color="green" onClick={(e) => setOption("add_componente")}>
                                    <i className="fas fa-plus"></i>
                                </Button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {componente.data.map((c, indexC) =>
                            <tr key={`team-person-${indexC}`}>
                                <td className="text-center uppercase">{c.title}</td>
                                <td className="text-center uppercase">{moment(c.date_start).format('DD/MM/YYYY')}</td>
                                <td className="text-center uppercase">{moment(c.date_over).format('DD/MM/YYYY')}</td>
                                <td>
                                    {/* <Button color="red" basic>
                                        <i className="fas fa-times"></i>
                                    </Button> */}
                                </td>
                            </tr>
                        )}
                        <Show condicion={!current_loading && !isComponent}>
                            <tr>
                                <td colSpan="5" className="text-center">No hay registros disponibles</td>
                            </tr>
                        </Show>
                    </tbody>
                </table>
            </div>
        </Show>

        <Show condicion={option == 'add_componente'}>
            <AddComponente 
                plan_trabajo_id={plan_trabajo_id}
                isClose={(e) => setOption("")}
                onChange={(e) => getComponentes()}
            />
        </Show>
    </Fragment>)
}

export default TabComponente;