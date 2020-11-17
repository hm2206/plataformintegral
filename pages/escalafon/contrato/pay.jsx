import React, { Fragment, useEffect, useState, useContext } from 'react';
import { Form, Button, Select, Checkbox } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/router';
import { Body, BtnFloat, BtnBack } from '../../../components/Utils';
import { unujobs } from '../../../services/apis';
import Show from '../../../components/show';
import CreateConfigRemuneracion from '../../../components/contrato/createConfigRemuneracion';
import Swal from 'sweetalert2';
import { Confirm, backUrl } from '../../../services/utils'
import { tipo_documento } from '../../../services/storage.json';
import atob from 'atob'
import ContentControl from '../../../components/contentControl';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '../../../contexts/AppContext';


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

// componente principal
const Pay = ({ success, info, query }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [configs, setConfigs] = useState([]);
    const [old, setOld] = useState([]);
    const [edit, setEdit] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);
    const [option, setOption] = useState("");

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
            })
            .catch(err => {
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

    // cancelar edición
    const cancelConfig = async () => {
        setEdit(false);
        setConfigs(old);
    }

    // primera carga
    useEffect(() => {
        if (success) getConfig();
    }, []);

    return (
    <Fragment>
        <div className="col-md-12">
            <Body>
                <div className="card-">
                    <div className="card-header">
                        <BtnBack 
                            onClick={(e) => Router.push(backUrl(Router.pathname))} 
                        /> <span className="ml-4">Configuración de Remuneraciones</span>
                    </div>

                    <div className="card-body">
                        <Form>
                            <div className="row">
                                <div className="col-md-4 mt-3 text-center">
                                    <img src={info && info.person && info.person.image_images && info.person.image_images.image_200x200 || '/img/perfil.jpg'}
                                        style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }}
                                    />
                                            
                                    <div className="row">
                                        <div className="col-md-12 mt-3">
                                            <h3 className="text-center uppercase">{info && info.person ? info.person.fullname : ''}</h3>
                                        </div>

                                        <div className="col-md-12 mt-5 text-left">
                                            <label>Tip. Documento</label>
                                            <input type="text"
                                                disabled
                                                readOnly
                                                value={info && info.person && info.person.document_type || ""}
                                                disabled
                                            />
                                        </div>

                                        <div className="col-md-12 mt-3 text-left">
                                            <Form.Field>
                                                <label>N° Documento</label>
                                                <input type="text"
                                                    disabled
                                                    readOnly
                                                    value={info && info.person && info.person.document_number || ""}
                                                />
                                            </Form.Field>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-8">
                                    <div className="row">
                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Planilla</label>
                                                <input type="text" disabled defaultValue={info.planilla || ""}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Partición Presupuestal</label>
                                                <input type="text" disabled defaultValue={info.cargo || ""}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Ext. Presupuestal</label>
                                                <input type="text" disabled defaultValue={info.ext_pptto || ""}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">P.A.P</label>
                                                <input type="text" disabled defaultValue={info.pap}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Tip. Categoría</label>
                                                <input type="text" disabled defaultValue={info.categoria}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">MetaID</label>
                                                <input type="text" disabled defaultValue={info.meta}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">ActividadID</label>
                                                <input type="text" disabled defaultValue={info.actividadID}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Meta</label>
                                                <input type="text" disabled defaultValue={info.meta}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Dependencia</label>
                                                <input type="text" disabled defaultValue={info.dependencia && info.dependencia.nombre}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Perfil Laboral</label>
                                                <input type="text" disabled defaultValue={info.perfil_laboral && info.perfil_laboral.nombre || ""}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Situación Laboral</label>
                                                <input type="text" disabled defaultValue={info.situacion_laboral || ""}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">{info.is_pay ? 'Remunerada' : 'No Remunerada'}</label>
                                                <Checkbox toggle checked={info.is_pay ? true : false} readOnly disabled/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Plaza</label>
                                                <input type="text" disabled defaultValue={info.plaza}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Fecha de Ingreso</label>
                                                <input type="date" 
                                                    disabled={true}
                                                    defaultValue={info.fecha_de_ingreso || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Fecha de Cese</label>
                                                <input type="date" 
                                                    disabled={true} 
                                                    defaultValue={info.fecha_de_cese || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-8 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Observación</label>
                                                <textarea type="text" disabled defaultValue={info.observacion}/>
                                            </Form.Field>
                                        </div>

                                        <Show condicion={info.file}>
                                            <div className="col-md-4 mt-3">
                                                <Form.Field>
                                                    <label htmlFor="">File</label>
                                                    <Button color="red"
                                                        onClick={(e) => this.handleFile(info.file)}
                                                    >
                                                        <i className="fas fa-file-pdf"></i>
                                                    </Button>
                                                </Form.Field>
                                            </div>
                                        </Show>
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <hr/>
                                </div>
                            </div>
                        </Form>
                    </div>

                    <div className="card-body" id="config">
                        <h4><i className="fas fa-cogs"></i> Configuración Global</h4>
                        <Form>
                            <div className="row mt-4 justify-content-between">
                                <Show condicion={!current_loading}
                                    predeterminado={<PlaceholderConfigs/>}
                                >
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
                            </div>
                        </Form>
                    </div>
                </div>
            </Body>
        </div>

        <Show condicion={success && info.estado}>
            <ContentControl>
                <Show condicion={edit}>
                    <div className="col-lg-2 col-6">
                        <Button fluid color="red"onClick={cancelConfig}>
                            <i className="fas fa-times"></i> Cancelar
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button fluid color="blue" onClick={updateConfig}>
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </Show>

                <Show condicion={!edit}>
                    <div className="col-lg-2 col-6">
                        <Button fluid color="teal" onClick={(e) => {
                            location.href = `${Router.pathname}?id=${query.id}#config`;
                            setEdit(true);
                        }}>
                            <i className="fas fa-pencil-alt"></i> Editar
                        </Button>
                    </div>
                </Show>
            </ContentControl>
        </Show>

        <Show condicion={success && !edit}>
            <BtnFloat 
                onClick={(e) => setOption("create")}
                style={{ bottom: "80px" }}
            >
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </Show>
        {/* Ventanas flotantes */}
        <Show condicion={option == 'create'}>
            <CreateConfigRemuneracion
                info={info}
                isClose={(e) => setOption("")}
                onCreate={(e) => getConfig()}
            />
        </Show>
        
    </Fragment>)
}

// server rendering
Pay.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let id = atob(ctx.query.id || "");
    // request
    let { success, info } = await unujobs.get(`info/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false }));
    console.log(info);
    // response
    return { success, info: info || {}, query: ctx.query };
}

export default Pay;