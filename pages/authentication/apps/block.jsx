import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select, Checkbox, List, Image } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import atob from 'atob';
import Show from '../../../components/show';


export default class BlockApp extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        edit: false,
        block: 1,
        query_search: "",
        planillas: [],
        method: {
            next: false,
            page: 1,
            last_page: 1,
            data: []
        },
        old: {},
        form: {},
        files: {},
        errors: {},
        check: false,
        person: {}
    }

    componentWillMount = async () => {
        await this.getApp();
        this.getMethodApp();
    }

    componentDidUpdate = async (prevProps, prevState) => {
        let { block } = this.state;
        if (block != prevState.block) this.getMethodApp(true);
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

    getMethodApp = async (changed = false) => {
        this.setState({ loading: true });
        if (changed) await this.setState({ method: { next: false, page: 1, last_page: 1, data: [] } });
        let { form, block, method, query_search } = this.state;
        await authentication.get(`app/${form.id}/block?block=${block}&page=${method.page}&query_search=${query_search}`)
        .then(res => {
            let { data, lastPage, page } = res.data;
            this.setState(state => {
                state.method.data = changed ? data : [...state.method.data, ...data];
                state.method.page = page + 1;
                state.method.last_page = lastPage;
                state.method.next = lastPage > page;
                return { method: state.method };
            });
        }).catch(err => console.log(err.message))
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
        let { form, errors, files, loading, method } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Restricciones de la App
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
                                            <label htmlFor="">Nombre</label>
                                            <input type="text" 
                                                name="name"
                                                placeholder="Ingrese un nombre"
                                                value={form.name || ""}
                                                disabled={true}
                                                readOnly
                                            />
                                            <label>{errors && errors.name && errors.name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Cliente</label>
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

                                    <div className="col-md-12 mt-4">
                                        <hr/>
                                        <div className="row">
                                            <div className="col-md-10 col-10">
                                                <i className={`fas ${!this.state.block ? 'fa-shield-alt text-success' : 'fa-ban text-red'}`}></i> Metodos {!this.state.block ? 'Permitidos' : 'Bloqueados'}
                                            </div>
                                            
                                            <div className="col-md-2 col-2">
                                                <Checkbox 
                                                    toggle 
                                                    name="block" 
                                                    checked={this.state.block ? false : true}
                                                    onChange={(e, obj) => this.setState({ block: obj.checked ? 0 : 1 })}
                                                    disabled={loading}
                                                />
                                            </div>

                                            <div className="col-md-10 col-10">
                                                <Form.Field>
                                                    <input type="text"
                                                        placeholder="Buscar Método por: Nombre, URL y Sistema"
                                                        name="query_search"
                                                        value={this.state.query_search || ""}
                                                        onChange={({ target }) => this.setState({ [target.name]: target.value })}
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-2 col-2">
                                                <Button fluid
                                                    disabled={loading}
                                                    onClick={(e) => {
                                                        this.getMethodApp(true);
                                                    }}
                                                >
                                                    <i className="fas fa-search"></i>
                                                </Button>
                                            </div>

                                            <div className="col-md-12">
                                                <hr/>
                                            </div>

                                            <div className="col-md-12">
                                                <List divided verticalAlign='middle'>
                                                    {method.data.map((obj, index) => 
                                                        <List.Item key={`list-people-${obj.id}`}>
                                                            <List.Content floated='right'>
                                                                <Show condicion={this.state.block}>
                                                                    <Button color={'olive'}
                                                                        className="mt-1"
                                                                        title="Permitir"
                                                                    >
                                                                        <i className={`fas fa-check`}></i>
                                                                    </Button>
                                                                </Show>

                                                                <Show condicion={!this.state.block}>
                                                                    <Button color={'red'}
                                                                        className="mt-1"
                                                                        title={'Bloquear'}
                                                                    >
                                                                        <i className="fas fa-ban"></i>
                                                                    </Button>
                                                                </Show>
                                                            </List.Content>
                                                            <List.Content>
                                                                <span className="uppercase mt-1">{obj.system}</span>
                                                                <br/>
                                                                <span className="badge badge-dark mt-1 mb-2">
                                                                    {obj.name} - {obj.action_type}
                                                                </span>
                                                                <br/>
                                                                <span className="badge badge-warning ml-1 mt-1 mb-2">
                                                                    {obj.url}
                                                                </span>
                                                                <br/>
                                                                {obj.description}
                                                            </List.Content>
                                                        </List.Item>
                                                    )}
                                                </List>    
                                            </div>

                                            <div className="col-md-12 mt-4">
                                                <hr/>
                                                <Button fluid
                                                    disabled={!method.next}
                                                    onClick={(e) => this.getMethodApp()}
                                                >
                                                    <Show condicion={method.next}>
                                                        <i className="fas fa-arrow-down"></i> Obtener más registros
                                                    </Show>

                                                    <Show condicion={!method.next}>
                                                        <i className="fas fa-ban"></i> No hay más registros
                                                    </Show>
                                                </Button>
                                            </div>
                                        </div>
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