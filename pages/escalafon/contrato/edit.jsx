import React, { Fragment, useEffect, useState, useContext } from 'react';
import { Form, Button, Select, Checkbox, Message } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/router';
import { BtnBack, funcBack } from '../../../components/Utils';
import { handleErrorRequest, escalafon, unujobs } from '../../../services/apis';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import { Confirm } from '../../../services/utils'
import ContentControl from '../../../components/contentControl';
import atob from 'atob';
import btoa from 'btoa';
import { AppContext } from '../../../contexts/AppContext';
import { SelectPlanilla, SelectCargo, SelectCargoTypeCategoria, SelectMeta, SelectSitacionLaboral, SelectTypeCargo } from '../../../components/select/cronograma';
import { SelectDependencia, SelectDependenciaPerfilLaboral } from '../../../components/select/authentication';
import storage from '../../../services/storage.json';
import BoardSimple from '../../../components/boardSimple';
import NotFoundData from '../../../components/notFoundData'
import { EntityContext } from '../../../contexts/EntityContext';
import { SelectHourhand } from '../../../components/select/escalafon';

const Edit = ({ success, info, query }) => {

    // validar datos
    if (!success) return <NotFoundData/>;

    // app
    const app_context = useContext(AppContext);
    
    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({});
    const [old, setOld] = useState({});
    const [errors, setErrors] = useState({});

    // cargar entity
    useEffect(() => {
        entity_context.fireEntity({ render: true, disabled: true, entity_id: info.entity_id });
        return () => entity_context.fireEntity({ render: false, disabled: false });
    }, []);

    // primera carga
    useEffect(() => {
        if (success) {
            setForm(info);
            setOld(JSON.parse(JSON.stringify(info)));
        }
    }, [info?.id]);

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
        if (!answer) return false;
        app_context.setCurrentLoading(true)
        let datos = new FormData;
        await Object.keys(form).map(key => datos.append(key, form[key] || ""));
        datos.append('_method', 'PUT');
        // actualizar
        await unujobs.post(`info/${info.id}`, datos)
        .then(async res => {
            app_context.setCurrentLoading(false)
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            setErrors({});
            setEdit(false);
            setOld(JSON.parse(JSON.stringify(form)));
            Router.push({ pathname: Router.pathname, query: Router.query });
        }).catch(async err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
    }

    // restaurar contrato
    const restaurar = async () => {
        let answer = await Confirm("warning", `¿Deseas en clonar el contrato?`, 'Clonar');
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await unujobs.post(`info/${info.id}/restore`)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message, restore } = res.data; 
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            let { push, pathname } = Router;
            query.id = btoa(restore.id);
            await push({ pathname, query });
        }).catch(err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
    }

    // elimnar
    const destroy = async () => {
        let answer = await Confirm("warning", `¿Deseas eliminar el contrato?`, 'Eliminar');
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await unujobs.post(`info/${info.id}?`, { _method: 'DELETE' })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message, restore } = res.data; 
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            Router.push(funcBack());
        }).catch(err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
    }

    // manejador de optiones
    const handleOption = async (e, index, obj) => {
        switch (obj.key) {
            case 'restaurar':
                await restaurar();
                break;
            default:
                break;
        }
    }

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    prefix={<BtnBack/>}
                    title="Contrato"
                    info={["Editar contrato"]}
                    bg="light"
                    onOption={handleOption}
                    options={[
                        { key: "restaurar", title: "Clonar contrato", icon: "fas fa-clone" }
                    ]}
                >
                    <div className="card-body">
                        <Form>
                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    <div>
                                        <Message color={form?.estado ? 'green' : 'red'}>
                                            <div className="row">
                                                <div className="col-md-10">
                                                    <b>El contrato está {info?.estado ? 'habilitado' : 'deshabilitado'}</b>
                                                </div>
                                                <div className="col-md-2 text-right">
                                                    <Checkbox toggle
                                                        checked={form?.estado ? true : false}
                                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                        disabled={!edit}
                                                        name="estado"
                                                    />
                                                </div>
                                            </div>
                                        </Message>
                                    </div>
                                    <hr/>
                                </div>

                                <div className="col-md-4 mt-3 text-center">
                                    <img src={info?.work?.person?.image_images?.image_200x200 || '/img/perfil.jpg'}
                                        style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }}
                                    />
                                            
                                    <div className="row">
                                        <div className="col-md-12 mt-3">
                                            <h3 className="text-center uppercase">{info?.work?.person?.fullname || ''}</h3>
                                        </div>

                                        <div className="col-md-12 mt-5 text-left">
                                            <label>Tip. Documento</label>
                                            <input type="text"
                                                readOnly
                                                value={info?.work?.person?.document_type?.name || ""}
                                            />
                                        </div>

                                        <div className="col-md-12 mt-3 text-left">
                                            <Form.Field>
                                                <label>N° Documento</label>
                                                <input type="text"
                                                    readOnly
                                                    value={info?.work?.person?.document_number || ""}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mt-3 text-left">
                                            <Form.Field>
                                                <label htmlFor="">Ley Social <b className="text-red">*</b></label>
                                                <input type="text" 
                                                    readOnly
                                                    value={info.work?.afp?.afp || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mt-3 text-left">
                                            <Form.Field>
                                                <label htmlFor="">Fecha de Afiliación</label>
                                                <input type="date" 
                                                    readOnly
                                                    value={info.work?.fecha_de_afiliacion || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mt-3 text-left">
                                            <Form.Field>
                                                <label htmlFor="">N° CUSSP</label>
                                                <input type="text" 
                                                    readOnly 
                                                    value={info.work?.numero_de_cussp || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mt-3 text-left">
                                            <Form.Field>
                                                <label htmlFor="">N° Essalud</label>
                                                <input type="text" 
                                                    readOnly
                                                    value={info.work?.numero_de_essalud || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-12 mt-3 text-left">
                                            <Form.Field>
                                                <label htmlFor="">Banco <b className="text-red">*</b></label>
                                                <input type="text" 
                                                    readOnly
                                                    value={info.work?.banco?.nombre || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-12 mt-3 text-left">
                                            <Form.Field>
                                                <label htmlFor="">N° Cuenta</label>
                                                <input type="text" 
                                                    readOnly
                                                    value={info.work?.numero_de_cuenta || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-12 mt-3 text-left">
                                            <Form.Field>
                                                <label htmlFor="">Prima Seguro</label>
                                                <Checkbox toggle 
                                                    checked={info.work?.prima_seguro ? true : false} 
                                                    disabled
                                                />
                                            </Form.Field>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-8">
                                    <div className="row">
                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.planilla_id && errors.planilla_id[0] || ""}>
                                                <label htmlFor="">Planilla <b className="text-red">*</b></label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectPlanilla name="planilla_id" value={form.planilla_id} onChange={(e, obj) => handleInput(obj)}/>}
                                                >
                                                    <input type="text" value={form?.planilla?.nombre || ""} readOnly/>
                                                </Show>
                                                <label>{errors.planilla_id && errors.planilla_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.cargo_id && errors.cargo_id[0] || ""}>
                                                <label htmlFor="">Partición Presupuestal <b className="text-red">*</b></label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectCargo name="cargo_id" value={form.cargo_id} onChange={(e, obj) => handleInput(obj)}/>}
                                                >
                                                    <input type="text" value={form?.cargo?.descripcion || ""} readOnly/>
                                                </Show>
                                                <label>{errors.cargo_id && errors.cargo_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Ext. Presupuestal</label>
                                                <input type="text" value={info?.cargo?.ext_pptto || ""} readOnly/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.type_cargo_id && errors.type_cargo_id[0] || ""}>
                                                <label htmlFor="">Tipo de Trabajador <b className="text-red">*</b></label>
                                                <Show condicion={!edit}
                                                    predeterminado={
                                                        <SelectTypeCargo name="type_cargo_id"
                                                            value={form.type_cargo_id}
                                                            onChange={(e, obj) => handleInput(obj)}
                                                            displayText={(dato) => dato?.description}
                                                        />}
                                                >
                                                    <input type="text" value={form?.type_cargo?.description || ""} readOnly/>
                                                </Show>
                                                <label>{errors.type_cargo_id && errors.type_cargo_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.pap && errors.pap[0] || ""}>
                                                <label htmlFor="">P.A.P <b className="text-red">*</b></label>
                                                <Show condicion={!edit}
                                                    predeterminado={<Select name="pap" value={form.pap} options={storage.pap} onChange={(e, obj) => handleInput(obj)}/>}
                                                >
                                                    <input type="text" value={info.pap} readOnly/>
                                                </Show>
                                                <label>{errors.pap && errors.pap[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.type_categoria_id && errors.type_categoria_id[0] || ""}>
                                                <label htmlFor="">Tip. Categoría <b className="text-red">*</b></label>
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
                                                    <input type="text" value={info?.type_categoria?.descripcion} readOnly/>
                                                </Show>
                                                <label>{errors.type_categoria_id && errors.type_categoria_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.meta_id && errors.meta_id[0] || ""}>
                                                <label htmlFor="">MetaID <b className="text-red">*</b></label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectMeta name="meta_id" 
                                                        value={form.meta_id} 
                                                        year={new Date().getFullYear()} 
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />}
                                                >
                                                    <input type="text" value={info.meta?.metaID}/>
                                                </Show>
                                                <label>{errors.meta_id && errors.meta_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">ActividadID</label>
                                                <input type="text" value={info.meta?.actividadID} readOnly/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Meta</label>
                                                <input type="text" value={info?.meta?.meta} readOnly/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.dependencia_id && errors.dependencia_id[0] || ""}>
                                                <label htmlFor="">Dependencia <b className="text-red">*</b></label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectDependencia name="dependencia_id" 
                                                        value={form.dependencia_id} 
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />}
                                                >
                                                    <input type="text" readOnly value={info?.dependencia?.nombre}/>
                                                </Show>
                                                <label>{errors.dependencia_id && errors.dependencia_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.perfil_laboral_id && errors.perfil_laboral_id[0] || ""}>
                                                <label htmlFor="">Perfil Laboral <b className="text-red">*</b></label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectDependenciaPerfilLaboral
                                                        dependencia_id={form.dependencia_id} 
                                                        refresh={form.dependencia_id}
                                                        name="perfil_laboral_id"
                                                        value={form.perfil_laboral_id}
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />}
                                                >
                                                    <input type="text" readOnly value={info.perfil_laboral && info.perfil_laboral.nombre || ""}/>
                                                </Show>
                                                <label>{errors.perfil_laboral_id && errors.perfil_laboral_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.situacion_laboral_id && errors.situacion_laboral_id[0] || ""}>
                                                <label htmlFor="">Situación Laboral <b className="text-red">*</b></label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectSitacionLaboral name="situacion_laboral_id" 
                                                        value={form.situacion_laboral_id}
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />}
                                                >
                                                    <input type="text" readOnly value={form?.situacion_laboral?.nombre || ""}/>
                                                </Show>
                                                <label>{errors.situacion_laboral_id && errors.situacion_laboral_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Código AIRHSP</label>
                                                <input type="text" 
                                                    readOnly={!edit} 
                                                    name="code_airhsp" 
                                                    value={form.code_airhsp || ""}
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Código Asistencia</label>
                                                <input type="text" 
                                                    readOnly={!edit} 
                                                    name="code" 
                                                    value={form.code || ""}
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.hourhand_id && errors.hourhand_id[0] || ""}>
                                                <label htmlFor="">Horario</label>
                                                <Show condicion={!edit}
                                                    predeterminado={<SelectHourhand name="hourhand_id" 
                                                        value={form.hourhand_id}
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />}
                                                >
                                                    <input type="text" readOnly value={form?.hourhand?.name || ""}/>
                                                </Show>
                                                <label>{errors.hourhand_id && errors.hourhand_id[0] || ""}</label>
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
                                                    readOnly={!edit} 
                                                    name="plaza" 
                                                    value={form.plaza || ""}
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.resolucion && errors.resolucion[0] || ""}>
                                                <label htmlFor="">N° Resolución <b className="text-red">*</b></label>
                                                <input type="text" 
                                                    readOnly={!edit}
                                                    value={form.resolucion || ""}
                                                    name="resolucion" 
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                                <label>{errors.resolucion && errors.resolucion[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] || ""}>
                                                <label htmlFor="">Fecha de Resolución <b className="text-red">*</b></label>
                                                <input type="date" 
                                                    readOnly={!edit}
                                                    value={form.fecha_de_resolucion || ""}
                                                    name="fecha_de_resolucion" 
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                                <label>{errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field error={errors.fecha_de_ingreso && errors.fecha_de_ingreso[0] || ""}>
                                                <label htmlFor="">Fecha de Ingreso <b className="text-red">*</b></label>
                                                <input type="date" 
                                                    readOnly={!edit}
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
                                                    readOnly={!edit}
                                                    name="fecha_de_cese" 
                                                    value={form.fecha_de_cese || ""} 
                                                    onChange={({target}) => handleInput(target)}
                                                />
                                                <label>{errors.fecha_de_cese && errors.fecha_de_cese[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-8 mt-3">
                                            <Form.Field error={errors.observacion && errors.observacion[0] || ""}>
                                                <label htmlFor="">Observación</label>
                                                <textarea type="text" 
                                                    readOnly={!edit} 
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
                </BoardSimple>
            </div>

            <Show condicion={success}>
                <ContentControl>
                    <Show condicion={edit}>
                        <div className="col-lg-2 col-6">
                            <Button fluid color="blue" onClick={updateInfo}
                                title="Actualizar"
                            >
                                <i className="fas fa-sync"></i>
                            </Button>
                        </div>

                        <div className="col-lg-2 col-6">
                            <Button fluid color="red" onClick={cancelInfo}
                                title="Cancelar"
                            >
                                <i className="fas fa-times"></i>
                            </Button>
                        </div>
                    </Show>

                    <Show condicion={!edit}>
                        <div className="col-lg-2 col-6">
                            <Button fluid color="red" onClick={destroy}
                                title="Eliminar"
                            >
                                <i className="fas fa-trash"></i>
                            </Button>
                        </div>

                        <div className="col-lg-2 col-6">
                            <Button fluid color="blue" basic 
                                onClick={(e) => setEdit(true)}
                                title="Editar"
                            >
                                <i className="fas fa-pencil-alt"></i>
                            </Button>
                        </div>
                    </Show>
                </ContentControl>
            </Show>
        </Fragment>
    )
}

// server rendering
Edit.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let id = atob(query.id) || '__error';
    // request
    let { success, info } = await escalafon.get(`infos/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, info: {} }));
    // response
    return { pathname, query, success, info };
}

export default Edit;