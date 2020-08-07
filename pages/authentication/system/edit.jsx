import React, { Component } from 'react';
import { Body, BtnBack, InputFile } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';
import dynamic from 'next/dynamic';

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false })


export default class EditSystem extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        edit: false,
        loading: false,
        planillas: [],
        type_cargos: [],
        old: {},
        form: {},
        errors: {},
        files: {}
    }


    componentDidMount = async () => {
        await this.findSystem();
    }


    findSystem = async () => {
        this.props.fireLoading(true);
        let { query } = this.props;
        let id = query.id ? atob(query.id) : '__error';
        await authentication.get(`system/${id}`)
        .then(res => this.setState({ form: res.data, old: res.data }))
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
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
        let data = new FormData;
        let { form, files } = this.state;
        // add payload
        data.append('name', form.name);
        data.append('path', form.path);
        data.append('icon', form.icon);
        data.append('email', form.email);
        data.append('version', form.version);
        data.append('description', form.description);
        data.append('support_name', form.support_name);
        data.append('support_link', form.support_link);
        data.append('support_email', form.support_email);
        data.append('config_mail_connection',  form.config_mail_connection)
        data.append('config_mail_data',  form.config_mail_data)
        // add files
        for(let attr in files) data.append(attr, files[attr]);
        // crear sistema
        await authentication.post(`system/${form.id}/update`, data)
        .then(async res => {
            let { success, message, system } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            this.setState({ form: system, old: system, errors: {}, files: {}, edit: false })
        })
        .catch(err => {
            try {
                let response = JSON.parse(err.message);
                Swal.fire({ icon: 'warning', text: response.message });
                this.setState({ errors: response.errors });
            } catch (error) {
                Swal.fire({ icon: 'error', text: err.message });
            }
        })
        this.setState({ loading: false });
    }

    validate = () => {
        let { name, path, icon, email, version, description, support_name, support_link, support_email } = this.state.form;
        return name && path, icon && email && version && description && support_name && support_link && support_email;
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors, files } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Editar Sistema
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.name && errors.name[0] || false}>
                                            <label htmlFor="">Nombre <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="name"
                                                placeholder="Ingrese el nombre del Sistema"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.name || ""}
                                            />
                                            <label>{errors && errors.name && errors.name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.path && errors.path[0] || false}>
                                            <label htmlFor="">Ruta <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="path"
                                                placeholder="Ingrese dirección del Sistema. Ejm http://ejemplo.com"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.path || ""}
                                            />
                                            <label>{errors && errors.path && errors.path[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.imagen && errors.imagen[0] || false}>
                                            <label htmlFor="">Imagen <small>(Opcional)</small></label>
                                            <Show condicion={form.image && !files.image}>
                                                <img src={form.image && form.image_images && form.image_images.image_200x200} alt="image" className="img-content mb-2"/>
                                            </Show>
                                            <InputFile id="image" 
                                                name="image" 
                                                title="Seleccionar Imagen"
                                                accept="image/*"
                                                onChange={(obj) => {
                                                    this.setState(state => {
                                                        state.files[obj.name] = obj.file;
                                                        return { files: state.files, edit: true };
                                                    })
                                                }}
                                            />
                                            <label>{errors && errors.imagen && errors.imagen[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.icon && errors.icon[0] || false}>
                                            <label htmlFor="">Icono <small>(Opcional)</small></label>
                                            <input type="text"
                                                name="icon"
                                                placeholder="Ingrese el texto del icono"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.icon || ""}
                                            />
                                            <label>{errors && errors.icon && errors.icon[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.email && errors.email[0] || false}>
                                            <label htmlFor="">Correo Electrónico <b className="text-red">*</b></label>
                                            <input type="email"
                                                name="email"
                                                placeholder="Ingrese un correo electrónico asociado al sistema"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.email || ""}
                                            />
                                            <label>{errors && errors.email && errors.email[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.version && errors.version[0] || false}>
                                            <label htmlFor="">Versión <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="version"
                                                placeholder="Ingrese la versión del Sistema"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.version || ""}
                                            />
                                            <label>{errors && errors.version && errors.version[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 mb-3">
                                        <Form.Field error={errors && errors.description && errors.description[0] || false}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <textarea type="text"
                                                name="description"
                                                placeholder="Ingrese una descripción del Sistema"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.description || ""}
                                            />
                                            <label>{errors && errors.description && errors.description[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                        <i className="fas fa-info-circle"></i> Soporte
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.support_name && errors.support_name[0] || false}>
                                            <label htmlFor="">Nombre <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="support_name"
                                                placeholder="Ingrese una descripción del Sistema"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.support_name || ""}
                                            />
                                            <label>{errors && errors.support_name && errors.support_name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.support_link && errors.support_link[0] || false}>
                                            <label htmlFor="">Sitio Web <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="support_link"
                                                placeholder="Ingrese una descripción del Sistema"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.support_link || ""}
                                            />
                                            <label>{errors && errors.support_link && errors.support_link[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.support_email && errors.support_email[0] || false}>
                                            <label htmlFor="">Correo <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="support_email"
                                                placeholder="Ingrese una descripción del Sistema"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.support_email || ""}
                                            />
                                            <label>{errors && errors.support_email && errors.support_email[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                        <i className="fas fa-cogs"></i> Configuración del envio de correos
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.config_mail_connection && errors.config_mail_connection[0] || false}>
                                            <label htmlFor="">Conexión <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="config_mail_connection"
                                                placeholder="Ingrese la conexión Ejm. smtp"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.config_mail_connection || ""}
                                            />
                                            <label>{errors && errors.config_mail_connection && errors.config_mail_connection[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6"></div>

                                    <div className="col-md-12 mb-3">
                                        <label htmlFor="">Parámetros</label>
                                        <ReactJson src={form && form.config_mail_data && JSON.parse(form.config_mail_data) || {}} 
                                            onEdit={(e) => this.handleInput({ name: 'config_mail_data', value: JSON.stringify(e.updated_src) })}
                                            onAdd={(e) => this.handleInput({ name: 'config_mail_data', value: JSON.stringify(e.updated_src) })}
                                            onDelete={(e) => this.handleInput({ name: 'config_mail_data', value: JSON.stringify(e.updated_src) })}
                                            displayDataTypes={false}
                                            iconStyle="square"
                                            enableClipboard={false}
                                        />
                                    </div>

                                    <div className="col-md-12">
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
                                            disabled={this.state.loading || !this.validate() || !this.state.edit}
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