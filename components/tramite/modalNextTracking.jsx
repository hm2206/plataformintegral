import React, { Component } from 'react'
import Modal from '../modal';
import { Form, Select, Button } from 'semantic-ui-react';
import Router from 'next/router';
import { tramite, authentication } from '../../services/apis';
import { InputFile } from '../../components/Utils';
import { Confirm } from '../../services/utils'
import Swal from 'sweetalert2';

export default class ModalNextTracking extends Component
{

    state = {
        loader: false,
        form: {
            status: "",
            dependencia_destino_id: "",
            description: "",
            file: null
        },
        errors: {},
        query_search: "",
        dependencias: []
    }

    componentDidMount = async () => {
        let { tramite } = this.props;
        this.getDependencias();
    }

    getDependencias = async (page = 1) => {
        await authentication.get(`dependencia?page=${page}`)
        .then(async res => {
            let { success, message, dependencia } = res.data;
            if (!success) throw new Error(message);
            let { lastPage, data } = dependencia;
            let newData = [];
            // add data
            await data.map(async d => await newData.push({
                key: `dependencia-${d.id}`,
                value: d.id,
                text: `${d.nombre}`
            }));
            // setting data
            this.setState(state => ({
                dependencias: [...state.dependencias, ...newData]
            }));
            // validar request
            if (lastPage > page + 1) await this.getDependencias(page + 1);
        })
        .catch(err => console.log(err.message));
    }

    getAction = (parent = 1) => {
        if (parent) return [
            { key: "_DERIVAR", value: "DERIVADO", text: "DERIVAR" },
            { key: "_ANULAR", value: "ANULADO", text: "ANULAR" },
            { key: "_FINALIZAR", value: "FINALIZADO", text: "FINALIZAR" }
        ]
        // default
        return [
            { key: "_ACEPTAR", value: "ACEPTADO", text: "ACEPTAR" },
            { key: "_RECHAZAR", value: "RECHAZADO", text: "RECHAZAR" }
        ]
    }

    handlePage = async (nextPage) => {
        this.setState({ loader: true });
        await this.getUser(nextPage, this.state);
    }

    handleInput = ({ name, value }) => {
        this.setState(state => {
            state.form[name] = value;
            state.errors[name] = [];
            return { form: state.form, errors: state.errors };
        });
    }

    nextTracing = async () => {
        let answer = await Confirm(`warning`, `¿Deseas continuar?`);
        if (answer) {
            let { id, dependencia_destino_id } = this.props.tramite;
            let { form } = this.state;
            let datos = new FormData;
            // assing form
            for(let attr in form) {
                datos.append(attr, form[attr]);
            }
            // send next
            await tramite.post(`tracking/${id}/next`, form, { headers: { DependenciaId: dependencia_destino_id } })
                .then(res => {
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    Swal.fire({ icon: 'success', text: message });
                }).catch(err => {
                    try {
                        let response = JSON.parse(err.message);
                        Swal.fire({ icon: 'warning', text: response.message });
                        this.setState({ errors: response.errors });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: err.message });
                    }
                });
        }
    }

    render() {

        let { loader, form, dependencias, errors } = this.state;
        let { tramite } = this.props;

        return (
            <Modal
                show={true}
                {...this.props}
                titulo={<span><i className="fas fa-path"></i> Proceso del trámite: <span className="badge badge-dark">{tramite && tramite.slug}</span></span>}
            >
                <Form className="card-body" loading={loader}>
                    <div className="row">
                        <div className="col-md-6 mt-3">
                            <Form.Field>
                                <label htmlFor="">Fecha Registro</label>
                                <input type="date" readOnly value={tramite && tramite.created_at && `${tramite.created_at}`.split(' ')[0] || ""}/>
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mt-3">
                            <Form.Field error={errors.status && errors.status[0] || ""}>
                                <label htmlFor="">Acción <b className="text-red">*</b></label>
                                <Select
                                    placeholder="Select. Acción"
                                    options={this.getAction(tramite.parent || 0)}
                                    name="status"
                                    value={form.status || ""}
                                    onChange={(e, obj) => this.handleInput(obj)}
                                />
                                <label htmlFor="">{errors.status && errors.status[0] || ""}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mt-3">
                            <Form.Field>
                                <label htmlFor="">Dependencía Origen</label>
                                <input type="text" readOnly value={tramite && tramite.dependencia_origen && tramite.dependencia_origen.nombre}/>
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mt-3">
                            <Form.Field error={errors.dependencia_destino_id && errors.dependencia_destino_id[0] || ""}>
                                <label htmlFor="">Dependencía Destino <b className="text-red">*</b></label>
                                <Select
                                    name="dependencia_destino_id"
                                    placeholder="Select. Dependencía Destino"
                                    options={dependencias}
                                    value={form.dependencia_destino_id || ""}
                                    onChange={(e, obj) => this.handleInput(obj)}
                                />
                                <label htmlFor="">{errors.dependencia_destino_id && errors.dependencia_destino_id[0] || ""}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-12 mt-3">
                            <Form.Field  error={errors.description && errors.description[0] || ""}>
                                <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                <textarea 
                                    name="description" 
                                    rows="4"
                                    value={form.description || ""}
                                    onChange={(e) => this.handleInput(e.target)}
                                />
                                <label htmlFor="">{errors.description && errors.description[0] || ""}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-12 mt-3">
                            <Form.Field error={errors.file && errors.file[0] || ""}>
                                <label htmlFor="">Adjuntar Archivo</label>
                                <InputFile
                                    id="file_"
                                    name="file"
                                    title="Adjuntar Archivo (*.docx, *.pdf)"
                                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={(e) => this.handleInput({ name: e.name, value: e.file })}
                                />
                                <label htmlFor="">{errors.file && errors.file[0] || ""}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-12 mt-4">
                            <hr/>
                            <div className="text-right">
                                <Button color="teal"
                                    onClick={this.nextTracing}
                                >
                                    <i className="fas fa-sync"></i> Procesar Trámite
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form>
            </Modal>
        );
    }

}