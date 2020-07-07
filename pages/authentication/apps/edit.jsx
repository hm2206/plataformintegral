import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import atob from 'atob';
import Show from '../../../components/show';


export default class EditApp extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        edit: false,
        planillas: [],
        type_cargos: [],
        old: {},
        form: {},
        files: {},
        errors: {},
        check: false,
        person: {}
    }

    componentWillMount = async () => {
        await this.getApp();
    }

    getApp = async () => {
        let { query } = this.props;
        let id = query.id ? atob(query.id) : "__error";
        this.setState({ loading: true });
        await authentication.get(`app/${id}/show`)
        .then(res => this.setState({ form: res.data, old: res.data }))
        .catch(err => this.setState({ form: {} }));
        this.setState({ loading: false });
    }

    handleFile = ({ name, files }) => {
        let file = files[0] || null;
        this.setState(state => {
            state.files[name] = file;
            return { files: state.files, edit: true }; 
        });
    }


    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors, edit: true };
        });
    }

    save = async () => {
        this.setState({ loading: true });
        let data = new FormData();
        let { form, files } = this.state;
        for(let attr in form) data.append(attr, form[attr]);
        // add files
        for(let attr in files) data.append(attr, files[attr]);
        // crear app
        await authentication.post(`app/${form.id}/update`, data)
        .then(async res => {
            let { success, message, app } = res.data;
            if (!success) throw new Error(message);
            await  Swal.fire({ icon: 'success', text: message });
            await this.setState({ form: app, files: {}, errors: {} });
        })
        .catch(async err => {
            try {
                let response = JSON.parse(err.message);
                await Swal.fire({ icon: 'error', text: response.message });
                await this.setState({ errors: response.errors });
            } catch (error) {
                await Swal.fire({ icon: 'error', text: err.message });
            }
        });
        this.setState({ loading: false });
    }

    validate = () => {
        let { name, client_device } = this.state.form;
        return name && client_device;
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors, files, loading } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Editar App
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-12">
                                        <h4><i className="fas fa-box"></i> Datos de la App</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.name && errors.name[0] || false}>
                                            <label htmlFor="">Nombre <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="name"
                                                placeholder="Ingrese un nombre"
                                                value={form.name || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                disabled={loading}
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
                                                onChange={(e, obj) => this.handleInput(obj)}
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
                                        <Show condicion={form.cover && !files.cover }>
                                            <img src={form.cover && form.cover_images && form.cover_images.cover_200x200} alt="cover" className="img-content mb-2"/>
                                        </Show>
                                        <label className="btn btn-outline-file w-100" htmlFor="cover">
                                            <i className="fas fa-image"></i> {files.cover ? files.cover.name : 'Seleccionar Cover'}
                                            <input type="file"
                                                id="cover" 
                                                disabled={loading}
                                                onChange={(e) => this.handleFile(e.target)}
                                                accept="image/*"
                                                name="cover"
                                                hidden
                                            />
                                        </label>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="">icon <b className="text-red">*</b></label>
                                        <Show condicion={form.icon && !files.icon}>
                                            <img src={form.icon && form.icon_images && form.icon_images.icon_200x200} alt="icon" className="img-content mb-2"/>
                                        </Show>
                                        <label className="btn btn-outline-file w-100" htmlFor="icon">
                                            <i className="fas fa-image"></i> {files.icon ? files.icon.name : 'Seleccionar Icon'}
                                            <input type="file"
                                                id="icon" 
                                                name="icon"
                                                disabled={loading}
                                                onChange={(e) => this.handleFile(e.target)}
                                                accept="image/*"
                                                hidden
                                            />
                                        </label>
                                        <label>{errors && errors.icon && errors.icon[0]}</label>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.support_name && errors.support_name[0]}>
                                            <label htmlFor="">Soporte <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="support_name"
                                                value={form.support_name || ""}
                                                disabled={loading}
                                                onChange={(e) => this.handleInput(e.target)}
                                                placeholder="Nombre del Soporte"
                                            />
                                            <label>{errors && errors.support_name && errors.support_name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6">
                                        <Form.Field error={errors && errors.support_link && errors.support_link[0]}>
                                            <label htmlFor="">Soporte Enlace <b className="text-red">*</b></label>
                                            <input type="text" 
                                                className="mb-3"
                                                name="support_link"
                                                value={form.support_link || ""}
                                                disabled={loading}
                                                onChange={(e) => this.handleInput(e.target)}
                                                placeholder="Página web del Soporte. Ejm http://ejemplo.com"
                                            />
                                            <label>{errors && errors.support_link && errors.support_link[0]}</label>
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
                                            <i className="fas fa-image"></i> {files.file ? files.file.name : 'Seleccionar Archivo'}
                                            <input type="file"
                                                id="file" 
                                                name="file"
                                                disabled={loading}
                                                onChange={(e) => this.handleFile(e.target)}
                                                hidden
                                            />
                                        </label>
                                        <label>{errors && errors.file && errors.file[0]}</label>
                                    </div>

                                    <div className="col-md-12 mt-5">
                                        <hr/>
                                    </div>

                                    <div className="col-md-4 text-right">
                                        <Show condicion={this.state.edit}> 
                                            <Button color="red"
                                                disabled={this.state.loading}
                                                onClick={(e) => this.setState(state => ({ form: state.old, edit: false, files: {}, errors: {} }))}
                                            >
                                                <i className="fas fa-times"></i> Cancelar
                                            </Button>
                                        </Show>

                                        <Button color="teal"
                                            disabled={this.state.loading || !this.validate()}
                                            onClick={this.save}
                                            loading={this.state.loading}
                                        >
                                            <i className="fas fa-save"></i> Guardar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </Body>
            </div>
        )
    }
    
}