import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { RequestParse } from 'validator-error-adonis';
import { AUTHENTICATE } from '../../../services/auth';


export default class CreateApps extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        planillas: [],
        type_cargos: [],
        form: {},
        files: {},
        errors: {},
        check: false,
        person: {}
    }


    handleFile = ({ name, files }) => {
        let file = files[0];
        this.setState(state => {
            state.files[name] = file;
            return { files: state.files }; 
        });
    }


    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors };
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
        await authentication.post('app', data)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            Swal.fire({ icon: 'success', text: message });
            this.setState({ form: {}, errors: {}, files: {} });
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
        let { form, errors, files } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Nueva App
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
                                            />
                                            <label>{errors && errors.name && errors.name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.client_device && errors.client_device[0] || false}>
                                            <label htmlFor="">Cliente <b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Select. Tip. Cliente"
                                                name="client_device"
                                                onChange={(e, obj) => this.handleInput(obj)}
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
                                        <Form.Field error={errors && errors.cover && errors.cover[0]}>
                                            <label htmlFor="">Cover <b className="text-red">*</b></label>
                                            <label className="btn btn-outline-file" htmlFor="cover">
                                                <i className="fas fa-image"></i> {files.cover ? files.cover.name : 'Seleccionar Cover'}
                                                <input type="file"
                                                    id="cover" 
                                                    onChange={(e) => this.handleFile(e.target)}
                                                    accept="image/*"
                                                    name="cover"
                                                    hidden
                                                />
                                            </label>
                                            <label>{errors && errors.cover && errors.cover[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.icon && errors.icon[0]}>
                                            <label htmlFor="">icon <b className="text-red">*</b></label>
                                            <label className="btn btn-outline-file" htmlFor="icon">
                                                <i className="fas fa-image"></i> {files.icon ? files.icon.name : 'Seleccionar Icon'}
                                                <input type="file"
                                                    id="icon" 
                                                    name="icon"
                                                    onChange={(e) => this.handleFile(e.target)}
                                                    accept="image/*"
                                                    hidden
                                                />
                                            </label>
                                            <label>{errors && errors.icon && errors.icon[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.support_name && errors.support_name[0]}>
                                            <label htmlFor="">Soporte <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="support_name"
                                                value={form.support_name || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                placeholder="Nombre del Soporte"
                                            />
                                            <label>{errors && errors.support_name && errors.support_name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.support_link && errors.support_link[0]}>
                                            <label htmlFor="">Soporte Enlace <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="support_link"
                                                value={form.support_link || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                placeholder="Página web del Soporte. Ejm http://ejemplo.com"
                                            />
                                            <label>{errors && errors.support_link && errors.support_link[0]}</label>
                                        </Form.Field>
                                    </div>


                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.file && errors.file[0]}>
                                            <label htmlFor="">Archivo <b className="text-red">*</b></label>
                                            <label className="btn btn-outline-file" htmlFor="file">
                                                <i className="fas fa-image"></i> {files.file ? files.file.name : 'Seleccionar Archivo'}
                                                <input type="file"
                                                    id="file" 
                                                    name="file"
                                                    onChange={(e) => this.handleFile(e.target)}
                                                    hidden
                                                />
                                            </label>
                                            <label>{errors && errors.file && errors.file[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                    </div>

                                    <div className="col-md-2 text-right">
                                        <Button color="teal" fluid
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