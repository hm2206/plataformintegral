import React, { useEffect, useState, useMemo } from 'react';
import currencyFormatter from 'currency-formatter';
import { Button, Input } from 'semantic-ui-react';
import Show from '../../../show';
import { Confirm } from '../../../../services/utils';
import { handleErrorRequest, projectTracking } from '../../../../services/apis';
import Swal from 'sweetalert2';
import { SelectPresupuesto, SelectMedida } from '../../../select/project_tracking';
import VerifyFinanciera from './verifyFinanciera'

const ItemExecuteGasto = ({ activity, block, gasto, onVerifyTecnica = null, onBlock = null, onUpdate = null }) => {

    // estados
    const [current_gasto, setCurrentGasto] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const [is_detalle, setIsDetalle] = useState(false);

    const displayMonto = useMemo(() => {
        return currencyFormatter.format(gasto?.monto, { code: 'PEN' });
    }, [gasto.monto]);

    const displayTotal = useMemo(() => {
        return currencyFormatter.format(gasto?.total, { code: 'PEN' })
    }, [gasto.total]);

    const displayExecutado = useMemo(() => {
        return currencyFormatter.format(gasto?.ejecutado, { code: 'PEN' })
    }, [gasto.total]);

    const displaySaldo = useMemo(() => {
        return currencyFormatter.format(gasto?.saldo, { code: 'PEN' })
    }, [gasto.total]);

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, current_gasto)
        newForm[name] = value
        setCurrentGasto(newForm)
    }

    useEffect(() => {
        if (!edit) setCurrentGasto(Object.assign({}, gasto))
    }, [edit])
 
    useEffect(() => {
        if (typeof onBlock == 'function') onBlock(edit); 
    }, [edit])

    // render
    return (
        <tr>
            <th className="bg-white">
                <Show condicion={edit} predeterminado={gasto?.description}>
                    <Input type="text" 
                        fluid
                        name="description"
                        value={current_gasto?.description}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </Show>
            </th>
            <th className="bg-white text-center" width="200px">
                <Show condicion={edit} predeterminado={gasto?.ext_pptto}>
                    <SelectPresupuesto
                        name="presupuesto_id"
                        value={current_gasto?.presupuesto_id}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </Show>
            </th>
            <th className="bg-white text-center" width="200px">
                <Show condicion={edit} predeterminado={gasto?.medida}>
                    <SelectMedida
                        execute
                        name="medida_id"
                        value={current_gasto?.medida_id}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </Show>
            </th>
            <th className="bg-white text-right" width="200px">
                <Show condicion={edit} 
                    predeterminado={displayMonto}
                >
                    <Input type="number"
                        step="any" 
                        fluid
                        name="monto"
                        value={current_gasto?.monto}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </Show>
            </th>
            <th className="bg-white text-center" width="200px">
                <Show condicion={edit} predeterminado={gasto?.cantidad}>
                    <Input type="number"
                        fluid
                        name="cantidad"
                        value={current_gasto?.cantidad}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </Show>
            </th>
            <th className={`bg-white text-right`}
                width="200px"
            >
                {displayTotal}
            </th>
            <th className={`bg-white text-right`}
                width="200px"
            >
                {displayExecutado}
            </th>
            <th className={`bg-white text-right`}
                width="200px"
            >
                {displaySaldo}
            </th>
            {/* verificación técnica */}
            <Show condicion={activity.execute_verify_tecnica}>
                <th className="bg-white">
                    <div className="text-center">
                            <Show condicion={gasto?.execute_verify}
                                predeterminado={
                                    <Button color="black"
                                        basic
                                        size="mini"
                                        icon="check"
                                        onClick={() => setIsDetalle(true)}      
                                    />
                                }
                            >
                                <Button icon="search"
                                    size="mini"
                                    color="green"
                                    onClick={() => setIsDetalle(true)}  
                                />
                            </Show>
                    </div>
                    {/* modals */}
                    <Show condicion={is_detalle}>
                        <VerifyFinanciera
                            gasto={gasto}
                            isClose={() => setIsDetalle(false)}
                            onVerifycationFinanciera={onVerifyTecnica}
                        />
                    </Show>
                </th>
            </Show>
        </tr>
    )
}

export default ItemExecuteGasto;