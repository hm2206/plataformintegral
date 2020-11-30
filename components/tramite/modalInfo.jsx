import React, { Component, useState, useEffect, useContext } from 'react'
import Modal from '../modal';
import { Button, Form, Dropdown, Tab } from 'semantic-ui-react';
import Router from 'next/router';
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import apis from '../../services/apis';
const api_tramite = apis.tramite;
import Swal from 'sweetalert2';
import { Confirm } from '../../services/utils';

const Documento = ({ tramite }) => {

    // app
    const app_context = useContext(AppContext);

    // imprimir
    const getPrint = async () => {
        app_context.fireLoading(true);
        await api_tramite.get(`report/tracking/${tramite.id}`, { responseType: 'blob' })
            .then(({data}) => {
                app_context.fireLoading(false);
                let a = document.createElement('a');
                a.target = '_blank';
                a.href = URL.createObjectURL(data);
                a.click();
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message });
            });
    }

    // render
    return (
        <Form>
            <div className="row">
                <Form.Field className="col-md-12">
                    <label htmlFor="">Tipo Documento</label>
                    <input type="text" value={tramite.tramite_type && tramite.tramite_type.description}/>
                </Form.Field>

                <Form.Field className="col-md-6">
                    <label htmlFor="">N° Documento</label>
                    <input type="text" value={tramite.document_number} readOnly/>
                </Form.Field>

                <Form.Field className="col-md-6">
                    <label htmlFor="">N° Folios</label>
                    <input type="text" value={tramite.folio_count} readOnly/>
                </Form.Field>

                <Form.Field className="col-md-12">
                    <label htmlFor="">Asunto</label>
                    <textarea  value={tramite.asunto} readOnly/>
                </Form.Field>

                <div className="col-md-12 mt-3">
                    <Button color="red"
                        onClick={getPrint}
                    >
                        <i className="fas fa-file-pdf"></i> Reporte
                    </Button>
                </div>
            </div>
        </Form>
    )
}


const Remitente = ({ person }) => {
    return (
        <Form>
            <div className="row">
                <Form.Field className="col-md-12 text-center">
                    <img src={person && person.image_images && person.image_images.image_200x200} 
                        alt="foto de persona"
                        style={{ width: "150px", height: "150px", borderRadius: '50%', objectFit: 'cover' }}
                    />
                </Form.Field>

                <Form.Field className="col-md-6">
                    <label htmlFor="">Tipo Documento</label>
                    <input type="text" value={person && person.document_type} readOnly/>
                </Form.Field>

                <Form.Field className="col-md-6">
                    <label htmlFor="">N° Documento</label>
                    <input type="text" value={person && person.document_number} readOnly/>
                </Form.Field>

                <Form.Field className="col-md-12">
                    <label htmlFor="">Apellidos y Nombres</label>
                    <input type="text" value={person && person.fullname} readOnly/>
                </Form.Field>

                <Form.Field className="col-md-6">
                    <label htmlFor="">N° Teléfono</label>
                    <input type="text" value={person && person.phone} readOnly/>
                </Form.Field>

                <Form.Field className="col-md-6">
                    <label htmlFor="">Correo de Contacto</label>
                    <input type="text" value={person && person.email_contact} readOnly/>
                </Form.Field>

                <Form.Field className="col-md-12">
                    <label htmlFor="">Dirección</label>
                    <input type="text" value={person && person.address} readOnly/>
                </Form.Field>
            </div>
        </Form>
    );
}


