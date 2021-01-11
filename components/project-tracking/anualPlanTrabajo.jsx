import React, { useState, useContext, useEffect, Fragment } from 'react';
import { projectTracking } from '../../services/apis';
import currentFormatter from 'currency-formatter';
import { Form } from 'semantic-ui-react';
import moment from 'moment';

const CierrePlanTrabajo = ({ plan_trabajo }) => {

    const [current_loading, setCurrentLoading] = useState(false);
    const [current_project, setCurrentProject] = useState({});
    const [current_plan_trabajo, setCurrentPlanTrabajo] = useState({});
    const [current_principal, setCurrentPrincipal] = useState({});
    const [current_avances, setCurrentAvances] = useState({});
    const [current_rubro, setCurrentRubro] = useState({ datos: [], total_programado: 0, total_ejecutado: 0 });
    const [current_presupuestado, setCurrentPresupuestado] = useState([]);
    const [current_financiamiento, setCurrentFinanciamiento] = useState([]);
    const [current_anexos, setCurrentAnexos] = useState([]);
    const [error, setError] = useState(false);


    // obtener reporte de cierre
    const getReportCierre = async () => {
        setCurrentLoading(true);
        await projectTracking.post(`report/anual_plan_trabajo/${plan_trabajo.id}`)
            .then(res => {
                let { project, plan_trabajo, principal, avances, rubros, presupuestado, financiamiento, anexos } = res.data;
                setCurrentProject(project || {});
                setCurrentPlanTrabajo(plan_trabajo || {});
                setCurrentPrincipal(principal || {});
                setCurrentAvances(avances || {});
                setCurrentRubro(rubros || {});
                setCurrentPresupuestado(presupuestado || []);
                setCurrentFinanciamiento(financiamiento || []);
                setCurrentAnexos(anexos || []);
                setError(false);
            }).catch(err => setError(true));
        setCurrentLoading(false);
    }

    // montar componente
    useEffect(() => {
        getReportCierre();
    }, []);

    // render
    return (
        <Form className="table-responsive">
            <table className="table table-bordered">
                <tbody>
                    <tr>
                        <td>Investigador principal:</td>
                        <td className="font-12 uppercase">{current_principal && current_principal.person && current_principal.person.fullname}</td>
                    </tr>
                    <tr>
                        <td>Proyecto:</td>
                        <td className="font-12 uppercase">{current_project.title}</td>
                    </tr>
                    <tr>
                        <td>Referencia:</td>
                        <td>
                            <textarea name="referencia" value={current_project.referencia || ""}/>
                        </td>
                    </tr>
                    <tr>
                        <td>Fecha:</td>
                        <td>{moment(current_project.date_start).format('DD/MM/YYYY')}</td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <div className="py-2">
                                El Reporte de Evaluación del Informe Anual  de Actividades y de Gastos xxxx, del proyecto fue <br/>
                                revisado y analizado en la Dirección de Gestión de la Investigación de la Vicepresidenci <br/>
                                de Investigación, considerando la documentación remitida por el Investigador Principal Sr(a) <br/>
                                <span className="font-12 uppercase">{current_principal && current_principal.person && current_principal.person.fullname || ""}</span>, verificándose lo siguiente: <br/>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th colSpan="2" className="bg-dark text-white">Cuadro 1: Avance técnico y financiero porcentual del proyecto en ejecución</th>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="text-center">
                                        <tr>
                                            <th rowSpan="2">Detalle</th>
                                            <th colSpan="2">
                                                <div>Plan de Trabajo</div>
                                                <div>{moment(plan_trabajo.date_start).format('YYYY')}</div>
                                            </th>
                                        </tr>
                                        <tr>
                                            <th>Técnico</th>
                                            <th>Financiero</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Número de actividades en el proyecto (NAP) y presupuesto total (PT)</td>
                                            <td className="text-right">{current_avances.count_activities || 0}</td>
                                            <td className="text-right">{currentFormatter.format(current_avances.total_gasto || 0, { code: 'PEN' })}</td>
                                        </tr>
                                        <tr>
                                            <td>N° de Actividades programadas en el Plan de Trabajo (NAPT) y Gasto programado (GP).</td>
                                            <td className="text-right">{current_avances.count_activities_plan_trabajo || 0}</td>
                                            <td className="text-right">{currentFormatter.format(current_avances.total_gasto_plan_trabajo || 0, { code: 'PEN' })}</td>
                                        </tr>
                                        <tr>
                                            <td>N° de Actividades verificadas* (NAV) y Gasto verificado* (GV)</td>
                                            <td className="text-right">{current_avances.count_activities_plan_trabajo_verify_tecnica || 0}</td>
                                            <td className="text-right">{currentFormatter.format(current_avances.total_gasto_plan_trabajo_verify || 0, { code: 'PEN' })}</td>
                                        </tr>
                                        <tr>
                                            <td>%Avance técnico (%AT) y % gasto ejecutado (%GE) sobre el Plan de Trabajo.</td>
                                            <td className="text-right">{current_avances.porcentaje_activities_plan_trabajo_verify_tecnica || 0}%</td>
                                            <td className="text-right">{current_avances.porcentaje_gasto_plan_trabajo_verify || 0}%</td>
                                        </tr>
                                        <tr>
                                            <td>% Avance Técnico Total Acumulado (%ATTA) y %Gasto Financiero Total Acumulado (%GFTA)</td>
                                            <td className="text-right">{current_avances.porcentaje_activities_acumulados || 0}%</td>
                                            <td className="text-right">{current_avances.porcentaje_gastos_acumulados || 0}%</td>
                                        </tr>
                                        <tr>
                                            <td>Número total de Actividades pendientes (NAPEN) y Saldo disponible en el proyecto.</td>
                                            <td className="text-right">{current_avances.count_activities_pendientes || 0}</td>
                                            <td className="text-right">{currentFormatter.format(current_avances.total_gastos_pendientes || 0, { code: 'PEN' })}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div>*El término verificado, significa cumplido o su ejecución ha sido aceptada.</div>
                            <br/>
                            <div><b><u>A.	Resumen:</u></b></div> <br/>
                            <div>
                                El porcentaje de avance técnico del proyecto es del <b>{current_avances.porcentaje_activities_plan_trabajo_verify_tecnica || 0}%</b>, al haberse cumplido con <b>{current_avances.porcentaje_gasto_plan_trabajo_verify}</b> de las <br/>
                                actividades programadas en el Plan de Trabajo <b>{moment(plan_trabajo.date_start).format('YYYY')}</b>, en tanto el avance financiero alcanzó el <br/> 
                                <b>{current_avances.porcentaje_gasto_plan_trabajo_verify || 0}%</b>. <br/><br/>

                                El porcentaje de Avance Técnico Total Acumulado es de <b>{current_avances.porcentaje_activities_acumulados || 0}%</b> y el porcentaje de Gasto Financiero Total Acumulado 
                                es de <b>{current_avances.porcentaje_gastos_acumulados || 0}%</b>. <br/><br/>

                                El número total de actividades pendientes es de <b>{current_avances.count_activities_pendientes || 0}</b>, y el saldo del proyecto a la fecha de presentación del plan de <br/> 
                                trabajo es de <b>{currentFormatter.format(current_avances.total_gastos_pendientes || 0, { code: 'PEN' })}</b> <br/><br/>

                                Sobre el gasto elegible por la UNIA expuesto en el xx Concurso, hasta la fecha de presentación <br/>
                                del IAAyG, el proyecto ejecutó S/. xxxxx, que representa el xxxx% del importe entregado por la <br/>
                                UNIA.
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <th colSpan="2" className="bg-dark text-white">Cuadro 2: Avance técnico y financiero porcentual del proyecto en ejecución</th>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="text-center">
                                        <tr>
                                            <th>Gastos elegibles</th>
                                            <th>Presupuesto Aprobado Plan de Trabajo</th>
                                            <th>Rendido y Verificado IAAyG</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {current_rubro && current_rubro.datos && current_rubro.datos.map((rub, indexR) => 
                                            <tr key={`lista-presupuestado-${indexR}`}>
                                                <td className="uppercase font-12">{rub.description}</td>
                                                <td className="text-right">{currentFormatter.format(rub.programado, { code: 'PEN' })}</td>
                                                <td className="text-right">{currentFormatter.format(rub.ejecutado, { code: 'PEN' })}</td>
                                            </tr>
                                        )}
                                        <tr>
                                            <th style={{ background: 'rgba(0, 0, 0, 0.05)' }}>Total</th>
                                            <th style={{ background: 'rgba(0, 0, 0, 0.05)' }} className="text-right">
                                                {currentFormatter.format(current_rubro.total_programado || 0, { code: 'PEN' })}
                                            </th>
                                            <th style={{ background: 'rgba(0, 0, 0, 0.05)' }} className="text-right">
                                                {currentFormatter.format(current_rubro.total_ejecutado || 0, { code: 'PEN' })}
                                            </th>
                                        </tr>
                                        <tr>
                                            <th colSpan="2">Importe elegible rendido por el investigador o gasto ejecutado.</th>
                                            <td className="text-right" style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                                                {currentFormatter.format(current_rubro.total_ejecutado || 0, { code: 'PEN' })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th colSpan="2">%Gasto ejecutado</th>
                                            <td className="text-right" style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                                                {currentFormatter.format(current_rubro.porcentaje_ejecutado || 0, { code: 'PEN' })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th colSpan="2">Saldo disponible en el proyecto</th>
                                            <td className="text-right" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
                                                {currentFormatter.format(current_rubro.saldo || 0, { code: 'PEN' })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-center">
                                Hasta el término del Plan de Trabajo {moment(plan_trabajo.date_start).format('YYYY')}, el saldo del proyecto corresponde a {currentFormatter.format(current_project.monto - current_rubro.total_programado, { code: 'PEN' })}.
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <th colSpan="2" className="bg-dark text-white">Cuadro 3: Gasto programado y Gasto ejecutado</th>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="text-center">
                                        <tr>
                                            <th width="25%">Componente/Actividad</th>
                                            <th>Descripción</th>
                                            <th width="7%">Unidad Medida</th>
                                            <th width="7%">Cant.</th>
                                            <th width="10%">Costo Unitario</th>
                                            <th width="10%">Gasto Aprobado</th>
                                            <th width="10%">Gasto Ejecutado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {current_financiamiento.map((fin, indexF) => 
                                            <Fragment>
                                                <tr key={`lista-financiamiento-${indexF}`}>
                                                    <td className="bg-gray-1">{fin.title }</td>
                                                    <td className="bg-gray-1"></td>
                                                    <td className="bg-gray-1"></td>
                                                    <td className="bg-gray-1"></td>
                                                    <td className="bg-gray-1"></td>
                                                    <td className="bg-gray-1"></td>
                                                    <td className="bg-gray-1"></td>
                                                </tr>  
                                                {fin.activities.map((act, indexA) => 
                                                    <Fragment>
                                                        <tr key={`lista-actividades-${indexA}`}>
                                                            <td rowSpan={act.gastos.length + 1 || 1} className="bg-gray-03">{act.index}. {act.title}</td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        {act.gastos.map((gas, indexG) => 
                                                            <tr key={`lista-gasto-${indexG}`}>
                                                                <td>{gas.description}</td>
                                                                <td>{gas.medida}</td>
                                                                <td className="text-center">{gas.cantidad}</td>
                                                                <td className="text-right">{currentFormatter.format(gas.monto || 0, { code: 'PEN' })}</td>
                                                                <td className="text-right">{currentFormatter.format(gas.total || 0, { code: 'PEN' })}</td>
                                                                <td className="text-right">{currentFormatter.format(gas.ejecutado || 0, { code: 'PEN' })}</td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                )}
                                            </Fragment> 
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-center">
                                Hasta el término del Plan de Trabajo {moment(plan_trabajo.date_start).format('YYYY')}, el saldo del proyecto corresponde a {currentFormatter.format(current_project.monto - current_rubro.total_programado, { code: 'PEN' })}.
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th colSpan="2">
                            <div className="text-right">
                                <button className="btn btn-primary">
                                    <i className="fas fa-print"></i> Reporte
                                </button>
                            </div>
                        </th>
                    </tr>
                </tbody>
            </table>
        </Form>
    )
}

// exportar
export default CierrePlanTrabajo;