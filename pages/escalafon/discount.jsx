import React, { useContext, useEffect, useState } from 'react';
import { AUTHENTICATE } from '../../services/auth';
import BoardSimple from '../../components/boardSimple';
import Show from '../../components/show';
import { Message, Form, Select, Button } from 'semantic-ui-react';
import { EntityContext } from '../../contexts/EntityContext';
import { SelectTypeCategoria, SelectCargo } from '../../components/select/cronograma'
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import { AppContext } from '../../contexts/AppContext';
import { DiscountProvider, DiscountContext } from '../../contexts/escalafon/DiscountContext'
import { discountTypes } from '../../contexts/escalafon/DiscountReducer'
import ListDiscount from '../../components/escalafon/discount/listDiscount'
import DiscountProviderRequest from '../../providers/escalafon/DiscountProvider';

const discountProviderRequest = new DiscountProviderRequest

const WrapperDiscount = () => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const { entity_id, fireEntity } = useContext(EntityContext);

    // discount
    const { year, month, cargo_id, type_categoria_id, dispatch, defaultRefresh, current_loading } = useContext(DiscountContext)

    const handleOption = async (e, index, obj) => {
        switch (obj.key) {
            case 'generate-discount':
                await generateDiscount();
            default:
                return;
        }
    }

    const generateDiscount = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en generar el descuento?`);
        if (!answer) return;
        app_context.setCurrentLoading(true);
        discountProviderRequest.process(year, month)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            defaultRefresh();
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'warning', text: err.message });
        });
    }

    useEffect(() => {
        fireEntity({ render: true })
        return () => fireEntity({ render: false })
    }, []);

    return (
        <BoardSimple
            title="Descuentos"
            info={["Control de descuentos de faltas y tardanzas"]}
            bg="danger"
            onOption={handleOption}
            options={[
                { key: "generate-discount", icon: "fas fa-download", title: "Generar descuentos" }
            ]}
        >
            <div className="card-body">
                <Show condicion={entity_id}
                    predeterminado={
                        <div className="mt-4">
                            <Message color="yellow">
                                Porfavor seleccione una Entidad
                            </Message>
                        </div>
                    }
                >
                    <div className="card" style={{ minHeight: '400px' }}>
                        <Form className="card-header">
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <i className="fas fa-clock"></i> Fecha de Búsqueda
                                </div>

                                <div className="col-md-2 col-6 mb-2">
                                    <input type="number"
                                        step="any"
                                        placeholder="Año"
                                        onChange={({ target }) => dispatch({ type: discountTypes.SET_YEAR, payload: target.value })}
                                        value={year || ""}
                                        disabled={current_loading}
                                    />
                                </div>

                                <div className="col-6 col-md-2 mb-2">
                                    <Select
                                        placeholder="Seleccionar Mes"
                                        value={month || ""}
                                        onChange={(e, obj) => dispatch({ type: discountTypes.SET_MONTH, payload: obj.value })}
                                        options={[
                                            { key: "Ene", value: 1, text: "Enero" },
                                            { key: "Feb", value: 2, text: "Febrero" },
                                            { key: "Mar", value: 3, text: "Marzo" },
                                            { key: "Abr", value: 4, text: "Abril" },
                                            { key: "May", value: 5, text: "Mayo" },
                                            { key: "Jun", value: 6, text: "Junio" },
                                            { key: "Jul", value: 7, text: "Julio" },
                                            { key: "Ago", value: 8, text: "Agosto" },
                                            { key: "Sep", value: 9, text: "Septiembre" },
                                            { key: "Oct", value: 10, text: "Octubre" },
                                            { key: "Nov", value: 11, text: "Noviembre" },
                                            { key: "Dic", value: 12, text: "Diciembre" }
                                        ]}
                                    />
                                </div>

                                <div className="col-md-3 col-6 mb-2">
                                    <SelectCargo
                                        disabled={current_loading}
                                        value={cargo_id}
                                        onChange={(e, obj) => dispatch({ type: discountTypes.SET_CARGO_ID, payload: obj.value })}
                                    />
                                </div>

                                <div className="col-md-3 col-6 mb-2">
                                    <SelectTypeCategoria
                                        disabled={current_loading}
                                        value={type_categoria_id}
                                        onChange={(e, obj) => dispatch({ type: discountTypes.SET_TYPE_CATEGORIA_ID, payload: obj.value })}
                                    />
                                </div>

                                <div className="col-2">
                                    <Button color="blue"
                                        fluid
                                        disabled={current_loading}
                                        onClick={defaultRefresh}
                                    >
                                        <i className="fas fa-search"></i>
                                    </Button>
                                </div>
                            </div>
                        </Form>
                           
                        {/* listado de discount */}
                        <ListDiscount/>
                        
                    </div>
                </Show>
            </div>
        </BoardSimple>
    )
}

const Discount = ({ pathname, query }) => {

    // render
    return (
        <div className="col-12">
            <DiscountProvider>
                <WrapperDiscount/>
            </DiscountProvider>
        </div>
    );
}

// server
Discount.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    return { query, pathname }
}


// exportar
export default Discount;