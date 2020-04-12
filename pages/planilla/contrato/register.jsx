import React, { Component, Fragment } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/router';
import { Body } from '../../../components/Utils';
import ContentControl from '../../../components/contentControl';
import Show from '../../../components/show';
import { unujobs, authentication } from '../../../services/apis';
import { responsive } from '../../../services/storage.json';
import { parseUrl } from '../../../services/utils';
import { findWork } from '../../../storage/actions/workActions';
import { parseOptions } from '../../../services/utils';
import { pap } from '../../../services/storage.json';


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
        form: {
            planilla_id: "",
            meta_id: "",
            dependencia_id: "",
            pap: "",
            cargo_id: "",
            type_categoria_id: ""
        }
    }

    componentDidMount = async () => {
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
    }

    handleInput = async ({ name, value }) => {
        let newForm = Object.assign({}, this.state.form);
        newForm[name] = value;
        this.setState({ form: newForm });
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

    render() {

        let { query, work } = this.props;

        return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <Button 
                            disabled={this.state.loading}
                            onClick={(e) => {
                                let { push, pathname } = Router;
                                this.setState({ loading: true })
                                push({ pathname: parseUrl(pathname, 'preparate')});
                            }}
                        >
                            <i className="fas fa-arrow-left"></i> Atrás
                        </Button>
                    </Body>
                </div>

                <div className="col-md-12 mt-3">
                    <Body>
                        <Form loading={this.state.loading}>
        
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
                                                />
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
                                                />
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
                                                />
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
                                                <label htmlFor="">Cargo <b className="text-red">*</b></label>
                                                <Select
                                                    options={parseOptions(this.state.cargos, ['Sel-car', '', 'Select. Cargo'], ['id', 'id', 'alias'])}
                                                    placeholder="Select. Cargo"
                                                    name="cargo_id"
                                                    value={this.state.form.cargo_id}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                />
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
                                                />
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
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Plaza <b className="text-red">*</b></label>
                                                <input type="text" 
                                                    name="plaza"
                                                    value={this.state.form.plaza}
                                                    placeholder="Plaza"
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Perfil Laboral <b className="text-red">*</b></label>
                                                <input type="text" 
                                                    name="perfil_laboral"
                                                    placeholder="Perfil Laboral"
                                                    value={this.state.form.perfil_laboral}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
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
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Fecha de Cese <b className="text-red">*</b></label>
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
                                                        name="file"
                                                        hidden 
                                                        placeholder="Archivo de Regístro"
                                                        accept="application/pdf"
                                                    />
                                                </label>
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
                                        </div>
                                    </div>
                                </div>
                            </Show>
                        </Form>
                    </Body>
                </div>

                <ContentControl>
                    <div className="col-lg-2 col-6">
                        <Button fluid color="red">
                            <i className="fas fa-times"></i> Cancelar
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button fluid color="blue">
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </ContentControl>
            </Fragment>
        )
    }

}