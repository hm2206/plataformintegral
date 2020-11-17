import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import AssignPerson from '../../../components/authentication/user/assignPerson';
import { tipo_documento } from '../../../services/storage.json';
import {  AUTHENTICATE } from '../../../services/auth';


export default class CreateUser extends Component
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
        person: {},
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

    save = async () => {
        this.setState({ loading: true });
        await this.handleInput({ name: 'redirect', value: `${location.origin}/login` });
        let { person, form } = this.state;
        form.person_id = person.id
        await authentication.post('register', form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) this.setState({ form: {}, errors: {} });
        })
        .catch(async err => {
            try {
                let { data } = err.response
                let { message, errors } = data;
                this.setState({ errors });
            } catch (error) {
                await Swal.fire({ icon: 'error', text: 'Algo salió mal' });
            }
        });
        this.setState({ loading: false });
    }


    getAdd = async (obj) => {
        this.setState({
            person: obj,
            check: true
        })
        // generar usuario
        this.handleInput({ name: 'username', value: obj.document_number });
    }

    validate = () => {
        let { username, email, password, confirm_password } = this.state.form;
        return username && email && password && password == confirm_password;
    }


    validatePassword = () => {
        let { password } = this.state.form;
        let message = "";
        if (password && password.length < 8) message =  "La contraseña debe contener al menos 8 caracteres!";
        else if(password && password.length >= 8) {
            if (!/[A-Z]/.test(password)) message = "La contraseña debe contener al menos una mayúscula";
            else if (!/[0-9]/.test(password)) message = "La contraseña debe contener al menos un valor numérico";
        }
        // sin errores
        return message;
    }

    validateConfirmPassword = () => {
        let { password, confirm_password } = this.state.form;
        let message = "";
        if (password != confirm_password) return "La confirmación es incorrecta!";
        return message;
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors, person } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Nuevo Usuario
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-12 mb-4">
                                        <h4><i className="fas fa-fingerprint"></i> Seleccionar Persona</h4>
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
                                                        <label htmlFor="">Tip. Documento</label>
                                                        <input value={person.document_type} readOnly/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">N° Documento</label>
                                                        <input type="text"
                                                            value={person.document_number || ""}
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Apellidos y Nombres</label>
                                                        <input type="text"
                                                            value={person.fullname || ""}
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Button
                                                        onClick={this.handleAssign}
                                                        disabled={this.state.loading}
                                                    >
                                                        <i className="fas fa-plus"></i> Cambiar
                                                    </Button>
                                                </div>
                                            </Show>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                        <h4><i className="fas fa-user"></i> Datos del usuario</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.username && errors.username[0]}>
                                            <label htmlFor="">Username <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="username"
                                                disabled
                                                placeholder="Ingrese un username"
                                                value={form.username || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.username && errors.username[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.email && errors.email[0]}>
                                            <label htmlFor="">Email <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="email"
                                                value={form.email || ""}
                                                placeholder="Ingrese un correo eléctronico válido"
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.email && errors.email[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.password && errors.password[0] || this.validatePassword()}>
                                            <label htmlFor="">Contraseña <b className="text-red">*</b></label>
                                            <input type="password"
                                                placeholder="Ingrese una contraseña"
                                                name="password"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.password || ""}
                                            />
                                            <label>{errors && errors.password && errors.password[0] || this.validatePassword()}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.confirm_password && errors.confirm_password[0] || this.validateConfirmPassword()}>
                                            <label htmlFor="">Confirmar Contraseña <b className="text-red">*</b></label>
                                            <input type="password"
                                                placeholder="Confirme la contraseña"
                                                name="confirm_password"
                                                value={form.confirm_password || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.confirm_password && errors.confirm_password[0] || this.validateConfirmPassword()}</label>
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
                    <AssignPerson
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