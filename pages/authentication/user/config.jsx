import React, { Component } from 'react';
import { Body, BtnBack, SimpleList, SimpleListContent } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import atob from 'atob';
import Show from '../../../components/show';
import ConfigEntity from '../../../components/authentication/user/configEntity';
import ConfigEntityDependencia from '../../../components/authentication/user/configEntityDependencia';


export default class ConfigUser extends Component
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
        person: {},
        option: ""
    }

    componentWillMount = async () => {
        await this.findUser();
        this.getMethodApp();
    }

    componentDidUpdate = async (prevProps, prevState) => {
        let { block } = this.state;
        if (block != prevState.block) this.getMethodApp(true);
    }

    findUser = async () => {
        let { query } = this.props;
        let id = query.id ? atob(query.id) : "__error";
        this.setState({ loading: true });
        await authentication.get(`user/${id}`)
        .then(res => this.setState({ form: res.data }))
        .catch(err => console.log(err));
        this.setState({ loading: false });
    }

    getMethodApp = async (changed = false) => {
        this.setState({ loading: true });
        if (changed) await this.setState({ method: { next: false, page: 1, last_page: 1, data: [] } });
        let { form, block, method, query_search } = this.state;
        await authentication.get(`user/${form.id}/block?block=${block}&page=${method.page}&query_search=${query_search}`)
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

    add = async (obj, index) => {
        await  this.handleRequest(`block_method_user`, obj, index);
    }

    delete = async (obj, index) => {
        await this.handleRequest(`block_method_user/${obj.id}/delete`, obj, index);
    }

    handleRequest = async (path, obj, index) => {
        this.setState({ loading: true });
        let { form } = this.state;
        // request
        await authentication.post(path, {
            user_id: form.id,
            method_id: obj.id
        })
        .then(res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            Swal.fire({ icon: 'success', text: message });
            this.setState(state => {
                state.method.data.splice(index, 1);
                return { method: state.method }
            });
        }).catch(err => Swal.fire({ icon: 'error', text: message }));
        this.setState({ loading: false });
    }

    render() {

        let { pathname, query } = this.props;
        let { form, loading, option } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Configuraciones de Usuario
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-12">
                                        <h4><i className="fas fa-user"></i> Datos de Usuario</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Apellidos y Nombres</label>
                                            <input type="text" 
                                                placeholder="Ingrese un nombre"
                                                value={form.person && form.person.fullname || ""}
                                                readOnly
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">N° Documento</label>
                                            <input type="text"
                                                placeholder="Ingrese un nombre"
                                                value={form.person && form.person.document_number || ""}
                                                readOnly
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Username</label>
                                            <input type="text" 
                                                name="name"
                                                placeholder="Ingrese un nombre"
                                                value={form.username || ""}
                                                readOnly
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Email</label>
                                            <input type="text" 
                                                value={form.email || ""}
                                                readOnly
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 mt-4">
                                        <hr/>
                                        <h4 className="pb-2"><i className="fas fa-cog"></i> Configuraciones</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <SimpleListContent>
                                                    <SimpleList
                                                        icon="fas fa-briefcase"
                                                        bg="primary"
                                                        title="Entidades"
                                                        onClick={(e) => this.setState({ option: 'CONFIG_ENTITY' })}
                                                    />
                                                    <SimpleList
                                                        icon="fas fa-building"
                                                        bg="orange"
                                                        title="Dependencias"
                                                        onClick={(e) => this.setState({ option: 'CONFIG_ENTITY_DEPENDENCIA' })}
                                                    />
                                                </SimpleListContent>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </Body>

                <Show condicion={form && form.id && option == 'CONFIG_ENTITY'}>
                    <ConfigEntity user={form} isClose={(e) => this.setState({ option: "" })}/>
                </Show>

                <Show condicion={form && form.id && option == 'CONFIG_ENTITY_DEPENDENCIA'}>
                    <ConfigEntityDependencia user={form} isClose={(e) => this.setState({ option: "" })}/>
                </Show>
            </div>
        )
    }
    
}