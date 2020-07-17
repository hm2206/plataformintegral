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


export default class BlockUser extends Component
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

    componentDidMount = () => {
        this.findUser();
    }

    findUser = async () => {
        let  { query } = this.props;
        let id = query.id ? atob(query.id) : '_error';
        await authentication.get(`user/${id}`)
        .then(res => this.setState({ form: res.data }))
        .catch(err => console.log(err));
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

    validate = () => {
        let { username, email, password, confirm_password } = this.state.form;
        return username && email && password && password == confirm_password;
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors, person } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Restricciones del Usuario
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-12">
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
                                                readOnly
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
                                                disabled
                                                readOnly
                                            />
                                            <label>{errors && errors.email && errors.email[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
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