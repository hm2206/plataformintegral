import React, { useState, useEffect, useContext, Fragment } from 'react';
import { Form, Checkbox, Button } from 'semantic-ui-react';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '../../contexts/AppContext';
import { unujobs } from '../../services/apis'
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import { SelectInfoTypeDescuento } from '../select/cronograma';

const PlaceholderInput = ({ height = "38px" }) => <Skeleton height={height}/>

const PlaceholderConfigs = () => {

    const array = [1, 2, 3, 4];

    return (
        <Fragment>
            {array.map(a => 
                <div className="col-md-12 mb-2" 
                    style={{ 
                        border: "1.5px solid rgba(0, 0, 0, 0.3)", 
                        paddingTop: "0.4em", 
                        paddingBottom: "0.8em", 
                        borderRadius: "0.3em"
                    }} 
                    key={`placeholder-config-${a}`}
                >
                    <div className="row">
                        <div className="col-md-6">
                            <Form.Field>
                                <b className="mb-2"><PlaceholderInput height={"20px"}/></b>
                                <PlaceholderInput/>
                            </Form.Field>
                        </div>
        
                        <div className="col-md-4 col-6">
                            <b className="mb-2"><PlaceholderInput height={"20px"}/></b>
                            <div>
                                <PlaceholderInput/>
                            </div>
                        </div>
                                                                    
                        <div className="col-md-2 col-6">
                            <b className="mb-2"><PlaceholderInput height={"20px"}/></b>
                            <div>
                                <PlaceholderInput/>
                            </div>                      
                        </div>
                    </div>
                </div>     
            )}
        </Fragment>
    )
}

