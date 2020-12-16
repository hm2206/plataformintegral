import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { projectTracking } from '../../services/apis';
import moment from 'moment';
import Show from '../show';
import InfoPlanTrabajo from './infoPlanTrabajo';
import ExecutePlanTrabajo from './executePlanTrabajo';
import AnualPlanTrabajo from './anualPlanTrabajo';
import Anexos from './anexos';
import Router from 'next/dist/client/router'

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

    const { project } = useContext(ProjectContext);

    // stados
    const [current_loading, setCurrentLoading] = useState(true);
    const [plan_trabajo, setPlanTrabajo] = useState({ page: 1, lastPage: 0, data: [] });
    const [option, setOption] = useState("");
    const [current_plan_trabajo, setCurrentPlanTrabajo] = useState({});

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
        <div className="table-responsive font-13">
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th className="text-center" rowSpan="2">Duración</th>
                        <th className="text-center" colSpan="2">Fechas</th>
                        <th className="text-center" colSpan="3">Informe</th>
                        <th className="text-center" rowSpan="2">Acciones</th>
                    </tr>
                    <tr>
                        <th className="text-center">Inicio</th>
                        <th className="text-center">Fin</th>
                        <th className="text-center">Fecha</th>
                        <th className="text-center">Situación</th>
                        <th className="text-center">Documento</th>
                    </tr>
                </thead>
                <tbody>
                    {plan_trabajo && plan_trabajo.data.map(pla => 
                        <tr key={`th-plan-trabajo-${pla.id}`}>
                            <td className="text-center">{pla.duration}</td>    
                            <td className="text-center">{moment(pla.date_start).format('DD/MM/YYYY')}</td>  
                            <td className="text-center">{moment(pla.date_over).format('DD/MM/YYYY')}</td> 
                            <td className="text-center"></td> 
                            <td className="text-center">{pla.state}</td> 
                            <td className="text-center"></td> 
                            <td className="text-center">
                                <div className="btn btn-group">
                                    <button className="btn btn-sm btn-outline-primary"
                                        onClick={(e) => {
                                            setOption('info')
                                            setCurrentPlanTrabajo(pla)
                                        }}
                                    >
                                        <i className="fas fa-eye"></i>
                                    </button>

                                    <button className="btn btn-sm btn-outline-dark"
                                        onClick={(e) => {
                                            setOption('execute')
                                            setCurrentPlanTrabajo(pla)
                                        }}
                                    >
                                        <i className="fas fa-upload"></i>
                                    </button>

                                    <button className="btn btn-sm btn-outline-danger"
                                        onClick={(e) => {
                                            setOption('anual')
                                            setCurrentPlanTrabajo(pla)
                                        }}
                                    >
                                        <i className="fas fa-file-pdf"></i>
                                    </button>

                                    <button className="btn btn-sm btn-warning"
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

        <div className="mt-5">
            <b className="font-13"><u>Situación del Informe</u></b>
            <div className="font-12">
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['PENDIENTE'].color }}></div> {situacions['PENDIENTE'].text}</div>
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['ENVIADO'].color }}></div> {situacions['ENVIADO'].text}</div>
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['OBSERVADO'].color }}></div> {situacions['OBSERVADO'].text}</div>
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['APROBADO'].color }}></div> {situacions['APROBADO'].text}</div>
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['RESERVA'].color }}></div> {situacions['RESERVA'].text}</div>
                <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['DESAPROBADO'].color }}></div> {situacions['DESAPROBADO'].text}</div>
            </div>
        </div>

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
            <AnualPlanTrabajo
                plan_trabajo={current_plan_trabajo}
                isClose={(e) => setOption("")}
            />
        </Show>

        <Show condicion={option == 'anexos'}>
            <Anexos
                object_id={current_plan_trabajo.id}
                object_type={'App/Models/PlanTrabajo'}
                isClose={(e) => setOption("")}
                files={current_plan_trabajo.anexos}
                afterSave={(files) => {
                    let datos = Object.assign({}, current_plan_trabajo);
                    datos.anexos = [...datos.anexos, ...files];
                    setCurrentPlanTrabajo(datos);
                    getPlanTrabajo();
                }}
            />
        </Show>
    </Fragment>)
}

export default TabPlanTrabajo;