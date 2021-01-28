import React, { useState, useContext, useEffect } from 'react';
import CardInfoTramite from './cardInfoTramite';
import ItemFileCircle from '../itemFileCircle';
import ModalNextTracking from './modalNextTracking';
import ModalTracking from './modalTracking';
import { AppContext } from '../../contexts/AppContext';
import Show from '../show';
import { Button } from 'semantic-ui-react'
import { tramite } from '../../services/apis';
import { DropZone, BtnFloat } from '../Utils';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

const RenderShow = ({ tracking = {}, role = {}, boss = {}, onFile = null, refresh = false, onCreate = null }) => {

    // app
    const app_context = useContext(AppContext);
    
    // estados
    const [current_refresh, setCurrentRefesh] = useState(refresh);
    const [current_tracking, setCurrentTracknig] = useState(tracking);
    const [option, setOption] = useState("");
    const [action, setAction] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_qr, setCurrentQr] = useState("");

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
                    setCurrentRefesh(true);
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
                setCurrentRefesh(true);
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
    const getTracking = async (id = current_tracking.id) => {
        setCurrentLoading(true);
        await tramite.get(`auth/tramite/${id}/tracking`, {
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

    // actualizar tracking
    const handleOnSave = async (track) => {
        setOption("");
        await getTracking(track.id);
    }

    // crear tramite apartir del tracking
    const handleCreateTramite = async () => {
        if (typeof onCreate == 'function') onCreate(current_tramite);
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
                            status={current_tracking.first ? current_tracking.status : ''}
                            revisado={current_tracking.revisado}
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
                            <Show condicion={!current_tracking.revisado && current_tracking.user_verify_id == app_context.auth.id}>
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
                        <div className="mb-2">
                            <button className="btn btn-outline-primary btn-block"
                                onClick={(e) => setOption('TIMELINE')}
                            >
                                <i className="fas fa-search"></i> Seguímiento
                            </button>
                        </div>

                        <img src={current_qr || ""} alt="code_qr"
                            style={{ width: "100%", objectFit: 'contain' }}
                        />
                    </div>

                    <div className="col-md-12 mb-2">
                        <hr/>
                        <b><i className="fas fa-clip-paper"></i> Archivos de trámite: </b>
                        <div className="row mt-3">
                                <Show condicion={current_tramite && current_tramite.files && current_tramite.files.length > 0 || 0}>
                                    {current_tramite && current_tramite.files.map((f, indexF) => 
                                        <div className="ml-5 col-xs" key={`item-tramite-${indexF}`}>
                                            <ItemFileCircle
                                                id={f.id}
                                                is_observation={f.observation}
                                                className="mb-3"
                                                key={`item-file-tramite-${indexF}`}
                                                url={f.url}
                                                name={f.name}
                                                extname={f.extname}
                                                hidden={[ 
                                                    current_tramite.person_id == app_context.auth.person_id
                                                ]}
                                                edit={true}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (typeof onFile == 'function') onFile(f)
                                                }}
                                                onAction={(e, file) => setCurrentRefesh(true)}
                                            />
                                        </div>
                                    )}
                                </Show>
                                {/* agregar archivos */}
                                <Show condicion={
                                    current_tracking.first && 
                                    !current_tracking.revisado && 
                                    (current_tracking.user_id == app_context.auth.id || 
                                    current_tracking.user_verify_id == app_context.auth.id)
                                }>
                                    <div className="text-right ml-3">
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

                    {/* meta datos */}
                    <Show condicion={!current_tracking.first}>
                        <div className="col-md-12 mt-3">
                            <hr/>
                            <CardInfoTramite
                                image={current_tracking.person && current_tracking.person.image_images && current_tracking.person.image_images.image_200x200 || ""}
                                remitente={current_tracking.person && current_tracking.person.fullname || ""}
                                email={current_tracking.person && current_tracking.person.email_contact || ""}
                                dependencia={current_tracking.dependencia_destino && current_tracking.dependencia_destino.nombre || ""}
                                status={current_tracking.status}
                                revisado={current_tracking.revisado}
                        />

                            <div className="mt-3">
                                <b>Descripción: </b> {current_tracking.description || 'No hay descripción disponible'}
                            </div>

                            <Show condicion={typeof current_tracking == 'object' && current_tracking.files && current_tracking.files.length || false}>
                                <div className="row mt-3">
                                    <div className="col-md-12">Archivos del seguímiento:</div>
                                    {/* archivos del tracking */}
                                    {current_tracking.files.map((f, indexF) => 
                                        <div className="ml-5 col-xs" key={`item-tracking-${indexF}`}>
                                            <ItemFileCircle
                                                id={f.id}
                                                is_observation={f.observation}
                                                className="mb-3"
                                                key={`item-file-tracking-${indexF}`}
                                                url={f.url}
                                                name={f.name}
                                                extname={f.extname}
                                                edit={true}
                                                hidden={['delete']}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (typeof onFile == 'function') onFile(f)
                                                }}
                                                onAction={(e) => setCurrentRefesh(true)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Show>
                        </div>
                    </Show>

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
            {/* línea de tiempo */}
            <Show condicion={option == 'TIMELINE'}>
                <ModalTracking 
                    isClose={(e) => setOption("")}
                    slug={current_tramite.slug}
                    onFile={(f) => typeof onFile == 'function' ? onFile(f) : null}
                />
            </Show>
            {/* ventana de acciones */}
            <Show condicion={current_tracking.current && option == 'NEXT'}>
                <ModalNextTracking
                    tracking={current_tracking}
                    role={role}
                    boss={boss}
                    isClose={(e) => setOption("")}
                    action={action}
                    onSave={handleOnSave}
                />
            </Show>
            {/* boton flotante */}
            <Show condicion={current_tracking.current && current_tracking.status == 'PENDIENTE'}>
                <BtnFloat onClick={handleCreateTramite}>
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </Show>
        </div>
    )
}

// exportar
export default RenderShow;