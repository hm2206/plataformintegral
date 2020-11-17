import React, { Fragment, useEffect, useState, useContext } from 'react';
import { Form, Button, Select, Checkbox } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/router';
import { Body, BtnBack } from '../../../components/Utils';
import { unujobs } from '../../../services/apis';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import { Confirm, backUrl } from '../../../services/utils'
import { tipo_documento } from '../../../services/storage.json';
import ContentControl from '../../../components/contentControl';
import atob from 'atob'
import { AppContext } from '../../../contexts/AppContext';
import { SelectCargo, SelectCargoTypeCategoria, SelectMeta, SelectSitacionLaboral } from '../../../components/select/cronograma';
import { SelectDependencia, SelectDependenciaPerfilLaboral } from '../../../components/select/authentication';
import storage from '../../../services/storage.json';

const Edit = ({ success, info }) => {

    // app
    const app_context = useContext(AppContext);
    
    // estados
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({});
    const [old, setOld] = useState({});
    const [errors, setErrors] = useState({});

    // primera carga
    useEffect(() => {
        if (success) {
            setForm(info);
            setOld(JSON.parse(JSON.stringify(info)));
        }
    }, []);

    // cancelar edición
    const cancelInfo = async () => {
        setEdit(false);
        setForm(old);
    }
    
    // cambiar form
    const handleInput = async ({ name, value}) => {
        let newForm = await Object.assign({}, JSON.parse(JSON.stringify(form)));
        newForm[name] = value;
        setForm(newForm);
    }

    // actualizar contrato 
    const updateInfo = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar los datos?`, 'Confirmar');
        if (answer) {
            app_context.fireLoading(true)
            let datos = new FormData;
            datos.append('cargo_id', form.cargo_id);
            datos.append('type_categoria_id', form.type_categoria_id);
            datos.append('pap', form.pap);
            datos.append('meta_id', form.meta_id);
            datos.append('dependencia_id', form.dependencia_id);
            datos.append('perfil_laboral_id', form.perfil_laboral_id);
            datos.append('situacion_laboral_id', form.situacion_laboral_id);
            datos.append('is_pay', form.is_pay);
            datos.append('plaza', form.plaza);
            datos.append('fecha_de_ingreso', form.fecha_de_ingreso)
            datos.append('fecha_de_cese', form.fecha_de_cese)
            datos.append('observacion', form.observacion);
            datos.append('_method', 'PUT')
            // actualizar
            await unujobs.post(`info/${info.id}`, datos)
                .then(async res => {
                    app_context.fireLoading(false)
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    setErrors({});
                    setEdit(false);
                    setOld(JSON.parse(JSON.stringify(form)));
                    Router.push({ pathname: Router.pathname, query: Router.query });
                }).catch(async err => {
                    try {
                        app_context.fireLoading(false)
                        let { message, errors } = err.response.data;
                        setErrors(errors);
                        await Swal.fire({ icon: 'warning', text: message });
                    } catch (error) {
                        app_context.fireLoading(false)
                        Swal.fire({ icon: 'error', message: err.message });
                    }
                });
        }
    }

    return (
    <Fragment>
        <div className="col-md-12">
            <Body>
                <div className="card-">
                    <div className="card-header">
                        <BtnBack 
                            onClick={(e) => Router.push(backUrl(Router.pathname))} 
                        /> <span className="ml-4">Editar Contrato</span>
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
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectCargo name="cargo_id" value={form.cargo_id} onChange={(e, obj) => handleInput(obj)}/>}
                                                >
                                                    <input type="text" disabled value={form.cargo || ""} readOnly/>
                                                </Show>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Ext. Presupuestal</label>
                                                <input type="text" disabled value={info.ext_pptto || ""} readOnly/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">P.A.P</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<Select name="pap" value={form.pap} options={storage.pap} onChange={(e, obj) => handleInput(obj)}/>}
                                                >
                                                    <input type="text" disabled value={info.pap}/>
                                                </Show>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Tip. Categoría</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectCargoTypeCategoria 
                                                                cargo_id={form.cargo_id} 
                                                                refresh={form.cargo_id}
                                                                name="type_categoria_id" 
                                                                value={form.type_categoria_id}
                                                                onChange={(e, obj) => handleInput(obj)}
                                                            />
                                                        }
                                                >
                                                    <input type="text" disabled value={info.categoria} readOnly/>
                                                </Show>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">MetaID</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectMeta name="meta_id" 
                                                        value={form.meta_id} 
                                                        year={new Date().getFullYear()} 
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />}
                                                >
                                                    <input type="text" disabled value={info.metaID}/>
                                                </Show>
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
                                                <input type="text" disabled value={info.meta} readOnly/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Dependencia</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectDependencia name="dependencia_id" 
                                                        value={form.dependencia_id} 
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />}
                                                >
                                                    <input type="text" disabled value={info.dependencia && info.dependencia.nombre}/>
                                                </Show>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Perfil Laboral</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectDependenciaPerfilLaboral
                                                        dependencia_id={form.dependencia_id} 
                                                        refresh={form.dependencia_id}
                                                        name="perfil_laboral_id"
                                                        value={form.perfil_laboral_id}
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />}
                                                >
                                                    <input type="text" disabled value={info.perfil_laboral && info.perfil_laboral.nombre || ""}/>
                                                </Show>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Situación Laboral</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectSitacionLaboral name="situacion_laboral_id" 
                                                        value={form.situacion_laboral_id}
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />}
                                                >
                                                    <input type="text" disabled value={form.situacion_laboral || ""}/>
                                                </Show>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">{info.is_pay ? 'Remunerada' : 'No Remunerada'}</label>
                                                <Checkbox toggle
                                                    checked={form.is_pay ? true : false} 
                                                    disabled={!edit}
                                                    name="is_pay"
                                                    onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Plaza</label>
                                                <input type="text" 
                                                    disabled={!edit} 
                                                    name="plaza" 
                                                    value={form.plaza || ""}
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Fecha de Ingreso</label>
                                                <input type="date" 
                                                    disabled={!edit}
                                                    value={form.fecha_de_ingreso || ""}
                                                    name="fecha_de_ingreso" 
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Fecha de Cese</label>
                                                <input type="date" 
                                                    disabled={!edit}
                                                    name="fecha_de_cese" 
                                                    value={form.fecha_de_cese || ""} 
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-8 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Observación</label>
                                                <textarea type="text" 
                                                    disabled={!edit} 
                                                    value={form.observacion || ""}
                                                    name="observacion"
                                                    onChange={({target}) => handleInput(target)}
                                                />
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
                </div>
            </Body>
        </div>

        <Show condicion={success && info.estado}>
            <ContentControl>
                <Show condicion={edit}>
                    <div className="col-lg-2 col-6">
                        <Button fluid color="red" onClick={cancelInfo}>
                            <i className="fas fa-times"></i> Cancelar
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button fluid color="blue" onClick={updateInfo}>
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </Show>

                <Show condicion={!edit}>
                    <div className="col-lg-2 col-6">
                        <Button fluid color="teal" onClick={(e) => setEdit(true)}>
                            <i className="fas fa-pencil-alt"></i> Editar
                        </Button>
                    </div>
                </Show>
            </ContentControl>
        </Show>
    </Fragment>)
}

// server rendering
Edit.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let id = atob(ctx.query.id);
    // request
    let { success, info } = await unujobs.get(`info/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false }));
    console.log(info);
    // response
    return { success, info: info || {}, query: ctx.query };
}

export default Edit;