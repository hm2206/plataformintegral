import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';
import moment from 'moment';
import { projectTracking } from '../../services/apis';
import currencyFormatter from 'currency-formatter'
import { AppContext } from '../../contexts/AppContext';
import Show from '../show';
import Swal from 'sweetalert2';
import AddDetalle from './addDetalle'
import ListDetalle from './listDetalle'
import ListMedioVerification from './listMedioVerification'
import { Confirm } from '../../services/utils';

const TableSaldoFinanciero = ({ plan_trabajo, refresh, execute = false }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_objectives, setCurrentObjectives] = useState([]);
    const [current_gasto, setCurrentGasto] = useState({});
    const [option, setOption] = useState("");
    const [current_meta, setCurrentMeta] = useState({});

    const getSaldoFinanciero = async () => {
        projectTracking.get(`plan_trabajo/${plan_trabajo.id}/financiamiento`)
            .then(res => {
                let { objectives } = res.data;
                setCurrentObjectives(objectives);
            }).catch(err => console.log(err.message));
    }

    // actualizar los detalles del gasto
    const onUpdateGasto = async (detalle) => {
        setOption("");
        getSaldoFinanciero();
    }

    // verificación financiera
    const handleVerify = async (indexO, indexA, obj) => {
        let answer = await Confirm('warning', '¿Estas seguro en verificar financieramente la actividad?')
        if (answer) {
            app_context.setCurrentLoading(true);
            await projectTracking.post(`activity/${obj.id}/verify`)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    let newObjectives = JSON.parse(JSON.stringify(current_objectives));
                    let newActivities = newObjectives[indexO].activities;
                    obj.verify = 1;
                    newActivities[indexA] = obj;
                    newObjectives.activities = newActivities;
                    setCurrentObjectives(newObjectives);
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { message, errors } = err.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message || err.message });
                    }
                });
        }
    }

    // verificación técnica
    const handleVerifyTecnica = async (indexO, indexA, obj) => {
        let answer = await Confirm('warning', '¿Estas seguro en verificar técnicamente la actividad?')
        if (answer) {
            app_context.setCurrentLoading(true);
            await projectTracking.post(`activity/${obj.id}/verify_tecnica`)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    let newObjectives = JSON.parse(JSON.stringify(current_objectives));
                    let newActivities = newObjectives[indexO].activities;
                    obj.verify_tecnica = 1;
                    newActivities[indexA] = obj;
                    newObjectives.activities = newActivities;
                    setCurrentObjectives(newObjectives);
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { message, errors } = err.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message || err.message });
                    }
                });
        }
    }

    // primera carga
    useEffect(() => {
        if (plan_trabajo.id || refresh) getSaldoFinanciero();
    }, [plan_trabajo.id, refresh]);


    return (
    <Fragment>
        {current_objectives.map((obj, indexO) => 
            <div className="card" style={{ border: "1.5px solid #000" }}>
                <div className="card-header">
                   <div className="table-responsive">
                        <table className="table">
                            <thead className="bg-dark text-white">
                                <tr>
                                    <th>Objectivo/Componente</th>
                                    <th className="text-center" width="10%">TOTAL PROG.</th>
                                    <Show condicion={execute}>
                                        <th className="text-center" width="10%">TOTAL EJEC.</th>
                                        <th className="text-center" width="10%">TOTAL SALDO</th>
                                    </Show>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{obj.title}</td>
                                    <td className="font-13 text-right">{currencyFormatter.format(obj.total_programado, { code: 'PEN' })}</td>
                                    <Show condicion={execute}>
                                        <td className="font-13 text-right">{currencyFormatter.format(obj.total_ejecutado, { code: 'PEN' })}</td>
                                        <td className={`font-13 text-right ${obj.total_saldo < 0 ? 'text-red' : ''}`}>{currencyFormatter.format(obj.total_saldo, { code: 'PEN' })}</td>
                                    </Show>
                                </tr>
                            </tbody>
                        </table>
                   </div>
                </div>

                <div className="card-body">
                    <div className="table-responsive font-12">
                        <table className="table table-bordered table-striped" key={`table-financiamiento-${indexO}`}>
                            <thead>
                                <tr>
                                    <th className="text-center">ACTIVIDAD</th>
                                    <th className="text-center" width="10%">TOTAL PROG.</th>
                                    <Show condicion={execute}>
                                        <th className="text-center" width="10%">TOTAL EJEC.</th>
                                        <th className="text-center" width="10%">TOTAL SALDO</th>
                                        <th className="text-center" width="5%" title="Verificación Técnica">VT</th>
                                        <th className="text-center" width="5%" title="Verificación Financiera">VF</th>
                                    </Show>
                                </tr>
                            </thead>
                            <tbody>
                                {obj.activities && obj.activities.map((act, indexA) => 
                                    <Fragment key={`activity-index-${indexA}`}>
                                        <tr>
                                            <th className="font-14">{act.title}</th>
                                            <th className="font-13 text-right">{currencyFormatter.format(act.total_programado, { code: 'PEN' })}</th>
                                            <Show condicion={execute}>
                                                <th className="font-13 text-right">{currencyFormatter.format(act.total_ejecutado, { code: 'PEN' })}</th>
                                                <th className={`font-13 text-right ${act.total_saldo < 0 ? 'text-red' : ''}`}>{currencyFormatter.format(act.total_saldo, { code: 'PEN' })}</th>
                                                <td className="text-center bg-white">
                                                    <Show condicion={!act.verify_tecnica}
                                                        predeterminado={
                                                            <span className="badge badge-success"><i className="fas fa-check"></i></span>
                                                        }
                                                    >
                                                        <button className="btn btn-sm btn-outline-warning"
                                                            title="Verificación Técnica"
                                                            onClick={(e) => handleVerifyTecnica(indexO, indexA, act)}
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    </Show>
                                                </td>
                                                <td className="text-center bg-white">
                                                    <Show condicion={!act.verify}
                                                        predeterminado={
                                                            <span className="badge badge-success"><i className="fas fa-check"></i></span>
                                                        }
                                                    >
                                                        <button className="btn btn-sm btn-outline-warning"
                                                            title="Verificación Financiera"
                                                            onClick={(e) => handleVerify(indexO, indexA, act)}
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    </Show>
                                                </td>
                                            </Show>
                                        </tr>    

                                        <Show condicion={act.gastos && act.gastos.length}
                                            predeterminado={
                                                <tr>
                                                    <td colSpan="6" className="text-center font-11">No hay registros disponibles</td>
                                                </tr>
                                            }
                                        >                                
                                            <tr>
                                                <td colSpan="6">
                                                    <table className="table table-bordered">
                                                        <thead className="text-center font-11">
                                                            <tr>
                                                                <th>DESCRIPCIÓN</th>
                                                                <th>EXT PRES.</th>
                                                                <th>UNIDAD</th>
                                                                <th>COSTO UNITARIO</th>
                                                                <th>CANTIDAD</th>
                                                                <th>COSTO TOTAL</th>
                                                                <Show condicion={execute}>
                                                                    <th>EJEC.</th>
                                                                    <th>ACCIÓN</th>
                                                                </Show>
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
                                                                    <th className={`bg-white text-right ${execute && gas.total < gas.ejecutado ? 'text-red' : ''} ${execute && gas.total == gas.ejecutado ? 'text-success' : ''}`}>
                                                                        {currencyFormatter.format(gas.total, { code: 'PEN' })}
                                                                    </th>
                                                                    <Show condicion={execute}>
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

                                                                                <Show condicion={gas.ejecutado}>
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
                                                                    </Show>
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
                </div>

                <div className="card-footer font-12">
                    <div className="table responsive">
                        <table className="table">
                            <thead className="text-center">
                                <tr>
                                    <th>INDICADOR</th>
                                    <th width="15%">MEDIO DE VERIFICACIÓN</th>
                                </tr>
                            </thead>
                            <tbody className="font-14">
                                <Show condicion={obj.metas && obj.metas.length}
                                    predeterminado={
                                        <tr>
                                            <th colSpan="2" className="text-center font-12">No hay registros disponibles!</th>
                                        </tr>
                                    }
                                >
                                    {obj.metas.map(m => 
                                        <tr>
                                            <td className="text-center">
                                                <b>{m.description}</b>
                                            </td>

                                            <td className="text-center">
                                                <a href="#" onClick={(e) => {
                                                    e.preventDefault();
                                                    setOption("list_medio_verification");
                                                    setCurrentMeta(m);
                                                }}><i className="fas fa-search"></i></a>
                                            </td>
                                        </tr>    
                                    )}
                                </Show>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

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

        <Show condicion={option == 'list_medio_verification'}>
            <ListMedioVerification
                meta={current_meta}
                isClose={() => setOption("")}
            />
        </Show>
    </Fragment>)
}

export default TableSaldoFinanciero;