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
        color: 'danger'
    }
};

const TabTeam = () => {

    const { project } = useContext(ProjectContext);
    const isProject = Object.keys(project || {}).length;

    // estados
    const [financiamiento, setFinanciamiento] = useState([]);
    const [total_monetario, setTotalMonetario] = useState(0);
    const [total_no_monetario, setTotalNoMonetario] = useState(0);
    const [total_porcentaje_monetario, setTotalPorcentajeMonetario] = useState(0);
    const [total_porcentaje_no_monetario, setTotalPorcentajeNoMonetario] = useState(0);
    const [total, setTotal] = useState(0);

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

    // primera carga
    useEffect(() => {
        if (project.id) getFinanciamiento();
    }, []);

    // render
    return (
    <Fragment>
        <div className="table-responsive font-13">
            <table className="table mb-4">
                <thead >
                    <tr>
                        <td colSpan="1" className="uppercase"><b>Código: </b> {project.code}</td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="uppercase"><b>Entidad Ejecutora: </b> <span className="uppercase">{project.entity && project.entity.name}</span></td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="uppercase"><b>Coordinador General: </b> <span className="uppercase">{project.principal && project.principal.person && project.principal.person.fullname || ""}</span></td>
                    </tr>
                </thead>
                <tbody>
                    <tr className="text-center">
                        <td width="26%">
                            <b>Inicio del programa</b>
                            <div>{moment(project.date_start).format('DD/MM/YYYY')}</div>
                        </td>
                        <td width="26%">
                            <b>Duración (Meses)</b>
                            <div>{project.duration}</div>
                        </td>
                        <td width="26%">
                            <b>Fin del programa</b>
                            <div>{moment(project.date_over).format('DD/MM/YYYY')}</div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div><hr/></div>
            <h4>Financiamiento</h4>
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="text-center">
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

            <Show condicion={isProject}>
                <b className="font-15">Estado del Proyecto: <span className={`badge badge-${states[project.state].color}`}>{states[project.state].text}</span></b>
            </Show>
        </div>
    </Fragment>)
}

export default TabTeam;