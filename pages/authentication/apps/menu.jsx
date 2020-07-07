import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions, Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';


export default class MenuApp extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        config_modules: [],
        systems: [],
        modules: [],
        app: {},
        form: {},
        errors: {},
        check: false,
    }

    componentDidMount = async () => {
        await this.findApp();
        this.getConfigModules();
        this.getSystem(1);
    }

    componentWillUpdate = async (nextProps, nextState) => {
        let { state } = this;
        if (state.form.system_id != nextState.form.system_id) await this.findSystem(nextState.form.system_id);
    }

    findApp = async () => {
        let { query } = this.props;
        let id = query.id ? atob(query.id) : "__error";
        this.setState({ loading: true });
        await authentication.get(`app/${id}/show`)
        .then(res => this.setState({ app: res.data }))
        .catch(err => this.setState({ app: {} }));
        this.setState({ loading: false });
    }

    getConfigModules = async () => {
        this.setState({ loading: true });
        let { app } = this.state;
        await authentication.get(`app/${app.id}/config_module`)
        .then(res => this.setState({ config_modules: res.data }))
        .catch(err => this.setState({ config_modules: [] }));
        this.setState({ loading: false });
    }

    getSystem = async (tmpPage = 1) => {
        this.setState({ loading: true });
        await authentication.get(`system?page=${tmpPage}`)
        .then(async res => {
            let { data, page, lastPage } = res.data;
            let validate = (page + 1) <= lastPage;
            await this.setState(state => ({ systems: [...state.systems, ...data] }));
            if (validate) {
                await this.getSystem(page + 1);
            }
        })
        .catch(err => console.log(err.message))
        this.setState({ loading: false });
    }

    findSystem = async (id) => {
        this.setState({ loading: true, modules: [] });
        await authentication.get(`system/${id}`)
        .then(async res =>  this.setState({ modules: res.data.modules || [] }))
        .catch(err => console.log(err.message))
        this.setState({ loading: false });
        this.handleInput({ name: 'module_id', value: "" });
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors };
        });
    }

    add = async () => {
        let answer = await Confirm("warning", `¿Deseas guardar los datos?`, 'Guardar');
        if (answer) {
            this.setState({ loading: true });
            let { form, app } = this.state;
            form.app_id = app.id;
            await authentication.post(`config_module`,form)
            .then(res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                this.setState({ form: {} });
                Swal.fire({ icon: 'success', text: message });
            })
            .catch(err => {
                try {
                    let { message, errors } = JSON.parse(err.message);
                    this.setState({ errors });
                    Swal.fire({ icon: 'warning', text: message });
                } catch (error) {
                    Swal.fire({ icon: 'error', text: err.message });
                }
            });
            this.setState({ loading: false });
        }
    }

    validate = () => {
        let { module_id, system_id, icon, slug } = this.state.form;
        return module_id && system_id && icon && slug;
    }

    render() {

        let { pathname, query } = this.props;
        let { app, form, errors, config_modules, systems, modules } = this.state;
        let is_app = Object.keys(app).length;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Agregar Menu
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
                                        <Form.Field>
                                            <label htmlFor="">Client ID</label>
                                            <input type="text" 
                                                name="client-id"
                                                placeholder="Ingrese un nombre"
                                                value={app.client_id || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                disabled={true}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Nombre</label>
                                            <input type="text" 
                                                name="name"
                                                placeholder="Ingrese un nombre"
                                                value={app.name || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                disabled={true}
                                            />
                                        </Form.Field>
                                    </div>

                                    <Show condicion={is_app}>
                                        <div className="col-md-12 mb-3">
                                            <label>Menu de <b>"{app.name || ""}"</b></label> <br/>
                                            {config_modules.map(per => 
                                                <small className="badge badge-warning ml-1" key={`menu-${per.id}`}
                                                    style={{ cursor: 'pointer' }}
                                                    title="Quitar Menu"
                                                >
                                                    {per.system} - {per.name}
                                                </small>     
                                            )}
                                            <hr/>
                                        </div>

                                        <div className="col-md-6">
                                            <Form.Field>
                                                <label>Sistema <b className="text-red">*</b></label>
                                                <Select
                                                    fluid
                                                    placeholder="Select. Sistema"
                                                    options={parseOptions(systems, ["select-sys", "", "Select. Sistema"], ["id", "id", "name"])}
                                                    name="system_id"
                                                    value={form.system_id || ""}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                    disabled={this.state.loading}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6">
                                            <Form.Field error={errors.module_id && errors.module_id[0] || false}>
                                                <label>Modulo <b className="text-red">*</b></label>
                                                <Select
                                                    fluid
                                                    placeholder="Select. Modulo"
                                                    options={parseOptions(modules, ["select-mod", "", "Select. Modulo"], ["id", "id", "name"])}
                                                    name="module_id"
                                                    disabled={this.state.loading || !form.system_id}
                                                    value={form.module_id || ""}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                />
                                                <label>{errors.module_id && errors.module_id[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mt-3">
                                            <Form.Field error={errors.icon && errors.icon[0] || false}>
                                                <label>Icono <b className="text-red">*</b></label>
                                                <input type="text"
                                                    placeholder="Icono"
                                                    name="icon"
                                                    value={form.icon || ""}
                                                    onChange={(e) => this.handleInput(e.target)} 
                                                    disabled={this.state.loading}
                                                />
                                                <label>{errors.icon && errors.icon[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mt-3">
                                            <Form.Field error={errors.slug && errors.slug[0] || false}>
                                                <label>Slug <b className="text-red">*</b></label>
                                                <input type="text"
                                                    placeholder="Slug"
                                                    name="slug"
                                                    value={form.slug || ""}
                                                    onChange={(e) => this.handleInput(e.target)} 
                                                    disabled={this.state.loading}
                                                />
                                                <label>{errors.slug && errors.slug[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-12 text-right mt-3">
                                            <hr/>
                                            <Button color="teal"
                                                loading={this.state.loading}
                                                disabled={this.state.loading || !this.validate()}
                                                onClick={this.add}
                                            >
                                                <i className="fas fa-save"></i> Guardar
                                            </Button>
                                        </div>
                                    </Show>
                                </div>
                            </div>
                        </Form>
                    </div>
                </Body>
            </div>
        )
    }
    
}