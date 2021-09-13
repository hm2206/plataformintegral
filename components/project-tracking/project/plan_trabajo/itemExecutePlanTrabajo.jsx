import React, { Fragment, useEffect, useState } from 'react';
import { projectTracking } from '../../../../services/apis';
import currencyFormatter from 'currency-formatter'
import Show from '../../../show';
import ListMedioVerification from '../../listMedioVerification'
import ItemExecuteGasto from './itemExecuteGasto'
import Skeleton from 'react-loading-skeleton';
import VerifyObjective from './verifyObjective'
import ActivityVerify from '../activity/activityVerify';


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

const ItemExecutePlanTrabajo = ({ plan_trabajo, refresh }) => {

    // estados
    const [current_objectives, setCurrentObjectives] = useState([]);
    const [option, setOption] = useState("");
    const [current_meta, setCurrentMeta] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [block, setBlock] = useState(false);
    const [current_objective, setCurrentObjective] = useState({})
    const [current_activity, setCurrentActivity] = useState({})

    const getSaldoFinanciero = async () => {
        setCurrentLoading(true);
        await projectTracking.get(`plan_trabajo/${plan_trabajo.id}/executado?principal=0`)
        .then(res => {
            let { objectives } = res.data;
            setCurrentObjectives(objectives);
        }).catch(err => console.log(err.message));
        setCurrentLoading(false);
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
                <div className="card" style={{ border: "1.5px solid #000" }}
                    key={`item-objective-financiero-${indexO}`}
                >
                    <div className="card-header">
                    <div className="table-responsive">
                            <table className="table">
                                <thead className="bg-dark text-white">
                                    <tr>
                                        <th>Objectivo/Componente</th>
                                        <th className="text-center" width="10%">TOTAL PROG.</th>
                                        <th className="text-center" width="10%">TOTAL EJEC.</th>
                                        <th className="text-center" width="10%">TOTAL SALDO.</th> 
                                        <th className="text-center" width="10%">OPCIONES</th> 
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{obj.title}</td>
                                        <td className="font-13 text-right">{currencyFormatter.format(obj.total_programado, { code: 'PEN' })}</td>
                                        <td className="font-13 text-right">{currencyFormatter.format(obj.total_ejecutado, { code: 'PEN' })}</td>
                                        <td className="font-13 text-right">{currencyFormatter.format(obj.total_saldo, { code: 'PEN' })}</td>
                                        <td className="text-center">
                                            <VerifyObjective 
                                                status="EXECUTE"
                                                objective={obj}
                                                plan_trabajo={plan_trabajo}
                                            />
                                        </td>
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
                                        <th className="text-center" width="10%">TOTAL SALDO.</th>
                                        <th className="text-center" width="5%" title="Verificación Técnica">VT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {obj?.activities?.map((act, indexA) => 
                                        <Fragment key={`activity-index-${indexA}`}>
                                            <tr>
                                                <th className="font-14">{act.title}</th>
                                                <th className="font-13 text-right">{currencyFormatter.format(act.total_programado, { code: 'PEN' })}</th>
                                                <th className="font-13 text-right">{currencyFormatter.format(act.total_ejecutado, { code: 'PEN' })}</th>
                                                <th className="font-13 text-right">{currencyFormatter.format(act.total_saldo, { code: 'PEN' })}</th>
                                                <td className="text-center bg-white">
                                                    <span className={`badge badge-${act.execute_verify_tecnica ? 'success' : 'danger'} cursor-pointer`}
                                                        onClick={() => {
                                                            setOption("verify_tecnica")
                                                            setCurrentActivity(act)
                                                        }}
                                                    >
                                                        <i className={`fas fa-${act.execute_verify_tecnica ? 'check' : 'times'}`}></i>
                                                    </span>
                                                </td>
                                            </tr>    

                                            <Show condicion={act?.gastos?.length}
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
                                                                    <th>SALDO</th>
                                                                    <th width="5%" colSpan="2">
                                                                        <Show condicion={act.execute_verify_financiera}
                                                                            predeterminado={<span className="badge badge-danger"><i className="fas fa-times"></i></span>}
                                                                        >
                                                                            <span className="badge badge-success cursor-pointer"
                                                                                title="Verificación financiera"
                                                                                onClick={() => {
                                                                                    setOption('verify_financiera')
                                                                                    setCurrentActivity(act)
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-check"></i>
                                                                            </span>
                                                                        </Show>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {act.gastos.map((gas, indexG) => 
                                                                    <ItemExecuteGasto
                                                                        key={`item-preview-gasto-${indexG}`}
                                                                        activity={act}
                                                                        gasto={gas}
                                                                        onUpdate={async () => await getSaldoFinanciero()}
                                                                        onVerifyTecnica={getSaldoFinanciero}
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

        {/* verificación tecnica de activity */}
        <Show condicion={option == 'verify_tecnica'}>
            <ActivityVerify title="Verificación Técnica"
                mode="EXECUTE_TECNICA"
                activity={current_activity}
                onSave={getSaldoFinanciero}
                onClose={() => setOption("")}
            />
        </Show>

        {/* verificación financiera de activity */}
        <Show condicion={option == 'verify_financiera'}>
            <ActivityVerify title="Verificación Financiera"
                mode="EXECUTE_FINANCIERA"
                activity={current_activity}
                onSave={getSaldoFinanciero}
                onClose={() => setOption("")}
            />
        </Show>
    </Fragment>)
}

export default ItemExecutePlanTrabajo;