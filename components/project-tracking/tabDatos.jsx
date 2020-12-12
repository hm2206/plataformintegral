import React, { Fragment, useContext, useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import moment from 'moment';
import { projectTracking } from '../../services/apis';
import currencyFormatter from 'currency-formatter';
import Show from '../show';

const states = {
    START: {
        text: 'INICIO',
        color: 'primary'
    },
    EXECUTE: {
        text: 'EJECUCIÓN',
        color: 'success'
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
                        <td className="uppercase"><b>Coordinador General: </b></td>
                        <td colSpan="2">
                            <span className="uppercase">{project.principal && project.principal.person && project.principal.person.fullname || ""}</span>
                        </td>
                    </tr>
                    <tr>
                        <td className="uppercase"><b>Líneas de Investigación: </b></td>
                        <td colSpan="2">
                            {area && area.data.length && area.data.map((a, indexA) => 
                                <small className="ml-2 badge badge-warning uppercase" key={`linea-de-investigacion-${indexA}`}>{a.description}</small>    
                            )}
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
    </Fragment>)
}

export default TabTeam;