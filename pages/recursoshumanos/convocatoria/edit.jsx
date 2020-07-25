import React, { Component, Fragment } from 'react';
import { Form, Button, Icon, Select } from 'semantic-ui-react';
import Show from '../../../components/show';
import { recursoshumanos } from '../../../services/apis';
import { parseOptions, Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import { findConvocatoria } from '../../../services/requests';


export default class EditConvocatoria extends Component
{

    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let {query, pathname} = ctx;
        let response = await findConvocatoria(ctx);
        let { convocatoria, success } = response || {};
        return {query, pathname, convocatoria, success }
    }

    state = {
        numero_de_convocatoria: "",
        fecha_inicio: "",
        fecha_final: "",
        observacion: "",
        estado_actual: "",
        estado: "",
        loading: false,
        errors: {},
        cancel: false,
        actividad: {
            descripcion: "",
            fecha_inicio: "",
            fecha_final: "",
            responsable: ""
        },
        errors_actividad: {},
        loading_actividad: false,
        actividades: []
    }

    componentDidMount = async () => {
        this.props.fireLoading(true);
        await this.setting();
        await this.settingActividad();
        this.getActividades();
        this.props.fireLoading(false);
    }

    getActividades = () => {
        recursoshumanos.get(`convocatoria/${this.props.convocatoria.id}/actividades`)
        .then(({ data }) => this.setState({ actividades: data.success ? data.actividades : [] }))
        .catch(err => this.setState({ actividades: [] }));
    }

    setting = () => {
        let { success, convocatoria } = this.props;
        if (success) {
            this.props.fireEntity({ render: true, disabled: true, entity_id: convocatoria.entity_id });
            this.setState({
                numero_de_convocatoria: convocatoria.numero_de_convocatoria,
                fecha_inicio: convocatoria.fecha_inicio,
                fecha_final: convocatoria.fecha_final,
                observacion: convocatoria.observacion,
                estado_actual: convocatoria.estado
            })
        }
    }

    settingActividad = () => {
        let { success, convocatoria } = this.props;
        if (success) {
            this.setState(state => {
                state.actividad.fecha_inicio = convocatoria.fecha_inicio;
                state.actividad.fecha_final = convocatoria.fecha_final;
                return { actividad: state.actividad };
            });
        }
    }

    handleInput = ({ name, value }) => {
        this.setState({[name]: value, cancel: true});
    }

    handleActivity = ({ name, value }) => {
        this.setState(state => {
            state.actividad[name] = value;
            return { actividad: state.actividad };
        });
    }

    readySend = () => {
        let { fecha_final, observacion } = this.state;
        return fecha_final && observacion;
    }

    saveAndContinue = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar los cambios?`, 'Confirmar');
        if (answer) {
            this.props.fireLoading(true);
            let form = Object.assign({}, this.state);
            // send
            await recursoshumanos.post(`convocatoria/${this.props.convocatoria.id}/update`, form)
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await this.setState(state => {
                    let nextActividad = Object.assign({}, state.actividad);
                    nextActividad.descripcion = "";
                    nextActividad.responsable = "";
                    return { cancel: false, actividad: nextActividad };
                });
                let { push, pathname, query } = Router;
                await push({ pathname, query });
            })
            .catch(async err => {
                try {
                    this.props.fireLoading(false);
                    let { data } = err.response;
                    this.setState({ errors: data })
                } catch (error) {
                    Swal.fire({ icon: 'error', text: err.message });
                }
            });
        }
    }

    createActividad = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar la actividad?`);
        if (answer) {
            await this.setState({ loading_actividad: true });
            let form = Object.assign({}, this.state.actividad);
            form.convocatoria_id = this.props.convocatoria.id;
            // send
            await recursoshumanos.post(`actividad`, form)
            .then(async res => {
                let { success, message, actividad } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await this.setState(state => {
                    state.actividades.push(actividad);
                    state.actividad.descripcion = "";
                    state.actividad.responsable = "";
                    return { actividades: state.actividades, actividad: state.actividad };
                });
                // update actividad
                await this.settingActividad(this.props.convocatoria);
            })
            .catch(async err => {
                try {
                    let { data } = err.response;
                    this.setState({ errors_actividad: data })
                } catch (error) {
                    Swal.fire({ icon: 'error', text: err.message });
                }
            });
            this.setState({ loading_actividad: false });
        }
    }

    handleClose = () => {
        this.setState({ loading: true });
        let { push, pathname } = Router;
        let newPath = pathname.split('/');
        newPath.splice(-1, 1);
        push({  pathname: newPath.join('/') });
    }

    handleCancel = () => {
        this.setting(this.props.convocatoria);
        this.setState({ cancel: false });
    }

    handleBack = async () => {
        this.setState({ loading: true });
        let { pathname, query } = Router;
        let newBack = pathname.split('/');
        newBack.splice(-1, 1);
        Router.push({ pathname: newBack.join('/') });
    }

    render() {

        let { actividad, errors, errors_actividad } = this.state;

        return (
            <div className="col-md-12">
                <Body>                    
                    <div className="card- mt-3">
                        <div className="card-header">
                        <BtnBack
                            onClick={this.handleBack}
                        /> Editar Convocatoria
                        </div>
                        <div className="card-body">
                            <Form className="row justify-content-center" loading={this.state.loading} method="POST" action="#" onSubmit={(e) => e.preventDefault()}>
                                <div className="col-md-10">
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
                                            <label>Estado Actual <b className="text-red">*</b></label>
                                            <input type="text" 
                                                value={this.state.estado_actual}
                                                name="estado_actual"
                                                onChange={(e) => this.handleInput(e.target)}
                                                disabled
                                            />
                                        </Form.Field>
                                    
                                        <Form.Field className="col-md-12">
                                            <label htmlFor="" className="text-left">Observación <b className="text-red">*</b></label>
                                            <textarea name="observacion"
                                                rows="6"
                                                value={this.state.observacion}
                                                placeholder="Ingrese una observación a está convocatoria"
                                                onChange={({ target }) => this.handleInput(target)}
                                            />
                                        </Form.Field>

                                        <div className="col-md-12 text-right mt-3 mb-5">
                                            <Button color="red"
                                                disabled={!this.state.cancel || this.state.loading}
                                                onClick={(e) => this.handleCancel()}
                                                loading={this.state.loading}
                                            >
                                                <i className="fas fa-times mr-2"></i> Cancelar
                                            </Button>

                                            <Button color="teal"
                                                disabled={!this.readySend() || this.state.loading}
                                                onClick={this.saveAndContinue}
                                                loading={this.state.loading}
                                            >
                                                <Icon name="save"/> Actualizar
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Cronograma de actividades */}

                                <div className="col-md-12">
                                    <hr/>
                                    <i className="fas fa-clock"></i> Cronograma de Actividades 
                                    <b className="ml-2">({this.state.actividades && this.state.actividades.length || 0})</b>
                                    <hr/>
                                </div>

                                <Form.Field className="col-md-3" errors={errors_actividad.descripcion && errors_actividad.descripcion[0]}>
                                    <label>Descripción <b className="text-red">*</b></label>
                                    <textarea name="descripcion" 
                                        rows="5"
                                        value={actividad.descripcion || ""}
                                        placeholder="Ingrese la descripción de la actividad"
                                        onChange={(e) => this.handleActivity(e.target)}
                                        disabled={this.state.loading_actividad}
                                    />
                                    <label>{errors_actividad.descripcion && errors_actividad.descripcion[0]}</label>
                                </Form.Field>

                                <Form.Field className="col-md-3" errors={errors_actividad.fecha_inicio && errors_actividad.fecha_inicio[0]}>
                                    <label>F. Inicio <b className="text-red">*</b></label>
                                    <input type="date" 
                                        name="fecha_inicio"
                                        value={actividad.fecha_inicio || ""}
                                        onChange={(e) => this.handleActivity(e.target)}
                                        disabled={this.state.loading_actividad}
                                    />
                                    <label>{errors_actividad.fecha_inicio && errors_actividad.fecha_inicio[0]}</label>
                                </Form.Field>

                                <Form.Field className="col-md-3" errors={errors_actividad.fecha_final && errors_actividad.fecha_final[0]}>
                                    <label>F. Final <b className="text-red">*</b></label>
                                    <input type="date" 
                                        name="fecha_final"
                                        value={actividad.fecha_final || ""}
                                        onChange={(e) => this.handleActivity(e.target)}
                                        disabled={this.state.loading_actividad}
                                    />
                                    <label>{errors_actividad.fecha_final && errors_actividad.fecha_final[0]}</label>
                                </Form.Field>

                                <Form.Field className="col-md-2" errors={errors_actividad.responsable && errors_actividad.responsable[0]}>
                                    <label>Responsable <b className="text-red">*</b></label>
                                    <input type="text" 
                                        name="responsable"
                                        placeholder="Ingrese el área responsable"
                                        value={actividad.responsable || ""}
                                        onChange={(e) => this.handleActivity(e.target)}
                                        disabled={this.state.loading_actividad}
                                    />
                                    <label>{errors_actividad.responsable && errors_actividad.responsable[0]}</label>
                                </Form.Field>

                                <Form.Field className="col-md-1">
                                    <label className="text-center">Agregar</label>
                                    <Button fluid 
                                        icon="plus"
                                        onClick={this.createActividad}
                                        loading={this.state.loading_actividad}
                                        disabled={actividad.descripcion == "" || actividad.fecha_inicio == "" || actividad.fecha_final == "" || actividad.responsable == "" ? true : false}
                                    />
                                </Form.Field>

                                <div className="col-md-12 mt-4"></div>

                                {/* Lista de actividades */}
                                {this.state.actividades.map(obj =>
                                    <Fragment key={`actividad-${obj.id}`}>
                                        <div className="col-md-12">
                                            <hr/>
                                        </div>

                                        <Form.Field className="col-md-3">
                                            <label>Descripción <b className="text-red">*</b></label>
                                            <textarea name="descripcion" 
                                                rows="5"
                                                value={obj.descripcion}
                                                placeholder="Ingrese la descripción de la obj"
                                                onChange={(e) => this.handleActivity(e.target)}
                                                disabled
                                            />
                                        </Form.Field>

                                        <Form.Field className="col-md-3">
                                            <label>F. Inicio <b className="text-red">*</b></label>
                                            <input type="date" 
                                                name="fecha_inicio"
                                                value={obj.fecha_inicio}
                                                onChange={(e) => this.handleActivity(e.target)}
                                                disabled
                                            />
                                        </Form.Field>

                                        <Form.Field className="col-md-3">
                                            <label>F. Final <b className="text-red">*</b></label>
                                            <input type="date" 
                                                name="fecha_final"
                                                value={obj.fecha_final}
                                                onChange={(e) => this.handleActivity(e.target)}
                                                disabled
                                            />
                                        </Form.Field>

                                        <Form.Field className="col-md-3">
                                            <label>Responsable <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="responsable"
                                                placeholder="Ingrese el área responsable"
                                                value={obj.responsable || ""}
                                                onChange={(e) => this.handleActivity(e.target)}
                                                disabled
                                            />
                                        </Form.Field>
                                    </Fragment>    
                                )}
                            </Form>
                        </div>
                    
                    </div>
                </Body>
            </div>
        )
    }

}