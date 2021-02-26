import React, { useState, Fragment } from 'react';
import { BtnBack, InputFile } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';
import atob from 'atob';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl'
import dynamic from 'next/dynamic';
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false })


const EditSystem = ({ pathname, query, success, system }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [form, setForm] = useState(JSON.parse(JSON.stringify(system || {})));
    const [errors, setErrors] = useState({});
    const [current_files, setCurrentFiles] = useState({});
    const [edit, setEdit] = useState(false);

    // manejar los cambios del form
    const handleInput = ({ name, value }, obj = 'form') => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // manejador de archivos
    const handleFiles = ({ name, file }) => {
        setCurrentFiles({ ...current_files, [name]: file });
        setEdit(true);
    }

    // actualizar datos
    const save = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en actualizar los datos?`, 'Actualizar')
        if (!answer) return false;
        setCurrentLoading(true);
        let data = new FormData();
        for(let attr in form) data.append(attr, typeof form[attr] == 'object' ? JSON.stringify(form[attr]) : form[attr] || '');
        // add files
        for(let attr in current_files) data.append(attr, current_files[attr]);
        data.delete('modules');
        // crear app
        await authentication.post(`system/${form.id}?_method=PUT`, data)
        .then(async res => {
            let { message, app } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            let { push } = Router;
            setCurrentFiles({});
            setErrors({});
            setEdit(false);
            push(location.href);
        }).catch(async err => {
            try {
                let { data } = err.response;
                if (typeof data != 'object') throw new Error(err.message);
                if (typeof data.errors != 'object') throw new Error(data.message || err.message);
                await Swal.fire({ icon: 'error', text: data.message || err.message });
                setErrors(data.errors);
            } catch (error) {
                await Swal.fire({ icon: 'error', text: error.message });
            }
        });
        setCurrentLoading(false);
    }

    // cancelar
    const handleCancel = () => {
        setEdit(false);
        setForm(JSON.parse(JSON.stringify(system || {})));
        setCurrentFiles({});
    }

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    title={<span>Sistema: {system && system.name || ""}</span>}
                    prefix={<BtnBack/>}
                    bg={"light"}
                    info={["Editar sistema"]}
                    options={[]}
                >
                    <Form className="card-body">
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
                                                <Show condicion={form.image && !current_files.image}>
                                                    <img src={form.image && form.image_images && form.image_images.image_200x200} alt="image" className="img-content mb-2"/>
                                                </Show>
                                                <InputFile id="image" 
                                                    name="image" 
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

                                    <div className="col-md-12">
                                        <hr/>
                                        <i className="fas fa-cogs"></i> Configuración del envio de correos
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.config_mail_connection && errors.config_mail_connection[0] ? true : false}>
                                            <label htmlFor="">Conexión <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="config_mail_connection"
                                                placeholder="Ingrese la conexión Ejm. smtp"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.config_mail_connection || ""}
                                            />
                                            <label>{errors.config_mail_connection && errors.config_mail_connection[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6"></div>

                                    <div className="col-md-12 mb-3">
                                        <label htmlFor="">Parámetros</label>
                                        <ReactJson src={form && form.config_mail_data && form.config_mail_data || {}} 
                                            onEdit={(e) => handleInput({ name: 'config_mail_data', value: e.updated_src })}
                                            onAdd={(e) => handleInput({ name: 'config_mail_data', value: e.updated_src })}
                                            onDelete={(e) => handleInput({ name: 'config_mail_data', value: e.updated_src })}
                                            displayDataTypes={false}
                                            iconStyle="square"
                                            enableClipboard={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                </BoardSimple>
            </div>
            {/* panel de control */}
            <Show condicion={edit}>
                <ContentControl>
                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="red"
                            onClick={handleCancel}
                            disabled={current_loading}
                        >
                            <i className="fas fa-times"></i> Cancelar
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="blue"
                            disabled={current_loading}
                            onClick={save}
                            loading={current_loading}
                        >
                            <i className="fas fa-sync"></i> Actualizar
                        </Button>
                    </div>
                </ContentControl>
            </Show>
        </Fragment>
    )
}

// server
EditSystem.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx
    let id = atob(query.id) || '__error';
    let { success, system } = await authentication.get(`system/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, system: {} }))
    // response
    return { pathname, query, success, system };
}
    
// exportar
export default EditSystem;