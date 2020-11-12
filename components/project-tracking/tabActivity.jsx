import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button, Accordion, Icon } from 'semantic-ui-react';
import Show from '../show';
import { projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import AddActivity from './addActivity';
import { SelectProjectPlanTrabajo, SelectPlanTrabajoObjective } from '../select/project_tracking'
import moment from 'moment';

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
    const [plan_trabajo_id, setPlanTrabajoID] = useState("");
    const [current_objective, setCurrentObjective] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [indexActive, setIndexActive] = useState(undefined);

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

    // obtener activities
    const getActivities = async (nextPage = 1, up = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`objective/${current_objective.id}/activity?page=${nextPage}`)
            .then(({ data }) => {
            setActivity({ 
                    last_page: data.activities.last_page,
                    total: data.activities.total,
                    data: up ? [...activity.data, ...data.objectives.data] : data.activities.data,
                    page: data.activities.page
                });
            }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // seleccionar plan de trabajo
    const getIndexActive = async ({ index }, obj) => {
        setActivity(defaultPaginate);
        setIndexActive(index);
        setCurrentObjective(obj);
    }

    // primera carga
    useEffect(() => {
        if (plan_trabajo_id) getComponentes();
    }, [plan_trabajo_id]);

    // obtener actividades
    useEffect(() => {   
        if (current_objective.id) getActivities();
    }, [current_objective.id]);

    // render
    return (
    <Fragment>
        <div className="row">
            <div className="col-md-12 mb-3">
                <SelectProjectPlanTrabajo 
                    project_id={project.id}
                    value={plan_trabajo_id}
                    onChange={(e, obj) => setPlanTrabajoID(obj.value)}
                />
            </div>

            <div className="col-md-12 mb-3">
            <Accordion styled fluid>
                {componente.data.map((c, indexC) => 
                    <Fragment key={`acordion-plan_trabajo-${indexC}`}>
                        <Accordion.Title
                            active={indexActive == indexC}
                            index={indexC}
                            onClick={(e,  data) => indexActive != indexC ? getIndexActive(data, c) : null}
                        >
                            <Icon name='dropdown' /> {(indexC + 1)}. {c.title}
                        </Accordion.Title>
                        <Accordion.Content active={indexActive == indexC}>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead>
                                        <tr>
                                            <th className="text-center">Titulo</th>
                                            <th className="text-center">Fecha Inicio</th>
                                            <th className="text-center">Fecha Término</th>
                                            <th width="5%">
                                                <Button fluid basic color="green" onClick={(e) => setOption("add_activity")}>
                                                    <i className="fas fa-plus"></i>
                                                </Button>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activity.data.map((c, indexA) =>
                                            <tr key={`team-person-${indexA}`}>
                                                <td className="text-left uppercase"><b>{(indexC + 1)}. {(indexA + 1)}</b> . {c.title}</td>
                                                <td className="text-center uppercase">{moment(c.date_start).format('DD/MM/YYYY')}</td>
                                                <td className="text-center uppercase">{moment(c.date_over).format('DD/MM/YYYY')}</td>
                                                <td></td>
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
                        </Accordion.Content>
                    </Fragment>)}
            </Accordion>
        </div>
    </div>

    <Show condicion={option == 'add_activity'}>
        <AddActivity 
            objective={current_objective}
            isClose={(e) => setOption("")}
            onCreate={(e) => getActivities()}
        />
    </Show>
</Fragment>)
}

export default TabActivity;