import React, { Component, Fragment } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select, Accordion, Menu, Message } from 'semantic-ui-react'
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
        permissions: [],
        indexCheck: null
    }

    componentDidMount = () => {
        this.getSystem();
    }

    handleClick = async (id, index) => {
        await this.findSystem(id)
        this.setState({ indexCheck: index });
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors };
        });
    }

    handleCheck = async (mod, modIndex, checked) => {
        // variables
        let { user, modules } = this.state;
        let module = modules[modIndex];
        let form = {};
        form.user_id = user.id;
        form.module_id = mod.id;
        // accion
        if (checked) {
            await this.save(form, modIndex, module);
        } else {
            await this.delete(modIndex, module);
        }
        // actualizar permisos
        await this.findPermissions(user.id);
        await this.props.fireRefreshProfile();
    } 

    updateChecked = async (index, mod) => {
        await this.setState(state => {
            state.modules[index] = mod;
            return { modules: state.modules };
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
        this.setState({ loading: true, modules: [] });
        let newPermissions = await this.state.permissions.filter(per => per.system_id == id);
        await authentication.get(`system/${id}`)
        .then(async res =>  {
            let { modules } = res.data;
            await modules.map(mod => {
                let isCheck = false;
                let permission_id = "";
                for(let per of newPermissions) {
                    if (mod.id == per.module_id) {
                        isCheck = true;
                        permission_id = per.id;
                        break;
                    }
                }
                // add checked
                mod.checked = isCheck;  
                mod.permission_id = permission_id;
            });
            // add
            this.setState({ modules })
        })
        .catch(err => console.log(err.message))
        this.setState({ loading: false });
        this.handleInput({ name: 'module_id', value: "" });
    }

    save = async (form, index, module) => {
        this.setState({ loading: true });
        await authentication.post('permission', form)
        .then(async res => {
            let { success, message, permission } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (!success) throw new Error(message);
            module.permission_id = permission.id;
            module.checked = true;
            await this.updateChecked(index, module);
        })
        .catch(async err => {
            try {
                let { message } = err.response.data.error || "";
                let newErrors = JSON.parse(message);
                this.setState({ errors: newErrors.errors || {} });
            } catch (error) {
                await Swal.fire({ icon: 'error', text: err.message });
            }
        });
        this.setState({ loading: false });
    }

    delete = async (index, module) => {
        this.setState({ loading: true });
        await authentication.post(`permission/${module.permission_id}/delete`)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            module.checked = false;
            await this.updateChecked(index, module);
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
        this.setState({ loading: false });
    }

    getAdd = async (obj) => {
        this.setState({
            user: obj,
            check: true,
            indexCheck: null
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
        let { form, user, systems, modules, permissions, indexCheck } = this.state;

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

                                    <div className="col-md-12">
                                        <Show condicion={this.state.check}>
                                            <Accordion as={Menu} vertical fluid>
                                                {systems.map((sys, index) => 
                                                    <Menu.Item key={`system-${sys.id}`} disabled={!this.state.check}>
                                                        <Accordion.Title
                                                            active={indexCheck === index}
                                                            content={<b>{sys.name}</b>}
                                                            index={0}
                                                            onClick={(e) => this.handleClick(sys.id, index)}
                                                        />
                                                        <Accordion.Content active={indexCheck === index}>
                                                            <Fragment>
                                                                <Form.Group grouped>
                                                                    {modules.map((mod, modIndex) => 
                                                                        <Form.Checkbox 
                                                                            label={mod.name} 
                                                                            key={`modulo-${mod.id}`}
                                                                            checked={mod.checked ? true : false}
                                                                            onChange={(e, obj) => this.handleCheck(mod, modIndex, obj.checked)}
                                                                        />    
                                                                    )}
                                                                </Form.Group>
                                                            </Fragment>
                                                        </Accordion.Content>
                                                    </Menu.Item>    
                                                )}
                                            </Accordion>
                                        </Show>
                                        <Show condicion={!this.state.check}>
                                            <Message color="yellow">
                                                <Message.Header>Porfavor seleccione un usuario</Message.Header>
                                                <p>Para mostrar el selector de permisos</p>
                                            </Message>
                                        </Show>
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