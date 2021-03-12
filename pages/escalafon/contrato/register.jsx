import React, { Fragment, useState, useContext, useEffect } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import { BtnBack } from '../../../components/Utils';
import ContentControl from '../../../components/contentControl';
import Show from '../../../components/show';
import { unujobs } from '../../../services/apis';
import { backUrl, Confirm } from '../../../services/utils';
import { pap } from '../../../services/storage.json';
import Swal from 'sweetalert2';
import Router from 'next/router';
import AssignTrabajador from '../../../components/contrato/assingTrabajador';   
import { SelectPlanilla, SelectCargo, SelectCargoTypeCategoria, SelectMeta } from '../../../components/select/cronograma';
import { SelectDependencia, SelectDependenciaPerfilLaboral } from '../../../components/select/authentication';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../../components/boardSimple';

const Register = () => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [option, setOption] = useState("");
    const [work, setWork] = useState({});
    const isWork = Object.keys(work).length;
    const [form, setForm] = useState({ is_aportacion: 1 });
    const [errors, setErrors] = useState({});

    // primera carga
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // cambios del form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // agregar file
    const handleFile = async ({ name, files }) => {
        if (files[0]) {
            handleInput({ name, value: files[0] });
        }
    }

    // agregar trabajador
    const getAdd = async (obj) => {
        setWork(obj);
        setOption("");
    }

    // crear contrato
    const createInfo = async () => {
        let answer = await Confirm("warning", "¿Estas seguro en guardar el contrato?", "Estoy Seguro");
        if (answer) {
            app_context.setCurrentLoading(true);
            let newForm = new FormData;
            newForm.append('work_id', work.id);
            for(let key in form) {
                newForm.append(key, form[key]);
            }
            await unujobs.post('info', newForm)
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message, info } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                let id = btoa(info.id) || '__error';
                // query
                let query = {
                    id,
                    href: btoa(location.pathname || "")
                }
                Router.push({ pathname: `${backUrl(Router.pathname)}/edit`, query });
            }).catch(err => {
                try {
                    app_context.setCurrentLoading(false);
                    let { data } = err.response;
                    if (typeof data != 'object') throw new Error(err.message);
                    if (typeof data.errors != 'object') throw new Error(data.message || "");
                    Swal.fire({ icon: 'warning', text: data.message });
                    setErrors(data.errors);
                } catch(error) {
                    Swal.fire({ icon: 'error', text: err.message })
                }
            });
        }
    }
    
    // render
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple 
                    title="Contrato"
                    info={["Crear contrato de trabajo"]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <Form className="card-body">
                        <div onSubmit={(e) => e.preventDefault()} className="row justify-content-center">

                            <div className="col-md-12 mb-4">
                                <h4><i className="fas fa-fingerprint"></i> Seleccionar Trabajador</h4>
                                <hr/>

                                <div className="row">
                                    <Show condicion={!isWork}>
                                        <div className="col-md-4">
                                            <Button
                                                onClick={(e) => setOption("assign")}
                                            >
                                                <i className="fas fa-plus"></i> Asignar
                                            </Button>
                                        </div>
                                    </Show>

                                    <Show condicion={isWork}>
                                        <div className="col-md-4 mb-3">
                                            <Form.Field>
                                                <label htmlFor="">Tip. Documento</label>
                                                <input type="text"
                                                    value={work.person && work.person.document_type  || ""}
                                                    disabled
                                                    readOnly
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4">
                                            <Form.Field>
                                                <label htmlFor="">N° Documento</label>
                                                <input type="text"
                                                    value={work.person && work.person.document_number  || ""}
                                                    disabled
                                                    readOnly
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4">
                                            <Form.Field>
                                                <label htmlFor="">Apellidos y Nombres</label>
                                                <input type="text"
                                                    className="uppercase"
                                                    value={work.person && work.person.fullname || ""}
                                                    disabled
                                                    readOnly
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4">
                                            <Button
                                                onClick={(e) => setOption('assign')}
                                            >
                                                <i className="fas fa-plus"></i> Cambiar
                                            </Button>
                                        </div>
                                    </Show>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div>
                                    <hr/>
                                    <i className="fas fa-info-circle mr-1"></i> Información del Contrato
                                    <hr/>
                                </div>

                                <div className="card-body">
                                    <div className="row w-100">
                                        <div className="col-md-4 mb-3">
                                            <Form.Field>
                                                <label htmlFor="">ID</label>
                                                <input type="text"
                                                    disabled
                                                    value="AUTOGENERADO"
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.planilla_id && errors.planilla_id[0] || ""}>
                                                <label htmlFor="">Planilla <b className="text-red">*</b></label>
                                                <SelectPlanilla
                                                    name="planilla_id"
                                                    value={form.planilla_id}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                />
                                                <label>{errors && errors.planilla_id && errors.planilla_id[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.dependencia_id && errors.dependencia_id[0] || ""}>
                                                <label htmlFor="">Dependencia/Oficina <b className="text-red">*</b></label>
                                                <SelectDependencia
                                                    name="dependencia_id"
                                                    value={form.dependencia_id || ""}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                />
                                                <b className="text-red">{errors && errors.dependencia_id && errors.dependencia_id[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.meta_id && errors.meta_id[0] || ""}>
                                                <label htmlFor="">MetaID <b className="text-red">*</b></label>
                                                <SelectMeta
                                                    name="meta_id"
                                                    value={form.meta_id}
                                                    year={new Date().getFullYear()}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                />
                                                <label>{errors && errors.meta_id && errors.meta_id[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.meta_id && errors.meta_id[0] || ""}>
                                                <label htmlFor="">ActividadID <b className="text-red">*</b></label>
                                                <SelectMeta
                                                    name="meta_id"
                                                    text="actividadID"
                                                    value={form.meta_id}
                                                    year={new Date().getFullYear()}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                />
                                                <label>{errors && errors.meta_id && errors.meta_id[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.meta_id && errors.meta_id[0] || ""}>
                                                <label htmlFor="">Meta <b className="text-red">*</b></label>
                                                <SelectMeta
                                                    name="meta_id"
                                                    text="meta"
                                                    value={form.meta_id}
                                                    year={new Date().getFullYear()}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                />
                                                <label>{errors && errors.meta_id && errors.meta_id[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.cargo_id && errors.cargo_id[0] || ""}>
                                                <label htmlFor="">Partición Presupuestal. <b className="text-red">*</b></label>
                                                <SelectCargo
                                                    name="cargo_id"
                                                    value={form.cargo_id}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                />
                                                <b className="text-red">{errors && errors.cargo_id && errors.cargo_id[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors.cargo_id && errors.cargo_id[0] || ""}>
                                                <label htmlFor="">Ext pptto <b className="text-red">*</b></label>
                                                <SelectCargo
                                                    name="cargo_id"
                                                    text="ext_pptto"
                                                    value={form.cargo_id}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                />
                                                <label htmlFor="">{errors.cargo_id && errors.cargo_id[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors.type_categoria_id && errors.type_categoria_id[0] || ""}>
                                                <label htmlFor="">Tip. Categoría <b className="text-red">*</b></label>
                                                <SelectCargoTypeCategoria
                                                    cargo_id={form.cargo_id}
                                                    execute={false}
                                                    disabled={!form.cargo_id}
                                                    refresh={form.cargo_id}
                                                    name="type_categoria_id"
                                                    value={form.type_categoria_id}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                />
                                                <b className="text-red">{errors && errors.type_categoria_id && errors.type_categoria_id[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field>
                                                <label htmlFor="">P.A.P <b className="text-red">*</b></label>
                                                <Select
                                                    options={pap}
                                                    placeholder="Select. P.A.P"
                                                    name="pap"
                                                    value={form.pap}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                    error={errors && errors.pap && errors.pap[0]}
                                                />
                                                <b className="text-red">{errors && errors.pap && errors.pap[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field>
                                                <label htmlFor="">Plaza</label>
                                                <input type="text" 
                                                    name="plaza"
                                                    value={form.plaza}
                                                    placeholder="Plaza"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.perfil_laboral_id && errors.perfil_laboral_id[0] || ""}>
                                                <label htmlFor="">Perfil Laboral <b className="text-red">*</b></label>
                                                <SelectDependenciaPerfilLaboral
                                                    disabled={!form.dependencia_id}
                                                    execute={false}
                                                    refresh={form.dependencia_id}
                                                    dependencia_id={form.dependencia_id}
                                                    name="perfil_laboral_id"
                                                    onChange={(e, obj) => handleInput(obj)}
                                                    value={form.perfil_laboral_id}
                                                />
                                                <b className="text-red">{errors && errors.perfil_laboral_id && errors.perfil_laboral_id[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.resolucion && errors.resolucion[0] || ""}>
                                                <label htmlFor="">Resolución <b className="text-red">*</b></label>
                                                <input type="text" 
                                                    name="resolucion"
                                                    placeholder="N° Resolución"
                                                    value={form.resolucion || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                <b className="text-red">{errors && errors.resolucion && errors.resolucion[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] || ""}>
                                                <label htmlFor="">Fecha de Resolución <b className="text-red">*</b></label>
                                                <input type="date" 
                                                    name="fecha_de_resolucion"
                                                    placeholder="Fecha de resolucion"
                                                    value={form.fecha_de_resolucion || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                <b className="text-red">{errors && errors.fecha_de_resolucion && errors.fecha_de_resolucion[0]}</b>
                                            </Form.Field>
                                        </div>
                                        
                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.file && errors.file[0] || ""}>
                                                <label htmlFor="file">Archivo de Regístro</label>
                                                <label htmlFor="file" className="btn btn-outline-dark">
                                                    <i className="fas fa-file-alt"></i>
                                                    <input type="file" 
                                                        id="file"
                                                        onChange={(e) => handleFile(e.target)}
                                                        name="file"
                                                        hidden 
                                                        placeholder="Archivo de Regístro"
                                                        accept="application/pdf"
                                                    />
                                                </label>
                                                <label>{errors && errors.file && errors.file[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.fecha_de_ingreso && errors.fecha_de_ingreso[0] || ""}>
                                                <label htmlFor="">Fecha de Ingreso <b className="text-red">*</b></label>
                                                <input type="date" 
                                                    name="fecha_de_ingreso"
                                                    placeholder="Fecha de ingreso"
                                                    value={form.fecha_de_ingreso || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                <b className="text-red">{errors && errors.fecha_de_ingreso && errors.fecha_de_ingreso[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.fecha_de_cese && errors.fecha_de_cese[0] || ""}>
                                                <label htmlFor="">Fecha de Cese </label>
                                                <input type="date" 
                                                    placeholder="Fecha de cese"
                                                    name="fecha_de_cese"
                                                    value={form.fecha_de_cese || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                <label htmlFor="">{errors && errors.fecha_de_cese && errors.fecha_de_cese[0]}</label>
                                            </Form.Field>
                                        </div>
                                        
                                        <div className="col-md-8 mb-3">
                                            <Form.Field error={errors && errors.observacion && errors.observacion[0] || ""}>
                                                <label htmlFor="">Observación <b className="text-red">*</b></label>
                                                <textarea name="observacion" 
                                                    value={form.observacion || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                <label>{errors && errors.observacion && errors.observacion[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Form.Field>
                                                <label htmlFor="">N° Ruc</label>
                                                <input type="text" 
                                                    placeholder="N° Ruc"
                                                    name="ruc"
                                                    value={form.ruc || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </Form.Field>

                                            <Form.Field>
                                                <label htmlFor="">¿ Agregar aportación empleador: ESSALUD ?</label>
                                                <Select
                                                    placeholder="Select. Aportación"
                                                    name="is_aportacion"
                                                    options={[
                                                        { key: "0", value: "0", text: "No" },
                                                        { key: "1", value: "1", text: "Si" }
                                                    ]}
                                                    value={`${form.is_aportacion || ""}`}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                />
                                            </Form.Field>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                </BoardSimple>
            </div>

            <ContentControl>
                <div className="col-lg-2 col-6">
                    <Button fluid color="red" disabled={!isWork}
                        onClick={(e) => {
                            setWork({});
                            setForm({});
                            setErrors({});
                        }}
                    >
                        <i className="fas fa-times"></i> Cancelar
                    </Button>
                </div>

                <div className="col-lg-2 col-6">
                    <Button fluid color="blue" 
                        disabled={!isWork}
                        onClick={createInfo}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </ContentControl>

            <Show condicion={option == 'assign'}>
                <AssignTrabajador
                    getAdd={getAdd}
                    local={true}
                    isClose={(e) => setOption('')}
                />
            </Show>
        </Fragment>
    )
}

// server rendering
Register.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    // response
    return { query, pathname }
}

// exportar
export default Register;