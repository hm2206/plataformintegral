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
        await this.getEntity();
    }

    getEntity = async () => {
        let { query } = this.props;
        let id = query.id ? atob(query.id) : "__error";
        this.setState({ loading: true });
        await authentication.get(`entity/${id}`)
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
        await authentication.post(`entity/${form.id}/update`, data)
        .then(async res => {
            let { success, message, entity } = res.data;
            if (!success) throw new Error(message);
            await  Swal.fire({ icon: 'success', text: message });
            await this.setState({ form: entity, old: entity, files: {}, errors: {} });
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
        let { name, slug, email, ruc, address } = this.state.form;
        return name && slug && email && ruc && address;
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors, files, loading, edit } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Editar Entidad
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end mt-4">

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.name && errors.name[0] || false}>
                                            <label htmlFor="">Nombre <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="name"
                                                className="capitalize"
                                                placeholder="Ingrese un nombre"
                                                value={form.name || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                disabled={loading}
                                            />
                                            <label>{errors && errors.name && errors.name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.slug && errors.slug[0] || false}>
                                            <label htmlFor="">Slug <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="slug"
                                                placeholder="Ingrese un slug"
                                                value={form.slug || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                disabled={true}
                                            />
                                            <label>{errors && errors.slug && errors.slug[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="">Logo <b className="text-red">*</b></label>
                                        <Show condicion={form.logo && !files.logo }>
                                            <img src={form.logo && form.logo_images && form.logo_images.logo_200x200} alt="logo" className="img-content mb-2"/>
                                        </Show>
                                        <label className="btn btn-outline-file w-100" htmlFor="logo">
                                            <i className="fas fa-image"></i> {files.logo ? files.logo.name : 'Seleccionar logo'}
                                            <input type="file"
                                                id="logo" 
                                                disabled={loading}
                                                onChange={(e) => this.handleFile(e.target)}
                                                accept="image/*"
                                                name="logo"
                                                hidden
                                            />
                                        </label>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.email && errors.email[0] || false}>
                                            <label htmlFor="">Correo Electrónico <b className="text-red">*</b></label>
                                            <input type="email" 
                                                name="email"
                                                placeholder="Ingrese el correo electrónico"
                                                value={form.email || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                disabled={loading}
                                                autoSave="Off"
                                                autoComplete="Off"
                                            />
                                            <label>{errors && errors.email && errors.email[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.ruc && errors.ruc[0]}>
                                            <label htmlFor="">RUC <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="ruc"
                                                value={form.ruc || ""}
                                                disabled={loading}
                                                onChange={(e) => this.handleInput(e.target)}
                                                placeholder="RUC de la entidad"
                                            />
                                            <label>{errors && errors.ruc && errors.ruc[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6">
                                        <Form.Field error={errors && errors.address && errors.address[0]}>
                                            <label htmlFor="">Dirección <b className="text-red">*</b></label>
                                            <textarea type="text" 
                                                className="mb-3"
                                                name="address"
                                                value={form.address || ""}
                                                disabled={loading}
                                                onChange={(e) => this.handleInput(e.target)}
                                                placeholder="Ingrese la dirección de la entidad"
                                                autoComplete="Off"
                                                autoSave="Off"
                                            />
                                            <label>{errors && errors.address && errors.address[0]}</label>
                                        </Form.Field>
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
                                            disabled={this.state.loading || !this.validate() || !edit}
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