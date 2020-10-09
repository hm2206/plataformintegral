import React, { Component, Fragment } from 'react';
import { Form, Button, Select, Checkbox } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import { Body } from '../../../components/Utils';
import ContentControl from '../../../components/contentControl';
import Show from '../../../components/show';
import { unujobs, escalafon } from '../../../services/apis';
import { parseUrl, Confirm } from '../../../services/utils';
import { parseOptions, backUrl } from '../../../services/utils';
import Swal from 'sweetalert2';
import btoa from 'btoa';
import Router from 'next/router';
import AssignContrato from '../../../components/contrato/assingContrato';   
import { tipo_documento } from '../../../services/storage.json';


export default class RegisterLicencia extends Component
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
        situacion_laboral: [],
        form: {
            is_pay: 0
        },
        errors: {}
    }

    componentDidMount = async () => {
        this.props.fireEntity({ render: true });
        await this.getSituacionLaboral();
    }

    handleInput = async ({ name, value }) => {
        let newForm = Object.assign({}, this.state.form);
        let newErrors = Object.assign({}, this.state.errors);
        newErrors[name] = [];
        newForm[name] = value;
        this.setState({ form: newForm, errors: newErrors });
    }

    getSituacionLaboral = async (page = 1, up = false) => {
        await unujobs.get(`situacion_laboral?page=${page}&licencia=1`)
            .then(async res => {
                let { data, last_page } = res.data;
                let payload = [];
                // setting datos
                await data.filter(d => payload.push({
                    key: `situacion-laboral-${d.id}`,
                    value: `${d.id}`,
                    text: `${d.nombre}`
                }));
                // save datos
                this.setState(state => ({ situacion_laboral: up ? [...state.situacion_laboral, ...payload] : payload }));
                // next Page
                if (last_page >= page + 1) await this.getSituacionLaboral(page + 1);
            })
            .catch(err => console.log(err.message));
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
        let answer = await Confirm("warning", "¿Estas seguro en guardar la licencia?", "Estoy Seguro");
        if (answer) {
            this.props.fireLoading(true);
            let newForm = new FormData;
            newForm.append('info_id', this.state.person.id);
            for(let key in this.state.form) {
                newForm.append(key, this.state.form[key]);
            }
            await escalafon.post('licencia', newForm)
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                this.setState({ errors: {}, form: {} });
            }).catch(err => {
                try {
                    this.props.fireLoading(false);
                    let { data } = err.response;
                    this.setState({ errors: data.errors });
                } catch (error) {
                    Swal.fire({ icon: 'error', text: err.message });
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
                            <span className="ml-3">Regístrar Lícencia</span>
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
                                                        <i className="fas fa-sync"></i> Cambiar Personal
                                                    </Button>
                                                </div>
                                            </Show>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div>
                                            <hr/>
                                            <i className="fas fa-info-circle mr-1"></i> Información del Ascenso de Personal
                                            <hr/>
                                        </div>

                                        <div className="card-body">
                                            <div className="row w-100">
                                                <div className="col-md-4 mb-3">
                                                    <Form.Field error={errors.resolucion && errors.resolucion[0] || ""}>
                                                        <label htmlFor="">N° Resolución</label>
                                                        <input type="text"
                                                            name="resolucion"
                                                            value={form.resolucion || ""}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                            disabled={isLoading}
                                                        />
                                                        <label htmlFor="">{errors.resolucion && errors.resolucion[0] || ""}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-3">
                                                    <Form.Field error={errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] || ""}>
                                                        <label htmlFor="">Fecha Resolución</label>
                                                        <input type="date"
                                                            name="fecha_de_resolucion"
                                                            value={form.fecha_de_resolucion || ""}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                            disabled={isLoading}
                                                        />
                                                        <label htmlFor="">{errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] || ""}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-3">
                                                    <Form.Field error={errors.situacion_laboral_id && errors.situacion_laboral_id[0] || ""}>
                                                        <label htmlFor="">Situación Laboral</label>
                                                        <Select
                                                            placeholder="Seleccionar Situación Laboral"
                                                            name="situacion_laboral_id"
                                                            value={`${form.situacion_laboral_id || ""}`}
                                                            onChange={(e, data) => this.handleInput(data)}
                                                            disabled={isLoading}
                                                            options={this.state.situacion_laboral}
                                                        />
                                                        <label htmlFor="">{errors.situacion_laboral_id && errors.situacion_laboral_id[0] || ""}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-3">
                                                    <Form.Field error={errors.descripcion && errors.descripcion[0] || null}>
                                                        <label htmlFor="">Descripción</label>
                                                        <input type="text"
                                                            name="descripcion"
                                                            value={form.descripcion || ""}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                            disabled={isLoading}
                                                        />
                                                        <label htmlFor="">{errors.descripcion && errors.descripcion[0] || ""}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-3">
                                                    <Form.Field error={errors.fecha_inicio && errors.fecha_inicio[0] || ""}>
                                                        <label htmlFor="">Fecha Inicio</label>
                                                        <input type="date"
                                                            name="fecha_inicio"
                                                            value={form.fecha_inicio || ""}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                            disabled={isLoading}
                                                        />
                                                        <label htmlFor="">{errors.fecha_inicio && errors.fecha_inicio[0] || ""}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-3">
                                                    <Form.Field error={errors.fecha_final && errors.fecha_final[0] || ""}>
                                                        <label htmlFor="">Fecha Final</label>
                                                        <input type="date"
                                                            name="fecha_final"
                                                            value={form.fecha_final || ""}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                            disabled={isLoading}
                                                        />
                                                        <label htmlFor="">{errors.fecha_final && errors.fecha_final[0] || ""}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-3">
                                                    <Form.Field>
                                                        <label htmlFor="">Licencia Remunerada</label>
                                                        <div>
                                                            <Checkbox toggle
                                                                name="is_pay"
                                                                checked={form.is_pay ? true : false}
                                                                onChange={(e, data) => this.handleInput({ name: data.name, value: data.checked ? 1 : 0 })}
                                                            />
                                                        </div>
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