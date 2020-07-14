import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions, Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, List } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';


export default class SystemModule extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        system: {},
        current: {},
        form: {},
        errors: {},
        check: false,
        block: false,
        edit: false
    }

    componentDidMount = async () => {
        await this.findSystem();
    }

    componentWillUpdate = async (nextProps, nextState) => {
        let { state } = this;
        if (state.form.system_id != nextState.form.system_id) await this.findSystem(nextState.form.system_id);
    }

    findSystem = async () => {
        this.props.fireLoading(true);
        let { query } = this.props;
        let id = query.id ? atob(query.id) : '__error';
        await authentication.get(`system/${id}`)
        .then(res => this.setState({ system: res.data }))
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors };
        });
    }

    handleInputEdit = ({ name, value }, obj, index) => {
        this.setState((state, props) => {
            obj[name] = value;
            // assign 
            state.system.modules[index] = obj;
            return { system: state.system };
        });
    }

    handleEdit = (obj, index, cancel = false) => {
        this.setState(state => {
            let edit = obj.edit ? false : true;
            obj = cancel ? state.current : obj;
            obj.edit = edit;
            state.system.modules[index] = obj;
            state.current = cancel ? {} : JSON.parse(JSON.stringify(obj));
            return { edit: obj.edit, system: state.system, current: state.current };
        });
    }

    add = async () => {
        let answer = await Confirm("warning", `¿Deseas guardar los datos?`, 'Guardar');
        if (answer) {
            this.setState({ loading: true });
            let { form, system } = this.state;
            form.system_id = system.id;
            await authentication.post(`module`,form)
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                this.setState({ form: {} });
                await Swal.fire({ icon: 'success', text: message });
            })
            .catch(async err => {
                try {
                    let { message, errors } = JSON.parse(err.message);
                    this.setState({ errors });
                    await Swal.fire({ icon: 'warning', text: message });
                } catch (error) {
                    await Swal.fire({ icon: 'error', text: err.message });
                }
            });
            this.setState({ loading: false });
        }
    }

    update = async (obj) => {
        this.setState({ loading: true, block: true });
        await authentication.post(`module/${obj.id}/update`, obj)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            await this.findSystem();
        }).catch(async err => {
            await Swal.fire({ icon: 'error', text: err.message });
        });
        this.setState({ loading: false, block: false, edit: false });
    }

    validate = () => {
        let { name, description } = this.state.form;
        return name && description;
    }

    render() {

        let { pathname, query } = this.props;
        let { system, form, errors, block, edit } = this.state;
        let is_app = Object.keys(system).length;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Agregar Modulo
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-12">
                                        <h4><i className="fas fa-box"></i> Datos de Sistema</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Nombre</label>
                                            <input type="text" 
                                                name="client-id"
                                                placeholder="Ingrese un nombre"
                                                value={system.name || ""}
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
                                                value={system.email || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                disabled={true}
                                            />
                                        </Form.Field>
                                    </div>

                                    <Show condicion={is_app}>
                                        {/* crear */}
                                        <div className="col-md-12 mt-5">
                                            <hr/>
                                            <label><i className="fas fa-plus"></i> Agregar Modulo a <b>"{system.name || ""}"</b></label>
                                            <hr/>
                                        </div>

                                        <div className="col-md-6">
                                            <Form.Field error={errors.name && errors.name[0] || false}>
                                                <label>Nombre <b className="text-red">*</b></label>
                                                <input type="text"
                                                    placeholder="Ingrese un nombre"
                                                    name="name"
                                                    value={form.name || ""}
                                                    onChange={(e) => this.handleInput(e.target)} 
                                                    disabled={this.state.loading}
                                                />
                                                <label>{errors.name && errors.name[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6">
                                            <Form.Field error={errors.description && errors.description[0] || false}>
                                                <label>Descripción <b className="text-red">*</b></label>
                                                <input type="text"
                                                    placeholder="Ingrese la descripción"
                                                    name="description"
                                                    value={form.description || ""}
                                                    onChange={(e) => this.handleInput(e.target)} 
                                                    disabled={this.state.loading}
                                                />
                                                <label>{errors.description && errors.description[0]}</label>
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

                                        <div className="col-md-12 mb-3 mt-5">
                                            <hr/>
                                            <label><i className="fas fa-list"></i> Modulos de <b>"{system.name || ""}"</b></label>
                                            <hr/>
                                        </div>

                                        <div className="col-md-12">
                                            <List divided verticalAlign='middle'>
                                            {system.modules && system.modules.length && system.modules.map((obj, index) => 
                                                    <List.Item key={`list-categoria-${obj.id}`}>
                                                        <List.Content>
                                                            <div className="row">
                                                                <div className="col-md-3 capitalize mb-2">
                                                                    <Form.Field>
                                                                        <input type="text"
                                                                            name="name"
                                                                            disabled={block}
                                                                            value={obj.name || ""}
                                                                            placeholder="ingrese el nombre"
                                                                            disabled={!obj.edit}
                                                                            onChange={(e) => this.handleInputEdit(e.target, obj, index)}
                                                                        />
                                                                    </Form.Field>
                                                                </div>
                                                                <div className="col-md-5 mb-2">
                                                                    <Form.Field>
                                                                        <input type="text"
                                                                            name="description"
                                                                            disabled={block}
                                                                            value={obj.description || ""}
                                                                            placeholder="ingrese la descripción"
                                                                            disabled={!obj.edit}
                                                                            onChange={(e) => this.handleInputEdit(e.target, obj, index)}
                                                                        />
                                                                    </Form.Field>
                                                                </div>

                                                                <div className="col-md-4 text-right mb-2">
                                                                    <Show condicion={!obj.edit}>
                                                                        <Button 
                                                                            className="mt-1"
                                                                            title="Editar"
                                                                            color='green'
                                                                            basic
                                                                            disabled={edit || block}
                                                                            onClick={(e) => this.handleEdit(obj, index)}
                                                                        >
                                                                            <i className={`fas fa-pencil-alt`}></i>
                                                                        </Button>
                                                                    </Show>

                                                                    <Show condicion={obj.edit}>
                                                                        <Button color={'green'}
                                                                            className="mt-1"
                                                                            title="Guardar"
                                                                            disabled={block || !obj.name || !obj.description}
                                                                            onClick={(e) => this.update(obj)}
                                                                        >
                                                                            <i className={`fas fa-save`}></i>
                                                                        </Button>

                                                                        <Button color={'red'}
                                                                            className="mt-1"
                                                                            title="Cancelar"
                                                                            disabled={block}
                                                                            onClick={(e) => this.handleEdit(obj, index, true)}
                                                                        >
                                                                            <i className={`fas fa-times`}></i>
                                                                        </Button>
                                                                    </Show>
                                                                </div>
                                                            </div>
                                                        </List.Content>
                                                    </List.Item>
                                                )}
                                            </List>    
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