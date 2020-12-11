import React, { Fragment, useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';
import moment from 'moment';
import { projectTracking } from '../../services/apis';
import currencyFormatter from 'currency-formatter'
import Show from '../show';
import AddDetalle from './addDetalle'
import ListDetalle from './listDetalle'

const TableSaldoFinanciero = ({ plan_trabajo, refresh }) => {

    // estados
    const [current_activities, setCurrentActivities] = useState([]);
    const [current_gasto, setCurrentGasto] = useState({});
    const [option, setOption] = useState("");

    const getSaldoFinanciero = async () => {
        projectTracking.get(`plan_trabajo/${plan_trabajo.id}/activity`)
            .then(res => {
                let { actividades } = res.data;
                setCurrentActivities(actividades);
            }).catch(err => console.log(err.message));
    }

    // actualizar los detalles del gasto
    const onUpdateGasto = async (detalle) => {
        setOption("");
        getSaldoFinanciero();
    }

    // primera carga
    useEffect(() => {
        if (plan_trabajo.id || refresh) getSaldoFinanciero();
    }, [plan_trabajo.id, refresh]);


    return (
    <Fragment>
        <div className="table-responsive font-12">
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th className="text-center">DESCRIPCION</th>
                        <th className="text-center" width="10%">TOTAL PROG.</th>
                        <th className="text-center" width="10%">TOTAL EJEC.</th>
                        <th className="text-center" width="10%">TOTAL SALDO</th>
                    </tr>
                </thead>
                <tbody>
                    {current_activities.map((act, indexA) => 
                        <Fragment key={`activity-index-${indexA}`}>
                            <tr>
                                <th className="font-14">{act.title}</th>
                                <th className="font-13 text-right">{currencyFormatter.format(act.total_programado, { code: 'PEN' })}</th>
                                <th className="font-13 text-right">{currencyFormatter.format(act.total_ejecutado, { code: 'PEN' })}</th>
                                <th className="font-13 text-right">{currencyFormatter.format(act.total_saldo, { code: 'PEN' })}</th>
                            </tr>    

                            <Show condicion={act.gastos && act.gastos.length}
                                predeterminado={
                                    <tr>
                                        <td colSpan="4" className="text-center">No hay registros disponibles</td>
                                    </tr>
                                }
                            >                                
                                <tr>
                                    <td colSpan="4">
                                        <table className="table table-bordered">
                                            <thead className="text-center font-11">
                                                <tr>
                                                    <th>DESCRIPCIÓN</th>
                                                    <th>EXT PRES.</th>
                                                    <th>UNIDAD</th>
                                                    <th>COSTO UNITARIO</th>
                                                    <th>CANTIDAD</th>
                                                    <th>COSTO TOTAL</th>
                                                    <th>EJEC.</th>
                                                    <th>ACCIÓN</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {act.gastos.map((gas, indexG) => 
                                                    <tr key={`activity-gasto-${indexG}`}>
                                                        <th className="bg-white">{gas.description}</th>
                                                        <th className="bg-white text-center">{gas.ext_pptto}</th>
                                                        <th className="bg-white text-center">{gas.medida}</th>
                                                        <th className="bg-white text-right">{currencyFormatter.format(gas.monto, { code: 'PEN' })}</th>
                                                        <th className="bg-white text-center">{gas.cantidad}</th>
                                                        <th className={`bg-white text-right ${gas.total < gas.ejecutado ? 'text-red' : ''} ${gas.total == gas.ejecutado ? 'text-success' : ''}`}>
                                                            {currencyFormatter.format(gas.total, { code: 'PEN' })}
                                                        </th>
                                                        <th className="bg-white text-right">{currencyFormatter.format(gas.ejecutado, { code: 'PEN' })}</th>
                                                        <th className="bg-white text-center">
                                                            <div className="btn-group">
                                                                <Show condicion={!act.verify}>
                                                                    <button className="btn btn-sm btn-outline-dark"
                                                                        onClick={(e) => {
                                                                            setCurrentGasto(gas)    
                                                                            setOption("add_detalle")
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-upload"></i>
                                                                    </button>
                                                                </Show>

                                                                <Show condicion={gas.ejecutado}
                                                                    predeterminado={
                                                                        <button className="btn btn-sm btn-outline-red">
                                                                            <i className="fas fa-times"></i>
                                                                        </button>
                                                                    }
                                                                >
                                                                    <button className="btn btn-sm btn-primary"
                                                                        onClick={(e) => {
                                                                            setCurrentGasto(gas)    
                                                                            setOption("list_detalle")
                                                                        }}
                                                                    >
                                                                        <i className="far fa-file-alt"></i>
                                                                    </button>
                                                                </Show>
                                                            </div>
                                                        </th>
                                                    </tr>
                                                )}
                                            </tbody>    
                                        </table>
                                    </td>
                                </tr>
                            </Show>
                        </Fragment>
                    )}
                </tbody>
            </table>
        </div>

        <Show condicion={option == 'add_detalle'}>
            <AddDetalle
                gasto={current_gasto}
                isClose={() => setOption("")}
                onCreate={onUpdateGasto}
            />
        </Show>

        <Show condicion={option == 'list_detalle'}>
            <ListDetalle
                gasto={current_gasto}
                isClose={() => setOption("")}
            />
        </Show>
    </Fragment>)
}

export default TableSaldoFinanciero;