import React, { useState, useEffect, useContext, Fragment } from 'react';
import { Form, Checkbox, Button } from 'semantic-ui-react';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '../../contexts/AppContext';
import { unujobs } from '../../services/apis'
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import { SelectInfoTypeAportacion } from '../select/cronograma';

const PlaceholderInput = ({ height = "38px" }) => <Skeleton height={height}/>

const PlaceholderConfigs = () => {

    const array = [1, 2, 3, 4, 5, 6];

    return (
        <Fragment>
            {array.map(a => 
                <div className="col-md-4 mb-2" key={`placeholder-config-type_aportacion-${a}`}>
                    <div className="row">
                        <div className="col-md-10">
                                <PlaceholderInput/>
                        </div>
        
                        <div className="col-md-2">
                            <PlaceholderInput/>
                        </div>
                    </div>
                </div>     
            )}
        </Fragment>
    )
}

// principal
const UpdateAportacion = ({ info, edit }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [form, setForm] = useState({});
    const [configs, setConfigs] = useState([]);
    const [old, setOld] = useState([]);
    const [reload, setReload] = useState(false);

    // obtener las configuraciones de pago
    const getConfig = async (nextPage = 1, add = false) => {
        setCurrentLoading(true);
        // realizar petición
        await unujobs.get(`info/${info.id}/type_aportacion?page=${nextPage}`)
            .then(async res => {
                let { type_aportaciones } = res.data;
                setConfigs(add ? [...configs, ...type_aportaciones.data] : type_aportaciones.data);
                setOld(JSON.parse(JSON.stringify(add ? [...configs, ...type_aportaciones.data] : type_aportaciones.data)));
                // siguiente página
                if (type_aportaciones.last_page >= nextPage + 1) await getConfig(nextPage + 1, true);
            })
            .catch(err => {
                console.log(err);
                setConfigs([]);
                setOld([]);
            });
        setCurrentLoading(false);
    }
    
    // cambiar montos
    const handleInput = ({ name, value }, index) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // crear tipo de remuneración
    const assignTypeAportacion = async () => {
        let answer = await Confirm("warning", `¿Deseas asignar la aportación?`, "Asignar");
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = Object.assign({}, form);
            datos.info_id = info.id;
            await unujobs.post(`info_type_aportacion`, datos)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                    setReload(true);
                    getConfig();
                }).catch(err => {
                    app_context.setCurrentLoading(false);
                    let { message, errors } = err.response.data;
                    if (typeof errors == 'object') Swal.fire({ icon: 'warning', text: message });
                    else Swal.fire({ icon: 'error', text: message });
                });
        }
    }
    
    // eliminar configuracion de pago
    const deleteConfig = async (id) => {    
        let value = await Confirm("warning", "¿Desea eliminar la aportación?", "Confirmar")
        if (value) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`info_type_aportacion/${id}`, { _method: 'DELETE' })
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    await getConfig();
                }).catch(err => {
                    app_context.setCurrentLoading(false);
                    Swal.fire({ icon: 'error', text: err.message });
                });
            }
    }

    // cacelar edición
    useEffect(() => {
        if (!edit) setConfigs(JSON.parse(JSON.stringify(old)))
    }, [edit]);

    // primera carga
    useEffect(() => {
        if (info.id) getConfig();
    }, []);

    // render
    return (
        <Form>
            <div className="card">
                <div className="card-header">
                    <i className="fas fa-cogs"></i> Configurar Aporte Empleador
                </div>

                <div className="card-body">
                    <div className="row mt-4 justify-content-between">
                        <Show condicion={info.estado && !edit}>
                            <div className="col-md-12 mb-3">
                                <div className="row">
                                    <div className="col-md-4 mb-2">
                                        <SelectInfoTypeAportacion
                                            refresh={reload}
                                            info_id={info.id}
                                            name="type_aportacion_id"
                                            value={form.type_aportacion_id}
                                            except={1}
                                            onChange={(e, obj) => handleInput(obj)}
                                            onReady={(e) => setReload(false)}
                                            disabled={edit}
                                        />
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Button color="green" 
                                            basic 
                                            onClick={assignTypeAportacion}
                                            disabled={edit || !form.type_aportacion_id}
                                        >
                                            <i className="fas fa-plus"></i> Agregar Aportación
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <hr/>
                            </div>
                        </Show>

                        <div className="col-md-12">
                            <div className="row">
                                {configs.map((c, indexC) => 
                                        <div className="col-md-4" key={`index-aportacion-${indexC}`}>
                                            <div className="card">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-10">
                                                            {c.descripcion} <small className="badge badge-xs badge-dark">{c.porcentaje}%</small>
                                                        </div>
                                                        <div className="col-md-2 text-right">
                                                            <Button color="red"
                                                                size="mini"
                                                                onClick={(e) => deleteConfig(c.id)}
                                                                disabled={current_loading || !edit}
                                                                basic
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
                    </div>
                </div>
            </div>
        </Form>
    )
}

export default UpdateAportacion;