import React, { useState, useContext, useEffect, Fragment } from 'react';
import { DropZone } from '../Utils';
import { Confirm } from '../../services/utils';
import { Form, Button } from 'semantic-ui-react';
import { signature, tramite } from '../../services/apis';
import Swal from 'sweetalert2';
import Show from '../show';
import PdfView from '../pdfView';
import { PDFDocument } from 'pdf-lib/dist/pdf-lib';
import { AppContext } from '../../contexts/AppContext';
import { SelectAuthEntityDependencia } from '../select/authentication';
import { SelectTramiteType } from '../select/tramite';


const CreateTramite = ({ verify = 0 }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [option, setOption] = useState("");
    const [current_files, setCurrentFiles] = useState([]);
    const [size_files, setSizeFiles] = useState(0);

    // estado del pdf
    const [pdf_url, setPdfUrl] = useState("");
    const [pdf_doc, setPdfDoc] = useState(undefined);
    const [pdf_blob, setPdfBlob] = useState(undefined);

    // primera carga
    useEffect(() => {
        app_context.fireEntity({ render: true });
    }, []);
    
    // cambiar el form
    const handleInput = ({ name, value }) => {
        const newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        const newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // dependencia predeterminada
    const defaultDependencia = async (datos = []) => {
        if (datos.length >= 2) {
            let current_dependencia = datos[1];
            let newForm = Object.assign({}, form);
            newForm['dependencia_id'] = current_dependencia.value;
            setForm(newForm);
        }
    }

    // manejar archivos
    const handleFiles = async ({ files }) => {
        let size_total = size_files;
        let size_limit = 6 * 1024;
        for (let f of files) {
            size_total += f.size;
            if ((size_total / 1024) <= size_limit) {
                let answer = await Confirm("info", `¿Desea añadir firma digital al archivo "${f.name}"?`, 'Firmar');
                if (answer) addSignature(f);
                else {
                    setCurrentFiles([...current_files, f]);
                }
            } else {
                size_total = size_total - f.size;
                Swal.fire({ icon: 'error', text: `El limíte máximo es de 2MB, tamaño actual(${(size_total / (1024 * 1024)).toFixed(6)}MB)` });
                return false;
            }
        }
    }

    // agregar pdf para firmar
    const addSignature = async (blob) => {
        let reader = new FileReader();
        await reader.readAsArrayBuffer(blob);
        reader.onload = async () => {
            let pdfDoc = await PDFDocument.load(reader.result);
            let url = URL.createObjectURL(blob);
            setPdfDoc(pdfDoc);
            setPdfBlob(blob);
            setPdfUrl(url);
            setOption("signer");
        }
    }
 
    // eliminar pdf
    const deleteFile = (index, file) => {
        let newFiles = current_files;
        newFiles.splice(index, 1);
        let size = current_files - file.size;
        setCurrentFiles(newFiles);
        setSizeFiles(size);
    }

    // guardar tramite
    const saveTramite = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar el tramite?`, 'Guardar');
        if (answer) {
            let datos = new FormData();
            datos.append('tramite_type_id', form.tramite_type_id || "");
            datos.append('document_number', form.document_number || "");
            datos.append('folio_count', form.folio_count || "");
            datos.append('asunto', form.asunto || "");
            datos.append('verify', verify || 0);
            // add files
            current_files.map(async f => await datos.append('files', f));
            // request
            app_context.fireLoading(true);
            await tramite.post('tramite', datos, { headers: { DependenciaId: form.dependencia_id } })
            .then(res => {
                app_context.fireLoading(false);
                let { success, message, tramite } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                setForm({});
                setCurrentFiles([]);
                setErrors({})
                setSizeFiles(0);
            }).catch(err => {
                try {
                    app_context.fireLoading(false);
                    let response = JSON.parse(err.message);
                    Swal.fire({ icon: 'warning', text: response.message });
                    setErrors(response.errors);
                } catch (error) {
                    Swal.fire({ icon: 'error', text: err.message });
                }
            })
        }
    }

    // realizar firma
    const onSignature = async (obj) => {
        let answer = await Confirm("warning", `¿Estás seguro en firmar el PDF?`, 'Firmar');
        if (answer) {
            app_context.fireLoading(true);
            let datos = new FormData();
            datos.append('location', obj.location)
            datos.append('page', obj.page)
            datos.append('reason', obj.reason)
            datos.append('visible', obj.visible)
            datos.append('file', obj.pdfBlob)
            if (obj.position) datos.append('position', obj.position)
            // firmar pdf
            await signature.post(`auth/signer`, datos, { responseType: 'blob' })
                .then(res => {
                    app_context.fireLoading(false);
                    let { data } = res;
                    data.lastModifiedDate = new Date();
                    let file = new File([data], obj.pdfBlob.name);
                    setCurrentFiles([...current_files, file]);
                    Swal.fire({ icon: 'success', text: 'El pdf se firmó correctamente!' });
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let { message } = err.response.data;
                        Swal.fire({ icon: 'error', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                });
        }
    }

    // render
    return (
            <Fragment>
                <Form className="row justify-content-center">
                            <div className="col-md-8">
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <Form.Field error={errors && errors.dependencia_id && errors.dependencia_id[0] || ""}>
                                            <label htmlFor="">Mi Dependencia <b className="text-red">*</b></label>
                                            <SelectAuthEntityDependencia
                                                value={form.dependencia_id}
                                                name="dependencia_id"
                                                entity_id={app_context.entity_id || ""}
                                                onChange={(e, obj) => handleInput(obj)}
                                                onReady={defaultDependencia}
                                            />
                                            <label>{errors && errors.dependencia_id && errors.dependencia_id[0] || ""}</label>
                                        </Form.Field>
                                    </div>
                                    
                                    <div className="col-md-6 mt-3">
                                        <Form.Field error={errors && errors.tramite_type_id && errors.tramite_type_id[0] || ""}>
                                            <label htmlFor="">Tipo de Tramite<b className="text-red">*</b></label>
                                            <SelectTramiteType
                                                value={form.tramite_type_id}
                                                name="tramite_type_id"
                                                onChange={(e, obj) => handleInput(obj)}
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
                                                onChange={(e) => handleInput(e.target)}
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
                                                onChange={(e) => handleInput(e.target)}
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
                                                onChange={(e) => handleInput(e.target)}
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
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.observation && errors.observation[0] || ""}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 mt-3">
                                        <DropZone 
                                            id="files" 
                                            name="files"
                                            onChange={(e) => handleFiles(e)} 
                                            icon="save"
                                            result={current_files}
                                            multiple={false}
                                            title="Select. Archivo Pdf"
                                            accept="application/pdf"
                                            onDelete={(e) => deleteFile(e.index, e.file)}

                                        />
                                    </div>

                                    <div className="col-md-12 mt-4">
                                        <hr/>
                                        <div className="text-right">
                                            <Button color="teal"
                                                onClick={saveTramite}
                                            >
                                                <i className="fas fa-save"></i> Guardar Tramite
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                    </div>
                </Form>

                <Show condicion={option == "signer"}>
                    <PdfView 
                        pdfUrl={pdf_url} 
                        pdfDoc={pdf_doc}
                        pdfBlob={pdf_blob}
                        onSignature={onSignature}
                        onClose={(e) => setOption("")}
                    />
                </Show>
            </Fragment>
        )
}


export default CreateTramite;