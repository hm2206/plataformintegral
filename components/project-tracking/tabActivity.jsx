import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';
import Show from '../show';
import { projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import AddComponente from './addComponente';
import { SelectProjectPlanTrabajo, SelectPlanTrabajoObjective } from '../select/project_tracking'
import moment from 'moment';

const TabActivity = (props) => {

    // project
    let { project } = useContext(ProjectContext);
    let isProject = Object.keys(project).length;

    // estados
    const [componente, setComponente] = useState({ page: 1, total: 0, last_page: 0, data: [] });
    const isComponent = componente.data.length;
    const [option, setOption] = useState("");
    const [plan_trabajo_id, setPlanTrabajoID] = useState("");
    const [objective_id, setObjectiveId] = useState("");
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
        if (objective_id) getComponentes();
    }, [objective_id]);

    // render
    return (
    <Fragment>
        <div className="row">
            <div className="col-md-3 mb-3">
                <SelectProjectPlanTrabajo 
                    project_id={project.id}
                    value={plan_trabajo_id}
                    onChange={(e, obj) => setPlanTrabajoID(obj.value)}
                />
            </div>

            <div className="col-md-9 mb-3">
                <SelectPlanTrabajoObjective
                    plan_trabajo_id={plan_trabajo_id}
                    refresh={plan_trabajo_id}
                    disabled={!plan_trabajo_id}
                    value={objective_id}
                    onChange={(e, obj) => {
                        setObjectiveId(obj.value);
                        setComponente({ page: 1, total: 0, last_page: 0, data: [] });
                    }}
                />
            </div>
        </div>

        <Show condicion={objective_id}
            predeterminado={
                <div className="mt-5 text-center">
                    <h4 style={{ fontSize: '1.5em', color: 'rgba(0,0,0,0.5)' }}>Seleccione un componente</h4>
                </div>
            }
        >
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th className="text-center" width="5%" rowSpan="2">Año</th>
                            <th className="text-center" colSpan="12">Meses</th>
                        </tr>
                        <tr>
                            <th className="text-center">Ene</th>
                            <th className="text-center">Feb</th>
                            <th className="text-center">Mar</th>
                            <th className="text-center">Jun</th>
                            <th className="text-center">Jul</th>
                            <th className="text-center">Ago</th>
                            <th className="text-center">Set</th>
                            <th className="text-center">Oct</th>
                            <th className="text-center">Nov</th>
                            <th className="text-center">Dic</th>
                        </tr>
                    </thead>
                    <tbody>
                        {componente.data.map((c, indexC) =>
                            <tr key={`team-person-${indexC}`}>
                                <th className="text-center"></th>
                                <th className="text-center"></th>
                                <th className="text-center"></th>
                                <th className="text-center"></th>
                                <th className="text-center"></th>
                                <th className="text-center"></th>
                                <th className="text-center"></th>
                                <th className="text-center"></th>
                                <th className="text-center"></th>
                                <th className="text-center"></th>
                                <th className="text-center"></th>
                            </tr>
                        )}
                        <Show condicion={!current_loading && !isComponent}>
                            <tr>
                                <td colSpan="13" className="text-center">No hay registros disponibles</td>
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

export default TabActivity;