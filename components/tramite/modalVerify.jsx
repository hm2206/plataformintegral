import React, { useContext, useState, useEffect } from 'react'
import Modal from '../modal';
import { Form, Select, Button } from 'semantic-ui-react';
import Router from 'next/router';
import { tramite, signature } from '../../services/apis';
import { Confirm } from '../../services/utils'
import Swal from 'sweetalert2';
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { SelectDependencia } from '../../components/select/authentication';
import PdfView from '../pdfView';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';


const ModalVerify = (props) =>{

    // app
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [option, setOption] = useState("");
    const [current_files, setCurrentFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [block, setBlock] = useState(false);
    const [current_loading, setCurrentLoading] = useState(undefined);

    // estado del pdf
    const [pdf_url, setPdfUrl] = useState("");
    const [pdf_doc, setPdfDoc] = useState(undefined);
    const [pdf_blob, setPdfBlob] = useState(undefined);

    // preparar archivos
    const handleFiles = async () => {
        let payload = [];
        // preparar files
        if (props.tramite && props.tramite.tramite_files) {
            await props.tramite && props.tramite.tramite_files.map(async (f, indexF) => {
                await payload.push({
                    index: indexF,
                    name: `${f}`.split('/').pop(),
                    link: f,
                    signer: false
                })
            });
        }
        // set files
        setFiles(payload);
    }

    // primera carga
    useEffect(() => {
        handleFiles();
    }, []);

    // cambiar form
    const handleInput = async ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // preparar firmar digital
    const handleSignature = async (index, file) => {
        setBlock(true);
        setCurrentLoading(index);
        await tramite.get(file.link, { responseType: 'blob' }, null, true)
            .then(async res => {
                let { data } = res;
                data.lastModifiedDate = new Date();
                let blob = data;
                let newFile = new File([data], file.name);
                let reader = new FileReader();
                await reader.readAsArrayBuffer(blob);
                reader.onload = async () => {
                    let pdfDoc = await PDFDocument.load(reader.result);
                    let link = URL.createObjectURL(blob);
                    setPdfDoc(pdfDoc);
                    setPdfBlob(newFile);
                    setPdfUrl(link);
                    setOption("signer");
                }
            })
            .catch(err => Swal.fire({ icon: 'error', text: 'No se pudo obtener el archivo' }));
        setBlock(false);
    }

     // realizar firma
    const onSignature = async (obj) => {
        let answer = await Confirm("warning", `¿Estás seguro en firmar el PDF?`, 'Firmar');
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = new FormData();
            datos.append('location', obj.location)
            datos.append('page', obj.page)
            datos.append('reason', obj.reason)
            datos.append('visible', obj.visible)
            datos.append('file', obj.pdfBlob)
            if (obj.position) datos.append('position', obj.position)
            // firmar pdf
            await signature.post(`auth/signer`, datos, { responseType: 'blob' })
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let blob = res.data;
                    blob.lastModifiedDate = new Date();
                    blob.name = obj.pdfBlob.name;
                    // agregar archivo firmado
                    let datos = current_files;
                    datos[current_loading] = blob;
                    setCurrentFiles(datos);
                    // setting file
                    let newFiles = JSON.parse(JSON.stringify(files));
                    let newObj = newFiles[current_loading];
                    newObj.signer = true;
                    newObj.index_signer = current_loading;
                    newFiles[current_loading] = newObj;
                    setFiles(newFiles);
                    // alert
                    Swal.fire({ icon: 'success', text: 'El pdf se firmó correctamente!' });
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { message } = err.response.data;
                        Swal.fire({ icon: 'error', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: err.message });
                    }
                });
        }
    }

    // descargar
    const onDownload = async (index) => {
        let a = document.createElement('a');
        a.href = URL.createObjectURL(current_files[index]);
        a.target = '__blank';
        a.click();
    }

    // procesar trámite
    const verification = async () => {
        let answer = await Confirm(`warning`, `¿Deseas continuar?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            let { id, dependencia_destino_id } = props.tramite;
            let datos = new FormData;
            // assing form
            datos.append('verify_observation', form.verify_observation);
            // add files
            await current_files.map(f => {
                f.lastModifiedDate = new Date();
                let newFile = new File([f], f.name);
                datos.append('files', newFile)
            });
            // send next
            await tramite.post(`tramite/${props.tramite.tramite_id}/verify`, datos, { headers: { DependenciaId: dependencia_destino_id } })
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    let { push, pathname, query } = Router;
                    await push({ pathname, query });
                    props.isClose(true);
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let response = JSON.parse(err.message);
                        Swal.fire({ icon: 'warning', text: response.message });
                        setErrors(response.errors);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: err.message });
                    }
                });
        }
    }

    // render 
    return (
            <Modal
                md="7"
                show={true}
                {...props}
                disabled={block || props.disabled}
                titulo={<span><i className="fas fa-path"></i> Válidar trámite: <span className="badge badge-dark">{props.tramite && props.tramite.slug}</span></span>}
            >
                <Form className="card-body">
                    <div className="row">
                        <div className="col-md-12 mb-3">
                            <label htmlFor="">Observación de la validación</label>
                            <textarea
                                name="verify_observation"
                                value={form.verify_observation || ""}
                                onChange={(e) => handleInput(e.target)}
                                rows="2"
                            />
                        </div>

                        <div className="col-md-12 mb-3 mt-5">
                            <label htmlFor="">Archivos del trámite</label>
                            <div className="row">
                                {files.map((f, indexF) => 
                                    <div key={`tramite-files-${indexF}`} className="col-md-12">
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-10">
                                                        <a href={f.link} target="__blank">
                                                            {f.name}
                                                        </a>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <Show condicion={!f.signer}>
                                                            <Button color="black"
                                                                fluid
                                                                size="mini"
                                                                disabled={block}
                                                                loading={block && current_loading == indexF}
                                                                onClick={(e) => handleSignature(indexF, f)}
                                                            >
                                                                <i className="fas fa-signature"></i>
                                                            </Button>
                                                        </Show>
                                                        
                                                        <Show condicion={f.signer}>
                                                            <Button size="mini"
                                                                fluid
                                                                color="red"
                                                                onClick={(e) => onDownload(indexF)}
                                                            >
                                                                <i className="fas fa-download"></i>
                                                            </Button>
                                                        </Show>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-12 mt-4">
                            <hr/>
                            <div className="text-right">
                                <Button color="teal"
                                    disabled={!form.verify_observation || block}
                                    onClick={verification}
                                >
                                    <i className="fas fa-check"></i> Validar Trámite
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form>

                {/* firmar pdf  */}
                <Show condicion={option == "signer"}>
                    <PdfView 
                        pdfUrl={pdf_url} 
                        pdfDoc={pdf_doc}
                        pdfBlob={pdf_blob}
                        onSignature={onSignature}
                        onClose={(e) => setOption("")}
                    />
                </Show>
            </Modal>
        );
}

export default ModalVerify;