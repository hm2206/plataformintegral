import React, { Component } from 'react';
import { Form, Button, Icon } from 'semantic-ui-react';
import Show from '../../../components/show';
import { unujobs } from '../../../services/apis';
import { parseOptions } from '../../../services/utils';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { findConvocatoria } from '../../../storage/actions/convocatoriaActions';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';

export default class EditConvocatoria extends Component
{

    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let {query, pathname} = ctx;
        await ctx.store.dispatch(findConvocatoria(ctx));
        let { convocatoria } = await ctx.store.getState().convocatoria;
        return {query, pathname, convocatoria }
    }

    state = {
        numero_de_convocatoria: "",
        fecha_inicio: "",
        fecha_final: "",
        observacion: "",
        loading: false,
        errors: {}
    }

    componentDidMount = async () => {
        await this.setting(this.props.convocatoria);
    }

    setting = (data) => {
        this.setState({
           numero_de_convocatoria: data.numero_de_convocatoria,
           fecha_inicio: data.fecha_inicio,
            fecha_final: data.fecha_final,
            observacion: data.observacion
        })
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
        await unujobs.post('cronograma', this.state)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
        })
        .catch(err => this.setState({ errors: err.response.data }));
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
                                            <Form.Field className="col-md-6">
                                                <label htmlFor="" className="text-left">N° de Convocatoria <b className="text-red">*</b></label>
                                                <input type="text"
                                                    name="numero_de_convocatoria"
                                                    placeholder="Ingrese el N° de Convocatoria. Ejm: ENTIDAD-001"
                                                    value={this.state.numero_de_convocatoria}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                    disabled
                                                />
                                            </Form.Field>

                                            <Form.Field className="col-md-6">
                                                <label>Fecha de Inicio <b className="text-red">*</b></label>
                                                <input type="date"
                                                    name="fecha_inicio"
                                                    value={this.state.fecha_inicio}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                    disabled
                                                />
                                            </Form.Field>

                                            <Form.Field className="col-md-6">
                                                <label>Fecha Final <b className="text-red">*</b></label>
                                                <input type="date"
                                                    name="fecha_final"
                                                    value={this.state.fecha_final}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                            </Form.Field>

                                    
                                        <Form.Field className="col-md-6">
                                            <label htmlFor="" className="text-left">Observación <b className="text-red">*</b></label>
                                            <textarea name="nota"
                                                rows="6"
                                                value={this.state.nota}
                                                placeholder="Ingrese una observación a está convocatoria"
                                                onChange={({ target }) => this.handleInput(target)}
                                            />
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