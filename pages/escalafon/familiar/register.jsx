import React, { Component, Fragment } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import ContentControl from '../../../components/contentControl';
import Show from '../../../components/show';
import { unujobs, authentication } from '../../../services/apis';
import { parseUrl, Confirm } from '../../../services/utils';
import { pap } from '../../../services/storage.json';
import Swal from 'sweetalert2';
import btoa from 'btoa';
import Router from 'next/router';
import AssignPerson from '../../../components/authentication/user/assignPerson'
import AssignTrabajador from '../../../components/contrato/assingTrabajador';
import { tipo_documento } from '../../../services/storage.json';


export default class RegisterFamiliar extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query }
    }

    state = {
        loading: false,
        show_work: false,
        show_familiar: false,
        check: false,
        check_familiar: false,
        familiar: {},
        person: {},
        form: {
            is_aportacion: "1",
            planilla_id: "",
            meta_id: "",
            dependencia_id: "",
            pap: "",
            cargo_id: "",
            type_categoria_id: "",
            perfil_laboral_id: ""
        },
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

    getPersonAdd = async (obj) => {
        this.setState({
            show_familiar: false,
            familiar: obj,
            check_familiar: true
        });
    }

    create = async () => {
        let answer = await Confirm("warning", "¿Estas seguro en guardar el contrato?", "Estoy Seguro");
        if (answer) {
            this.props.fireLoading(true);
            this.setState({ loading: true });
            let newForm = new FormData;
            newForm.append('work_id', this.state.person.id);
            for(let key in this.state.form) {
                newForm.append(key, this.state.form[key]);
            }
            await unujobs.post('info', newForm)
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message, body } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                if (success) {
                    let id = btoa(body.id);
                    let query = {
                        id,
                        href: location.pathname
                    }
                    Router.push({ pathname: `${parseUrl(location.pathname, 'pay')}`, query });
                }
            }).catch(err => {
                this.props.fireLoading(false);
                let { status, data } = err.response;
                if (status == '422') {
                    this.setState({ errors: data.errors });
                }
            });
            // leave loading
            this.setState({ loading: false });
            this.props.fireLoading(false);
        }
    }

    render() {

        let { errors, person, show_work, show_familiar, check_familiar, familiar } = this.state;

        return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <div className="card-header">
                            <span className="ml-3">Regístrar Familiar del Trabajador</span>
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
                                            <i className="fas fa-info-circle mr-1"></i> Información del Familiar
                                            <hr/>
                                        </div>

                                        <div className="card-body">
                                            <div className="row w-100">
                                                <div className={`col-md-${check_familiar ? '3' : '4'} mb-2`}>
                                                    <Form.Field>
                                                        <label htmlFor="">Persona</label>
                                                        <Show condicion={check_familiar}>
                                                            <input type="text" disabled readOnly value={familiar && familiar.fullname || ""}/>
                                                        </Show>
                                                        <Show condicion={!check_familiar}>
                                                            <Button onClick={(e) => this.setState({ show_familiar: true })}>
                                                                <i className="fas fa-plus"></i> Agregar Persona
                                                            </Button>
                                                        </Show>
                                                    </Form.Field>
                                                </div>

                                                <Show condicion={check_familiar}>
                                                    <div className="col-md-1">
                                                        <Button className="mt-4" onClick={(e) => this.setState({ show_familiar: true })}>
                                                            <i className="fas fa-sync"></i>
                                                        </Button>
                                                    </div>
                                                </Show>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Tipo de Familiar</label>
                                                        <Select
                                                            placeholder="Seleccionar Tip. Familiar"
                                                            options={[]}
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Descripción</label>
                                                        <input type="text"
                                                            name="descripcion"
                                                        />
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
                    <AssignTrabajador
                        getAdd={this.getAdd}
                        isClose={(e) => this.setState({ show_work: false })}
                    />
                </Show>

                <Show condicion={show_familiar}>
                    <AssignPerson
                        getAdd={this.getPersonAdd}
                        isClose={(e) => this.setState({ show_familiar: false })}
                    />
                </Show>
            </Fragment>
        )
    }

}