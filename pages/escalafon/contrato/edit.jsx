import React, { Fragment, useEffect, useState, useContext } from 'react';
import { Form, Button, Select, Checkbox } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/router';
import { Body, BtnBack } from '../../../components/Utils';
import { unujobs } from '../../../services/apis';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import { Confirm, backUrl } from '../../../services/utils'
import ContentControl from '../../../components/contentControl';
import atob from 'atob';
import btoa from 'btoa';
import { AppContext } from '../../../contexts/AppContext';
import { SelectPlanilla, SelectCargo, SelectCargoTypeCategoria, SelectMeta, SelectSitacionLaboral } from '../../../components/select/cronograma';
import { SelectDependencia, SelectDependenciaPerfilLaboral } from '../../../components/select/authentication';
import storage from '../../../services/storage.json';

const Edit = ({ success, info, query }) => {

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
    const handleInput = ({ name, value}) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // actualizar contrato 
    const updateInfo = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar los datos?`, 'Confirmar');
        if (answer) {
            app_context.fireLoading(true)
            let datos = new FormData;
            await Object.keys(form).map(key => datos.append(key, form[key]));
            datos.append('_method', 'PUT');
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
                        let { data } = err.response;
                        if (typeof data != 'object') throw new Error(err.message);
                        if (typeof data.errors != 'object') throw new Error(data.message);
                        await Swal.fire({ icon: 'warning', text: data.message });
                        setErrors(data.errors);
                    } catch (error) {
                        app_context.fireLoading(false)
                        Swal.fire({ icon: 'error', message: error.message });
                    }
                });
        }
    }

    // restaurar contrato
    const restaurar = async () => {
        let answer = await Confirm("warning", `¿Deseas restaurar el contrato?`, 'Restaurar');
        if (answer) {
            app_context.fireLoading(true);
            await unujobs.post(`info/${info.id}/restore`)
                .then(async res => {
                    app_context.fireLoading(false);
                    let { success, message, restore } = res.data; 
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    let { push, pathname } = Router;
                    query.id = btoa(restore.id);
                    push({ pathname, query });
                }).catch(err => {
                    app_context.fireLoading(false);
                    Swal.fire({ icon: 'error', text: err.message });
                });
        }
    }

    // handle back
    const handleBack = () => {
        let { query, pathname, push } = Router;
        let href = query.href ? atob(query.href || "") : "";
        if (href) push(href);
        else push({ pathname: backUrl(pathname), query: { query_search: `${success ? info.person.fullname : ''}` }}) 
    }

    return (
    <Fragment>
        <div className="col-md-12">
            <Body>
                <div className="card-">
                    <div className="card-header">
                        <BtnBack 
                            onClick={handleBack}
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
                                            <Form.Field error={errors.planilla_id && errors.planilla_id[0] || ""}>
                                                <label htmlFor="">Planilla</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectPlanilla name="planilla_id" value={form.planilla_id} onChange={(e, obj) => handleInput(obj)}/>}
                                                >
                                                    <input type="text" disabled value={form.planilla || ""} readOnly/>
                                                </Show>
                                                <label>{errors.planilla_id && errors.planilla_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.cargo_id && errors.cargo_id[0] || ""}>
                                                <label htmlFor="">Partición Presupuestal</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectCargo name="cargo_id" value={form.cargo_id} onChange={(e, obj) => handleInput(obj)}/>}
                                                >
                                                    <input type="text" disabled value={form.cargo || ""} readOnly/>
                                                </Show>
                                                <label>{errors.cargo_id && errors.cargo_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Ext. Presupuestal</label>
                                                <input type="text" disabled value={info.ext_pptto || ""} readOnly/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.pap && errors.pap[0] || ""}>
                                                <label htmlFor="">P.A.P</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<Select name="pap" value={form.pap} options={storage.pap} onChange={(e, obj) => handleInput(obj)}/>}
                                                >
                                                    <input type="text" disabled value={info.pap}/>
                                                </Show>
                                                <label>{errors.pap && errors.pap[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.type_categoria_id && errors.type_categoria_id[0] || ""}>
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
                                                <label>{errors.type_categoria_id && errors.type_categoria_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.meta_id && errors.meta_id[0] || ""}>
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
                                                <label>{errors.meta_id && errors.meta_id[0] || ""}</label>
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
                                            <Form.Field error={errors.dependencia_id && errors.dependencia_id[0] || ""}>
                                                <label htmlFor="">Dependencia</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectDependencia name="dependencia_id" 
                                                        value={form.dependencia_id} 
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />}
                                                >
                                                    <input type="text" disabled value={info.dependencia && info.dependencia.nombre}/>
                                                </Show>
                                                <label>{errors.dependencia_id && errors.dependencia_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.perfil_laboral_id && errors.perfil_laboral_id[0] || ""}>
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
                                                <label>{errors.perfil_laboral_id && errors.perfil_laboral_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.situacion_laboral_id && errors.situacion_laboral_id[0] || ""}>
                                                <label htmlFor="">Situación Laboral</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectSitacionLaboral name="situacion_laboral_id" 
                                                        value={form.situacion_laboral_id}
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />}
                                                >
                                                    <input type="text" disabled value={form.situacion_laboral || ""}/>
                                                </Show>
                                                <label>{errors.situacion_laboral_id && errors.situacion_laboral_id[0] || ""}</label>
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
                                            <Form.Field error={errors.resolucion && errors.resolucion[0] || ""}>
                                                <label htmlFor="">N° Resolución</label>
                                                <input type="text" 
                                                    disabled={!edit}
                                                    value={form.resolucion || ""}
                                                    name="resolucion" 
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                                <label>{errors.resolucion && errors.resolucion[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] || ""}>
                                                <label htmlFor="">Fecha de Resolución</label>
                                                <input type="date" 
                                                    disabled={!edit}
                                                    value={form.fecha_de_resolucion || ""}
                                                    name="fecha_de_resolucion" 
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                                <label>{errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.fecha_de_ingreso && errors.fecha_de_ingreso[0] || ""}>
                                                <label htmlFor="">Fecha de Ingreso</label>
                                                <input type="date" 
                                                    disabled={!edit}
                                                    value={form.fecha_de_ingreso || ""}
                                                    name="fecha_de_ingreso" 
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                                <label>{errors.fecha_de_ingreso && errors.fecha_de_ingreso[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.fecha_de_cese && errors.fecha_de_cese[0] || ""}>
                                                <label htmlFor="">Fecha de Cese</label>
                                                <input type="date" 
                                                    disabled={!edit}
                                                    name="fecha_de_cese" 
                                                    value={form.fecha_de_cese || ""} 
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                                <label>{errors.fecha_de_cese && errors.fecha_de_cese[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Ley Social</label>
                                                <input type="text" 
                                                    disabled={true}
                                                    defaultValue={info.afp || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Fecha de Afiliación</label>
                                                <input type="date" 
                                                    disabled={true} 
                                                    defaultValue={info.fecha_de_afiliacion || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">N° CUSSP</label>
                                                <input type="text" 
                                                    disabled={true} 
                                                    defaultValue={info.numero_de_cussp || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">N° Essalud</label>
                                                <input type="text" 
                                                    disabled={true} 
                                                    defaultValue={info.numero_de_essalud || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Banco</label>
                                                <input type="text" 
                                                    disabled={true} 
                                                    defaultValue={info.banco || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">N° Cuenta</label>
                                                <input type="text" 
                                                    disabled={true} 
                                                    defaultValue={info.numero_de_cuenta || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Prima Seguro</label>
                                                <Checkbox toggle checked={info.prima_seguro ? true : false} readOnly disabled/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-8 mt-3">
                                            <Form.Field error={errors.observacion && errors.observacion[0] || ""}>
                                                <label htmlFor="">Observación</label>
                                                <textarea type="text" 
                                                    disabled={!edit} 
                                                    value={form.observacion || ""}
                                                    name="observacion"
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                                <label>{errors.observacion && errors.observacion[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <Show condicion={info.file}>
                                            <div className="col-md-4 mt-3">
                                                <Form.Field>
                                                    <label htmlFor="">File</label>
                                                    <Button color="red"
                                                        onClick={(e) => handleFile(info.file)}
                                                    >
                                                        <i className="fas fa-file-pdf"></i>
                                                    </Button>
                                                </Form.Field>
                                            </div>
                                        </Show>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </Body>
        </div>

        <Show condicion={success}>
            <ContentControl>
                <Show condicion={info.estado && edit}>
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

                <Show condicion={info.estado && !edit}>
                    <div className="col-lg-2 col-6">
                        <Button fluid color="teal" onClick={(e) => setEdit(true)}>
                            <i className="fas fa-pencil-alt"></i> Editar
                        </Button>
                    </div>
                </Show>

                <Show condicion={!info.estado}>
                    <div className="col-lg-2">
                        <Button fluid color="blue" onClick={restaurar}>
                            <i className="fas fa-sync"></i> Restaurar
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
    // response
    return { success, info: info || {}, query: ctx.query };
}

export default Edit;