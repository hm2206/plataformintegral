import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions, Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication, unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import AssignPerson from '../../../components/authentication/user/assignPerson';
import { tipo_documento } from '../../../services/storage.json';
import {  AUTHENTICATE } from '../../../services/auth';


export default class CreateWork extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        afps: [],
        bancos: [],
        form: {
            banco_id: 1,
            afp_id: 1
        },
        errors: {},
        check: false,
        person: {},
    }

    componentDidMount = () => {
        this.getAfps();
        this.getBancos();
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors };
        });
    }

    handleAssign = () => {
        let { push, pathname, query } = Router;
        query.assign = "true";
        push({ pathname, query });
    }

    getAfps = async () => {
        this.setState({ loader: true });
        await unujobs.get(`afp`)
        .then(res => {
            this.setState({ afps: res.data });
        }).catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    getBancos = async () => {
        this.setState({ loader: true });
        await unujobs.get(`banco`)
        .then(res => {
            this.setState({ bancos: res.data });
        }).catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    getAdd = async (obj) => {
        this.setState({
            person: obj,
            check: true
        })
        // generar usuario
        this.handleInput({ name: 'username', value: obj.document_number });
    }

    create = async () => {
        let safe = await Confirm('warning', '¿Desea guardar los datos?', 'Aceptar');
        if (safe) {
            this.setState({ loader: true });
            let { form, person } = this.state;
            let newForm = Object.assign({}, form);
            newForm.person_id = person.id;
            newForm.orden = person.fullname;
            await unujobs.post('work', newForm)
            .then(async res => {
                let { success, message, body } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
            })
            .catch(err => Swal.fire({ icon: 'error', text: err.message }))
            this.setState({ loader: false });
        }
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors, person } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Agregar Información del trabajador
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-12 mb-4">
                                        <h4><i className="fas fa-fingerprint"></i> Seleccionar Persona</h4>
                                        <hr/>

                                        <div className="row">
                                            <Show condicion={!this.state.check}>
                                                <div className="col-md-4">
                                                    <Button
                                                        disabled={this.state.loading}
                                                        onClick={this.handleAssign}
                                                    >
                                                        <i className="fas fa-plus"></i> Asignar
                                                    </Button>
                                                </div>
                                            </Show>

                                            <Show condicion={this.state.check}>
                                                <div className="col-md-4 mb-3">
                                                    <Form.Field>
                                                        <label htmlFor="">Tip. Documento</label>
                                                        <Select fluid
                                                            disabled
                                                            options={tipo_documento}
                                                            value={person.document_type || '01'}
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">N° Documento</label>
                                                        <input type="text"
                                                            value={person.document_number || ""}
                                                            disabled
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Apellidos y Nombres</label>
                                                        <input type="text"
                                                            className="uppercase"
                                                            value={person.fullname || ""}
                                                            disabled
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Button
                                                        onClick={this.handleAssign}
                                                        disabled={this.state.loading}
                                                    >
                                                        <i className="fas fa-sync"></i> Cambiar
                                                    </Button>
                                                </div>
                                            </Show>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                        <h4><i className="fas fa-praying-hands"></i> Datos del Trabajador</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <Form.Field>
                                            <label htmlFor="">N° de Essalud</label>
                                            <input type="text" 
                                                placeholder="Ingrese su autogenerado de essalud"
                                                value={form.numero_de_essalud || ""} 
                                                name="numero_de_essalud"
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <Form.Field>
                                            <label htmlFor="">Tip. Banco <b className="text-red">*</b></label>
                                                <Select
                                                    options={parseOptions(this.state.bancos, ['sel-banco', "", 'Select. Tip. Banco'], ['id', 'id', 'nombre'])}
                                                    name="banco_id"
                                                    value={form.banco_id || ""}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <Form.Field>
                                            <label htmlFor="">N° Cuenta</label>
                                            <input
                                                type="text"
                                                name="numero_de_cuenta"
                                                value={form.numero_de_cuenta || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <Form.Field>
                                            <label htmlFor="">Tip. AFP <b className="text-red">*</b></label>
                                            <Select
                                                options={parseOptions(this.state.afps, ['sel-afp', "", 'Select. Tip. AFP'], ['id', 'id', 'descripcion'])}
                                                name="afp_id"
                                                value={form.afp_id}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <Form.Field>
                                            <label htmlFor="">N° de Cussp</label>
                                            <input type="text"
                                            name="numero_de_cussp"
                                            value={form.numero_de_cussp}
                                             onChange={(e) => this.handleInput(e.target)}
                                         />
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-2">
                                    <Form.Field>
                                        <label htmlFor="">Fecha de Afiliación</label>
                                        <input type="date" 
                                            name="fecha_de_afiliacion"
                                            value={form.fecha_de_afiliacion}
                                            onChange={(e) => this.handleInput(e.target)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-2">
                                    <Form.Field>
                                        <label htmlFor="">Prima Seguro</label>
                                        <Select
                                            options={[
                                                {key: "no-afecto", value: 0, text: "No afecto"},
                                                {key: "afecto", value: 1, text: "afecto" }
                                            ]}
                                            name="prima_seguro"
                                            value={form.prima_seguro}
                                            onChange={(e, obj) => this.handleInput(obj)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-12">
                                    <hr/>
                                </div>

                                <div className="col-md-2">
                                    <Button color="teal" fluid
                                        disabled={this.state.loading || !this.state.check}
                                        onClick={this.create}
                                        loading={this.state.loading}
                                    >
                                        <i className="fas fa-save"></i> Guardar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Form>
                </div>
            </Body>

            <Show condicion={query && query.assign}>
                <AssignPerson
                    getAdd={this.getAdd}
                    isClose={(e) => {
                        let { push, pathname, query } = Router;
                        query.assign = "";      
                        push({ pathname, query })
                    }}
                />
            </Show>
        </div>
        )
    }
    
}