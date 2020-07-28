import React, { Component } from 'react';
import { Body, BtnBack, InputFile } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';


export default class CreateSede extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        form: {},
        errors: {},
        files: {}
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
        this.props.fireLoading(true);
        let { form } = this.state;
        // crear sistema
        await authentication.post('sede', form)
        .then(async res => {
            this.props.fireLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            this.setState({ form: {}, errors: {}, files: {} })
        })
        .catch(err => {
            try {
                this.props.fireLoading(false);
                let response = JSON.parse(err.message);
                Swal.fire({ icon: 'warning', text: response.message });
                this.setState({ errors: response.errors });
            } catch (error) {
                Swal.fire({ icon: 'error', text: err.message });
            }
        })
    }

    validate = () => {
        let { module_id } = this.state.form;
        return module_id;
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Sede
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.descripcion && errors.descripcion[0] || false}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="descripcion"
                                                placeholder="Ingrese la descripción de la Sede"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.descripcion || ""}
                                            />
                                            <label>{errors && errors.descripcion && errors.descripcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.direccion && errors.direccion[0] || false}>
                                            <label htmlFor="">Dirección <b className="text-red">*</b></label>
                                            <textarea type="text"
                                                name="direccion"
                                                placeholder="Ingrese la dirección"
                                                onChange={(e) => this.handleInput(e.target)}
                                                value={form.direccion || ""}
                                            />
                                            <label>{errors && errors.direccion && errors.direccion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                    </div>

                                    <div className="col-md-2">
                                        <Button color="teal" fluid
                                            disabled={this.state.loading}
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