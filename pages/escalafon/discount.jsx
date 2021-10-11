import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AUTHENTICATE } from '../../services/auth';
import BoardSimple from '../../components/boardSimple';
import Show from '../../components/show';
import { Message, Form, Button } from 'semantic-ui-react';
import { EntityContext } from '../../contexts/EntityContext';
import { SelectTypeCategoria, SelectCargo } from '../../components/select/cronograma'
import { SelectConfigDiscount } from '../../components/select/escalafon'
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import { BtnFloat } from '../../components/Utils'
import { AppContext } from '../../contexts/AppContext';
import { DiscountProvider, DiscountContext } from '../../contexts/escalafon/DiscountContext'
import { discountTypes } from '../../contexts/escalafon/DiscountReducer'
import ListDiscount from '../../components/escalafon/discount/listDiscount'
import ConfigDiscountProvider from '../../providers/escalafon/ConfigDiscountProvider';
import CreateConfigDiscount from '../../components/escalafon/config_discounts/createConfigDiscount'
import moment from 'moment';
import uid from 'uid';

const configDiscountProvider = new ConfigDiscountProvider

const headOptions = [
    { key: "generate-discount", icon: "fas fa-download", title: "Generar descuentos" },
    { key: "export-discount", icon: "fas fa-file-excel", title: "Exportar Descuentos" },
]

const WrapperDiscount = () => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const { entity_id, fireEntity } = useContext(EntityContext);

    // discount
    const { year, config_discount, dispatch, cargo_id, type_categoria_id, defaultRefresh, setCurrentLoading, current_loading } = useContext(DiscountContext)

    // estados
    const [option, setOption] = useState("")
    const [loading, setLoading] = useState(false);
    const [is_refresh, setIsRefresh] = useState(false);
    

    const handleOption = async (e, index, obj) => {
        switch (obj.key) {
            case 'generate-discount':
                await generateDiscount();
            case 'export-discount':
                await exportDiscount();
            default:
                return;
        }
    }

    const generateDiscount = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en generar el descuento?`);
        if (!answer) return;
        app_context.setCurrentLoading(true);
        await configDiscountProvider.process_discounts(config_discount?.id)
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

    const exportDiscount = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en exportar los descuento?`);
        if (!answer) return;
        app_context.setCurrentLoading(true);
        await configDiscountProvider.discounts(config_discount?.id, { type: 'excel' }, { responseType: 'blob' })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let a = document.createElement('a');
            a.href = URL.createObjectURL(res.data);
            a.target = '_blank';
            a.click();
        }).catch(() => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'warning', text: "No se pudó exportar los descuentos" });
        });
    }

    const handleDefaultYear = () => {
        let payload = moment().year();
        dispatch({ type: discountTypes.SET_YEAR, payload });
    }

    const handleConfigDiscount = (e, { value, options = [] }) => {
        let current_config = options.find(o => o.value == value);
        let payload = current_config?.obj || {}
        dispatch({ type: discountTypes.SET_CONFIG_DISCOUNT, payload })
    }

    const handleVerified = async () => {
        let answer = await Confirm("warning", "¿Estás seguro en verificar los descuentos?", "Verificar");
        if (!answer) return;
        app_context.setCurrentLoading(true);
        await configDiscountProvider.verified(config_discount?.id)
        .then(() => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'success', text: 'Los descuentos se verificarón correctamente!' })
            let payload = Object.assign(config_discount, { status: 'VERIFIED' });
            dispatch({ type: discountTypes.SET_CONFIG_DISCOUNT, payload })
        }).catch(() => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: 'No se pudó verificar los descuentos' })
        })
    }

    const handleAccepted = async () => {
        let answer = await Confirm("warning", "¿Estás seguro en aceptar los descuentos?", "Verificar");
        if (!answer) return;
        app_context.setCurrentLoading(true);
        await configDiscountProvider.accepted(config_discount?.id)
        .then(() => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'success', text: 'Los descuentos se aceptarón correctamente!' })
            let payload = Object.assign(config_discount, { status: 'ACCEPTED' });
            dispatch({ type: discountTypes.SET_CONFIG_DISCOUNT, payload })
        }).catch(() => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: 'No se pudó aceptar los descuentos' })
        })
    }

    const btnStatus = {
        START: {
            theme: "btn-warning",
            icon: "fas fa-check",
            title: "Verificar Descuentos",  
            handle: handleVerified
        },
        VERIFIED: {
            theme: "btn-primary",
            icon: "fas fa-clipboard-check",
            title: "Aceptar Descuentos",
            handle: handleAccepted
        }
    }

    // memos
    const currentBtn = useMemo(() => {
        let btn = btnStatus[config_discount?.status];
        return btn || {}
    }, [config_discount?.status])
    
    const reloadConfig = useMemo(() => {
        return uid(4);
    }, [year, is_refresh]);

    const onSave = (data) => {
        setOption("");
        setIsRefresh(true)
        dispatch({ type: discountTypes.SET_CONFIG_DISCOUNT, payload: data });
    }

    const findConfigDiscount = async () => {
        setLoading(true)
        await configDiscountProvider.show(config_discount?.id) 
        .then(({ data }) => dispatch({ type: discountTypes.SET_CONFIG_DISCOUNT, payload: data?.config_discount || {} }))
        .catch((err) => console.log(err.message))
        setLoading(false)
    }

    useEffect(() => {
        fireEntity({ render: true })
        return () => fireEntity({ render: false })
    }, []);

    useEffect(() => {
        if (config_discount?.id) findConfigDiscount();
    }, [config_discount?.id]);

    useEffect(() => {
        handleDefaultYear();
    }, []);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    return (
        <BoardSimple
            title="Descuentos"
            info={["Control de descuentos de faltas y tardanzas"]}
            bg="danger"
            onOption={handleOption}
            options={config_discount?.id ? headOptions : []}
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
                                    <SelectConfigDiscount year={year}
                                        refresh={reloadConfig}
                                        name="config_discount_id"
                                        value={config_discount?.id}
                                        onChange={handleConfigDiscount}
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
                                        disabled={current_loading || !config_discount?.id}
                                        onClick={defaultRefresh}
                                    >
                                        <i className="fas fa-search"></i>
                                    </Button>
                                </div>
                            </div>
                        </Form>
                           
                        {/* listado de discount */}
                        <Show condicion={config_discount?.id}
                            predeterminado={
                                <div className="pl-2 pr-2 pt-2">
                                    <Message warning>
                                        Seleccionar Configuración de descuento
                                    </Message>
                                </div>
                            }
                        >
                            <ListDiscount/>
                        </Show>

                        {/* buttons de status */}
                        <Show condicion={config_discount?.id && currentBtn?.icon}>
                            <BtnFloat theme={currentBtn?.theme} 
                                loading={current_loading}
                                onClick={currentBtn?.handle || null}>
                                <i className={currentBtn?.icon}></i>
                            </BtnFloat>
                        </Show>

                        {/* crear configuración */}
                        <Show condicion={!config_discount?.id}>
                            <BtnFloat loading={current_loading}
                                 onClick={() => setOption('create_config')}
                            >
                                <i className="fas fa-plus"></i>
                            </BtnFloat>
                            <CreateConfigDiscount show={option == 'create_config'}
                                onClose={() => setOption("")}
                                onSave={onSave}
                            />
                        </Show>
                        
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