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
import btoa from 'btoa';
import Router from 'next/router';
import AssignTrabajador from '../../../components/contrato/assingTrabajador';   
import { tipo_documento } from '../../../services/storage.json';
import { SelectPerfilLaboral, SelectInstitution } from '../../../components/select/authentication';


export default class RegisterExperiencia extends Component
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
        let answer = await Confirm("warning", "¿Estas seguro en guardar la experiencia laboral?", "Estoy Seguro");
        if (answer) {
            this.props.fireLoading(true);
            let newForm = new FormData;
            newForm.append('work_id', this.state.person.id);
            for(let key in this.state.form) {
                newForm.append(key, this.state.form[key]);
            }
            await escalafon.post('experiencia_laboral', newForm)
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                this.setState({ form: {}, errors: {} })
            }).catch(async err => {
                try {
                    this.props.fireLoading(false);
                    let { data } = err.response;
                    this.setState({ errors: data.errors });
                    await Swal.fire({ icon: 'warning', text: 'Los datos son incorrectos' });
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
                            <span className="ml-3">Regístrar Experiencia Laboral</span>
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
                                                        <i className="fas fa-plus"></i> Asignar Personal
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

                                                <div className="col-md-4 mt-1">
                                                    <Button
                                                        onClick={(e) => this.setState({ show_work: true })}
                                                        disabled={this.state.loading}
                                                    >
                                                        <i className="fas fa-sync"></i> Cambiar Personal
                                                    </Button>
                                                </div>
                                            </Show>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div>
                                            <hr/>
                                            <i className="fas fa-info-circle mr-1"></i> Información de la Experiencia Laboral
                                            <hr/>
                                        </div>

                                        <div className="card-body">
                                            <div className="row w-100">
                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors.institution_id && errors.institution_id[0] ? true : null}>
                                                        <label htmlFor="">Institución</label>
                                                        <SelectInstitution
                                                            value={`${form.institution_id || ""}`}
                                                            name="institution_id"
                                                            onChange={(e, data) => this.handleInput(data)}
                                                        />
                                                        <label htmlFor="">{errors.institution_id && errors.institution_id[0] || null}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors.resolucion && errors.resolucion[0] ? true : null}>
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
                                                    <Form.Field error={errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] ? true : null}>
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
                                                    <Form.Field error={errors.perfil_laboral_id && errors.perfil_laboral_id[0] ? true : null}>
                                                        <label htmlFor="">Perfil Laboral</label>
                                                        <SelectPerfilLaboral
                                                            value={`${form.perfil_laboral_id || ""}`}
                                                            name="perfil_laboral_id"
                                                            onChange={(e, data) => this.handleInput(data)}
                                                        />
                                                        <label htmlFor="">{errors.perfil_laboral_id && errors.perfil_laboral_id[0] || null}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors.jornada_laboral && errors.jornada_laboral[0] ? true : null}>
                                                        <label htmlFor="">Jornada Laboral</label>
                                                        <input type="text"
                                                            name="jornada_laboral"
                                                            value={form.jornada_laboral || ""}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                            disabled={isLoading}
                                                        />
                                                        <label htmlFor="">{errors.jornada_laboral && errors.jornada_laboral[0] || null}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors.fecha_inicio && errors.fecha_inicio[0] ? true : null}>
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

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors.fecha_final && errors.fecha_final[0] ? true : null}>
                                                        <label htmlFor="">Fecha Final</label>
                                                        <input type="date"
                                                            name="fecha_final"
                                                            value={form.fecha_final || ""}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                            disabled={isLoading}
                                                        />
                                                        <label htmlFor="">{errors.fecha_final && errors.fecha_final[0] || null}</label>
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
                        <Button fluid color="red" 
                            disabled={this.state.loading || !this.state.check}
                            onClick={(e) => this.setState({ errors: {}, form: {}, check: false, person: {} })}
                        >
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
                    <AssignTrabajador
                        getAdd={this.getAdd}
                        isClose={(e) => this.setState({ show_work: false })}
                    />
                </Show>
            </Fragment>
        )
    }

}