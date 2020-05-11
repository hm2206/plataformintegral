import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';


export default class CreateTypeAportacion extends Component
{

    static getInitialProps = (ctx) => {
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        form: {},
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
        await unujobs.post('type_aportacion', this.state.form)
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
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Tip. Aportación
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field  error={errors && errors.key && errors.key[0]}>
                                            <label htmlFor="">ID-MANUAL <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese un identificador unico"
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
                                        <Form.Field error={errors && errors.porcentaje && errors.porcentaje[0]}>
                                            <label htmlFor="">Porcentaje <b className="text-red">*</b></label>
                                            <input type="number"
                                                placeholder="Ingrese una cantidad porcentual. Ejm 4 = 4%"
                                                name="porcentaje"
                                                value={form.porcentaje || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.porcentaje && errors.porcentaje[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Mínimo</label>
                                            <input type="number"
                                                placeholder="Ingrese un monto mínimo"
                                                name="minimo"
                                                value={form.minimo || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Predeterminado</label>
                                            <input type="number"
                                                placeholder="Ingrese un monto predeterminado"
                                                name="default"
                                                value={form.default || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Exp Presupuestal</label>
                                            <input type="text"
                                                placeholder="Ingrese una extensión presupuestal"
                                                name="ext_pptto"
                                                value={form.ext_pptto || ""}
                                                onChange={(e) => this.handleInput(e.target)}
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