import React, { Component, Fragment } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/router';
import { Body, BtnBack } from '../../../components/Utils';
import ContentControl from '../../../components/contentControl';
import Show from '../../../components/show';
import { unujobs, authentication } from '../../../services/apis';
import { parseUrl } from '../../../services/utils';
import { findWork } from '../../../storage/actions/workActions';
import { parseOptions } from '../../../services/utils';
import { pap } from '../../../services/storage.json';
import Swal from 'sweetalert2';
import btoa from 'btoa';


export default class Register extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query, store } = ctx;
        await store.dispatch(findWork(ctx));
        let { work } = store.getState().work;
        return { pathname, query, work }
    }

    state = {
        loading: false,
        planillas: [],
        metas: [],
        dependencias: [],
        cargos: [],
        type_categorias: [],
        perfile_laborales: [],
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
        await this.getPlanilla();
        await this.getMeta();
        await this.getDependencias();
        await this.getCargos();
    }

    componentDidUpdate = async (nextProps, nextState ) => {
        let { form } = this.state;
        if (nextState.form && nextState.form.cargo_id != form.cargo_id) {
            await this.getTypeCategoria();
        }
        if (nextState.form && nextState.form.dependencia_id != form.dependencia_id) {
            await this.handlePerfilLaborales(form.dependencia_id)
        }
    }

    handleInput = async ({ name, value }) => {
        let newForm = Object.assign({}, this.state.form);
        let newErrors = Object.assign({}, this.state.errors);
        newErrors[name] = [];
        newForm[name] = value;
        this.setState({ form: newForm, errors: newErrors });
    }

    handleFile = async ({ name, files }) => {
        if (files[0]) {
            this.handleInput({ name, value: files[0] });
        }
    }

    handlePerfilLaborales = async (dependencia_id = null) => {
        if (dependencia_id) {
            this.setState(state => {
                for (let dep of state.dependencias) {
                    if (dep.id == dependencia_id) return { perfil_laborales: dep.perfil_laborales || [] };
                }
            });
        } else {
            this.setState({ perfil_laborales: [] });
            this.handleInput({ name: 'perfil_laboral_id', value: '' });
        }
    } 

    getPlanilla = async () => {
        this.setState({ loading: true });
        await unujobs.get('planilla')
        .then(res => this.setState({ planillas: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    getMeta = async () => {
        this.setState({ loading: true });
        await unujobs.get('meta')
        .then(res => this.setState({ metas: res.data.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    getDependencias = async () => {
        this.setState({ loading: true });
        await unujobs.get('dependencia')
        .then(res => this.setState({ dependencias: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    getCargos = async () => {
        this.setState({ loading: true });
        await unujobs.get('cargo')
        .then(res => this.setState({ cargos: res.data.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    getTypeCategoria = async () => {
        await this.handleInput({ name: "type_categoria_id", value: "" });
        this.setState({ loading: true, type_categorias: [] });
        await unujobs.get(`cargo/${this.state.form.cargo_id}`)
        .then(res => this.setState({ type_categorias: res.data.type_categorias }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    create = async () => {
        this.setState({ loading: true });
        let newForm = new FormData;
        newForm.append('work_id', this.props.work.id);
        for(let key in this.state.form) {
            newForm.append(key, this.state.form[key]);
        }
        await unujobs.post('info', newForm)
        .then(async res => {
            let { success, message, body } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) {
                let id = btoa(body.id);
                location.href = `${parseUrl(location.pathname, 'pay')}?id=${id}`;
            }
        }).catch(err => {
            let { status, data } = err.response;
            if (status == '422') {
                this.setState({ errors: data.errors });
            }
        });
        // leave loading
        this.setState({ loading: false });
    }

    render() {

        let { query, work } = this.props;
        let { errors, perfil_laborales } = this.state;

        return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <div className="card-header">
                            <BtnBack onClick={this.handleBack}/> <span className="ml-3">Crear contrato de trabajo</span>
                        </div>
                    </Body>
                </div>

                <div className="col-md-12 mt-3">
                    <Body>
                        <Form loading={this.state.loading} onSubmit={(e) => e.preventDefault()}>
        
                            <Show condicion={true}>
                                <div className="card-header">
                                    <i className="fas fa-plus"></i> Registrar nuevo contrato
                                </div>
                                <div className="card-body">
                                    <div className="row w-100">
                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Trabajador</label>
                                                <input type="text" 
                                                    defaultValue={work && work.person && work.person.fullname}
                                                    disabled={true}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Planilla <b className="text-red">*</b></label>
                                                <Select
                                                    options={parseOptions(this.state.planillas, ['Sel-plan', '', 'Select. Planilla'], ['id', 'id', 'nombre'])}
                                                    placeholder="Select. Planilla"
                                                    name="planilla_id"
                                                    value={this.state.form.planilla_id}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                    error={errors && errors.planilla_id && errors.planilla_id[0]}
                                                />
                                                <b className="text-red">{errors && errors.planilla_id && errors.planilla_id[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Dependencia/Oficina <b className="text-red">*</b></label>
                                                <Select
                                                     options={parseOptions(this.state.dependencias, ['Sel-depen', '', 'Select. Dependencia'], ['id', 'id', 'nombre'])}
                                                     placeholder="Select. Dependencia"
                                                     name="dependencia_id"
                                                     value={this.state.form.dependencia_id}
                                                     onChange={(e, obj) => this.handleInput(obj)}
                                                     error={errors && errors.dependencia_id && errors.dependencia_id[0]}
                                                />
                                                <b className="text-red">{errors && errors.dependencia_id && errors.dependencia_id[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">MetaID <b className="text-red">*</b></label>
                                                <Select
                                                    options={parseOptions(this.state.metas, ['Sel-met', '', 'Select. Meta'], ['id', 'id', 'metaID'])}
                                                    placeholder="Select. MetaID"
                                                    name="meta_id"
                                                    value={this.state.form.meta_id}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                    error={errors && errors.meta_id && errors.meta_id[0]}
                                                />
                                                <b className="text-red">{errors && errors.meta_id && errors.meta_id[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">ActividadID <b className="text-red">*</b></label>
                                                <Select
                                                    options={parseOptions(this.state.metas, ['Sel-met', '', 'Select. Meta'], ['id', 'id', 'actividadID'])}
                                                    placeholder="Select. Meta"
                                                    name="meta_id"
                                                    value={this.state.form.meta_id}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Meta <b className="text-red">*</b></label>
                                                <Select
                                                    options={parseOptions(this.state.metas, ['Sel-met', '', 'Select. Meta'], ['id', 'id', 'meta'])}
                                                    placeholder="Select. Meta"
                                                    name="meta_id"
                                                    value={this.state.form.meta_id}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Partición Presupuestal. <b className="text-red">*</b></label>
                                                <Select
                                                    options={parseOptions(this.state.cargos, ['Sel-car', '', 'Select. Cargo'], ['id', 'id', 'alias'])}
                                                    placeholder="Select. Cargo"
                                                    name="cargo_id"
                                                    value={this.state.form.cargo_id}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                    error={errors && errors.cargo_id && errors.cargo_id[0]}
                                                />
                                                <b className="text-red">{errors && errors.cargo_id && errors.cargo_id[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Ext pptto <b className="text-red">*</b></label>
                                                <Select
                                                    options={parseOptions(this.state.cargos, ['Sel-pptto', '', 'Select. Ext pptto'], ['id', 'id', 'ext_pptto'])}
                                                    placeholder="Select. Ext pptto"
                                                    name="cargo_id"
                                                    value={this.state.form.cargo_id}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Tip. Categoría <b className="text-red">*</b></label>
                                                <Select
                                                    options={parseOptions(this.state.type_categorias, ['Sel-tip-categoria', '', 'Select. Tip. Categoría'], ['id', 'id', 'descripcion'])}
                                                    placeholder="Select. Tip. Categoría"
                                                    name="type_categoria_id"
                                                    value={this.state.form.type_categoria_id}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                    disabled={!this.state.form.cargo_id}
                                                    error={errors && errors.type_categoria_id && errors.type_categoria_id[0]}
                                                />
                                                <b className="text-red">{errors && errors.type_categoria_id && errors.type_categoria_id[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">P.A.P <b className="text-red">*</b></label>
                                                <Select
                                                    options={pap}
                                                    placeholder="Select. P.A.P"
                                                    name="pap"
                                                    value={this.state.form.pap}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                    error={errors && errors.pap && errors.pap[0]}
                                                />
                                                <b className="text-red">{errors && errors.pap && errors.pap[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Plaza</label>
                                                <input type="text" 
                                                    name="plaza"
                                                    value={this.state.form.plaza}
                                                    placeholder="Plaza"
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field err>
                                                <label htmlFor="">Perfil Laboral <b className="text-red">*</b></label>
                                                <Select
                                                     options={parseOptions(perfil_laborales, ['Sel-per', '', 'Select. Perfil Laboral'], ['id', 'id', 'nombre'])}
                                                     placeholder="Select. Perfil Laboral"
                                                     name="perfil_laboral_id"
                                                     value={this.state.form.perfil_laboral_id || ""}
                                                     onChange={(e, obj) => this.handleInput(obj)}
                                                     error={errors && errors.perfil_laboral_id && errors.perfil_laboral_id[0]}
                                                />
                                                <b className="text-red">{errors && errors.perfil_laboral && errors.perfil_laboral[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Fecha de Ingreso <b className="text-red">*</b></label>
                                                <input type="date" 
                                                    name="fecha_de_ingreso"
                                                    placeholder="Fecha de ingreso"
                                                    value={this.state.form.fecha_de_ingreso}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                                <b className="text-red">{errors && errors.fecha_de_ingreso && errors.fecha_de_ingreso[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Fecha de Cese </label>
                                                <input type="date" 
                                                    placeholder="Fecha de cese"
                                                    name="fecha_de_cese"
                                                    value={this.state.form.fecha_de_cese}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="file">Archivo de Regístro</label>
                                                <label htmlFor="file" className="btn btn-outline-dark">
                                                    <i className="fas fa-file-alt"></i>
                                                    <input type="file" 
                                                        id="file"
                                                        onChange={(e) => this.handleFile(e.target)}
                                                        name="file"
                                                        hidden 
                                                        placeholder="Archivo de Regístro"
                                                        accept="application/pdf"
                                                    />
                                                </label>
                                                <b className="text-red">{errors && errors.file && errors.file[0]}</b>
                                            </Form.Field>
                                        </div>
                                        
                                        <div className="col-md-8 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Observación <b className="text-red">*</b></label>
                                                <textarea name="observacion" 
                                                    value={this.state.form.observacion}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                                <b className="text-red">{errors && errors.observacion && errors.observacion[0]}</b>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">N° Ruc</label>
                                                <input type="text" 
                                                    placeholder="N° Ruc"
                                                    name="ruc"
                                                    value={this.state.form.ruc}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                            </Form.Field>

                                            <Form.Field>
                                                <label htmlFor="">¿ Agregar aportación empleador: ESSALUD ?</label>
                                                <Select
                                                    placeholder="Select. Aportación"
                                                    name="is_aportacion"
                                                    options={[
                                                        { key: "0", value: "0", text: "No" },
                                                        { key: "1", value: "1", text: "Si" }
                                                    ]}
                                                    value={this.state.form.is_aportacion}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                />
                                            </Form.Field>
                                        </div>
                                    </div>
                                </div>
                            </Show>
                        </Form>
                    </Body>
                </div>

                <ContentControl>
                    <div className="col-lg-2 col-6">
                        <Button fluid color="red" disabled={this.state.loading}>
                            <i className="fas fa-times"></i> Cancelar
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button fluid color="blue" 
                            disabled={this.state.loading}
                            onClick={this.create}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </ContentControl>
            </Fragment>
        )
    }

}