import React, { useState, useEffect, useContext, Fragment } from 'react';
import { Form, Checkbox, Button } from 'semantic-ui-react';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '../../contexts/AppContext';
import { unujobs } from '../../services/apis'
import CreateConfigRemuneracion from './createConfigRemuneracion';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

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
const UpdateRemuneracion = ({ info, edit, send }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [option, setOption] = useState("");
    const [configs, setConfigs] = useState([]);
    const [old, setOld] = useState([]);

    // obtener las configuraciones de pago
    const getConfig = async () => {
        setCurrentLoading(true);
        await unujobs.get(`info/${info.id}/config`)
            .then(res => {
                setConfigs(res.data);
                setOld(JSON.parse(JSON.stringify(res.data)));
            })
            .catch(err => {
                setConfigs([]);
                setOld([]);
            });
        setCurrentLoading(false);
    }
    
    // cambiar montos
    const handleInput = ({ name, value }, index) => {
        let newConfigs = JSON.parse(JSON.stringify(configs));
        let newObj = newConfigs[index];
        newObj[name] = value;
        newConfigs[index] = newObj;
        setConfigs(newConfigs);
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

    // actualizar
    useEffect(() => {
        if (send) updateConfig();
    }, [send]);

    // render
    return (
        <Form>
            <div className="row mt-4 justify-content-between">

                <div className="col-md-12 mb-3">
                    <Button color="green" 
                        basic 
                        onClick={(e) => setOption("create")}
                        disabled={edit}
                    >
                        <i className="fas fa-plus"></i> Agregar Remuneración
                    </Button>
                </div>

                <Show condicion={!current_loading}>
                    {configs.map((obj, index) => 
                        <div className="col-md-12 mb-2" 
                            style={{ 
                                border: "1.5px solid rgba(0, 0, 0, 0.3)", 
                                paddingTop: "0.4em", 
                                paddingBottom: "0.8em", 
                                borderRadius: "0.3em"
                            }} 
                            key={`config-item-${obj.id}`}
                        >
                            <div className="row">
                                <div className="col-md-6">
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

                                <div className="col-md-4 col-6">
                                    <b>Base imponible</b>
                                    <div>
                                        <Checkbox
                                            toggle
                                            name="base"
                                            disabled={current_loading || !edit}
                                            checked={obj.base == 0 ? true : false}
                                            onChange={(e, o) => handleInput({ name: o.name, value: o.checked ? 0 : 1 }, index)}
                                        />
                                    </div>
                                </div>
                                                            
                                <div className="col-md-2 col-6">
                                    <b>Opción</b>
                                    <Button fluid
                                        color="red"
                                        disabled={!edit}
                                        onClick={(e) => deleteConfig(obj.id)}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </div>
                            </div>
                        </div>    
                    )}
                </Show>

                <Show condicion={current_loading}>
                    <PlaceholderConfigs/>
                </Show>
            </div>

            <Show condicion={option == 'create'}>
                <CreateConfigRemuneracion
                    info={info}
                    isClose={(e) => setOption("")}
                    onCreate={(e) => getConfig()}
                />
            </Show>
        </Form>
    )
}

export default UpdateRemuneracion;