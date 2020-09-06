import React, { Component } from 'react';
import { Body, BtnBack, DropZone } from '../../../components/Utils';
import Router from 'next/router';
import { backUrl, Confirm } from '../../../services/utils';
import { Form, Select, Button } from 'semantic-ui-react';
import { authentication, tramite } from '../../../services/apis';
import Swal from 'sweetalert2';


export default class IndexTramiteInterno extends Component
{

    static getInitialProps = async (ctx) => {
        let { query, pathname } = ctx;
        return { query, pathname }
    } 

    state = {
        my_dependencias: [],
        dependencias: [],
        tramite_types: [],
        errors: {},
        form: {
            dependencia_id: "",
            dependencia_origen_id: "",
            tramite_type_id: "",
            document_number: "",
            folio_count: "",
            asunto: ""
        },
        file: {
            size: 0,
            data: []
        }
    }

    componentDidMount = () => {
        this.props.fireEntity({ render: true });
        this.getDependencias();
        this.getTramiteType();
        this.getMyDependencias(this.props.entity_id || "", 1, true)
    }

    componentWillReceiveProps = (nextProps) => {
        let { entity_id } = this.props;
        if (entity_id != nextProps.entity_id) this.getMyDependencias(nextProps.entity_id, 1, false);
    }

    handleBack = () => {
        let { pathname, push } = Router;
        push({ pathname: backUrl(pathname) });
    }
    
    handleInput = ({ name, value }) => {
        this.setState(state => {
            state.form[name] = value || "";
            state.errors[name] = [];
            return { form: state.form };
        })
    }

    handleFiles = ({ files }) => {
        let { file } = this.state;
        let size_total = file.size;
        let size_limit = 2 * 1024;
        for (let f of files) {
            size_total += f.size;
            if ((size_total / 1024) <= size_limit) {
                this.setState(state => {
                    state.file.size = size_total;
                    state.file.data.push(f);
                    return { file: state.file }
                });
            } else {
                size_total = size_total - f.size;
                Swal.fire({ icon: 'error', text: `El limíte máximo es de 2MB, tamaño actual(${(size_total / (1024 * 1024)).toFixed(2)}MB)` });
                return false;
            }
        }
    }
 
