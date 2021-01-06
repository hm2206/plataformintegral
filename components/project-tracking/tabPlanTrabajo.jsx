import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { projectTracking } from '../../services/apis';
import { AppContext } from '../../contexts/AppContext';
import moment from 'moment';
import Show from '../show';
import InfoPlanTrabajo from './infoPlanTrabajo';
import ExecutePlanTrabajo from './executePlanTrabajo';
import AnualPlanTrabajo from './anualPlanTrabajo';
import Anexos from './anexos';
import AddPlanTrabajo from './addPlanTrabajo';
import Router from 'next/router'
import { Button, Form } from 'semantic-ui-react';
import ReportPlanTrabajo from './reportPlanTrabajo';
import currentFormatter from 'currency-formatter'

const situacions = {
    PENDIENTE: {
        text: "Pendiente/Registrado",
        color: "#263238"
    },
    ENVIADO: {
        text: "Enviado para revisión",
        color: "#0d47a1"
    },
    OBSERVADO: {
        text: "Observado",
        color: "#ff9800"
    },
    APROBADO: {
        text: "Aprobado",
        color: "#66bb6a"
    },
    RESERVA: {
        text: "Aprobado con Reservas",
        color: "#26c6da"
    },
    DESAPROBADO: {
        text: "Desaprobado",
        color: "#d50000"
    }
}

const TabPlanTrabajo = () => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);

    // stados
    const [current_loading, setCurrentLoading] = useState(true);
    const [plan_trabajo, setPlanTrabajo] = useState({ page: 1, lastPage: 0, data: [] });
    const [option, setOption] = useState("");
    const [current_plan_trabajo, setCurrentPlanTrabajo] = useState({});
    const [duration, setDuration] = useState("");
    const [resolucion, setResolucion] = useState("");
    const [date_resolucion, setDateResolucion] = useState("");

    // obtener plan de trabajo
    const getPlanTrabajo = async () => {
        setCurrentLoading(true);
        await projectTracking.get(`project/${project.id}/plan_trabajo?page=${plan_trabajo.page || 1}`)
            .then(res => {
                let { plan_trabajos } = res.data;
                setPlanTrabajo({
                    page: plan_trabajos.page,
                    lastPage: plan_trabajos.lastPage,
                    data: plan_trabajos.data
                });
            })
            .catch(err => console.log(err.message));
        setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        if (project.id) getPlanTrabajo();
    }, [project.id]);

    // render
    return (
    <Fragment>
        <Show condicion={project.state != 'OVER'}>
            <Form className="row">
                <div className="col-md-12 mb-4 text-right">
                    <Button color="teal" onClick={(e) => setOption('plan_trabajo')}>
                        <i className="fas fa-plus"></i> Agregar plan de trabajo
                    </Button>
                </div>
            </Form>
        </Show>

        <div className="table-responsive font-13">
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th className="text-center" rowSpan="2">Duración</th>
                        <th className="text-center" colSpan="2">Fechas</th>
                        <th className="text-center" rowSpan="2">Costo</th>
                        <th className="text-center" rowSpan="2">Situación</th>
                        <th className="text-center" rowSpan="2">Acciones</th>
                    </tr>
                    <tr>
                        <th className="text-center">Inicio</th>
                        <th className="text-center">Fin</th>
                    </tr>
                </thead>
                <tbody>
                    {plan_trabajo && plan_trabajo.data.map(pla => 
                        <tr key={`th-plan-trabajo-${pla.id}`}>
                            <td className="text-center">{pla.duration}</td>    
                            <td className="text-center">{moment(pla.date_start).format('DD/MM/YYYY')}</td>  
                            <td className="text-center">{moment(pla.date_over).format('DD/MM/YYYY')}</td> 
                            <th className="text-center">{currentFormatter.format(pla.monto, { code: 'PEN' })}</th> 
                            <td className="text-center">{pla.state}</td> 
                            <td className="text-center">
                                <div className="btn btn-group">
                                    <button className="btn btn-sm btn-outline-primary"
                                        onClick={(e) => {
                                            setOption('info')
                                            setCurrentPlanTrabajo(pla)
                                        }}
                                        title="Ver más"
                                    >
                                        <i className="fas fa-search"></i>
                                    </button>

                                    <button className="btn btn-sm btn-outline-dark"
                                        title="Ejecutar plan de trabajo"
                                        onClick={(e) => {
                                            setOption('execute')
                                            setCurrentPlanTrabajo(pla)
                                        }}
                                    >
                                        <i className="fas fa-upload"></i>
                                    </button>

                                    <button className="btn btn-sm btn-outline-danger"
                                        title="reporte"
                                        onClick={(e) => {
                                            setOption('anual')
                                            setCurrentPlanTrabajo(pla)
                                        }}
                                    >
                                        <i className="fas fa-file-pdf"></i>
                                    </button>

                                    <button className="btn btn-sm btn-warning"
                                        title="Anexos del plan de trabajo"
                                        onClick={(e) => {
                                            setOption('anexos')
                                            setCurrentPlanTrabajo(pla)
                                        }}
                                    >
                                        <i className="fas fa-paperclip"></i>
                                    </button>
                                </div>
                            </td> 
                        </tr>
                    )}
                    <Show condicion={!current_loading && plan_trabajo.data && !plan_trabajo.data.length}>
                        <tr>
                            <td colSpan="8" className="text-center">No hay registros disponibles</td>
                        </tr>
                    </Show>
                </tbody>
            </table>
        </div>

        {/* <div className="mt-5">
            <b className="font-13"><u>Situación del Informe</u></b>
            <div className="font-12">
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['PENDIENTE'].color }}></div> {situacions['PENDIENTE'].text}</div>
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['ENVIADO'].color }}></div> {situacions['ENVIADO'].text}</div>
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['OBSERVADO'].color }}></div> {situacions['OBSERVADO'].text}</div>
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['APROBADO'].color }}></div> {situacions['APROBADO'].text}</div>
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['RESERVA'].color }}></div> {situacions['RESERVA'].text}</div>
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['DESAPROBADO'].color }}></div> {situacions['DESAPROBADO'].text}</div>
            </div>
        </div> */}

        <Show condicion={option == 'info'}>
            <InfoPlanTrabajo
                plan_trabajo={current_plan_trabajo}
                isClose={(e) => setOption("")}
            />
        </Show>

        <Show condicion={option == 'execute'}>
            <ExecutePlanTrabajo
                plan_trabajo={current_plan_trabajo}
                isClose={(e) => setOption("")}
            />
        </Show>

        <Show condicion={option == 'anual'}>
            <ReportPlanTrabajo
                plan_trabajo={current_plan_trabajo}
                isClose={(e) => setOption("")}
            />
        </Show>

        <Show condicion={option == 'anexos'}>
            <Anexos
                object_id={current_plan_trabajo.id}
                object_type={'App/Models/PlanTrabajo'}
                isClose={(e) => setOption("")}
            />
        </Show>

        <Show condicion={option == 'plan_trabajo'}>
            <AddPlanTrabajo isClose={(e) => setOption("")}
                onSave={(e) => getPlanTrabajo()}
            />
        </Show>
    </Fragment>)
}

export default TabPlanTrabajo;