import React, { Component } from 'react';
import { Body, BtnBack, DropZone } from '../../../components/Utils';
import Router from 'next/router';
import { backUrl, Confirm } from '../../../services/utils';
import { Form, Select, Button } from 'semantic-ui-react';
import { authentication, tramite } from '../../../services/apis';
import Swal from 'sweetalert2';
import SearchUserToDependencia from '../../../components/authentication/user/searchUserToDependencia';
import Show from '../../../components/show';
import PdfView from '../../../components/pdfView';
import { PDFDocument } from 'pdf-lib/dist/pdf-lib';
import Authorize from '../../../components/authorize';

export default class CreateTramiteInterno extends Component
{

    static getInitialProps = async (ctx) => {
        let { query, pathname } = ctx;
        return { query, pathname }
    } 

    state = {
        my_dependencias: [],
        dependencias: [],
        tramite_types: [],
        show_user: false,
        errors: {},
        form: {
            dependencia_id: "",
            dependencia_origen_id: "",
            tramite_type_id: "",
            document_number: "",
            folio_count: "",
            asunto: "",
            code: ""
        },
        file: {
            size: 0,
            data: []
        },
        person: {},
        signature: {
            count: 0,
            data: []
        },
        pdf: {
            url: "",
            pdfDoc: PDFDocument,
            image: ""
        },
        show_signed: false
    }

    componentDidMount = () => {
        this.props.fireEntity({ render: true });
        this.getTramiteType();
        this.getMyDependencias(this.props.entity_id || "", 1, true)
        this.defaultPerson();
    }

    componentWillReceiveProps = (nextProps) => {
        let { entity_id } = this.props;
        if (entity_id != nextProps.entity_id) this.getMyDependencias(nextProps.entity_id, 1, false);
    }

    defaultPerson = () => {
        let { auth } = this.props;
        if (Object.keys(auth).length) {
            this.setState({
                person: {
                    id: auth.person_id,
                    fullname: auth.person && auth.person.fullname,
                    document_number: auth.person && auth.person.document_number,
                    image: auth.image_images && auth.image_images.image_200x200 || ""
                }
            })
        }
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
        // handle
        this.onHandleInput({ name, value });
    }

    onHandleInput = ({ name, value }) => {
        switch(name) {
            case "dependencia_id":
                this.defaultPerson();
                break;
            default: 
                
        }
    }