    deleteFile = (index, file) => {
        this.setState(state => {
            state.file.data.splice(index, 1);
            state.file.size = state.file.size - file.size; 
            return { file: state.file };
        });
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

    getMyDependencias = async (id, page = 1, up = true) => {
        if (id) {
            await authentication.get(`auth/dependencia/${id}?page=${page}`)
            .then(async res => {
                let { success, message, dependencia } = res.data;
                if (!success) throw new Error(message);
                let { lastPage, data } = dependencia;
                let newData = [];
                // add data
                await data.map(async d => await newData.push({
                    key: `my_dependencia-${d.id}`,
                    value: d.id,
                    text: `${d.nombre}`
                }));
                // setting data
                this.setState(state => ({
                    my_dependencias: up ? [...state.my_dependencias, ...newData] : newData
                }));
                // validar request
                if (lastPage > page + 1) await this.getMyDependencias(page + 1);
            })
            .catch(err => console.log(err.message));
        } else {
            this.setState({ my_dependencias: [] });
            this.handleInput({ name: 'dependencia_id', value: "" })
        }
    }

    getTramiteType = async (page = 1) => {
        await tramite.get(`tramite_type?page=${page}`)
        .then(async res => {
            let { tramite_type, success, message } = res.data;
            if (!success) throw new Error(message);
            let { lastPage, data } = tramite_type;
            let newData = [];
            await data.map(async d => await newData.push({
                key: `tramite_type_${d.id}`,
                value: d.id,
                text: d.description
            }));
            // add
            this.setState(state => ({ tramite_types: [...state.tramite_types, ...newData] }))
        })
        .catch(err => console.log(err.message));
    }

    saveTramite = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar el tramite?`, 'Guardar');
        if (answer) {
            let datos = new FormData();
            let { form, file } = this.state;
            for (let attr in form) {
                datos.append(attr, form[attr]);
            }
            // add files
            file.data.map(f => datos.append('files', f));
            // request
            this.props.fireLoading(true);
            await tramite.post('tramite', datos, { headers: { DependenciaId: form.dependencia_id } })
            .then(res => {
                this.props.fireLoading(false);
                let { success, message, tramite } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                this.setState({ form: {}, file: { size: 0, data: [] } })
            }).catch(err => {
                try {
                    this.props.fireLoading(false);
                    let response = JSON.parse(err.message);
                    Swal.fire({ icon: 'warning', text: response.message });
                    this.setState({ errors: response.errors });
                } catch (error) {
                    Swal.fire({ icon: 'error', text: err.message });
                }
            })
        }
    }

    render() {

        let { my_dependencias, form, tramite_types, errors, file } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={this.handleBack}/>
                        <span className="ml-2">Crear Tramite Interno</span>
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-8">
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <Form.Field error={errors && errors.dependencia_id && errors.dependencia_id[0] || ""}>
                                            <label htmlFor="">Mi Dependencia <b className="text-red">*</b></label>
                                            <Select
                                                value={form.dependencia_id || ""}
                                                name="dependencia_id"
                                                options={my_dependencias}
                                                placeholder="Select. Mi Dependencia"
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                            <label>{errors && errors.dependencia_id && errors.dependencia_id[0] || ""}</label>
                                        </Form.Field>
                                    </div>
                                    
                                    <div className="col-md-6 mt-3">
                                        <Form.Field error={errors && errors.tramite_type_id && errors.tramite_type_id[0] || ""}>
                                            <label htmlFor="">Tipo de Tramite<b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Select. Tipo de Tramite"
                                                value={form.tramite_type_id || ""}
                                                name="tramite_type_id"
                                                options={tramite_types}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                            <label>{errors && errors.tramite_type_id && errors.tramite_type_id[0] || ""}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mt-3">
                                        <Form.Field error={errors && errors.document_number && errors.document_number[0] || ""}>
                                            <label htmlFor="">N° Documento<b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el N° documento"
                                                name="document_number"
                                                value={form.document_number || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.document_number && errors.document_number[0] || ""}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mt-3">
                                        <Form.Field error={errors && errors.folio_count && errors.folio_count[0] || ""}>
                                            <label htmlFor="">N° Folio<b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el N° Folio"
                                                name="folio_count"
                                                value={form.folio_count || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.folio_count && errors.folio_count[0] || ""}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 mt-3">
                                        <Form.Field error={errors && errors.asunto && errors.asunto[0] || ""}>
                                            <label htmlFor="">Asunto de Tramite<b className="text-red">*</b></label>
                                            <input
                                                placeholder="Ingrese el asunto del trámite"
                                                name="asunto"
                                                value={form.asunto || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.asunto && errors.asunto[0] || ""}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 mt-3">
                                        <Form.Field error={errors && errors.observation && errors.observation[0] || ""}>
                                            <label htmlFor="">Observación</label>
                                            <textarea
                                                placeholder="Ingrese un observación"
                                                name="observation"
                                                value={form.observation || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.observation && errors.observation[0] || ""}</label>
                                        </Form.Field>
                                    </div>
                                    
                                    <div className="col-md-12">
                                        <hr/>
                                        <i className="fas fa-file-alt"></i> Agregar archivos
                                        <hr/>
                                    </div>

                                    <div className="col-md-12 mt-3">
                                        <DropZone id="files" 
                                            name="files"
                                            onChange={(e) => this.handleFiles(e)} 
                                            icon="save"
                                            result={file.data}
                                            title="Select. Archivo (*.docx, *.pdf)"
                                            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onDelete={(e) => this.deleteFile(e.index, e.file)}
                                        />
                                    </div>

                                    <div className="col-md-12 mt-4">
                                        <hr/>
                                        <div className="text-right">
                                            <Button color="teal"
                                                onClick={this.saveTramite}
                                            >
                                                <i className="fas fa-save"></i> Guardar Tramite
                                            </Button>
                                        </div>
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