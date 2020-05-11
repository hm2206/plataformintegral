import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';


export default class CreateTypeRemuneracion extends Component
{

    static getInitialProps = (ctx) => {
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        form: { 
            base: "0",
            bonificacion: "0"
        },
        errors: {}
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
        await unujobs.post('type_remuneracion', this.state.form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) this.setState({ form: {}, errors: {} })
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

    render() {

        let { pathname, query } = this.props;
        let { form, errors } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Tip. Remuneración
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.key && errors.key[0]}>
                                            <label htmlFor="">ID-MANUAL <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese un identificador único"
                                                name="key"
                                                value={form.key || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.key && errors.key[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.descripcion && errors.descripcion[0]}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="descripcion"
                                                value={form.descripcion || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.descripcion && errors.descripcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.alias && errors.alias[0]}>
                                            <label htmlFor="">Alias <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción corta(Alias)"
                                                name="alias"
                                                value={form.alias || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.alias && errors.alias[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Ext Presupuestal <small>(Opcional)</small></label>
                                            <input type="text"
                                                placeholder="Ingrese una extensión presupuestal(Opcional)"
                                                name="ext_pptto"
                                                value={form.ext_pptto || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">¿Aplica a la Base Imponible?</label>
                                            <Select
                                                placeholder="Select. Condición"
                                                options={[
                                                    { key: "base", value: "0", text: "Si" },
                                                    { key: "no-base", value: "1", text: "No" }
                                                ]}
                                                value={form.base || "0"}
                                                name="base"
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">¿Es una Bonificación/Gratificación?</label>
                                            <Select
                                                placeholder="Select. Bonificación/Gratificación"
                                                options={[
                                                    { key: "bonif", value: "1", text: "Si" },
                                                    { key: "no-bonif", value: "0", text: "No" }
                                                ]}
                                                value={form.bonificacion || "0"}
                                                name="bonificacion"
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                    </div>

                                    <div className="col-md-2">
                                        <Button color="teal" fluid
                                            loading={this.state.loading}
                                            onClick={this.save}
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