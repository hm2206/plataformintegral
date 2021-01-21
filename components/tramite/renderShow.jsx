import React, { useState, useContext, useEffect } from 'react';
import CardInfoTramite from './cardInfoTramite';
import ItemFileCircle from '../itemFileCircle';
import ModalNextTracking from './modalNextTracking';
import { AppContext } from '../../contexts/AppContext';
import Show from '../show';
import { Button } from 'semantic-ui-react'
import { tramite } from '../../services/apis';
import { DropZone } from '../Utils';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

const RenderShow = ({ tracking = {}, role = {}, boss = {}, onFile = null, refresh = false }) => {

    // app
    const app_context = useContext(AppContext);
    
    // estados
    const [current_refresh, setCurrentRefesh] = useState(refresh);
    const [current_tracking, setCurrentTracknig] = useState(tracking);
    const [option, setOption] = useState("");
    const [action, setAction] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_qr, setCurrentQr] = useState("http://127.0.0.1:3333/find_file_local?path=/user/img/perfil_admin@unia.jpg&size=50x50");

    // obtener trámite
    const current_tramite = current_tracking.tramite || {};

    // realizar accion
    const handleNext = (act) => {
        setOption("NEXT")
        setAction(act)
    }

    // verificar tracking
    const verifyTracking = async () => {
        let answer = await Confirm(`warning`, `¿Estás seguro en revisar el trámite?`, 'Revisar');    
        if (answer) {
            app_context.fireLoading(true);
            await tramite.post(`tracking/${tracking.id}/verify`, {}, { headers: { DependenciaId: tracking.dependencia_id } })
                .then(async res => {
                    app_context.fireLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let { data } = err.response;
                        if (typeof data != 'object') throw new Error(err.message);
                        throw new Error(data.message);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                });
        }
    }
    
    // agregar archivo
    const addFile = async ({ name, file }, object_type = 'App/Models/Tramite') => {
        let datos = new FormData;
        app_context.fireLoading(true);
        datos.append('files', file);
        datos.append('object_id', tracking.first ? current_tramite.id : tracking.id);
        datos.append('object_type', object_type);
        await tramite.post(`file`, datos)
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message, files } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                let { push } = Router;
                await push(location.href);
            }).catch(err => {
                try {
                    app_context.fireLoading(false);
                    let { data } = err.response;
                    if (typeof data != 'object') throw new Error(err.message);
                    if (typeof data.errors != 'object') throw Error(data.message);
                    Swal.fire({ icon: 'warning', text: data.message });
                } catch (error) {
                    Swal.fire({ icon: 'error', text: error.message });
                }
            });
    }

    // obtener tracking
    const getTracking = async () => {
        setCurrentLoading(true);
        await tramite.get(`auth/tramite/${current_tracking.id}/tracking`, {
            headers: { EntityId: current_tracking.entity_id, DependenciaId: current_tracking.dependencia_id } 
        }).then(res => {
            let { success, message, tracking } = res.data;
            if (!success) throw new Error(message);
            setCurrentTracknig(tracking)
        }).catch(err => console.log(err));
        setCurrentLoading(false);
        setCurrentRefesh(false);
    }

    // obtener code_qr
    const getCodeQr = async () => {
        if (current_tramite && current_tramite.code_qr) {
            setCurrentQr(current_tramite.code_qr || "");
        } else {
            tramite.get(`tramite/${current_tramite.slug || '_error'}/code_qr`, { responseType: 'blob' })
                .then(async res => {
                    let type = res.headers['content-type'];
                    let blob = new Blob([res.data], { type });
                    let url = await URL.createObjectURL(blob);
                    setCurrentQr(url);
                }).catch(err => console.log(err));
        }
    }

    // escuchar refresh
    useEffect(() => {
        setCurrentRefesh(refresh);
    }, [refresh]);

    // refrescar datos
    useEffect(() => {
        if (current_refresh) getTracking();
    }, [current_refresh])

    // obtener code_qr
    useEffect(() => {
        if (!current_loading) getCodeQr();
    }, [current_loading])

    // render
    return (
        <div className="card mt-3">
            <div className="card-header">
                <span className="badge badge-dark">
                    {current_tramite.slug || ""}
                </span>
                <i className="fas fa-arrow-right ml-1 mr-1"></i>
                {current_tramite.asunto || ""}
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-10 mb-2">
                        <CardInfoTramite
                            image={current_tramite.person && current_tramite.person.image_images && current_tramite.person.image_images.image_200x200 || ""}
                            remitente={current_tramite.person && current_tramite.person.fullname || ""}
                            email={current_tramite.person && current_tramite.person.email_contact || ""}
                            dependencia={current_tramite.dependencia_origen && current_tramite.dependencia_origen.nombre || ""}
                            status={tracking.first ? tracking.status : ''}
                            revisado={tracking.revisado}
                        />

                        <div className="mt-4">
                            <b>Tipo Trámite: </b> {current_tramite.tramite_type && current_tramite.tramite_type.description || ""}
                            <br/>
                            <b>N° Trámite: </b> {current_tramite.document_number || ""}
                            <br/>
                            <b>Observación</b> {current_tramite.observation || ""} 
                            <br/>
                            <b>N° Folio: </b> {current_tramite.folio_count || 0}
                            <br/>
                            <Show condicion={!tracking.revisado && tracking.user_verify_id == app_context.auth.id}>
                                <div className="mb-3 mt-3">
                                    <button className="btn btn-outline-success"
                                        onClick={verifyTracking}
                                    >
                                        <i className="fas fa-check"></i> Autorizar
                                    </button>
                                </div>
                            </Show>
                        </div>
                    </div>

                    <div className="col-md-2 mb-2">
                        <img src={current_qr || ""} alt="code_qr"
                            style={{ width: "100%", height: "100%", objectFit: 'contain' }}
                        />
                    </div>

                    <div className="col-md-12 mb-2">
                        <hr/>
                        <b><i className="fas fa-clip-paper"></i> Archivos: </b>
                        <div className="row mt-3">
                                {current_tramite.files.map((f, indexF) => 
                                    <div className="ml-5 col-xs" key={`item-tramite-${indexF}`}>
                                        <ItemFileCircle
                                            id={f.id}
                                            is_observation={f.observation ? true : false}
                                            className="mb-3"
                                            key={`item-file-tramite-${indexF}`}
                                            url={f.url}
                                            name={f.name}
                                            extname={f.extname}
                                            edit={true}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (typeof onFile == 'function') onFile(f)
                                            }}
                                            onAction={(e) => alert('ok')}
                                        />
                                    </div>
                                )}
                                {/* agregar archivos */}
                                <Show condicion={
                                    current_tracking.user_verify_id == app_context.auth.id && 
                                    current_tracking.first && 
                                    !current_tracking.revisado
                                }>
                                    <div className="text-right">
                                        <DropZone
                                            id="file-tramite-datos"
                                            title="Seleccionar archivo PDF"
                                            accept="application/pdf"
                                            multiple={false}
                                            size={6}
                                            basic={true}
                                            icon="fas fa-plus"
                                            onChange={async ({ files, name }) => await addFile({ name, file: files[0] })}
                                            onSigned={async ({ name, file }) => await addFile({ name, file })}
                                        />
                                    </div>
                                </Show>
                        </div>
                    </div>

                    <div className="col-md-12">
                        {/* configuración de los archivos del tracking */}
                        <Show condicion={current_tracking.current}>
                            <div className="col-md-12 mt-4">
                                <Show condicion={
                                    !current_tracking.revisado && 
                                    app_context.auth.id == current_tracking.user_verify_id && 
                                    current_tracking.status == 'REGISTRADO'
                                }>
                                    <Button color="red" 
                                        basic
                                        size="mini"
                                        onClick={() => handleNext('ANULADO')}
                                    >
                                        Anular <i class="fas fa-times"></i>
                                    </Button>
                                </Show>
                                                                
                                <Show condicion={current_tracking.status == 'PENDIENTE'}>
                                    <Button color="orange" 
                                        basic 
                                        size="mini"
                                        disabled={!current_tracking.revisado}
                                        onClick={() => handleNext('RESPONDIDO')}
                                    >
                                        Responder <i class="fas fa-reply"></i>
                                    </Button>
                                </Show>

                                <Show condicion={current_tracking.status == 'REGISTRADO' || current_tracking.status == 'PENDIENTE'}>
                                    <Button color="purple" 
                                        basic 
                                        size="mini"
                                        disabled={!current_tracking.revisado}
                                        onClick={() => handleNext('DERIVADO')}
                                    >
                                        Derivar <i class="fas fa-paper-plane"></i>
                                    </Button>
                                </Show>

                                <Show condicion={current_tracking.status == 'ENVIADO'}>
                                    <Button color="red" 
                                        basic 
                                        size="mini"
                                        disabled={!current_tracking.revisado}
                                        onClick={() => handleNext('RECHAZADO')}
                                    >
                                        Rechazar <i class="fas fa-times"></i>
                                    </Button>
                                </Show>

                                <Show condicion={current_tracking.status == 'ENVIADO'}>
                                    <Button color="green" 
                                        basic 
                                        size="mini"
                                        disabled={!current_tracking.revisado}
                                        onClick={() => handleNext('ACEPTADO')}
                                    >
                                        Aceptar <i class="fas fa-check"></i>
                                    </Button>
                                </Show>

                                <Show condicion={current_tracking.status == 'PENDIENTE'}>
                                    <Button color="teal" 
                                        size="mini"
                                        disabled={!current_tracking.revisado}
                                        onClick={() => handleNext('FINALIZADO')}
                                    >
                                        Finalizar <i class="fas fa-check"></i>
                                    </Button>
                                </Show>
                            </div>
                        </Show>
                    </div>
                </div>
            </div>
            {/* ventana de acciones */}
            <Show condicion={current_tracking.current && option == 'NEXT'}>
                <ModalNextTracking
                    tracking={current_tracking}
                    role={role}
                    boss={boss}
                    isClose={(e) => setOption("")}
                    action={action}
                    // onSave={handleOnSave}
                />
            </Show>
        </div>
    )
}

// exportar
export default RenderShow;