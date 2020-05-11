import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';


export default class CreateTypeDescuento extends Component
{

    static getInitialProps = (ctx) => {
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        form: { 
            plame: "0",
            edit: "1"
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
        await unujobs.post('type_descuento', this.state.form)
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
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Tip. Descuento
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.key && errors.key[0]}>
                                            <label htmlFor="">ID-MANUAL</label>
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
                                            <label htmlFor="">Descripción</label>
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
                                        <Form.Field>
                                            <label htmlFor="">¿Mostrar en el Reporte Plame?</label>
                                            <Select
                                                placeholder="Select. Condición"
                                                options={[
                                                    { key: "plame", value: "1", text: "Si" },
                                                    { key: "no-plame", value: "0", text: "No" }
                                                ]}
                                                value={this.state.form.plame}
                                                name="base"
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">¿Edicion/Descuento Manual?</label>
                                            <Select
                                                placeholder="Select. Condición de la Edición"
                                                options={[
                                                    { key: "edit", value: "1", text: "Descuento Manual" },
                                                    { key: "no-edit", value: "0", text: "Descuento Automatico" }
                                                ]}
                                                value={this.state.form.edit}
                                                name="edit"
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