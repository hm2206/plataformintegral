import React, { useState, useEffect, useContext, Fragment } from 'react';
import { Form, Button } from 'semantic-ui-react';
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
                <div className="col-md-6 mb-2" key={`placeholder-config-descuento-${a}`}>
                    <div className="row">
                        <div className="col-md-10">
                            <PlaceholderInput/>
                        </div>                                        
                        <div className="col-md-2 ">
                            <PlaceholderInput/>          
                        </div>
                    </div>
                </div>     
            )}
        </Fragment>
    )
}


// principal
const UpdateDescuento = ({ info, edit, onUpdate }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_update, setIsUpdate] = useState(false);
    const [configs, setConfigs] = useState([]);
    const [current_page, setCurrentPage] = useState(1)
    const [old, setOld] = useState([]);
    const [form, setForm] = useState({});
    const [reload, setReload] = useState(false);

    // obtener las configuraciones de pago
    const getConfig = async (add = false) => {
        setCurrentLoading(true);
        await unujobs.get(`info/${info.id}/type_descuento?page=${current_page}`)
        .then(async res => {
            let { type_descuentos } = res.data;
            let payload = add ? [...configs, ...type_descuentos.data] : type_descuentos.data;
            // setting datos
            setConfigs(payload);
            setIsUpdate(false);
            setOld(JSON.parse(JSON.stringify(payload)));
            if (type_descuentos.last_page >= type_descuentos.current_page + 1) setCurrentPage(type_descuentos.current_page + 1);
        }).catch(err => console.log(err));
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
        newObj.edit = true;
        newConfigs[index] = newObj;
        setConfigs(newConfigs);
    }
    
    // crear config
    const createConfig = async () => {
        let answer = await Confirm("warning", `¿Deseas asignar el descuento al contrato?`, 'Asignar');
        if (!answer) return false; 
        app_context.setCurrentLoading(true);
        let datos = Object.assign({}, form);
        datos.info_id = info.id;
        await unujobs.post(`info_type_descuento`, datos)
        .then(res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setForm({});
            setReload(true);
            setCurrentPage(1);
            setIsUpdate(true);
        }).catch(err => {
            app_context.setCurrentLoading(false);
            if (typeof err.response != 'object') throw new Error(err.message);
            let { message } = err.response.data;
            Swal.fire({ icon: 'error', text: message }); 
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
        });
        setReload(false);
    }

    // eliminar configuracion de pago
    const deleteConfig = async (id, index) => {
        let value = await Confirm("warning", "¿Desea elimnar el descuento?", "Eliminar")
        if (!value) return false;
        app_context.setCurrentLoading(true);
        await unujobs.post(`info_type_descuento/${id}`, { _method: 'DELETE' })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            let newConfig = JSON.parse(JSON.stringify(configs));
            newConfig.splice(index, 1);
            setConfigs(newConfig);
            setOld(newConfig);
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: err.message });
        });
    }
    
    // actualizar configuraciones de pagos
    const updateConfig = async () => {
        let answer = await Confirm('warning', `¿Deseas actualizar la configuración?`, 'Confirmar');
        if (answer) {
            app_context.setCurrentLoading(true);
            let form = new FormData;
            let datos = await configs.filter(c => c.edit);
            form.append('configs', JSON.stringify(datos));
            form.append('_method', 'PUT');
            await unujobs.post(`info_type_descuento/${info.id}/update_all`, form)
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    setOld(configs);
                    if (typeof onUpdate == 'function') onUpdate();
                }).catch(err => {
                    app_context.setCurrentLoading(false);
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

    // next page
    useEffect(() => {
        if (current_page > 1) getConfig(true)
    }, [current_page]);

    // cargar actualizado
    useEffect(() => {
        if (is_update) getConfig();
    }, [is_update]);

    // render
    return (
        <Form>
            <div className="card-">
                <div className="card-header">
                    <i className="fas fa-cogs"></i> Configurar Descuentos
                </div>

                <div className="card-body">
                    <div className="row mt-4 justify-content-between">
                        <Show condicion={info.estado && !edit}>
                            <div className="col-md-12 mb-3">
                                <div className="row">
                                    <div className="col-md-5">
                                        <SelectInfoTypeDescuento
                                            info_id={info.id}
                                            value={form.type_descuento_id}
                                            name="type_descuento_id"
                                            refresh={reload}
                                            except={true}
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

                        {configs.map((obj, index) => 
                                <div className="col-md-6 mb-2" 
                                    key={`config-item-descuento-${index}`}
                                >
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-10 col-9">
                                                    <Form.Field>
                                                        <b>
                                                            <span className={obj.monto > 0 ? 'text-red' : ''}>{obj.key}</span>.-
                                                            <span className={obj.monto > 0 ? 'text-primary' : ''}>{obj.descripcion}</span>
                                                        </b>
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
                                                        disabled={!edit || obj._loading}
                                                        basic
                                                        loading={obj._loading}
                                                        onClick={(e) => deleteConfig(obj.id, index)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>    
                        )}

                        <Show condicion={current_loading}>
                            <PlaceholderConfigs/>
                        </Show>

                        <Show condicion={!configs.length && !current_loading}>
                            <div className="col-md-12">
                                <div className="text-center mt-4 mb-4">
                                    <b className="text-muted">No hay registros disponibles</b>
                                </div>
                            </div>
                        </Show>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="card-body text-right">
                        <Button disabled={!edit || current_loading}
                            color="teal"
                            onClick={updateConfig}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </div>
            </div>
        </Form>
    )
}

export default UpdateDescuento;