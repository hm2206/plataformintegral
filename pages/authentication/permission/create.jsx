import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import AssignUser from '../../../components/authentication/permission/assignUser';
import { AUTHENTICATE } from '../../../services/auth';


export default class CreatePermission extends Component
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
        check: false,
        user: {},
        systems: [],
        modules: [],
        permissions: []
    }

    componentDidMount = () => {
        this.getSystem();
    }

    componentDidUpdate = (prevProps, prevState) => {
        let { form  } = this.state;
        if (form.system_id != prevState.form.system_id) this.findSystem(form.system_id) 
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors };
        });
    }

    handleAssign = () => {
        let { push, pathname, query } = Router;
        query.assign = "true";
        push({ pathname, query });
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
        this.setState({ loading: true });
        await authentication.get(`system/${id}`)
        .then(async res =>  this.setState({ modules: res.data.modules || [] }))
        .catch(err => console.log(err.message))
        this.setState({ loading: false });
        this.handleInput({ name: 'module_id', value: "" });
    }

    save = async () => {
        this.setState({ loading: true });
        let { user, form } = this.state;
        form.user_id = user.id
        await authentication.post('permission', form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) {
                await this.findPermissions(form.user_id);
                await this.handleInput({ name: 'module_id', value: "" });
                this.setState({ errors: {} });
                await this.props.fireRefreshProfile();
            }
        })
        .catch(async err => {
            try {
                let { message } = err.response.data.error || "";
                let newErrors = JSON.parse(message);
                this.setState({ errors: newErrors.errors || {} });
            } catch (error) {
                await Swal.fire({ icon: 'error', text: 'Algo salió mal' });
            }
        });
        this.setState({ loading: false });
    }

    getAdd = async (obj) => {
        this.setState({
            user: obj,
            check: true
        })
        // add person
        this.findPerson(obj.person_id);
        this.findPermissions(obj.id);
    }

    findPerson = async (id) => {
        this.setState({ loading: true });
        await authentication.get(`find_person/${id}`)
        .then(async res => {
            await this.setState(state => {
                state.user.person = res.data;
                return { user: state.user }
            });
        }).catch(err => Swal.fire({ icon: 'warning', text: 'No se pudó obtener a la persona'}))
        this.setState({ loading: false });
    }

    findPermissions = async (id) => {
        this.setState({ loading: true });
        await authentication.get(`user/${id}/permissions`)
        .then(async res => this.setState({ permissions: res.data || [] }))
        .catch(err => console.log(err.message))
        this.setState({ loading: false });
    }

    validate = () => {
        let { module_id } = this.state.form;
        return module_id;
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors, user, systems, modules, permissions } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Agregar Permiso
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-12 mb-4">
                                        <h4><i className="fas fa-user"></i> Seleccionar Usuario</h4>
                                        <hr/>

                                        <div className="row">
                                            <Show condicion={!this.state.check}>
                                                <div className="col-md-4">
                                                    <Button
                                                        disabled={this.state.loading}
                                                        onClick={this.handleAssign}
                                                    >
                                                        <i className="fas fa-plus"></i> Asignar
                                                    </Button>
                                                </div>
                                            </Show>

                                            <Show condicion={this.state.check}>
                                                <div className="col-md-4 mb-3">
                                                    <Form.Field>
                                                        <label htmlFor="">Username</label>
                                                        <input type="text"
                                                            value={user.username || ""}
                                                            placeholder="Ingrese el username"
                                                            disabled={true}
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Email</label>
                                                        <input type="text"
                                                            value={user.email || ""}
                                                            disabled
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Apellidos y Nombres</label>
                                                        <input type="text"
                                                            value={user.person && user.person.fullname || ""}
                                                            disabled
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-12 mb-4">
                                                    <label>Permisos de <b>"{user.username || ""}"</b></label> <br/>
                                                    {permissions.map(per => 
                                                        <small className="badge badge-warning ml-1" key={`system-${per.id}`}
                                                            style={{ cursor: 'pointer' }}
                                                            title="Quitar Permiso"
                                                        >
                                                            {per.system} - {per.module}
                                                        </small>     
                                                    )}
                                                    <hr/>
                                                </div>

                                                <div className="col-md-4">
                                                    <Button
                                                        onClick={this.handleAssign}
                                                        disabled={this.state.loading}
                                                    >
                                                        <i className="fas fa-sync"></i> Cambiar
                                                    </Button>
                                                </div>
                                            </Show>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                        <h4><i className="fas fa-user-tag"></i> Asignar Permiso</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.system_id && errors.system_id[0]}>
                                            <label htmlFor="">Sistema <b className="text-red">*</b></label>
                                            <Select
                                                value={form.system_id || ""}
                                                placeholder="Select. Sistema"
                                                options={parseOptions(systems, ["sel-sys", "", "Select. Sistemas"], ["id", "id", "name"])}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                name="system_id"
                                                disabled={this.state.loading || user && user.id ? false : true}
                                            />
                                            <label>{errors && errors.system_id && errors.system_id[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.module_id && errors.module_id[0]}>
                                            <label htmlFor="">Modulo <b className="text-red">*</b></label>
                                            <Select
                                                value={form.module_id || ""}
                                                placeholder="Select. Modulo"
                                                options={parseOptions(modules, ["sel-mod", "", "Select. Modulo"], ["id", "id", "name"])}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                name="module_id"
                                                disabled={this.state.loading || user && user.id ? false : true}
                                            />
                                            <label>{errors && errors.module_id && errors.module_id[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                    </div>

                                    <div className="col-md-2">
                                        <Button color="teal" fluid
                                            disabled={this.state.loading || !this.validate() || !this.state.check}
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

                <Show condicion={query && query.assign}>
                    <AssignUser
                        getAdd={this.getAdd}
                        isClose={(e) => {
                            let { push, pathname, query } = Router;
                            query.assign = "";      
                            push({ pathname, query })
                        }}
                    />
                </Show>
            </div>
        )
    }
    
}