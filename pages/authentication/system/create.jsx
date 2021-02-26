import React, { Fragment, useState } from 'react';
import { Body, BtnBack, InputFile } from '../../../components/Utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';
import { Confirm } from '../../../services/utils';


const CreateSystem = ({ pathname, query }) => {

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_files, setCurrentFiles] = useState({});

    // manejador de estados
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // manejador de archivos
    const handleFiles = ({ name, file }) => {
        setCurrentFiles({ ...current_files, [name]: file });
    }

    // guardar los datos
    const save = async () => {
        let answer = await Confirm('warning', 'Estas seguro en guardar los datos', 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        let data = new FormData;
        for(let attr in form) data.append(attr, form[attr]);
        // add files
        for(let attr in current_files) data.append(attr, files[attr]);
        // crear sistema
        await authentication.post('system', data)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
            setCurrentFiles({});
        })
        .catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    // renderizar
    return (
        <Fragment>
            <Form className="col-md-12">
                <BoardSimple
                    title={"Nuevo Sistema"}
                    prefix={<BtnBack/>}
                    bg="light"
                    info={["Crear Nuevo Sistema"]}
                    options={[]}
                >
                    <div className="card-body">
                        <div className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.name && errors.name[0] ? true : false}>
                                            <label htmlFor="">Nombre <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="name"
                                                placeholder="Ingrese el nombre del Sistema"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.name || ""}
                                            />
                                            <label>{errors.name && errors.name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.path && errors.path[0] ? true : false}>
                                            <label htmlFor="">Ruta <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="path"
                                                placeholder="Ingrese dirección del Sistema. Ejm http://ejemplo.com"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.path || ""}
                                            />
                                            <label>{errors.path && errors.path[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.imagen && errors.imagen[0] ? true : false}>
                                            <label htmlFor="">Imagen <small>(Opcional)</small></label>
                                            <InputFile id="imagen" 
                                                name="imagen" 
                                                title="Seleccionar Imagen"
                                                accept="image/*"
                                                onChange={handleFiles}
                                            />
                                            <label>{errors.imagen && errors.imagen[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.icon && errors.icon[0] ? true : false}>
                                            <label htmlFor="">Icono <small>(Opcional)</small></label>
                                            <input type="text"
                                                name="icon"
                                                placeholder="Ingrese el texto del icono"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.icon || ""}
                                            />
                                            <label>{errors.icon && errors.icon[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.icon_mobile && errors.icon_mobile[0] ? true : false}>
                                            <label htmlFor="">Icono Mobile<small>(Opcional)</small></label>
                                            <input type="text"
                                                name="icon_mobile"
                                                placeholder="Ingrese el texto del icon mobile"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.icon_mobile || ""}
                                            />
                                            <label>{errors.icon_mobile && errors.icon_mobile[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.icon_desktop && errors.icon_desktop[0] ? true : false}>
                                            <label htmlFor="">Icono Desktop<small>(Opcional)</small></label>
                                            <input type="text"
                                                name="icon_desktop"
                                                placeholder="Ingrese el texto del icon desktop"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.icon_desktop || ""}
                                            />
                                            <label>{errors.icon_desktop && errors.icon_desktop[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.email && errors.email[0] ? true : false}>
                                            <label htmlFor="">Correo Electrónico <b className="text-red">*</b></label>
                                            <input type="email"
                                                name="email"
                                                placeholder="Ingrese un correo electrónico asociado al sistema"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.email || ""}
                                            />
                                            <label>{errors.email && errors.email[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.version && errors.version[0] ? true : false}>
                                            <label htmlFor="">Versión <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="version"
                                                placeholder="Ingrese la versión del Sistema"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.version || ""}
                                            />
                                            <label>{errors.version && errors.version[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 mb-3">
                                        <Form.Field error={errors.description && errors.description[0] ? true : false}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <textarea type="text"
                                                name="description"
                                                placeholder="Ingrese una descripción del Sistema"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.description || ""}
                                            />
                                            <label>{errors.description && errors.description[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                        <i className="fas fa-info-circle"></i> Soporte
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.support_name && errors.support_name[0] ? true : false}>
                                            <label htmlFor="">Nombre <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="support_name"
                                                placeholder="Ingrese una descripción del Sistema"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.support_name || ""}
                                            />
                                            <label>{errors.support_name && errors.support_name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.support_link && errors.support_link[0] ? true : false}>
                                            <label htmlFor="">Sitio Web <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="support_link"
                                                placeholder="Ingrese una descripción del Sistema"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.support_link || ""}
                                            />
                                            <label>{errors.support_link && errors.support_link[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.support_email && errors.support_email[0] ? true : false}>
                                            <label htmlFor="">Correo <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="support_email"
                                                placeholder="Ingrese una descripción del Sistema"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.support_email || ""}
                                            />
                                            <label>{errors.support_email && errors.support_email[0]}</label>
                                        </Form.Field>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </BoardSimple>
            </Form>
            {/* panel de control */}
            <ContentControl>
                <div className="col-lg-2 col-6">
                    <Button fluid 
                        color="teal"
                        disabled={current_loading}
                        onClick={save}
                        loading={current_loading}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </ContentControl>
        </Fragment>
    )
}

// server
CreateSystem.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // render
    return { pathname, query }
}

// exportar
export default CreateSystem;