    handleFiles = async ({ files }) => {
        let { file } = this.state;
        let size_total = file.size;
        let size_limit = 2 * 1024;
        for (let f of files) {
            size_total += f.size;
            if ((size_total / 1024) <= size_limit) {
                let answer = await Confirm("info", `¿Desea añadir firma digital al archivo "${f.name}"?`, 'Firmar');
                if (answer) this.handleSignature(f);
                // add file
                await this.setState(state => {
                    state.signature.data.push({ pdf: f, signed: false, info: {} });
                    return { signature: state.signature }
                });
                // add files
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

    handleSignature = async (blob) => {
        let reader = new FileReader();
        await reader.readAsArrayBuffer(blob);
        reader.onload = async () => {
            let { person } = this.state;
            let pdfDoc = await PDFDocument.load(reader.result);
            this.setState({
                pdf: {
                    url: URL.createObjectURL(blob),
                    pdfDoc: pdfDoc,
                    pdfBlob: blob,
                    image: person.image || ""
                }
            });
        }
    }
 
    deleteFile = (index, file) => {
        this.setState(state => {
            state.file.data.splice(index, 1);
            state.file.size = state.file.size - file.size; 
            // leave signature
            if (typeof state.signature.data[index] == 'object') {
                let tmp = state.signature.data[index];
                state.signature.data.splice(index, 1);
                // quitar count
                state.signature.count -= tmp.signed ? 1 : 0;
            }
            // return 
            return { file: state.file, signature: state.signature };
        });
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
                await data.map(async (d, indexD) => {
                    await newData.push({
                        key: `my_dependencia-${d.id}`,
                        value: d.id,
                        text: `${d.nombre}`
                    })
                    // assing first
                    if (page == 1 && indexD == 0) this.handleInput({ name: 'dependencia_id', value: d.id });
                });
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
            let { form, file, person, signature } = this.state;
            for (let attr in form) {
                datos.append(attr, form[attr]);
            }
            // add person id
            datos.append('person_id', person.id);
            // add files
            let iter = 0;
            file.data.map(f => {
                datos.append('files', f);
                datos.append('info_signature[]', JSON.stringify(signature.data[iter] && signature.data[iter].info || { signed: false }));
                iter++;
            });
            // request
            this.props.fireLoading(true);
            await tramite.post('tramite', datos, { headers: { DependenciaId: form.dependencia_id } })
            .then(res => {
                this.props.fireLoading(false);
                let { success, message, tramite } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                this.handleClear()
                this.defaultPerson();
            }).catch(err => {
                try {
                    this.props.fireLoading(false);
                    let response = JSON.parse(err.message);
                    Swal.fire({ icon: 'warning', text: response.message });
                    this.setState({ errors: response.errors });
                    // validar error code
                    if (!response.errors['code']) this.setState({ show_signed: false }); 
                } catch (error) {
                    Swal.fire({ icon: 'error', text: err.message });
                }
            })
        }
    }

    handleAdd = (obj) => {
        this.setState({
            show_user: false, 
            person: {
                id: obj.person_id,
                fullname: obj.fullname,
                document_number: obj.document_number,
                image: obj.image_images && obj.image_images.image_200x200 || ""
            }
        });
    }

    handleClear = () => {
        this.setState(state => {
            state.form.tramite_type_id = "";
            state.form.document_number = "";
            state.form.folio_count = "";
            state.form.asunto = "";
            state.form.observation = "";
            return { form: state.form, file: { size: 0, data: [] }, signature: { count: 0, data: [] }, errors: {} };
        });
    }

    onSignature = async (obj) => {
        console.log(obj);
        // obtener archivo
        await this.setState(state => {
            // quitart blob
            obj.pdfBlob = "";
            obj.signed = true;
            // index signature 
            let indexS = state.signature.data.length - 1 || 0;
            let signed = state.signature.data[indexS];
            signed.signed = true;
            signed.info = obj;
            // add signature
            state.signature.data[indexS] = signed;
            state.signature.count += 1;
            // response
            return { signature: state.signature };
        });
    }

    render() {

        let { my_dependencias, form, tramite_types, errors, file, show_user, person, pdf, show_signed } = this.state;
        let { entity_id } = this.props;

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
                                        <i className="fas fa-male"></i> 
                                        <span className="mr-2">Asignar Remitente</span>
                                        <hr/>
                                    </div>

                                    <div className="col-md-12 mb-4 mb-1">
                                        <div className="row">
                                            <div className="col-md-3 mb-1">
                                                <input type="text" disabled value={person && person.document_number}/>
                                            </div>

                                            <div className="col-md-7 mb-1">
                                                <input type="text" disabled value={person && person.fullname}/>
                                            </div>

                                            <div className="col-md-2">
                                                <button className="btn btn-outline-dark" onClick={(e) => this.setState({ show_user: true })}>
                                                    <i className="fas fa-sync"></i>
                                                </button>
                                            </div>
                                        </div>
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
                                            title="Select. Archivo Pdf"
                                            accept="application/pdf"
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

                <Show condicion={entity_id && show_user}>
                    <SearchUserToDependencia entity_id={entity_id} 
                        dependencia_id={form.dependencia_id}
                        isClose={(e) => this.setState({ show_user: false })}
                        getAdd={this.handleAdd}
                    />
                </Show>

                <Show condicion={pdf.url}>
                    <PdfView 
                        pdfUrl={pdf.url} 
                        pdfDoc={pdf.pdfDoc}
                        pdfBlob={pdf.pdfBlob}
                        defaultImage={pdf.image}
                        disabledMetaInfo={true}
                        onSignature={this.onSignature}
                        onClose={(e) => this.setState({ pdf: {
                            url: "",
                            pdfDoc: PDFDocument,
                            pdfBlob: {},
                            image: ""
                        } })}
                    />
                </Show>
            </div>
        )
    }

}