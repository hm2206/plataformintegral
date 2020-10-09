import React, { Component, Fragment } from 'react';
import { Form, Button, Select, Checkbox } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../services/auth';
import { Body, BtnBack } from '../../components/Utils';
import ContentControl from '../../components/contentControl';
import Show from '../../components/show';
import { escalafon } from '../../services/apis';
import { parseUrl, Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import Router from 'next/router';
import AssignTrabajadorEntity from '../../components/contrato/assingTrabajadorEntity';   
import { tipo_documento } from '../../services/storage.json';


export default class Ficha extends Component
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
        pdf: null,
        errors: {},
        argumentos: [],
        parametros: [
            { key: 'grado', value: 'grado', text: 'Formación Académica' },
            { key: 'experiencia', value: 'experiencia', text: 'Exp. Laboral' },
            { key: 'licencia', value: 'licencia', text: 'Licencia' },
            { key: 'ascenso', value: 'ascenso', text: 'Ascensos' },
            { key: 'desplazamiento', value: 'desplazamiento', text: 'Desplazamientos' },
            { key: 'merito', value: 'merito', text: 'Méritos' },
            { key: 'desmerito', value: 'desmerito', text: 'Desmeritos' },
            { key: 'familiar', value: 'familiar', text: 'Familiar' }
        ]
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
            check: true,
            pdf: null
        })
        // generar usuario
        this.handleInput({ name: 'username', value: obj.document_number });
    }

    getFicha = async () => {
        let { person, argumentos } = this.state;
        let form = new FormData;
        await argumentos.map(par => form.append('argumentos[]', par));
        this.props.fireLoading(true);
        await escalafon.post(`report/ficha_escalafonaria/${person.id}?is_pdf=0`, form, { responseType: 'blob' })
            .then(res => {
                this.props.fireLoading(false);
                let mines = res.headers['content-type'];
                let blob = new Blob([res.data], { type: 'text/html' });
                let link = URL.createObjectURL(blob);
                this.setState({ pdf: link });
            }).catch(err => {
                this.props.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
            
    }

    handleChecked = (e, { name, checked }) => {
        if (checked) {
            this.setState(state => ({ argumentos: [...state.argumentos, name] }));
        } else {
            this.setState(state => {
                let index = state.argumentos.indexOf(name);
                if (index >= 0) state.argumentos.splice(index, 1);
                return { argumentos: state.argumentos };
            });
        } 
    }

    executePrint = async () => {
        let print = window.open(this.state.pdf);
        print.onload = () => {
            print.print();
        }
    }

    render() {

        let { errors, person, show_work, parametros } = this.state;
        let { isLoading } = this.props;

        return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <div className="card-header">
                            <span className="ml-3">Reporte de Ficha Escalafonaria</span>
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
                                            <i className="fas fa-info-circle mr-1"></i> Información de Ficha Escalafonaria
                                            <hr/>
                                        </div>

                                        <div className="card-body">
                                            <div className="row w-100">
                                                <div className="col-md-8">
                                                    <dic className="card">
                                                        <div className="card-header">
                                                            <i className="fas fa-file-pdf text-red"></i> Visualizador
                                                        </div>
                                                        <div className="card-body">
                                                            <Show condicion={!this.state.pdf}>
                                                                <div className="py-5 text-center">
                                                                    <i className="far fa-file-pdf" style={{ fontSize: '4em' }}></i>
                                                                    <div className="mt-2" style={{ fontSize: '1.5em'}}>
                                                                        No se encontró la ficha escalafonaria
                                                                    </div>
                                                                </div>
                                                            </Show>

                                                            <Show condicion={this.state.pdf}>
                                                                <iframe src={`${this.state.pdf}#view=FitH,top`} frameborder="0" width="100%" style={{ minHeight: '500px' }}></iframe>
                                                            </Show>
                                                        </div>
                                                        <div className="card-footer">
                                                            <div className="py-2 text-right w-100">
                                                                <Show condicion={this.state.pdf}>
                                                                    <Button color="blue" 
                                                                        disabled={isLoading}
                                                                        onClick={this.executePrint}
                                                                    >
                                                                        <i className="fas fa-print"></i> Imprimir
                                                                    </Button>
                                                                </Show>

                                                                <Button color="black" 
                                                                    disabled={!this.state.check}
                                                                    onClick={this.getFicha}
                                                                >
                                                                    <i className="fas fa-sync"></i> Generar
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </dic>
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <i className="fas fa-cog"></i> Configurar Reporte
                                                        </div>
                                                        <div className="card-body">
                                                            {parametros.map(par => 
                                                                <div className="mb-2" key={`parametro-${par.key}`}>
                                                                    <Checkbox onChange={this.handleChecked} name={par.key}/> {par.text}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </Body>
                </div>

                <Show condicion={show_work}>
                    <AssignTrabajadorEntity
                        getAdd={this.getAdd}
                        isClose={(e) => this.setState({ show_work: false })}
                    />
                </Show>
            </Fragment>
        )
    }

}