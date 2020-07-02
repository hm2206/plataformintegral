import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import Show from '../../../components/show';


export default class EditMeta extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        form: {},
        errors: {},
        old: {},
        edit: false
    }

    componentWillMount = async () => {
        await this.findMeta();
    }

    findMeta = async () => {
        let { query } = this.props;
        let id = query.id ? atob(query.id) : "_error";
        this.setState({ loading: true });
        await unujobs.get(`meta/${id}`)
        .then(res => this.setState({ form: res.data, old: res.data }))
        .catch(err => this.setState({ form: {} }));
        this.setState({ loading: false });
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors, edit: true };
        });
    }

    save = async () => {
        this.setState({ loading: true });
        let { form } = this.state;
        form._method = 'PUT';
        await unujobs.post(`meta/${form.id}`, form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) this.setState({ errors: {}, edit: false });
        })
        .catch(async err => {
            try {
                let { data } = err.response
                let { message, errors } = data;
                this.setState({ errors });
            } catch (error) {
                await Swal.fire({ icon: 'error', text: 'Algo salió mal' });
            }
        });
        this.setState({ loading: false });
    }
    
    render() {

        let { pathname, query } = this.props;
        let { form, errors } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Editar Meta Presupuestal
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.metaID && errors.metaID[0]}>
                                            <label htmlFor="">MetaID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID de la meta"
                                                name="metaID"
                                                value={form.metaID || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.metaID && errors.metaID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.meta && errors.meta[0]}>
                                            <label htmlFor="">Meta <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripcion de la Meta"
                                                name="meta"
                                                value={form.meta || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.meta && errors.meta[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.sectorID && errors.sectorID[0]}>
                                            <label htmlFor="">SectorID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID del sector"
                                                name="sectorID"
                                                value={form.sectorID || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.sectorID && errors.sectorID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.sector && errors.sector[0]}>
                                            <label htmlFor="">Sector <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción del sector"
                                                name="sector"
                                                value={form.sector || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.sector && errors.sector[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.pliegoID && errors.pliegoID[0]}>
                                            <label htmlFor="">PliegoID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID del pliego"
                                                name="pliegoID"
                                                value={form.pliegoID || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.pliegoID && errors.pliegoID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.pliego && errors.pliego[0]}>
                                            <label htmlFor="">Pliego <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción del pliego"
                                                name="pliego"
                                                value={form.pliego || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.pliego && errors.pliego[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.unidadID && errors.unidadID[0]}>
                                            <label htmlFor="">UnidadID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID de la unidad"
                                                name="unidadID"
                                                value={form.unidadID || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.unidadID && errors.unidadID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.unidad_ejecutora && errors.unidad_ejecutora[0]}>
                                            <label htmlFor="">Unidad Ejecutora <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción de la unidad ejecutora"
                                                name="unidad_ejecutora"
                                                value={form.unidad_ejecutora || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.unidad_ejecutora && errors.unidad_ejecutora[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.programaID && errors.programaID[0]}>
                                            <label htmlFor="">ProgramaID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID del programa"
                                                name="programaID"
                                                value={form.programaID || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.programaID && errors.programaID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.programa && errors.programa[0]}>
                                            <label htmlFor="">Programa <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción del programa"
                                                name="programa"
                                                value={form.programa || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.programa && errors.programa[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.funcionID && errors.funcionID[0]}>
                                            <label htmlFor="">FuncionID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID de la funcion"
                                                name="funcionID"
                                                value={form.funcionID || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.funcionID && errors.funcionID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.funcion && errors.funcion[0]}>
                                            <label htmlFor="">Funcion <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción de la funcion"
                                                name="funcion"
                                                value={form.funcion || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.funcion && errors.funcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.subProgramaID && errors.subProgramaID[0]}>
                                            <label htmlFor="">Sub-ProgramaID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID de la Sub-Programa"
                                                name="subProgramaID"
                                                value={form.subProgramaID || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.subProgramaID && errors.subProgramaID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.sub_programa && errors.sub_programa[0]}>
                                            <label htmlFor="">Sub-Programa <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción del Sub-Programa"
                                                name="sub_programa"
                                                value={form.sub_programa || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.sub_programa && errors.sub_programa[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.actividadID && errors.actividadID[0]}>
                                            <label htmlFor="">ActividadID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID de la Actividad"
                                                name="actividadID"
                                                value={form.actividadID || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.actividadID && errors.actividadID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.actividad && errors.actividad[0]}>
                                            <label htmlFor="">Actividad <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción de la Actividad"
                                                name="actividad"
                                                value={form.actividad || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.actividad && errors.actividad[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                    </div>

                                    <div className="col-md-4 text-right">
                                        <Show condicion={this.state.edit}>
                                            <Button color="red"
                                                disabled={this.state.loading}
                                                onClick={(e) => this.setState(state => ({ edit: false, errors: {}, form: state.old }))}
                                            >
                                                <i className="fas fa-save"></i> Guardar
                                            </Button>
                                        </Show>

                                        <Button color="teal" 
                                            disabled={!this.state.edit}
                                            loading={this.state.loading}
                                            onClick={this.save}
                                        >
                                            <i className="fas fa-save"></i> Guardar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </Body>
            </div>
        )
    }
    
}