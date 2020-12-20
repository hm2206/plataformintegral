import React, { useContext, useState } from 'react'
import Modal from '../modal';
import { Form, Select, Button } from 'semantic-ui-react';
import Router from 'next/router';
import { tramite, signature } from '../../services/apis';
import { DropZone } from '../../components/Utils';
import { Confirm } from '../../services/utils'
import Swal from 'sweetalert2';
import Show from '../show';
import SearchUserToDependencia from '../authentication/user/searchUserToDependencia';
import { AppContext } from '../../contexts/AppContext';
import { TrackingContext } from '../../contexts/tracking/TrackingContext';
import { SelectDependencia } from '../../components/select/authentication';
import PdfView from '../pdfView';
import { PDFDocument } from 'pdf-lib';


const ModalNextTracking = (props) =>{

    // app
    const app_context = useContext(AppContext);

    // tracking
    let { role } = useContext(TrackingContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [option, setOption] = useState("");
    const [add_copy, setAddCopy] = useState(false);
    const [copy, setCopy] = useState([]);
    const [copy_current, setCopyCurrent] = useState({
        user: { key: "", value: "", text: ""},
        dependencia: { key: "", value: "", text: "" }
    });
    const [copy_show, setCopyShow] = useState(false);
    const [current_files, setCurrentFiles] = useState([]);
    const [size_files, setSizeFiles] = useState(0);
    const [user, setUser] = useState({});

    // estado del pdf
    const [pdf_url, setPdfUrl] = useState("");
    const [pdf_doc, setPdfDoc] = useState(undefined);
    const [pdf_blob, setPdfBlob] = useState(undefined);

    // validar role
    let isRole = Object.keys(role || {}).length;

    // acciones
    const getAction = (status, parent = 1) => {
        if (status == 'REGISTRADO') return [
            { key: "_DERIVAR", value: "DERIVADO", text: "DERIVAR" },
            { key: "_ANULAR", value: "ANULADO", text: "ANULAR" }
        ]
        // pendiente
        if (status == 'PENDIENTE') return [
            { key: "_DERIVAR", value: "DERIVADO", text: "DERIVAR" },
            { key: "_REPONDER", value: "RESPONDER", text: "RESPONDER" },
            { key: "_FINALIZAR", value: "FINALIZADO", text: "FINALIZAR" }
        ];
        // enviado
        if (status == 'ENVIADO') return [
            { key: "_ACEPTAR", value: "ACEPTADO", text: "ACEPTAR" },
            { key: "_RECHAZAR", value: "RECHAZADO", text: "RECHAZAR" }
        ]
        // parant
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

    // cambiar form
    const handleInput = async ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // manejar archivos
    const handleFiles = async (file) => {
        setCurrentFiles([...current_files, file]);
    }
 
    // eliminar pdf
    const deleteFile = (index, file) => {
        let newFiles = current_files;
        newFiles.splice(index, 1);
        let size = current_files - file.size;
        setCurrentFiles(newFiles);
        setSizeFiles(size);
    }

    // procesar trámite
    const nextTracing = async () => {
        let answer = await Confirm(`warning`, `¿Deseas continuar?`);
        if (answer) {
            app_context.fireLoading(true);
            let { id, dependencia_destino_id } = props.tramite;
            let datos = new FormData;
            // assing form
            for(let attr in form) {
                datos.append(attr, form[attr]);
            }
            // add files
            await current_files.map(f => datos.append('files', f));
            // add copies
            datos.append('copy', JSON.stringify(copy));
            // send next
            await tramite.post(`tracking/${id}/next`, datos, { headers: { DependenciaId: dependencia_destino_id } })
                .then(async res => {
                    app_context.fireLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    let { push, pathname, query } = Router;
                    await push({ pathname, query });
                    props.isClose(true);
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let response = JSON.parse(err.message);
                        Swal.fire({ icon: 'warning', text: response.message });
                        setErrors(response.errors);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: err.message });
                    }
                });
        }
    }

    // agregar usuario
    const handleAdd = (obj) => {
        setOption("");
        setUser(obj);
        handleInput({ name: 'user_destino_id', value: obj.id });
    }

    // copia actual
    const handleCurrentCopy = (config = copy_current) => {
        let newConfig = Object.assign({}, { dependencia: config.dependencia, user: config.user });
        setCopyCurrent(newConfig);
    }

    // agregar copia
    const handleAddCopy = () => {
        let { dependencia, user } = copy_current;
        // add copy
        let newCopy = copy;
        newCopy.push({
            dependencia_id: dependencia.value || "",
            dependencia_text: dependencia.text || "",
            user_id: user.value || "",
            user_text: user.text || ""
        });
        // agregar
        setCopy(newCopy);
    }

    // quitar copia
    const handleDeleteCopy = (index) => {
        let newCopy = copy;
        newCopy.splice(index, 1);
        setCopy(newCopy);
    }

    // seleccionar la mísma oficina de origen
    const selectSelfOffice = () => {
        handleInput({ name: 'dependencia_destino_id', value: props.tramite.dependencia_origen_id })
    }

    // render 
    return (
            <Modal
                md="7"
                show={true}
                {...props}
                titulo={<span><i className="fas fa-path"></i> Proceso del trámite: <span className="badge badge-dark">{props.tramite && props.tramite.slug}</span></span>}
            >
                <Form className="card-body">
                    <div className="row">
                        <div className="col-md-6 mt-3">
                            <Form.Field>
                                <label htmlFor="">Fecha Registro</label>
                                <input type="date" readOnly value={props.tramite && props.tramite.created_at && `${props.tramite.created_at}`.split(' ')[0] || ""}/>
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mt-3">
                            <Form.Field error={errors.status && errors.status[0] || ""}>
                                <label htmlFor="">Acción <b className="text-red">*</b></label>
                                <Select
                                    placeholder="Select. Acción"
                                    options={getAction(props.tramite.status, props.tramite.parent || 0)}
                                    name="status"
                                    value={form.status || ""}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                                <label htmlFor="">{errors.status && errors.status[0] || ""}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mt-3">
                            <Form.Field>
                                <label htmlFor="">Dependencía Origen</label>
                                <input type="text" 
                                    disabled={!isRole}
                                    className="uppercase" 
                                    readOnly
                                    style={{ cursor: 'pointer' }}
                                    value={props.tramite && props.tramite.dependencia_origen && props.tramite.dependencia_origen.nombre}
                                    onClick={selectSelfOffice}
                                />
                            </Form.Field>
                        </div>

                        <Show condicion={isRole && props.tramite.parent && form.status == 'DERIVADO'}>
                            <Show condicion={(role && role.level == 'BOSS') || (props.tramite.next && role && role.level == 'SECRETARY')}
                                predeterminado={
                                    <div className="col-md-6 mt-3">
                                        <Form.Field>
                                            <label htmlFor="">Dependencía Destino</label>
                                            <input type="text" 
                                                disabled={!isRole}
                                                className="uppercase" 
                                                readOnly
                                                style={{ cursor: 'pointer' }}
                                                value={props.tramite && props.tramite.dependencia_origen && props.tramite.dependencia_origen.nombre}
                                            />
                                        </Form.Field>
                                    </div>
                                }
                            >
                                <div className="col-md-6 mt-3">
                                    <Form.Field error={errors.dependencia_destino_id && errors.dependencia_destino_id[0] || ""}>
                                        <label htmlFor="">Dependencía Destino <b className="text-red">*</b></label>
                                        <SelectDependencia
                                            name="dependencia_destino_id"
                                            value={form.dependencia_destino_id}
                                            onChange={(e, obj) => handleInput(obj)}
                                        />
                                        <label htmlFor="">{errors.dependencia_destino_id && errors.dependencia_destino_id[0] || ""}</label>
                                    </Form.Field>
                                </div>
                            </Show>
                        </Show>

                        <Show condicion={!isRole && props.tramite.parent && form.status == 'DERIVADO'}>
                            <div className="col-md-6 mt-3">
                                <Form.Field>
                                    <label htmlFor="">Dependencía Destino</label>
                                    <input type="text" 
                                        disabled={!isRole}
                                        className="uppercase" 
                                        readOnly
                                        style={{ cursor: 'pointer' }}
                                        value={props.tramite && props.tramite.dependencia_origen && props.tramite.dependencia_origen.nombre}
                                    />
                                </Form.Field>
                            </div>
                        </Show>

                        <Show condicion={form.status == 'DERIVADO' && 
                            (  
                                props.tramite.dependencia_destino_id == form.dependencia_destino_id  || 
                                !props.tramite.next && role.level != 'BOSS'
                            )
                        }>
                            <div className="col-md-12">
                                <hr/>
                                    <Form.Field error={errors.user_destino_id && errors.user_destino_id[0] || ""}>
                                        <i className="fas fa-user"></i> Agregar usuario 
                                        <button className="btn btn-sm btn-dark ml-2"
                                            onClick={(e) => setOption('assign-user')}
                                        >
                                            <i className={`fas fa-${user.fullname ? 'sync' : 'plus'}`}></i>
                                        </button>
                                        <Show condicion={user && user.fullname}>
                                            <span className="badge badge-warning ml-2 uppercase">{user.fullname}</span>
                                        </Show>

                                        <label className="text-center">{errors.user_destino_id && errors.user_destino_id[0] || ""}</label>
                                    </Form.Field>
                                <hr/>
                            </div>
                        </Show>

                        <div className="col-md-12 mt-3">
                            <Form.Field  error={errors && errors.description && errors.description[0] || ""}>
                                <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                <textarea 
                                    name="description" 
                                    rows="4"
                                    value={form.description || ""}
                                    onChange={(e) => handleInput(e.target)}
                                />
                                <label htmlFor="">{errors && errors.description && errors.description[0] || ""}</label>
                            </Form.Field>
                        </div>

                        <Show condicion={props.tramite.parent}>
                            <div className="col-md-12 mt-3">
                                <Form.Field error={errors.files && errors.files[0] || ""}>
                                    <label htmlFor="">Adjuntar Archivo</label>
                                    <DropZone id="files" 
                                        name="files"
                                        onChange={({ files }) => handleFiles(files[0])} 
                                        onSigned={({ file }) => handleFiles(file)}
                                        result={current_files}
                                        title="Select. Archivo (*.pdf)"
                                        accept="application/pdf"
                                        onDelete={(e) => deleteFile(e.index, e.file)}
                                    />
                                    <label htmlFor="">{errors.files && errors.files[0] || ""}</label>
                                </Form.Field>
                            </div>
                        </Show>

                        {/* <div className="col-md-12">
                            <hr/>
                                <i className={`far fa-file-alt mr-2`}></i> 
                                Agregar Copia {copy.length ? `(${copy.length})` : null} 
                                <button className={`ml-3 btn btn-dark btn-sm`}
                                    onClick={(e) => setAddCopy(!add_copy)}
                                >
                                    <i className={`fas fa-${add_copy ? 'minus' : 'plus'}`}></i>
                                </button>
                            <hr/>
                        </div> */}

                        {/* <Show condicion={add_copy}>
                            <div className="col-md-6 mt-3">
                                <Form.Field>
                                    <label htmlFor="">Dependencía</label>
                                    <SelectDependencia
                                        name="dependencia_copy_id"
                                        value={form.dependencia_copy_id}
                                        onChange={(e, obj) => handleInput(obj)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mt-3">
                                <Form.Field>
                                    <label htmlFor="">Usuario</label>
                                    <div>
                                        <Button
                                            disabled={!form.dependencia_copy_id}
                                            onClick={(e) => setCopyShow(true)}
                                        >
                                            <i className="fas fa-user-cog"></i>
                                        </Button>
                                    </div>
                                </Form.Field>
                            </div>

                            <Show condicion={copy.length}>
                                <div className="col-md-12 mt-3">
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Dependencia</th>
                                                    <th>Usuario</th>
                                                    <th>Eliminar</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {copy.map((c, indexC) => 
                                                    <tr key={`copy-file-${indexC}`}>
                                                        <td>{c.dependencia_text || ""}</td>
                                                        <td>{c.user_text || ""}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-red"
                                                                onClick={(e) => handleDeleteCopy(indexC)}
                                                            >
                                                                <i className="fas fa-trash-alt"></i>
                                                            </button>
                                                        </td>
                                                    </tr>    
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Show>
                        </Show> */}

                        <div className="col-md-12 mt-4">
                            <hr/>
                            <div className="text-right">
                                <Button color="teal"
                                    disabled={!form.status}
                                    onClick={nextTracing}
                                >
                                    <i className="fas fa-sync"></i> Procesar Trámite
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form>

                <Show condicion={option == 'assign-user'}>
                    <SearchUserToDependencia
                        entity_id={props.tramite.entity_id}
                        dependencia_id={props.tramite.dependencia_destino_id}
                        getAdd={handleAdd}
                        isClose={(e) => setOption("")}
                    />
                </Show>

                {/* user -> dependencia */}
                <Show condicion={copy_show}>
                    <SearchUserToDependencia 
                        entity_id={app_context.entity_id || ""} 
                        dependencia_id={form.dependencia_copy_id || ""}
                        isClose={(e) => setCopyShow(false)}
                        getAdd={async (e) => {
                            setCopyShow(false);
                            // handleCurrentCopy({ user: { key: `key-user-${e.username}`, value: e.id, text: e.fullname } })
                            // handleAddCopy();
                        }}
                    />
                </Show>
            </Modal>
        );
}

export default ModalNextTracking;