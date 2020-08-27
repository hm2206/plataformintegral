import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { auth, authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';


export default class CreateDependencia extends Component
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
        form: {
            type: "OTRO"
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
        this.props.fireLoading(true);
        await authentication.post('dependencia', this.state.form)
        .then(async res => {
            this.props.fireLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            if (success) this.setState({ form: {}, errors: {} });
        })
        .catch(async err => {
            try {
                this.props.fireLoading(false);
                let response = JSON.parse(err.message);
                this.setState({ errors: response.errors });
                Swal.fire({ icon: 'warning', text: response.message })
            } catch (error) {
                await Swal.fire({ icon: 'error', text: err.message });
            }
        });
        this.props.fireLoading(false);
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Dependencia
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.nombre && errors.nombre[0]}>
                                            <label htmlFor="">Nombre <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="nombre"
                                                placeholder="Ingrese un nombre"
                                                value={form.nombre || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.nombre && errors.nombre[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field  error={errors && errors.descripcion && errors.descripcion[0]}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="descripcion"
                                                value={form.descripcion || ""}
                                                placeholder="Ingrese una descripción de la dependencia"
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.descripcion && errors.descripcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field  error={errors && errors.ubicacion && errors.ubicacion[0]}>
                                            <label htmlFor="">Ubicación <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la ubicación"
                                                name="ubicacion"
                                                value={form.ubicacion || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.ubicacion && errors.ubicacion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field  error={errors && errors.type && errors.type[0]}>
                                            <label htmlFor="">Tipo <b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Selec. Tipo de Dependencia"
                                                name="type"
                                                value={form.type}
                                                options={[
                                                    { key: 'OTRO', value: 'OTRO', text: 'Otro' },
                                                    { key: 'ESCUELA', value: 'ESCUELA', text: 'Escuela' },
                                                    { key: 'FACULTAD', value: 'FACULTAD', text: 'Facultad' },
                                                    { key: 'OFICINA', value: 'OFICINA', text: 'Oficina' }
                                                ]}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                            <label>{errors && errors.type && errors.type[0]}</label>
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