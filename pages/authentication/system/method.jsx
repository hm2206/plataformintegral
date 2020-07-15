import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions, Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, List, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';


export default class SystemMethod extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        method: {
            page: 1,
            last_page: 1,
            data: []
        },
        system: {},
        current: {},
        form: {
            action_type: "ALL"
        },
        errors: {},
        check: false,
        block: false,
        edit: false
    }

    componentDidMount = async () => {
        await this.findSystem();
        this.getMethod();
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

    getMethod = async (changed = false) => {
        let { system, method, form } = this.state;
        await authentication.get(`system/${system.id}/method?page=${method.page}&query_search=${form.query_search || ""}&action_type=${form.action_type || ""}`)
        .then(res => this.setState(state => {
            let { data, page, lastPage } = res.data;
            state.method.page = page || state.method.pate;
            state.method.last_page = lastPage || state.method.last_page;
            state.method.data = changed ? data || [] : [...state.method.data, ...data];
            return { method: state.method }
        }))
        .catch(err => console.log(err.message));
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj };
        });
    }

    validate = () => {
        let { name, description } = this.state.form;
        return name && description;
    }

    render() {

        let { pathname, query } = this.props;
        let { system, form, errors, block, edit, method } = this.state;
        let is_app = Object.keys(system).length;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Gestionar Metodos
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center" onSubmit={(e) => e.preventDefault()}>
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
                                            <label htmlFor="">Ruta</label>
                                            <input type="text" 
                                                name="name"
                                                placeholder="Ingrese la ruta"
                                                value={system.path || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                disabled={true}
                                            />
                                        </Form.Field>
                                    </div>

                                    <Show condicion={is_app}>
                                        <div className="col-md-12 mb-3 mt-5">
                                            <hr/>
                                            <label><i className="fas fa-list"></i> Métodos de <b>"{system.name || ""}"</b></label>
                                            <hr/>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <input type="text"
                                                placeholder="Buscar Método"
                                                name="query_search"
                                                value={form.query_search || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <Select
                                                fluid
                                                options={[
                                                    { key: 'ALL', value: "ALL", text: "TODOS" },
                                                    { key: 'CREATE', value: "CREATE", text: "CREAR" },
                                                    { key: 'UPDATE', value: "UPDATE", text: "ACTUALIZAR" },
                                                    { key: 'DELETE', value: "DELETE", text: "ELIMINAR" },
                                                    { key: 'UPLOAD', value: "UPLOAD", text: "SUBIR FILE" },
                                                    { key: 'DOWNLOAD', value: "DOWNLOAD", text: "DESCARGAR FILE" },
                                                    { key: 'OTRO', value: "OTRO", text: "OTRA ACCIÓN" }
                                                ]}
                                                name="action_type"
                                                value={form.action_type || "ALL"}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </div>

                                        <div className="col-md-2 mb-3">
                                            <Button fluid
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    await this.setState(state => {
                                                        state.method.page = 1;
                                                        return { method: state.method }
                                                    });
                                                    // send
                                                    this.props.fireLoading(true);
                                                    await this.getMethod(true);
                                                    this.props.fireLoading(false);
                                                }}
                                            >
                                                <i className="fas fa-search"></i>
                                            </Button>
                                        </div>

                                        <div className="col-md-12">
                                            <List divided verticalAlign='middle'>
                                            {method.data.map((obj, index) => 
                                                    <List.Item key={`list-categoria-${obj.id}`}>
                                                        <List.Content>
                                                            <div className="row">
                                                                <div className="col-md-12 capitalize mb-2">
                                                                        <input type="text"
                                                                            name="name"
                                                                            className="bg-dark text-white"
                                                                            disabled={true}
                                                                            value={obj.name || ""}
                                                                            placeholder="ingrese el nombre"
                                                                            readOnly
                                                                        />
                                                                </div>
                                                            
                                                                <div className="col-md-10 capitalize mb-2">
                                                                        <textarea type="text"
                                                                            disabled={true}
                                                                            value={`${obj.url || ""}`}
                                                                            placeholder="ingrese la url"
                                                                            id={`url-${obj.id}`}
                                                                            readOnly
                                                                        />
                                                                </div>

                                                                <div className="col-md-2">
                                                                    <Button fluid
                                                                        onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            let input = document.createElement('input');
                                                                            let copy = `${system.path}/${obj.url}`
                                                                            input.setAttribute('value', copy);
                                                                            document.body.appendChild(input);
                                                                            input.select();
                                                                            let result = document.execCommand('copy');
                                                                            document.body.removeChild(input);
                                                                            await Swal.fire({ icon: 'success', text: `Se acaba de copiar: ${copy}` });
                                                                            return result;
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-copy"></i>
                                                                    </Button>
                                                                </div>

                                                                <div className="col-md-12 capitalize mb-2">
                                                                        <input type="text"
                                                                            disabled={true}
                                                                            value={obj.action_type || ""}
                                                                            placeholder="ingrese la url"
                                                                            readOnly
                                                                        />
                                                                </div>

                                                                <div className="col-md-12 mb-5">
                                                                        <textarea type="text"
                                                                            disabled={block}
                                                                            value={obj.description || ""}
                                                                            placeholder="Sin descripción"
                                                                            disabled={!obj.edit}
                                                                            readOnly
                                                                        />
                                                                </div>
                                                            </div>
                                                        </List.Content>
                                                    </List.Item>
                                                )}
                                            </List> 
                                                
                                            <Button fluid
                                                disabled={this.state.loading || method.page >= method.last_page || !method.last_page}
                                                onClick={(async e => {
                                                    await this.setState(state => {
                                                        state.method.page = state.method.page + 1; 
                                                        return { method: state.method }
                                                    });
                                                    // start
                                                    this.props.fireLoading(true);
                                                    // processing
                                                    await this.getMethod();
                                                    // end
                                                    this.props.fireLoading(false);
                                                })}
                                            >
                                                Obtener más registros
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