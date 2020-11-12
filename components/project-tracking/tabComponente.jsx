import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';
import Show from '../show';
import { projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import AddComponente from './addComponente';
import { SelectProjectPlanTrabajo } from '../select/project_tracking'
import { Accordion, Icon } from 'semantic-ui-react';
import moment from 'moment';

const TabComponente = (props) => {

    // project
    let { project } = useContext(ProjectContext);
    let isProject = Object.keys(project).length;

    // estados
    const [componente, setComponente] = useState({ page: 1, total: 0, last_page: 0, data: [] });
    const isComponent = componente.data.length;
    const [plan_trabajo, setPlanTrabajo] = useState({ page: 1, total: 0, last_page: 0, data: [] });
    const [option, setOption] = useState("");
    const [current_plan_trabajo, setCurrentPlanTrabajo] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [indexActive, setIndexActive] = useState(undefined);

    // obtener plan de trabajos
    const getPlanTrabajo = async (up = false) => {
        await projectTracking.get(`project/${project.id}/plan_trabajo`)
            .then(res => {
                let { plan_trabajos, success, message } = res.data;
                if (!success) throw new Error(message);
                setPlanTrabajo({
                    page: plan_trabajos.page,
                    total: plan_trabajos.total,
                    last_page: plan_trabajos.last_page,
                    data: up ? [...plan_trabajos.data, ...plan_trabajos.data] : plan_trabajos.data
                });
            })
            .catch(err => console.log(err.message));
    }

    // obtener componentes
    const getComponentes = async (nextPage = 1, up = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`plan_trabajo/${current_plan_trabajo.id}/objective?page=${nextPage}`)
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

    // seleccionar plan de trabajo
    const getIndexActive = async ({ index }, obj) => {
        setIndexActive(index);
        setCurrentPlanTrabajo(obj);
    }

    // primera carga
    useEffect(() => {
        getPlanTrabajo();
    }, []);

    // reaccionar al cambio de plan de trabajo actual
    useEffect(() => {
        if (current_plan_trabajo.id) getComponentes();
    }, [current_plan_trabajo.id]);

    // render
    return (
    <Fragment>
        <div className="col-md-12 mb-3">
            <Accordion styled fluid>
                {plan_trabajo.data.map((p, indexP) => 
                    <Fragment key={`acordion-plan_trabajo-${indexP}`}>
                        <Accordion.Title
                            active={indexActive == indexP}
                            index={indexP}
                            onClick={(e,  data) => getIndexActive(data, p)}
                        >
                            <Icon name='dropdown' /> DE: {moment(p.date_start).format('DD/MM/YYYY')} HASTA: {moment(p.date_over).format('DD/MM/YYYY')}
                        </Accordion.Title>
                        <Accordion.Content active={indexActive == indexP}>
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
                                                <td className="text-left uppercase"><b>{(indexC + 1)}</b> . {c.title}</td>
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

        <Show condicion={option == 'add_componente'}>
            <AddComponente 
                plan_trabajo={current_plan_trabajo}
                isClose={(e) => setOption("")}
                onCreate={(e) => getComponentes()}
            />
        </Show> 
    </Fragment>)
}

export default TabComponente;