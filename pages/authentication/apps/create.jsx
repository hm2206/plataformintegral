import React, { useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import ContentControl from '../../../components/contentControl' 
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';
import { Fragment } from 'react';


const CreateApps = ({ pathname, query }) => {

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
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
    }

    // cambiar form
    const handleInput = ({ name, value }, obj = 'form') => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // crear datos
    const save = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en actualizar los datos?`, 'Actualizar')
        if (!answer) return false;
        setCurrentLoading(true);
        let data = new FormData();
        for(let attr in form) data.append(attr, form[attr]);
        // add files
        for(let attr in current_files) data.append(attr, current_files[attr]);
        // crear app
        await authentication.post(`app`, data)
        .then(async res => {
            let { message, app } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            let { push } = Router;
            setCurrentFiles({});
            setErrors({});
            setForm({});
            push(location.href);
        }).catch(async err => {
            try {
                let { data } = err.response;
                if (typeof data != 'object') throw new Error(err.message);
                if (typeof data.errors != 'object') throw new Error(data.message || err.message);
                await Swal.fire({ icon: 'warning', text: data.message || err.message });
                setErrors(data.errors);
            } catch (error) {
                await Swal.fire({ icon: 'error', text: error.message });
            }
        });
        setCurrentLoading(false);
    }

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    bg="light"
                    title="Applicación Nueva"
                    info={["Crear aplicación"]}
                    prefix={<BtnBack/>}
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
                                            />
                                            <label>{errors && errors.name && errors.name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.client_device && errors.client_device[0] ? true : false}>
                                            <label htmlFor="">Cliente <b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Select. Tip. Cliente"
                                                name="client_device"
                                                onChange={(e, obj) => handleInput(obj)}
                                                value={form.client_device || ""}
                                                options={[
                                                    { key: 'android', value: 'ANDROID', text: 'Android' },
                                                    { key: 'ios', value: 'IOS', text: 'IOS' },
                                                    { key: 'app_desktop', value: 'APP_DESKTOP', text: 'Desktop' },
                                                    { key: 'app_web', value: 'APP_WEB', text: 'App Web' },
                                                    { key: 'otro', value: 'OTRO', text: 'Otro' },
                                                ]}
                                            />
                                            <label>{errors && errors.client_device && errors.client_device[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.cover && errors.cover[0] ? true : false}>
                                            <label htmlFor="">Cover <b className="text-red">*</b></label>
                                            <label className="btn btn-outline-file" htmlFor="cover">
                                                <i className="fas fa-image"></i> {current_files.cover ? current_files.cover.name : 'Seleccionar Cover'}
                                                <input type="file"
                                                    id="cover" 
                                                    onChange={(e) => handleFile(e.target)}
                                                    accept="image/*"
                                                    name="cover"
                                                    hidden
                                                />
                                            </label>
                                            <label>{errors && errors.cover && errors.cover[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.icon && errors.icon[0] ? true : false}>
                                            <label htmlFor="">icon <b className="text-red">*</b></label>
                                            <label className="btn btn-outline-file" htmlFor="icon">
                                                <i className="fas fa-image"></i> {current_files.icon ? current_files.icon.name : 'Seleccionar Icon'}
                                                <input type="file"
                                                    id="icon" 
                                                    name="icon"
                                                    onChange={(e) => handleFile(e.target)}
                                                    accept="image/*"
                                                    hidden
                                                />
                                            </label>
                                            <label>{errors && errors.icon && errors.icon[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.support_name && errors.support_name[0] ? true : false}>
                                            <label htmlFor="">Soporte <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="support_name"
                                                value={form.support_name || ""}
                                                onChange={(e) => handleInput(e.target)}
                                                placeholder="Nombre del Soporte"
                                            />
                                            <label>{errors.support_name && errors.support_name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.support_link && errors.support_link[0] ? true : false}>
                                            <label htmlFor="">Soporte Enlace <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="support_link"
                                                value={form.support_link || ""}
                                                onChange={(e) => handleInput(e.target)}
                                                placeholder="Página web del Soporte. Ejm http://ejemplo.com"
                                            />
                                            <label>{errors.support_link && errors.support_link[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.file && errors.file[0] ? true : false}>
                                            <label htmlFor="">Archivo <b className="text-red">*</b></label>
                                            <label className="btn btn-outline-file" htmlFor="file">
                                                <i className="fas fa-image"></i> {current_files.file ? current_files.file.name : 'Seleccionar Archivo'}
                                                <input type="file"
                                                    id="file" 
                                                    name="file"
                                                    onChange={(e) => this.handleFile(e.target)}
                                                    hidden
                                                />
                                            </label>
                                            <label>{errors.file && errors.file[0]}</label>
                                        </Form.Field>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </BoardSimple>
            </div>
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
CreateApps.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // render
    return { pathname, query }
}

// exportar
export default CreateApps;