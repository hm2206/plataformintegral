import React, { Fragment } from 'react';
import { Button } from 'semantic-ui-react';

const TabSaldoFinanciero = () => {

    return (
    <Fragment>
        <div className="table-responsive">
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th className="text-center" rowSpan="2">Plan Trab.</th>
                        <th className="text-center" colSpan="2">Fechas</th>
                        <th className="text-center" colSpan="4">Montos</th>
                    </tr>
                    <tr>
                        <th className="text-center">Inicio</th>
                        <th className="text-center">Fin</th>
                        <th className="text-center">Fecha</th>
                        <th className="text-center">Programado</th>
                        <th className="text-center">Ejecutado</th>
                        <th className="text-center">Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="8" className="text-center">No hay registros disponibles</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </Fragment>)
}

export default TabSaldoFinanciero;