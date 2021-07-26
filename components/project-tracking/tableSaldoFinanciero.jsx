import React, { Fragment, useContext, useEffect, useState } from 'react';
import { projectTracking } from '../../services/apis';
import currencyFormatter from 'currency-formatter'
import { AppContext } from '../../contexts/AppContext';
import Show from '../show';
import ListMedioVerification from './listMedioVerification'
import ItemSaldoFinanciero from './itemSaldoFinanciero';
import Skeleton from 'react-loading-skeleton';
import collect from 'collect.js';

const Placeholder = () => {
    const datos = [1, 2, 3, 4, 5];
    // response
    return (
        <div className="table-responsive">
            <table className="table">
                <thead>
                    {datos.map(d => 
                        <tr key={`list-item-${d}`}>
                            <td><Skeleton/></td>
                            <td><Skeleton/></td>
                            <td><Skeleton/></td>
                            <td><Skeleton/></td>
                        </tr>
                    )}
                </thead>
            </table>
        </div>
    )
}

const TableSaldoFinanciero = ({ plan_trabajo, refresh, execute = false, viewer = [] }) => {

    const verifies = {
        tecnica: 'tecnica', 
        financiera: 'financiera'
    }

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_objectives, setCurrentObjectives] = useState([]);
    const [option, setOption] = useState("");
    const [current_meta, setCurrentMeta] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [block, setBlock] = useState(false);

    const getSaldoFinanciero = async () => {
        setCurrentLoading(true);
        await projectTracking.get(`plan_trabajo/${plan_trabajo.id}/financiamiento`)
        .then(res => {
            let { objectives } = res.data;
            setCurrentObjectives(objectives);
        }).catch(err => console.log(err.message));
        setCurrentLoading(false);
    }

    // verificación de actividad
    const handleVerify = async (index, act, gas, name = 'verify_tecnica') => {
        let newObjectives = [...current_objectives];
        let current_objective = newObjectives[index];
        if (!current_objective) return;
        gas[name] = gas[name] ? 0 : 1;
        // update gasto
        await act?.gastos?.map(g => {
            if (g.id == gas.id) g = gas;
            return g
        });
        // update activities
        await current_objective?.activities?.map(a => {
            if (a.id = act.id) a = act;
            return a;
        });
        // actualizar objectives
        newObjectives[index] = current_objective;
        // verificar actividad
        let lackVerify = collect(act.gastos).where(name, 0).count();
        act[name == 'verify_tecnica' ? name : 'verify'] = lackVerify ? 0 : 1;
        // aplicar cambios
        setCurrentObjectives(newObjectives);
    }

    // primera carga
    useEffect(() => {
        if (plan_trabajo.id || refresh) getSaldoFinanciero();
    }, [plan_trabajo.id, refresh]);


    return (
    <Fragment>
        <Show condicion={!current_loading}
            predeterminado={<Placeholder/>}
        >
            {current_objectives.map((obj, indexO) => 
                <div className="card" style={{ border: "1.5px solid #000" }}>
                    <div className="card-header">
                    <div className="table-responsive">
                            <table className="table">
                                <thead className="bg-dark text-white">
                                    <tr>
                                        <th>Objectivo/Componente</th>
                                        <th className="text-center" width="10%">TOTAL PROG.</th>
                                        <th className="text-center" width="10%">TOTAL EJEC.</th>
                                        <th className="text-center" width="10%">TOTAL SALDO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{obj.title}</td>
                                        <td className="font-13 text-right">{currencyFormatter.format(obj.total_programado, { code: 'PEN' })}</td>
                                        <td className="font-13 text-right">{currencyFormatter.format(obj.total_ejecutado, { code: 'PEN' })}</td>
                                        <td className={`font-13 text-right ${obj.total_saldo < 0 ? 'text-red' : ''}`}>{currencyFormatter.format(obj.total_saldo, { code: 'PEN' })}</td>
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
                                        <th className="text-center" width="10%">TOTAL EJEC.</th>
                                        <th className="text-center" width="10%">TOTAL SALDO</th>
                                        <Show condicion={viewer.includes(verifies.tecnica)}>
                                            <th className="text-center" width="5%" title="Verificación Técnica">VT</th>
                                        </Show>

                                        <Show condicion={viewer.includes(verifies.financiera)}>
                                            <th className="text-center" width="5%" title="Verificación Financiera">VF</th>
                                        </Show>
                                    </tr>
                                </thead>
                                <tbody>
                                    {obj?.activities?.map((act, indexA) => 
                                        <Fragment key={`activity-index-${indexA}`}>
                                            <tr>
                                                <th className="font-14">{act.title}</th>
                                                <th className="font-13 text-right">{currencyFormatter.format(act.total_programado, { code: 'PEN' })}</th>
                                                <th className="font-13 text-right">{currencyFormatter.format(act.total_ejecutado, { code: 'PEN' })}</th>
                                                <th className={`font-13 text-right ${act.total_saldo < 0 ? 'text-red' : ''}`}>{currencyFormatter.format(act.total_saldo, { code: 'PEN' })}</th>
                                                <Show condicion={viewer.includes(verifies.tecnica)}>
                                                    <td className="text-center bg-white">
                                                        <Show condicion={!act.verify_tecnica}
                                                            predeterminado={
                                                                <span className="badge badge-success cursor-pointer"><i className="fas fa-check"></i></span>
                                                            }
                                                        >
                                                            <span className="badge badge-danger"><i className="fas fa-times"></i></span>
                                                        </Show>
                                                    </td>
                                                </Show>

                                                <Show condicion={viewer.includes(verifies.financiera)}>
                                                    <td className="text-center bg-white">
                                                        <Show condicion={!act.verify}
                                                            predeterminado={
                                                                <span className="badge badge-success cursor-pointer"><i className="fas fa-check"></i></span>
                                                            }
                                                        >
                                                            <span className="badge badge-danger"><i className="fas fa-times"></i></span>
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
                                                                    <th>EJEC.</th>
                                                                    <Show condicion={viewer.includes(verifies.tecnica)}>
                                                                        <th width="5%" colSpan="2">VT</th>
                                                                    </Show>
                                                                    <Show condicion={viewer.includes(verifies.financiera)}>
                                                                        <th width="5%">VF</th>
                                                                    </Show>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {act.gastos.map((gas, indexG) => 
                                                                    <ItemSaldoFinanciero
                                                                        key={`activity-gasto-${indexG}`}
                                                                        activity={act}
                                                                        execute={execute}
                                                                        gasto={gas}
                                                                        onUpdate={async () => await getSaldoFinanciero()}
                                                                        onVerifyTecnica={() => handleVerify(indexO, act, gas, 'verify_tecnica')}
                                                                        onVerifyFinanciera={() => handleVerify(indexO, act, gas, 'verify_financiera')}
                                                                        viewer={viewer}
                                                                        block={block}
                                                                        onBlock={(value) => setBlock(value)}
                                                                    />
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
            {/* no hay datos */}
            <Show condicion={!current_objectives?.length}>
                <div className="w-100 table-responsive" style={{ minHeight: "50vh" }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="text-center">No hay regístros</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </Show>
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