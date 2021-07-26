import React, { useEffect, useState, useMemo } from 'react';
import currencyFormatter from 'currency-formatter';
import { Button, Input } from 'semantic-ui-react';
import Show from '../show';
import { Confirm } from '../../services/utils';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import VerifyFinanciera from './verifyFinanciera';
import Swal from 'sweetalert2';
import { SelectPresupuesto, SelectMedida } from '../select/project_tracking';

const ItemSaldoFinanciero = ({ activity, block, gasto, execute, onVerifyTecnica = null, onVerifyFinanciera = null, viewer = [], onBlock = null, onUpdate = null }) => {

    const verifies = {
        tecnica: 'tecnica', 
        financiera: 'financiera'
    }

    // estados
    const [current_gasto, setCurrentGasto] = useState({});
    const [is_detalle, setIsDetalle] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);
    const [edit, setEdit] = useState(false);

    const displayMonto = useMemo(() => {
        return currencyFormatter.format(gasto?.monto, { code: 'PEN' });
    }, [gasto.monto]);

    const displayTotal = useMemo(() => {
        return currencyFormatter.format(gasto?.total, { code: 'PEN' })
    }, [gasto.total]);

    const displayEjecutado = useMemo(() => {
        return currencyFormatter.format(gasto?.ejecutado, { code: 'PEN' })
    }, [gasto.ejecutado]);

    const handleVerifyTecnica = async () => {
        let answer = await Confirm('info', '¿Deseas realizar la verificación técnica?', 'Verificar');
        if (!answer) return false;
        setCurrentLoading(true);
        await projectTracking.post(`gasto/${gasto.id}/verify_tecnica?_method=PUT&verify=${gasto.verify_tecnica ? 0 : 1}`)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            if (typeof onVerifyTecnica == 'function') onVerifyTecnica(gasto);
        }).catch(err => handleErrorRequest(err));
        setCurrentLoading(false);
    }

    const handleVerifyFinanciera = async () => {
        if (typeof onVerifyFinanciera == 'function') onVerifyFinanciera(gasto);
    }

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, current_gasto)
        newForm[name] = value
        setCurrentGasto(newForm)
    }

    const handleUpdate = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en actualizar el gasto?')
        if (!answer) return false;
        setCurrentLoading(true);
        await projectTracking.post(`gasto/${gasto.id}?_method=PUT&log=1`, current_gasto)
        .then(async res => {
            await Swal.fire({ icon: 'success', text: "El cambios se guardarón correctamente!" });
            if (typeof onUpdate == 'function') await onUpdate();
            setEdit(false);
        }).catch(err => handleErrorRequest(err, null));
        setCurrentLoading(false);
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
            <th className={`bg-white text-right ${execute && gasto?.total < gasto?.ejecutado ? 'text-red' : ''} ${execute && gasto?.total == gasto?.ejecutado ? 'text-success' : ''}`}
                width="200px"
            >
                {displayTotal}
            </th>
            <th className="bg-white text-right" width="200px">{displayEjecutado}</th>
            {/* verificación técnica */}
            <Show condicion={viewer.includes(verifies.tecnica)}>
                <th className="bg-white">
                    <div className="text-center">
                            <Show condicion={!gasto?.verify_tecnica}
                                predeterminado={
                                    <Button icon="check"
                                        size="mini"
                                        color="green"
                                        onClick={handleVerifyTecnica}
                                        disabled={gasto.verify_financiera}
                                    />
                                }
                            >
                                <Show condicion={!current_loading}
                                    predeterminado={
                                        <Button loading={current_loading}/>
                                    }
                                >
                                    <Show condicion={!edit}>
                                        <Button color="green"
                                            basic
                                            size="mini"
                                            disabled={block}
                                            icon="check"
                                            onClick={handleVerifyTecnica}
                                        />

                                        <Button color="black"
                                            basic
                                            size="mini"
                                            disabled={block}
                                            icon="edit"
                                            onClick={() => setEdit(true)}
                                        />
                                    </Show>

                                    <Show condicion={edit}>
                                        <Button color="blue"
                                            basic
                                            size="mini"
                                            icon="save"
                                            onClick={handleUpdate}
                                        />

                                        <Button color="red"
                                            basic
                                            size="mini"
                                            icon="cancel"
                                            onClick={() => setEdit(false)}
                                        />
                                    </Show>
                                </Show>
                            </Show>
                    </div>
                </th>
            </Show>
            {/* verificación financiera */}
            <Show condicion={viewer.includes(verifies.financiera)}>
                <th className="bg-white">
                    <div className="text-center">
                            <Show condicion={gasto?.verify_financiera}
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
                            onVerifycationFinanciera={handleVerifyFinanciera}
                        />
                    </Show>
                </th>
            </Show>
        </tr>
    )
}

export default ItemSaldoFinanciero;