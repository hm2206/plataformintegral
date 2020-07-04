import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select, Checkbox } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';


export default class EditTypeSindicato extends Component
{

    static getInitialProps = (ctx) => {
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        edit: false,
        type_descuentos: [],
        old: {},
        form: {
            modo: 0
        },
        errors: {}
    }

    componentDidMount = async () => {
        this.getTypeDescuento();
        await this.findTypeSindicato();
    }

    findTypeSindicato = async () => {
        this.setState({ loading: true });
        let { query } = this.props;
        let id = query.id ? atob(query.id) : '__error';
        await unujobs.get(`type_sindicato/${id}`)
        .then(res => this.setState({ form: res.data, old: res.data }))
        .catch(err => this.setState({ form: {}, old: {} }));
        this.setState({ loading: false });
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors, edit: true };
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
        let { form } = this.state;
        form._method = 'PUT';
        await unujobs.post(`type_sindicato/${form.id}`, form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) this.setState(state => ({ old: state.form, errors: {}, edit: false }));
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
        let { form, errors, edit } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Editar Tip. Afiliación
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
                                                disabled
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
                                                    { key: "porcentaje", value: true, text: "Porcentaje" },
                                                    { key: "monto", value: false, text: "Monto Estático" },
                                                ]}
                                                value={form.is_porcentaje ? true : false}
                                                name="is_porcentaje"
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                disabled={this.state.loading}
                                            />
                                        </Form.Field>
                                    </div>

                                    <Show condicion={form && !form.is_porcentaje}>
                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.monto && errors.monto[0]}>
                                                <label htmlFor="">Monto</label>
                                                <input type="number"
                                                    placeholder="Ingrese el monto"
                                                    name="monto"
                                                    value={form.monto || ""}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                    disabled={this.state.loading}
                                                />
                                                <label>{errors && errors.monto && errors.monto[0]}</label> 
                                            </Form.Field>
                                        </div>
                                    </Show>

                                    <Show condicion={form && form.is_porcentaje}>
                                        <div className="col-md-4 mb-3">
                                            <Form.Field error={errors && errors.porcentaje && errors.porcentaje[0]}>
                                                <label htmlFor="">Porcentaje</label>
                                                <input type="number"
                                                    placeholder="Ingrese el porcentaje"
                                                    name="porcentaje"
                                                    value={form.porcentaje || ""}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                    disabled={this.state.loading}
                                                />
                                                <label>{errors && errors.porcentaje && errors.porcentaje[0]}</label> 
                                            </Form.Field>
                                        </div>
                                    </Show>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.type_descuento_id && errors.type_descuento_id[0]}>
                                            <label htmlFor="">Descuento</label>
                                            <Select
                                                disabled
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

                                    <div className="col-md-4 text-right">
                                        <Show condicion={edit}>
                                            <Button color="red"
                                                disabled={this.state.loading}
                                                onClick={(e) => this.setState(state => ({ errors: {}, edit: false, form: state.old }))}
                                            >
                                                <i className="fas fa-times"></i> Cancelar
                                            </Button>
                                        </Show>
                                        
                                        <Button color="teal"
                                            disabled={!edit || this.state.loading}
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