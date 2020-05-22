import React, { Component } from 'react';
import { Form, Select, Button, Icon, Divider } from 'semantic-ui-react';
import Show from '../../../components/show';
import { unujobs } from '../../../services/apis';
import { parseOptions } from '../../../services/utils';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import { format } from 'native-url';

export default class RegisterConvocatoria extends Component
{

    static getInititalProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        return { pathname: ctx.pathname, query: ctx.query };
    };

    state = {
        numero_de_convocatoria: "",
        fecha_inicio: "",
        fecha_final: "",
        observacion: "",
        loading: false,
        errors: {}
    }


    handleInput = ({ name, value }) => {
        this.setState({[name]: value});
    }


    readySend = () => {
        let { numero_de_convocatoria, fecha_inicio, fecha_final, observacion } = this.state;
        return numero_de_convocatoria && fecha_inicio && fecha_final && observacion;
    }

    saveAndContinue = async () => {
        await this.setState({ loading: true });
        // send
        await unujobs.post('convocatoria', this.state)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
        })
        .catch(err => {
            try {
                let { data } = err.response;
                this.setState({ errors: data.errors })
            } catch (error) {
                Swal.fire({ icon: 'error', text: err.message });
            }
        });
        this.setState({ loading: false });
    }

    handleClose = () => {
        this.setState({ loading: true });
        let { push, pathname } = Router;
        let newPath = pathname.split('/');
        newPath.splice(-1, 1);
        push({  pathname: newPath.join('/') });
    }

    handleBack = async () => {
        this.setState({ loading: true });
        let { pathname, query } = Router;
        let newBack = pathname.split('/');
        newBack.splice(-1, 1);
        Router.push({ pathname: newBack.join('/') });
    }

    render() {

        let { errors } = this.state;

        return (
            <div className="col-md-12">
                <Body>                    
                    <div className="card- mt-3">
                        <div className="card-header">
                        <BtnBack
                            onClick={this.handleBack}
                        /> Registrar Nueva Convocatoria
                        </div>
                        <div className="card-body">
                            <div className="row justify-content-center">
                                <Form loading={this.state.loading} action="#" className="col-md-10" onSubmit={(e) => e.preventDefault()}>
                                    <div className="row justify-content-center">
                                            <Form.Field className="col-md-6" error={errors.numero_de_convocatoria && errors.numero_de_convocatoria[0]}>
                                                <label htmlFor="" className="text-left">N° de Convocatoria <b className="text-red">*</b></label>
                                                <input type="text"
                                                    name="numero_de_convocatoria"
                                                    placeholder="Ingrese el N° de Convocatoria. Ejm: ENTIDAD-001"
                                                    value={this.state.numero_de_convocatoria}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                                <label>{errors.numero_de_convocatoria && errors.numero_de_convocatoria[0]}</label>
                                            </Form.Field>

                                            <Form.Field className="col-md-6" error={errors.fecha_inicio && errors.fecha_inicio[0]}>
                                                <label>Fecha de Inicio <b className="text-red">*</b></label>
                                                <input type="date"
                                                    name="fecha_inicio"
                                                    value={this.state.fecha_inicio}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                                <label>{errors.fecha_inicio && errors.fecha_inicio[0]}</label>
                                            </Form.Field>

                                            <Form.Field className="col-md-6" error={errors.fecha_inicio && errors.fecha_inicio[0]}>
                                                <label>Fecha Final <b className="text-red">*</b></label>
                                                <input type="date"
                                                    name="fecha_final"
                                                    value={this.state.fecha_final}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                                <label>{errors.fecha_inicio && errors.fecha_inicio[0]}</label>
                                            </Form.Field>

                                    
                                        <Form.Field className="col-md-6" error={errors.observacion && errors.observacion[0]}>
                                            <label htmlFor="" className="text-left">Observación <b className="text-red">*</b></label>
                                            <textarea name="observacion"
                                                rows="6"
                                                value={this.state.observacion}
                                                placeholder="Ingrese una observación a está convocatoria"
                                                onChange={({ target }) => this.handleInput(target)}
                                            />
                                            <label>{errors.observacion && errors.observacion[0]}</label>
                                        </Form.Field>

                                        <div className="col-md-12">
                                            <hr/>
                                        </div>

                                        <div className="col-md-12 text-right">
                                            <Button color="teal"
                                                disabled={!this.readySend() || this.state.loading}
                                                onClick={this.saveAndContinue}
                                                loading={this.state.loading}
                                            >
                                                <Icon name="save"/> Guardar y Continuar
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </Body>
            </div>
        )
    }

}