// principal
const UpdateDescuento = ({ info, edit }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [option, setOption] = useState("");
    const [configs, setConfigs] = useState([]);
    const [old, setOld] = useState([]);
    const [form, setForm] = useState({});
    const [reload, setReload] = useState(false);

    // obtener las configuraciones de pago
    const getConfig = async (nextPage = 1, add = false) => {
        setCurrentLoading(true);
        await unujobs.get(`info/${info.id}/type_descuento?page=${nextPage}`)
            .then(async res => {
                let { type_descuentos } = res.data;
                setConfigs(add ? [...configs, ...type_descuentos.data] : type_descuentos.data);
                setOld(JSON.parse(JSON.stringify(add ? [...configs, ...type_descuentos.data] : type_descuentos.data)));
                // validar más peticiones
                if (type_descuentos.last_page >= nextPage + 1) await getConfig(nextPage + 1, true);
            })
            .catch(err => {
                setConfigs([]);
                setOld([]);
            });
        setCurrentLoading(false);
    }

    // cambiar el form
    const handleForm = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }
    
    // cambiar montos
    const handleInput = ({ name, value }, index) => {
        let newConfigs = JSON.parse(JSON.stringify(configs));
        let newObj = newConfigs[index];
        newObj[name] = value;
        newConfigs[index] = newObj;
        setConfigs(newConfigs);
    }
    
    // crear config
    const createConfig = async () => {
        let answer = await Confirm("warning", `¿Deseas asignar el descuento al contrato?`, 'Asignar');
        if (answer) {
            app_context.fireLoading(true);
            let datos = Object.assign({}, form);
            datos.info_id = info.id;
            await unujobs.post(`info_type_descuento`, datos)
                .then(res => {
                    app_context.fireLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                    setReload(true);
                    getConfig();
                }).catch(err => {
                    app_context.fireLoading(false);
                    if (typeof err.response != 'object') throw new Error(err.message);
                    let { message } = err.response.data;
                    Swal.fire({ icon: 'error', text: message }); 
                }).catch(err => {
                    Swal.fire({ icon: 'error', text: err.message });
                });
        }
    }

    // eliminar configuracion de pago
    const deleteConfig = async (id) => {
        let value = await Confirm("warning", "¿Desea elimnar la remuneración?", "Confirmar")
        if (value) {
            app_context.fireLoading(true);
            await unujobs.post(`info/${info.id}/delete_config`, { _method: 'DELETE', config_id: id })
                .then(async res => {
                    app_context.fireLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    await getConfig();
                }).catch(err => {
                    app_context.fireLoading(false);
                    Swal.fire({ icon: 'error', text: err.message });
                });
            }
    }
    
    // actualizar configuraciones de pagos
    const updateConfig = async () => {
        let answer = await Confirm('warning', `¿Deseas actualizar la configuración?`, 'Confirmar');
        if (answer) {
            app_context.fireLoading(true);
            let form = new FormData;
            form.append('configs', JSON.stringify(configs));
            form.append('_method', 'PUT');
            await unujobs.post(`info/${info.id}/config`, form)
                .then(async res => {
                    app_context.fireLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    setEdit(false);
                }).catch(err => {
                    app_context.fireLoading(false);
                    Swal.fire({ icon: 'error', text: err.message })
                })
        }
    }

    // cacelar edición
    useEffect(() => {
        if (!edit) setConfigs(JSON.parse(JSON.stringify(old)))
    }, [edit]);

    // primera carga
    useEffect(() => {
        getConfig();
    }, []);

    // render
    return (
        <Form>
            <div className="card">
                <div className="card-header">
                    <i className="fas fa-cogs"></i> Configurar Descuentos
                </div>

                <div className="card-body">
                    <div className="row mt-4 justify-content-between">
                        <Show condicion={!edit}>
                            <div className="col-md-12 mb-3">
                                <div className="row">
                                    <div className="col-md-5">
                                        <SelectInfoTypeDescuento
                                            info_id={info.id}
                                            value={form.type_descuento_id}
                                            name="type_descuento_id"
                                            refresh={reload}
                                            except={1}
                                            onChange={(e, obj) => handleForm(obj)}
                                        />
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <input type="number" 
                                            placeholder="Ingres un monto"
                                            name="monto"
                                            value={form.monto || ""}
                                            step="any"
                                            onChange={(e) => handleForm(e.target)}
                                            disabled={!form.type_descuento_id || edit}
                                        />
                                    </div>

                                    <div className="col-md-3 mb-2">
                                        <Button color="green" 
                                            basic 
                                            disabled={edit}
                                            disabled={!form.monto || edit}
                                            onClick={createConfig}
                                        >
                                            <i className="fas fa-plus"></i> Agregar Descuento
                                        </Button>
                                    </div>
                                    
                                    <div className="col-md-12 mb-">
                                        <hr/>
                                    </div>
                                </div>
                            </div>
                        </Show>

                        <Show condicion={!current_loading}>
                            {configs.map((obj, index) => 
                                <div className="col-md-6 mb-2" 
                                    key={`config-item-descuento-${obj.id}`}
                                >
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-10 col-9">
                                                <Form.Field>
                                                    <b><span className="text-red">{obj.key}</span>.-<span className="text-primary">{obj.descripcion}</span></b>
                                                    <input type="number"
                                                        name="monto"
                                                        value={obj.monto}
                                                        onChange={(e) => handleInput(e.target, index)}
                                                        disabled={current_loading || !edit}
                                                        step="any"
                                                    />
                                                </Form.Field>
                                            </div>
                                                                        
                                            <div className="col-md-2 col-3">
                                                <b>Opción</b>
                                                <Button fluid
                                                    color="red"
                                                    disabled={!edit}
                                                    basic
                                                    onClick={(e) => deleteConfig(obj.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </Button>
                                            </div>

                                            <div className="col-md-12">
                                                <hr/>
                                            </div>
                                        </div>
                                    </div>
                                </div>    
                            )}
                        </Show>

                        <Show condicion={current_loading}>
                            <PlaceholderConfigs/>
                        </Show>
                    </div>
                </div>
            </div>
        </Form>
    )
}

export default UpdateDescuento;