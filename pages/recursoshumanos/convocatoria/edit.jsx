import React, { Component, Fragment } from 'react';
import { Form, Button, Icon, Select } from 'semantic-ui-react';
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
        await this.setting(this.props.convocatoria);
        await this.settingActividad(this.props.convocatoria);
        this.getActividades();
    }

    getActividades = () => {
        unujobs.get(`convocatoria/${this.props.convocatoria.id}/actividades`)
        .then(res => this.setState({ actividades: res.data }))
        .catch(err => this.getActividades());
    }

    setting = (data) => {
        this.setState({
            numero_de_convocatoria: data.numero_de_convocatoria,
            fecha_inicio: data.fecha_inicio,
            fecha_final: data.fecha_final,
            observacion: data.observacion,
            estado_actual: data.estado
        })
    }

    settingActividad = (data) => {
        this.setState(state => {
            state.actividad.fecha_inicio = data.fecha_inicio;
            state.actividad.fecha_final = data.fecha_final;
            return { actividad: state.actividad };
        });
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
        await this.setState({ loading: true });
        let form = Object.assign({}, this.state);
        form._method = 'PUT';
        // send
        await unujobs.post(`convocatoria/${this.props.convocatoria.id}`, form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) {
                await this.setState({ cancel: false });
                let { push, pathname, query } = Router;
                await push({ pathname, query });
            }
        })
        .catch(async err => {
            try {
                let { data } = err.response;
                this.setState({ errors: data })
            } catch (error) {
                Swal.fire({ icon: 'error', text: err.message });
            }
        });
        this.setState({ loading: false });
    }

    createActividad = async () => {
        await this.setState({ loading_actividad: true });
        let form = Object.assign({}, this.state.actividad);
        form.convocatoria_id = this.props.convocatoria.id;
        // send
        await unujobs.post(`actividad`, form)
        .then(async res => {
            let { success, message, actividad } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) {
                await this.setState(state => {
                    state.actividades.push(actividad);
                    return { actividades: state.actividades };
                });
                // update actividad
                await this.settingActividad(this.props.actividad);
            }
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
                        /> Registrar Nueva Convocatoria
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

                                        <Form.Field className="col-md-6">
                                            <label>Estado <b className="text-red">*</b></label>
                                            {/* creado */}
                                            <Show condicion={this.state.estado_actual == 'CREADO'}>
                                                <Select
                                                    placeholder="Select. Estado"
                                                    name="estado"
                                                    value={this.state.estado}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                    options={[
                                                        {key: 'CREADO', value: "", text: 'Select. Estado'},
                                                        {key: 'PUBLICADO', value: 'PUBLICADO', text: 'PUBLICAR'},
                                                        {key: 'CANCELADO', value: 'CANCELADO', text: 'CANCELAR'},
                                                        {key: 'TERMINADO', value: 'TERMINADO', text: 'TERMINAR'},
                                                    ]}
                                                />
                                            </Show>
                                            {/* publicado */}
                                            <Show condicion={this.state.estado_actual == 'PUBLICADO'}>
                                                <Select
                                                    placeholder="Select. Estado"
                                                    name="estado"
                                                    value={this.state.estado}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                    options={[
                                                        {key: 'PUBLICADO', value: "", text: 'Select. Estado'},
                                                        {key: 'TERMINADO', value: 'TERMINADO', text: 'TERMINAR'},
                                                    ]}
                                                />
                                            </Show>
                                            {/* cancelado */}
                                            <Show condicion={this.state.estado_actual == 'CANCELADO'}>
                                                <input type="text"
                                                    name="estado_actual"
                                                    value={this.state.estado_actual}
                                                    disabled
                                                />
                                            </Show>
                                            {/* terminar */}
                                            <Show condicion={this.state.estado_actual == 'TERMINADO'}>
                                                <input type="text"
                                                    name="estado_actual"
                                                    value={this.state.estado_actual}
                                                    disabled
                                                />
                                            </Show>
                                        </Form.Field>
                                    
                                        <Form.Field className="col-md-6">
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
                                    <hr/>
                                </div>

                                <Form.Field className="col-md-3" errors={errors_actividad.descripcion && errors_actividad.descripcion[0]}>
                                    <label>Descripción <b className="text-red">*</b></label>
                                    <textarea name="descripcion" 
                                        rows="5"
                                        value={actividad.descripcion}
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
                                        value={actividad.fecha_inicio}
                                        onChange={(e) => this.handleActivity(e.target)}
                                        disabled={this.state.loading_actividad}
                                    />
                                    <label>{errors_actividad.fecha_inicio && errors_actividad.fecha_inicio[0]}</label>
                                </Form.Field>

                                <Form.Field className="col-md-3" errors={errors_actividad.fecha_final && errors_actividad.fecha_final[0]}>
                                    <label>F. Final <b className="text-red">*</b></label>
                                    <input type="date" 
                                        name="fecha_final"
                                        value={actividad.fecha_final}
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
                                        value={actividad.responsable}
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
                                                value={obj.responsable}
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