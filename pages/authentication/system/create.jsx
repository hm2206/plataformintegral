import React, { Component } from 'react';
import { Body, BtnBack, InputFile } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';


export default class CreateSystem extends Component
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
        errors: {},
        files: {}
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
        let data = new FormData;
        let { form, files } = this.state;
        for(let attr in form) data.append(attr, form[attr]);
        // add files
        for(let attr in files) data.append(attr, files[attr]);
        // crear sistema
        await authentication.post('system', data)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            this.setState({ form: {}, errors: {}, files: {} })
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
        let { module_id } = this.state.form;
        return module_id;
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Sistema
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
                                        <Form.Field error={errors && errors.icon && errors.icon[0] || false}>
                                            <label htmlFor="">Icono <small>(Opcional)</small></label>
                                            <InputFile id="icon" 
                                                name="icon" 
                                                title="Seleccionar Icono"
                                                accept="image/*"
                                                onChange={(obj) => {
                                                    this.setState(state => {
                                                        state.files[obj.name] = obj.file;
                                                        return { files: state.files };
                                                    })
                                                }}
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

                                    <div className="col-md-6 mb-3">
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
                                    </div>

                                    <div className="col-md-2">
                                        <Button color="teal" fluid
                                            disabled={this.state.loading}
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