const FileInfo = ({ tracking, tramite, files = [], dependencia_id, onRefresh, isReady }) => {

    // estados
    const [current_files, setCurrentFiles] = useState(files);

    // app
    const app_context = useContext(AppContext);

    // eliminar archivo
    const deleteFile = async (event, index) => {
        event.preventDefault();
        let answer = await Confirm("warning", `¿Deseas eliminar el archivo?`, 'Eliminar')
        if (answer) {
            app_context.fireLoading(true);
            await api_tramite.post(`tramite/${tramite.id}/delete_file`, { index }, {
                headers:  { DependenciaId: tracking.dependencia_id }
            }).then(res => {
                app_context.fireLoading(false);
                let { message, success } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                if (typeof onRefresh == 'function') onRefresh();
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message });
            });
        }
    }

    // actualizar archivo
    const updateFile = async (target, index) => {
        let answer = await Confirm("warning", `¿Deseas actualizar el archivo?`, 'Actualizar')
        if (answer) {
            app_context.fireLoading(true);
            let datos = new FormData;
            datos.append('file', target.files[0]);
            datos.append('index', index)
            await api_tramite.post(`tramite/${tramite.id}/update_file`, datos, {
                headers:  { DependenciaId: tracking.dependencia_id }
            }).then(async res => {
                app_context.fireLoading(false);
                let { message, success, file } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                if (typeof onRefresh == 'function') onRefresh();
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message });
            });
        }
        // vaciar file
        let nodeInput = document.getElementById(`index-file-${index}`);
        if (nodeInput)  nodeInput.value = null;
    }

    // agregar archivos
    const attachFile = async (target) => {
        let answer = await Confirm("warning", `¿Deseas agrear un archivo?`, 'Agregar')
        if (answer) {
            app_context.fireLoading(true);
            let datos = new FormData;
            datos.append('file', target.files[0]);
            await api_tramite.post(`tramite/${tramite.id}/attach_file`, datos, {
                headers:  { DependenciaId: tracking.dependencia_id }
            }).then(res => {
                app_context.fireLoading(false);
                let { message, success, file } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                if (typeof onRefresh == 'function') onRefresh();
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message });
            });
        }
        // vaciar file
        let nodeInput = document.getElementById(`new_file`);
        nodeInput.value = null;
    }

    const getMeta = (path) => {
        let key = path.split('.').pop()
        let metas = {
            pdf: { icon: "fas fa-file-pdf", className: "text-red" },
            docx: { icon: "fas fa-file-word", className: "text-primary" }
        };
        // response
        return metas[key];
    }

    // actualizar files
    useEffect(() => {
        if (!isReady) setCurrentFiles(files);
    }, [isReady]);

    return (
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th className="text-center">Opciones</th>
                </tr>
            </thead>
            <tbody>
                {current_files.map((f, indexF) => 
                    <tr key={`file-tramite-${indexF}`}>
                        <th>
                            <i className={`${getMeta(f).icon} ${getMeta(f).className}`} /> {`${f}`.split('/').pop()}
                        </th>
                        <th className="text-center">
                            <a className="mr-1 btn btn-sm btn-icon btn-secondary"
                                target="_blank" 
                                rel="noopener noreferrer"
                                title="ver archivo"
                                href={f}
                            >
                                <i className="fas fa-file-pdf"></i> 
                            </a>

                            <Show condicion={!tramite.verify && tracking.dependencia_destino_id == tramite.dependencia_id}>
                                <label className="mr-1 mt-2 btn btn-sm btn-icon btn-secondary"
                                    title="Remplazar Archivo"
                                >
                                    <i className="fas fa-upload"></i> 
                                    <input type="file" 
                                        name="file" 
                                        hidden
                                        accept="application/pdf"
                                        id={`index-file-${indexF}`}
                                        onChange={(({ target }) => updateFile(target, indexF))}
                                    />
                                </label>

                                <Show condicion={current_files.length > 1}>
                                    <a className="mr-1 btn btn-sm btn-icon btn-secondary"
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        title="Eliminar archivo"
                                        href={`#eliminar`}
                                        onClick={(e) => deleteFile(e, indexF)}
                                    >
                                        <i className="fas fa-times"></i> 
                                    </a>
                                </Show>
                            </Show>
                        </th>
                    </tr>
                )}
                
                <Show condicion={!tramite.verify}>
                    <tr>
                        <th colSpan="2" className="text-right">
                            <label className="ui button green basic" style={{ cursor: 'pointer' }}>
                                <input type="file" id="new_file" hidden onChange={(e) => attachFile(e.target)}/>
                                <i className="fas fa-plus"></i>
                            </label>
                        </th>
                    </tr>
                </Show>
            </tbody>
        </table>
    )
}

const CodeQr = ({ tramite }) => {

    // estado
    const [current_loading, setCurrentLoading] = useState(false);
    const [code_qr, setCodeQr] = useState("");

    const getCodeQr = async () => {
        setCurrentLoading(true);
        await api_tramite.get(`tramite/${tramite.id}/code_qr`, { responseType: 'blob' })
        .then(res => setCodeQr(URL.createObjectURL(res.data)))
        .catch(err => console.log(err));
        setCurrentLoading(false);
    }

    useEffect(() => {
        getCodeQr();
    }, []);

    return <div className="mt-5 mb-5">
        <div className="row justify-content-center">
            <Show condicion={code_qr}>
                <div style={{ width: "200px", height: "200px" }}>
                    <img src={code_qr} alt={`code_qr_${tramite.id}`} style={{ width: "100%", height: "100%", objectFit: "contain" }}/>
                </div>
            </Show>
        </div>
    </div>
}

export default class ModalInfo extends Component
{

    state = {
        tramite: {},
        loading: false
    }

    componentDidMount = () => {
        this.getTramite();
    }

    getTramite = async () => {
        this.setState({ loading: true });
        let { tracking } = this.props;
        await api_tramite.get(`public/tramite/${tracking.slug}`)
            .then(res => {
                let { success, tramite, message } = res.data;
                if (!success) throw new Error(message);
                this.setState({ tramite });
            })
            .catch(err => console.log(err.message));
            this.setState({ loading: false });
    }
 
    render() {

        let { tramite, loading } = this.state;
        let { tracking, dependencia_id } = this.props;

        return (
            <Modal
                show={true}
                md="6"
                {...this.props}
                titulo={<span>Información del Documento <small className="badge badge-dark">{tramite.slug}</small></span>}
                classClose="text-white opacity-1"
            >
                <Form className="card-body" loading={loading}>
                    <div className="pl-4 mt-4 pr-4">
                        <div className="card">
                            <Tab panes={[
                                { menuItem: 'Información', render: () => <Tab.Pane><Documento tramite={tramite}/></Tab.Pane> },
                                { menuItem: 'Datos Remitente', render: () => <Tab.Pane><Remitente person={tramite.person}/></Tab.Pane> },
                                { menuItem: 'Archivos', render: () => <Tab.Pane><FileInfo dependencia_id={dependencia_id} isReady={loading} onRefresh={this.getTramite} tramite={tramite} tracking={tracking} files={tramite.files}/></Tab.Pane> },
                                { menuItem: 'Code QR', render: () => <Tab.Pane><CodeQr tramite={tramite}/></Tab.Pane> }
                            ]}/>
                        </div>
                    </div>
                </Form>
            </Modal>
        );
    }

}