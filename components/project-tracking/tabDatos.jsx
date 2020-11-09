import React, { Fragment, useContext } from 'react';
import { Button } from 'semantic-ui-react';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';

const TabTeam = () => {

    const { project } = useContext(ProjectContext);

    return (
    <Fragment>
        <div className="table-responsive">
            <table className="table mb-4">
                <thead >
                    <tr>
                        <td><b>Código: </b> {project.code}</td>
                    </tr>
                    <tr>
                        <td><b>Entidad Ejecutora: </b> <span className="capitalize">{project.entity && project.entity.name}</span></td>
                    </tr>
                    <tr>
                        <td><b>Coordinador General: </b> <span className="capitalize">{project.principal && project.principal.person && project.principal.person.fullname || ""}</span></td>
                    </tr>
                </thead>
                <tbody>
                    <tr className="text-center">
                        <th>Inicio del programa</th>
                        <th>Duración (Meses)</th>
                        <th>Fin del programa</th>
                    </tr>
                </tbody>
            </table>
            <div><hr/></div>
            <h4>Financiamiento <button className="btn btn-sm btn-outline-success"><i className="fas fa-plus"></i></button></h4>
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
                        <tr>
                            <th className="text-center">Total</th>
                            <th className="text-right">0.00</th>
                            <th className="text-right">0.00</th>
                            <th className="text-right">0.00</th>
                            <th className="text-right">0.00%</th>
                            <th className="text-right">0.00%</th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </Fragment>)
}

export default TabTeam;