import React, { Fragment, useContext, useState, useEffect } from 'react';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { AppContext } from '../../contexts/AppContext';
import moment from 'moment';
import { projectTracking } from '../../services/apis';
import currencyFormatter from 'currency-formatter';
import Show from '../show';
import Anexos from './anexos';
import Router from 'next/dist/client/router';
import CierreProject from './cierreProject';
import { SelectArea } from '../select/project_tracking';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

const states = {
    START: {
        text: 'INICIO',
        color: 'primary'
    },
    EXECUTE: {
        text: 'EJECUCIÓN',
        color: 'success'
    },
    PREOVER: {
        text: 'PRE CIERRE',
        color: 'warning'
    },
    OVER: {
        text: 'CERRADO',
        color: 'white'
    }
};

const defaultPaginate = {
    total: 0,
    last_page: 0,
    page: 1,
    data: []
};

const TabTeam = () => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);
    const isProject = Object.keys(project || {}).length;

    // estados
    const [area, setArea] = useState(defaultPaginate);
    const [financiamiento, setFinanciamiento] = useState([]);
    const [total_monetario, setTotalMonetario] = useState(0);
    const [total_no_monetario, setTotalNoMonetario] = useState(0);
    const [total_porcentaje_monetario, setTotalPorcentajeMonetario] = useState(0);
    const [total_porcentaje_no_monetario, setTotalPorcentajeNoMonetario] = useState(0);
    const [total, setTotal] = useState(0);
    const [current_loading, setCurrentLoading] = useState(false);
    const [option, setOption] = useState("");
    const [is_add_area, setIsAddArea] = useState(false);

    // obtener financiamiento
    const getFinanciamiento = async () => {
        await projectTracking.get(`project/${project.id}/financiamiento`)
            .then(res => {
                let { data } = res;
                setFinanciamiento(data.financiamiento);
                setTotalMonetario(data.total_monetario);
                setTotalNoMonetario(data.total_no_monetario);
                setTotalPorcentajeMonetario(data.total_porcentaje_monetario);
                setTotalPorcentajeNoMonetario(data.total_porcentaje_no_monetario);
                setTotal(data.total);
            }).catch(err => console.log(err));
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

    // add línea de investigación
    const addAreaToProject = async (e, { value }) => {
        let answer = await Confirm('warning', `¿Estas seguro en agregar la línea de investigación al proyecto?`, 'Agregar');
        if (answer && value) {
            let datos = {};
            datos.area_id = value;
            datos.project_id = project.id;
            app_context.fireLoading(true);
            await projectTracking.post(`config_project_area`, datos)
                .then(async res => {
                    app_context.fireLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    setIsAddArea(false);
                    await Swal.fire({ icon: 'success', text: message });
                    getAreas();
                }).catch(err => {
                    app_context.fireLoading(false);
                    let { message } = err.response.data;
                    Swal.fire({ icon: 'error', text: message || err.message });
                });
        }
    }
 
    // eliminar línea de investigación
    const deleteAreaToProject = async (e, index, obj) => {
        e.preventDefault();
        if (project.state != 'OVER' && project.state != 'PREOVER') {
            let answer = await Confirm("warning", "¿Estás seguro en eliminar la línea de investigación?");
            if (answer) {
                app_context.fireLoading(true);
                await projectTracking.post(`config_project_area/${obj.id}/delete`)
                    .then(res => {
                        app_context.fireLoading(false);
                        let { success, message } = res.data;
                        if (!success) throw new Error(message);
                        let newArea = Object.assign({}, area);
                        newArea.data.splice(index, 1);
                        setArea(newArea);
                        Swal.fire({ icon: 'success', text: message });
                    }).catch(err => {
                        app_context.fireLoading(false);
                        let { message } = err.response.data;
                        Swal.fire({ icon: 'error', text: message || err.message });
                    });
                app_context.fireLoading(false);
            }
        }
    }

    // primera carga
    useEffect(() => {
        if (project.id) {
            getFinanciamiento();
            getAreas();
        }
    }, []);

    // render
    return (
    <Fragment>
        <div className="table-responsive font-13">
            <table className="table mb-4 table-bordered">
                <thead >
                    <tr>
                        <td className="uppercase"><b>Código: </b></td>
                        <td colSpan="2">{project.code}</td>
                    </tr>
                    <tr>
                        <td className="uppercase"><b>Resolución: </b></td>
                        <td colSpan="2" className="uppercase">{project.resolucion}</td>
                    </tr>
                    <tr>
                        <td className="uppercase"><b>Líneas de Investigación: </b></td>
                        <td colSpan="2">
                            <Show condicion={!is_add_area}
                                predeterminado={
                                    <div className="row">
                                        <div className="col-md-10">
                                            <SelectArea
                                                name="area_id"
                                                onChange={addAreaToProject}
                                            />
                                        </div>
                                        <div className="col-md-2">
                                            <button className="ml-1 btn btn-sm btn-outline-red"
                                                onClick={(e) => setIsAddArea(false)}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                }
                            >
                                <Show condicion={project.state != 'OVER' && project.state != 'PREOVER'}>
                                    <button className="ml-1 btn btn-sm btn-outline-primary"
                                        onClick={(e) => setIsAddArea(true)}
                                    >
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </Show>

                                <Show condicion={area && area.data.length}>
                                    {area.data.map((a, indexA) => 
                                        <a className="ml-2 badge badge-primary uppercase text-white" 
                                            key={`linea-de-investigacion-${indexA}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={(e) => deleteAreaToProject(e, indexA, a)}
                                            href="#"
                                        >
                                            {a.description}
                                        </a>    
                                    )}
                                </Show>
                            </Show>
                        </td>
                    </tr>
                    <tr>
                        <td className="uppercase"><b>Duración: </b></td>
                        <td colSpan="2">
                            <span className="uppercase">{project.duration} meses</span>
                        </td>
                    </tr>
                    <tr>
                        <td className="uppercase"><b>Costo del Proyecto: </b></td>
                        <td colSpan="2">
                            <b className="uppercase">{currencyFormatter.format(project.monto, { code: 'PEN' })}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="uppercase"><b>Investigador Principal: </b></td>
                        <td colSpan="2">
                            <span className="uppercase">{project.principal && project.principal.person && project.principal.person.fullname || ""}</span>
                        </td>
                    </tr>
                    <tr>
                        <td className="uppercase"><b>ESTADO: </b></td>
                        <td colSpan="2">
                            <Show condicion={isProject}>
                                <b className={`uppercase && badge badge-${states[project.state].color}`}>{states[project.state].text}</b>
                            </Show> 
                        </td>
                    </tr>
                    <Show condicion={project.state == 'PREOVER'}>
                        <tr>
                            <td className="uppercase">
                                <b>Informe de Cierre</b>
                            </td>
                            <td colSpan="2">
                                <button className="btn btn-sm btn-outline-dark"
                                    onClick={(e) => setOption("cierre")}
                                >
                                    Cerrar Proyecto <i className="fas fa-arrow-down"></i>
                                </button>
                            </td>
                        </tr>
                    </Show>

                    <Show condicion={project.state == 'OVER'}>
                        <tr>
                            <td className="uppercase">
                                <b>Resolución de Cierre</b>
                            </td>
                            <td colSpan="2" className="uppercase">
                                {project.cierre_resolucion}
                            </td>
                        </tr>
                        <tr>
                            <td className="uppercase">
                                <b>Motivo de Cierre</b>
                            </td>
                            <td colSpan="2" className="uppercase">
                                {project.cierre_motivo}
                            </td>
                        </tr>
                    </Show>
                    <tr>
                        <td className="uppercase"><b>ANEXOS: </b></td>
                        <td colSpan="2">
                            <a href="#" className="font-14"
                                onClick={(e) => setOption("anexos")}
                            >
                                <i className="fas fa-paperclip"></i>
                            </a>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr className="text-center font-14">
                        <td width="26%">
                            <b>Inicio del proyecto</b>
                            <div>{moment(project.date_start).format('DD/MM/YYYY')}</div>
                        </td>
                        <td width="26%">
                            <b>Duración (Meses)</b>
                            <div>{project.duration}</div>
                        </td>
                        <td width="26%">
                            <b>Fin del proyecto</b>
                            <div>{moment(project.date_over).format('DD/MM/YYYY')}</div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div><hr/></div>
            <h4 className="uppercase font-12">Financiamiento</h4>
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="text-center uppercase">
                        <tr>
                            <th rowSpan="2">Fuentes de Financiamientos</th>
                            <th colSpan="3">Monto (S/.)</th>
                            <th colSpan="2">Porcentaje (%)</th>
                        </tr>
                        <tr>
                            <th>Monetario</th>
                            <th>No Monetario</th>
                            <th>Total</th>
                            <th>Monetario</th>
                            <th>No Monetario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {financiamiento.map((f, indexF) => 
                            <tr key={`financiamiento-${indexF}`}>
                                <th className="text-center" title={f.name}>{f.ext_pptto}</th>
                                <th className="text-right">{currencyFormatter.format(f.monetario, { code: 'PEN' })}</th>
                                <th className="text-right">{currencyFormatter.format(f.no_monetario, { code: 'PEN' })}</th>
                                <th className="text-right">{currencyFormatter.format(f.total, { code: 'PEN' })}</th>
                                <th className="text-right">{f.porcentaje_monetario}%</th>
                                <th className="text-right">{f.porcentaje_no_monetario}%</th>
                            </tr>
                        )}
                        <tr>
                            <th className="text-center">Total</th>
                            <th className="text-right">{currencyFormatter.format(total_monetario, { code: 'PEN' })}</th>
                            <th className="text-right">{currencyFormatter.format(total_no_monetario, { code: 'PEN' })}</th>
                            <th className="text-right">{currencyFormatter.format(total, { code: 'PEN' })}</th>
                            <th className="text-right">{total_porcentaje_monetario}%</th>
                            <th className="text-right">{total_porcentaje_no_monetario}%</th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <Show condicion={option == 'anexos'}>
            <Anexos
                object_id={project.id}
                object_type={'App/Models/Project'}
                isClose={(e) => setOption("")}
            />
        </Show>

        <Show condicion={option == 'cierre'}>
            <CierreProject
                isClose={(e) => setOption("")}
                afterSave={async (e) => {
                    let { push, pathname, query } = Router;
                    await push({ pathname, query });
                    setOption("");
                }}
            />
        </Show>
    </Fragment>)
}

export default TabTeam;