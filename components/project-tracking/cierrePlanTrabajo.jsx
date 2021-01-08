import React, { useState, useContext, useEffect, Fragment } from 'react';
import { projectTracking } from '../../services/apis';
import currentFormatter from 'currency-formatter';
import { Form } from 'semantic-ui-react';

const CierrePlanTrabajo = ({ plan_trabajo }) => {

    const [current_loading, setCurrentLoading] = useState(false);
    const [current_project, setCurrentProject] = useState({});
    const [current_plan_trabajo, setCurrentPlanTrabajo] = useState({});
    const [current_objectives, setCurrentObjectives] = useState([]);
    const [current_principal, setCurrentPrincipal] = useState({});
    const [current_areas, setCurrentAreas] = useState([]);
    const [current_teams, setCurrentTeams] = useState([]);
    const [current_presupuestado, setCurrentPresupuestado] = useState([]);
    const [current_financiamiento, setCurrentFinanciamiento] = useState([]);
    const [current_anexos, setCurrentAnexos] = useState([]);
    const [error, setError] = useState(false);


    // obtener reporte de cierre
    const getReportCierre = async () => {
        setCurrentLoading(true);
        await projectTracking.post(`report/cierre_plan_trabajo/${plan_trabajo.id}`)
            .then(res => {
                let { project, plan_trabajo, objectives, areas, principal, teams, presupuestado, financiamiento, anexos } = res.data;
                setCurrentProject(project || {});
                setCurrentPlanTrabajo(plan_trabajo || {});
                setCurrentObjectives(objectives || []);
                setCurrentAreas(areas || []);
                setCurrentPrincipal(principal || {});
                setCurrentTeams(teams || []);
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
                <thead>
                    <tr>
                        <th colSpan="2" className="bg-dark text-white">I. Datos Generales del Proyecto de Investigación</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td width="20%">1.1. Área y línea de investigación.</td>
                        <td>
                            <ul>
                                {current_areas.map((a, indexA) => 
                                    <li key={`linea-de-investigacion-${indexA}`}>{a.description}</li>    
                                )}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>1.2. Resolución de aprobación del proyecto.</td>
                        <td>{current_project.resolucion}</td>
                    </tr>
                    <tr>
                        <td>1.3. Duración del proyecto.</td>
                        <td>{current_project.duration} (MESES)</td>
                    </tr>
                    <tr>
                        <td>1.4. Costo del proyecto.</td>
                        <td>{currentFormatter.format(current_project.monto, { code: 'PEN' })}</td>
                    </tr>
                    <tr>
                        <td>1.5. Datos del investigador responsable.</td>
                        <td className="font-12 uppercase">{current_principal && current_principal.person && current_principal.person.fullname}</td>
                    </tr>
                    <tr>
                        <td>1.6. Datos de la(s) institución (es) cooperante(s).</td>
                        <td></td>
                    </tr>
                </tbody>

                <thead>
                    <tr>
                        <th className="bg-dark text-white" colSpan="2">II. Equipo técnico que ha participado</th>
                    </tr>
                </thead>
                <tbody>
                    {current_teams.map((t, indexT) => 
                        <tr key={`list-team-${indexT}`}>
                            <td>2.{indexT + 1}. {t.role}</td>
                            <td className="font-12 uppercase">{t.person && t.person.fullname || ""}</td>
                        </tr>
                    )}
                </tbody>

                <thead>
                    <tr>
                        <th colSpan="2" className="bg-dark text-white">III. Escuelas involucradas y beneficiadas</th>
                    </tr>
                </thead>

                <thead>
                    <tr>
                        <th colSpan="2" className="bg-dark text-white">IV. Objectivos de Proyecto</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>4.1. Objectivo General</td>
                        <td>{current_project.general_object || ""}</td>
                    </tr>
                    {current_objectives.map((obj, indexO) => 
                        <tr key={`list-object-especifico-${indexO}`}>
                            <td>4.{indexO + 2}. Objectivo Específico</td>
                            <td>{obj.title}</td>
                        </tr>
                    )}
                </tbody>

                <thead>
                    <tr>
                        <th colSpan="2" className="bg-dark text-white">V. Resultados alcanzados</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="2">
                            <Form.Field>
                                <textarea name="resultados_alcanzados" value={current_plan_trabajo.resultados_alcanzados || ""}/>
                            </Form.Field>
                        </td>
                    </tr>
                </tbody>

                <thead>
                    <tr>
                        <th colSpan="2" className="bg-dark text-white">VI. Exposición de motivos de cierre por fuerza mayor o por mala gestión</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="2">
                            <Form.Field>
                                <textarea name="resultados_alcanzados" value={current_plan_trabajo.motivos || ""}/>
                            </Form.Field>
                        </td>
                    </tr>
                </tbody>

                <thead>
                    <tr>
                        <th colSpan="2" className="bg-dark text-white">VII. Informe financiero del proyecto</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="2">
                            7.1. Presupuesto detallado por actividades.
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="text-center">
                                        <tr>
                                            <th>Objectivo/Actividad</th>
                                            <th width="20%">Presupuesto Aprobado.</th>
                                            <th width="20%">Presupuesto ejecutado.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {current_financiamiento.map((fin, indexF) => 
                                            <Fragment key={`lista-financiamiento-${indexF}`}>
                                                <tr>
                                                    <td colSpan="3" style={{ background: 'rgba(0, 0, 0, 0.1)' }}><b>Objectivo Especifico {fin.index}:</b> {fin.title}</td>
                                                </tr>
                                                {fin.activities && fin.activities.map((act, indexA) => 
                                                    <Fragment key={`lista-activity-${indexA}`}>
                                                        <tr>
                                                            <td colSpan="3" style={{ background: 'rgba(0, 0, 0, 0.03)' }}><b>Actividad {fin.index}.{act.index}.</b> {act.title}</td>
                                                        </tr>
                                                        {act.rubros && act.rubros.map((rub, indexR) => 
                                                            <tr key={`lista-rubro-${indexR}`}>
                                                                <td className="font-12">{rub.description}</td>
                                                                <td className="text-right">{currentFormatter.format(rub.programado, { code: 'PEN' })}</td>
                                                                <td className="text-right">{currentFormatter.format(rub.ejecutado, { code: 'PEN' })}</td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                )}
                                            </Fragment>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            7.2. Distribución de gastos por partida presupuestaria.
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Especifica</th>
                                            <th>Concepto</th>
                                            <th>Presupuesto Aprobado</th>
                                            <th>Presupuesto Ejecutado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {current_presupuestado.map((pre, indexP) => 
                                            <tr key={`lista-presupuestada-${indexP}`}>
                                                <td>{pre.ext_pptto}</td>
                                                <td className="uppercase" cols>{pre.name}</td>
                                                <td className="text-right">{currentFormatter.format(pre.programado, { code: 'PEN' })}</td>
                                                <td className="text-right">{currentFormatter.format(pre.ejecutado, { code: 'PEN' })}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                </tbody>

                <thead>
                    <tr>
                        <th colSpan="2" className="bg-dark text-white">VIII. Adquisición de bienes duraderos, ubicación actual y destino final de uso</th>
                    </tr>
                </thead>

                <thead>
                    <tr>
                        <th colSpan="2" className="bg-dark text-white">IX. Lecciones aprendidas y recomendaciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="2">
                            <Form.Field>
                                <textarea name="resultados_alcanzados" value={current_plan_trabajo.recomendaciones || ""}/>
                            </Form.Field>
                        </td>
                    </tr>
                </tbody>

                <thead>
                    <tr>
                        <th colSpan="2" className="bg-dark text-white">X. Anexos</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="2">
                            <ul>
                                {current_anexos.map((a, indexA) => 
                                    <li key={`lista-anexos-${indexA}`}>
                                        <a href={a.url} target="_blank">{a.name}</a>
                                    </li>
                                )}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2" className="text-right">
                            <button className="btn btn-primary">
                                <i className="fa fa-print"></i> Reporte
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </Form>
    )
}

// exportar
export default CierrePlanTrabajo;