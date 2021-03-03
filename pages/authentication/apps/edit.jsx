import React, { useState, Fragment } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import atob from 'atob';
import Show from '../../../components/show';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';


const EditApp = ({ pathname, query, success, current_app }) => {

    // estados
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState(JSON.parse(JSON.stringify(current_app || {})));
    const [current_loading, setCurrentLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const [current_files, setCurrentFiles] = useState({})

    // cambiar archivos
    const handleFile = ({ name, files }) => {
        let file = files[0] || null;
        let newFiles = Object.assign({}, current_files);
        newFiles[name] = file;
        setCurrentFiles(newFiles);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // cambiar form
    const handleInput = ({ name, value }, obj = 'form') => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // actualizar datos
    const save = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en actualizar los datos?`, 'Actualizar')
        if (!answer) return false;
        setCurrentLoading(true);
        let data = new FormData();
        for(let attr in form) data.append(attr, form[attr]);
        // add files
        for(let attr in current_files) data.append(attr, current_files[attr]);
        // crear app
        await authentication.post(`app/${form.id}?_method=PUT`, data)
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
        setForm(JSON.parse(JSON.stringify(current_app || {})));
        setCurrentFiles({});
    }

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    bg="light"
                    options={[]}
                    prefix={<BtnBack/>}
                    title={<span>Editar: {form && form.name || ""}</span>}
                    info={["Editar aplicación"]}
                >
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-12">
                                        <h4><i className="fas fa-box"></i> Datos de la App</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.name && errors.name[0] ? true : false}>
                                            <label htmlFor="">Nombre <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="name"
                                                placeholder="Ingrese un nombre"
                                                value={form.name || ""}
                                                onChange={(e) => handleInput(e.target)}
                                                disabled={current_loading}
                                            />
                                            <label>{errors && errors.name && errors.name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Cliente <b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Select. Tip. Cliente"
                                                name="client_device"
                                                onChange={(e, obj) => handleInput(obj)}
                                                value={form.client_device || ""}
                                                disabled={true}
                                                options={[
                                                    { key: 'android', value: 'ANDROID', text: 'Android' },
                                                    { key: 'ios', value: 'IOS', text: 'IOS' },
                                                    { key: 'app_desktop', value: 'APP_DESKTOP', text: 'Desktop' },
                                                    { key: 'app_web', value: 'APP_WEB', text: 'App Web' },
                                                    { key: 'otro', value: 'OTRO', text: 'Otro' },
                                                ]}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="">Cover <b className="text-red">*</b></label>
                                        <Show condicion={form.cover && !current_files.cover }>
                                            <img src={form.cover && form.cover_images && form.cover_images.cover_200x200} alt="cover" className="img-content mb-2"/>
                                        </Show>
                                        <label className="btn btn-outline-file w-100" htmlFor="cover">
                                            <i className="fas fa-image"></i> {current_files.cover ? current_files.cover.name : 'Seleccionar Cover'}
                                            <input type="file"
                                                id="cover" 
                                                disabled={current_loading}
                                                onChange={(e) => handleFile(e.target)}
                                                accept="image/*"
                                                name="cover"
                                                hidden
                                            />
                                        </label>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="">icon <b className="text-red">*</b></label>
                                        <Show condicion={form.icon && !current_files.icon}>
                                            <img src={form.icon && form.icon_images && form.icon_images.icon_200x200} alt="icon" className="img-content mb-2"/>
                                        </Show>
                                        <label className="btn btn-outline-file w-100" htmlFor="icon">
                                            <i className="fas fa-image"></i> {current_files.icon ? current_files.icon.name : 'Seleccionar Icon'}
                                            <input type="file"
                                                id="icon" 
                                                name="icon"
                                                disabled={current_loading}
                                                onChange={(e) => handleFile(e.target)}
                                                accept="image/*"
                                                hidden
                                            />
                                        </label>
                                        <label>{errors && errors.icon && errors.icon[0]}</label>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.support_name && errors.support_name[0] ? true : false}>
                                            <label htmlFor="">Soporte <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="support_name"
                                                value={form.support_name || ""}
                                                disabled={current_loading}
                                                onChange={(e) => handleInput(e.target)}
                                                placeholder="Nombre del Soporte"
                                            />
                                            <label>{errors.support_name && errors.support_name[0] || ""}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6">
                                        <Form.Field error={errors.support_link && errors.support_link[0] ? true : false}>
                                            <label htmlFor="">Soporte Enlace <b className="text-red">*</b></label>
                                            <input type="text" 
                                                className="mb-3"
                                                name="support_link"
                                                value={form.support_link || ""}
                                                disabled={current_loading}
                                                onChange={(e) => handleInput(e.target)}
                                                placeholder="Página web del Soporte. Ejm http://ejemplo.com"
                                            />
                                            <label>{errors.support_link && errors.support_link[0] || ""}</label>
                                        </Form.Field>
                                    </div>


                                    <div className="col-md-6">
                                        <label className="mb-2">Archivo <b className="text-red">*</b></label>
                                        <Show condicion={form.file}>
                                            <div className="text-right mb-2">
                                                <a href={form.file} target="_blank"><i className="fas fa-download"></i> Descargar Archivo</a>
                                            </div>
                                        </Show>
                                        <label className="btn btn-outline-file w-100 mb-3" htmlFor="file">
                                            <i className="fas fa-image"></i> {current_files.file ? current_files.file.name : 'Seleccionar Archivo'}
                                            <input type="file"
                                                id="file" 
                                                name="file"
                                                disabled={current_loading}
                                                onChange={(e) => handleFile(e.target)}
                                                hidden
                                            />
                                        </label>
                                        <label>{errors && errors.file && errors.file[0] || ""}</label>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
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
EditApp.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // generar id
    let id = atob(query.id || `__error`);
    // obtener app
    let { success, app } = await authentication.get(`app/${id}?update`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, app: {} }));
    // response
    return { pathname, query, success, current_app: app };
}

// exportar
export default EditApp;