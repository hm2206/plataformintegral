import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';


export default class CreateTypeSindicato extends Component
{

    static getInitialProps = (ctx) => {
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        type_descuentos: [],
        form: {
            modo: "0"
        },
        errors: {}
    }

    componentDidMount = () => {
        this.getTypeDescuento();
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors };
        });
    }

    getTypeDescuento = async () => {
        this.setState({ loading: true });
        await unujobs.get('type_descuento?paginate=0')
        .then(res => this.setState({ type_descuentos: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    save = async () => {
        this.setState({ loading: true });
        await unujobs.post('type_sindicato', this.state.form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) this.setState({ form: { modo: "0" }, errors: {} })
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
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Tip. Afiliación
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.nombre && errors.nombre[0]}>
                                            <label htmlFor="">Descripción</label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="nombre"
                                                value={form.nombre || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.nombre && errors.nombre[0]}</label>  
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Modo</label>
                                            <Select
                                                placeholder="Select. Modo"
                                                options={[
                                                    { key: "porcentaje", value: "0", text: "Porcentaje" },
                                                    { key: "monto", value: "1", text: "Monto Estático" },
                                                ]}
                                                value={form.modo || "0"}
                                                name="modo"
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <Show condicion={form.modo && form.modo == "1"}>
                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.monto && errors.monto[0]}>
                                                <label htmlFor="">Monto</label>
                                                <input type="number"
                                                    placeholder="Ingrese el monto"
                                                    name="monto"
                                                    value={form.monto || ""}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                                <label>{errors && errors.monto && errors.monto[0]}</label> 
                                            </Form.Field>
                                        </div>
                                    </Show>

                                    <Show condicion={form.modo && form.modo == "0"}>
                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.porcentaje && errors.porcentaje[0]}>
                                                <label htmlFor="">Porcentaje</label>
                                                <input type="number"
                                                    placeholder="Ingrese el porcentaje"
                                                    name="porcentaje"
                                                    value={form.porcentaje || ""}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                                <label>{errors && errors.porcentaje && errors.porcentaje[0]}</label> 
                                            </Form.Field>
                                        </div>
                                    </Show>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.type_descuento_id && errors.type_descuento_id[0]}>
                                            <label htmlFor="">Descuento</label>
                                            <Select
                                                placeholder="Select. Descripcion Descuento"
                                                options={parseOptions(this.state.type_descuentos, ["sel-descripcion", "", "Select. Descripcion"], ["id", "id", "descripcion"])}
                                                value={form.type_descuento_id || ""}
                                                name="type_descuento_id"
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                            <label>{errors && errors.type_descuento_id && errors.type_descuento_id[0]}</label>  
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                    </div>

                                    <div className="col-md-2">
                                        <Button color="teal" fluid
                                            loading={this.state.loading}
                                            onClick={this.save}
                                            disabled={this.state.loading}
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