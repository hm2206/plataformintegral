import React, { Component, Fragment } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import ContentControl from '../../../components/contentControl';
import Show from '../../../components/show';
import { unujobs, authentication, escalafon } from '../../../services/apis';
import { parseUrl, Confirm } from '../../../services/utils';
import { pap } from '../../../services/storage.json';
import Swal from 'sweetalert2';
import Router from 'next/router';
import AssignContrato from '../../../components/contrato/assingContrato'; 
import { tipo_documento } from '../../../services/storage.json';
import { SelectDependencia, SelectDependenciaPerfilLaboral } from '../../../components/select/authentication';

export default class RegisterDesplazamiento extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query }
    }

    state = {
        loading: false,
        show_work: false,
        check: false,
        dependencias: [],
        person: {},
        form: {},
        errors: {}
    }

    componentDidMount = async () => {
        this.props.fireEntity({ render: true });
    }

    handleInput = async ({ name, value }) => {
        let newForm = Object.assign({}, this.state.form);
        let newErrors = Object.assign({}, this.state.errors);
        newErrors[name] = [];
        newForm[name] = value;
        this.setState({ form: newForm, errors: newErrors });
    }

    getAdd = async (obj) => {
        this.setState({
            show_work: false,
            person: obj,
            check: true
        })
        // generar usuario
        this.handleInput({ name: 'username', value: obj.document_number });
    }

    create = async () => {
        let answer = await Confirm("warning", "¿Estas seguro en guardar el desplazamiento de personal?", "Estoy Seguro");
        if (answer) {
            this.props.fireLoading(true);
            let newForm = new FormData;
            newForm.append('info_id', this.state.person.id);
            for(let key in this.state.form) {
                newForm.append(key, this.state.form[key]);
            }
            await escalafon.post('desplazamiento', newForm)
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
            }).catch(async err => {
                try {
                    this.props.fireLoading(false);
                    let { data } = err.response;
                    this.setState({ errors: data.errors });
                    await Swal.fire({ icon: 'warning', text: 'Los datos son incorrectos' });
                    this.setState({ errors: {}, form: {} });
                } catch (error) {
                    await Swal.fire({ icon: 'error', text: err.message });
                }
            });
            // leave loading
            this.props.fireLoading(false);
        }
    }

    render() {

        let { errors, person, show_work, form } = this.state;
        let { isLoading } = this.props;

        return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <div className="card-header">
                            <span className="ml-3">Regístrar Desplazamiento de Personal</span>
                        </div>
                    </Body>
                </div>

                <div className="col-md-12 mt-2">
                    <Body>
                        <div className="card-body">
                            <Form onSubmit={(e) => e.preventDefault()}>

                                <div className="row justify-content-center">
                                    <div className="col-md-12 mb-4">
                                        <div className="row">
                                            <Show condicion={!this.state.check}>
                                                <div className="col-md-4">
                                                    <Button
                                                        disabled={this.state.loading}
                                                        onClick={(e) => this.setState({ show_work: true })}
                                                    >
                                                        <i className="fas fa-plus"></i> Asignar Contrato
                                                    </Button>
                                                </div>
                                            </Show>

                                            <Show condicion={this.state.check}>
                                                <div className="col-md-4 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Tip. Documento</label>
                                                        <Select fluid
                                                            disabled
                                                            options={tipo_documento}
                                                            value={person.person && person.person.document_type || '01'}
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">N° Documento</label>
                                                        <input type="text"
                                                            value={person.person && person.person.document_number  || ""}
                                                            disabled
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Apellidos y Nombres</label>
                                                        <input type="text"
                                                            value={person.person && person.person.fullname || ""}
                                                            disabled
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Meta Pres.</label>
                                                        <input type="text"
                                                            value={person.meta && person.meta && person.meta.metaID || ""}
                                                            disabled
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Partición Pres.</label>
                                                        <input type="text"
                                                            value={person.cargo && person.cargo && person.cargo.descripcion || ""}
                                                            disabled
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Tip. Categoría</label>
                                                        <input type="text"
                                                            value={person.type_categoria && person.type_categoria && person.type_categoria.descripcion || ""}
                                                            disabled
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mt-1">
                                                    <Button
                                                        onClick={(e) => this.setState({ show_work: true })}
                                                        disabled={this.state.loading}
                                                    >
                                                        <i className="fas fa-sync"></i> Cambiar Contrato
                                                    </Button>
                                                </div>
                                            </Show>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div>
                                            <hr/>
                                            <i className="fas fa-info-circle mr-1"></i> Información del Desplazamiento de Personal
                                            <hr/>
                                        </div>

                                        <div className="card-body">
                                            <div className="row w-100">
                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors.resolucion && errors.resolucion[0] || null}>
                                                        <label htmlFor="">N° Resolución</label>
                                                        <input type="text"
                                                            name="resolucion"
                                                            value={form.resolucion || ""}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                            disabled={isLoading}
                                                        />
                                                        <label htmlFor="">{errors.resolucion && errors.resolucion[0] || null}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] || null}>
                                                        <label htmlFor="">Fecha Resolución</label>
                                                        <input type="date"
                                                            name="fecha_de_resolucion"
                                                            value={form.fecha_de_resolucion || ""}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                            disabled={isLoading}
                                                        />
                                                        <label htmlFor="">{errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] || null}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors.dependencia_id && errors.dependencia_id[0] || null}>
                                                        <label htmlFor="">Dependencia</label>
                                                        <SelectDependencia
                                                            name="dependencia_id"
                                                            value={`${form.dependencia_id || ""}`}
                                                            onChange={(e, data) => this.handleInput(data)}
                                                        />
                                                        <label htmlFor="">{errors.dependencia_id && errors.dependencia_id[0] || null}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors.perfil_laboral_id && errors.perfil_laboral_id[0] || null}>
                                                        <label htmlFor="">Perfil Laboral</label>
                                                        <SelectDependenciaPerfilLaboral
                                                            name="perfil_laboral_id"
                                                            value={`${form.perfil_laboral_id || ""}`}
                                                            onChange={(e, data) => this.handleInput(data)}
                                                            disabled={isLoading}
                                                            dependencia_id={form.dependencia_id || ""}
                                                            refresh={form.dependencia_id || false}
                                                        />
                                                        <label htmlFor="">{errors.perfil_laboral_id && errors.perfil_laboral_id[0] || null}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors.descripcion && errors.descripcion[0] || null}>
                                                        <label htmlFor="">Descripción</label>
                                                        <input type="text"
                                                            name="descripcion"
                                                            value={form.descripcion || ""}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                            disabled={isLoading}
                                                        />
                                                        <label htmlFor="">{errors.descripcion && errors.descripcion[0] || null}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors.fecha_inicio && errors.fecha_inicio[0] || null}>
                                                        <label htmlFor="">Fecha Inicio</label>
                                                        <input type="date"
                                                            name="fecha_inicio"
                                                            value={form.fecha_inicio || ""}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                            disabled={isLoading}
                                                        />
                                                        <label htmlFor="">{errors.fecha_inicio && errors.fecha_inicio[0] || null}</label>
                                                    </Form.Field>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </Body>
                </div>

                <ContentControl>
                    <div className="col-lg-2 col-6">
                        <Button fluid color="red" disabled={this.state.loading || !this.state.check}>
                            <i className="fas fa-times"></i> Cancelar
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button fluid color="blue" 
                            disabled={this.state.loading || !this.state.check}
                            onClick={this.create}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </ContentControl>

                <Show condicion={show_work}>
                    <AssignContrato
                        getAdd={this.getAdd}
                        isClose={(e) => this.setState({ show_work: false })}
                    />
                </Show>
            </Fragment>
        )
    }

}