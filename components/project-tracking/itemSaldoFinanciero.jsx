import React, { useState } from 'react';
import currencyFormatter from 'currency-formatter';
import { Button } from 'semantic-ui-react';
import Show from '../show';
import { Confirm } from '../../services/utils';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import VerifyFinanciera from './verifyFinanciera';
import Swal from 'sweetalert2';

const ItemSaldoFinanciero = ({ activity, gasto, execute, onVerifyTecnica = null, onVerifyFinanciera = null }) => {

    // estados
    const [is_detalle, setIsDetalle] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);

    const handleVerifyTecnica = async () => {
        let answer = await Confirm('info', '¿Deseas realizar la verificación técnica?', 'Verificar');
        if (!answer) return false;
        setCurrentLoading(true);
        await projectTracking.post(`gasto/${gasto.id}/verify_tecnica?_method=PUT`)
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
 
    // render
    return (
        <tr>
            <th className="bg-white">{gasto?.description}</th>
            <th className="bg-white text-center">{gasto?.ext_pptto}</th>
            <th className="bg-white text-center">{gasto?.medida}</th>
            <th className="bg-white text-right">{currencyFormatter.format(gasto?.monto, { code: 'PEN' })}</th>
            <th className="bg-white text-center">{gasto?.cantidad}</th>
            <th className={`bg-white text-right ${execute && gasto?.total < gasto?.ejecutado ? 'text-red' : ''} ${execute && gasto?.total == gasto?.ejecutado ? 'text-success' : ''}`}>
                {currencyFormatter.format(gasto?.total, { code: 'PEN' })}
            </th>
            <Show condicion={execute}>
                <th className="bg-white text-right">{currencyFormatter.format(gasto?.ejecutado, { code: 'PEN' })}</th>
                <th className="bg-white">
                    <div className="text-center">
                            <Show condicion={gasto?.verify_tecnica}
                                predeterminado={
                                    <Button color="black"
                                        basic
                                        size="mini"
                                        icon="check"
                                        onClick={handleVerifyTecnica}
                                    />
                                }
                            >
                                <Button icon="check"
                                    size="mini"
                                    color="green"
                                />
                            </Show>
                    </div>
                </th>
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