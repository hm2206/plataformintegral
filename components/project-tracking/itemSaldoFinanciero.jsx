import React, { useState } from 'react';
import currencyFormatter from 'currency-formatter';
import { Button } from 'semantic-ui-react';
import Show from '../show';
import AddDetalle from './addDetalle';
import ListDetalle from './listDetalle';

const ItemSaldoFinanciero = ({ activity, gasto, execute }) => {

    // estados
    const [option, setOption] = useState("");

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
                            <Show condicion={gasto?.verify_tecnica}
                                predeterminado={
                                    <Button color="black"
                                        basic
                                        size="mini"
                                        icon="check"
                                    />
                                }
                            >
                                <Button icon="search"
                                    size="mini"
                                    color="green"
                                />
                            </Show>
                    </div>
                    {/* modals */}
                    <Show condicion={option == 'add_detalle'}>
                        <AddDetalle
                            gasto={gasto}
                            isClose={() => setOption("")}
                            // onCreate={onUpdateGasto}
                        />
                    </Show>

                    <Show condicion={option == 'list_detalle'}>
                        <ListDetalle
                            gasto={gasto}
                            isClose={() => setOption("")}
                        />
                    </Show>
                </th>
            </Show>
        </tr>
    )
}

export default ItemSaldoFinanciero;