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
import { TramiteContext } from '../../contexts/TramiteContext';
import Skeleton from 'react-loading-skeleton';

const hidden = ['RECIBIDO', 'RECHAZADO', 'FINALIZADO'];
const nothing = ['FINALIZADO', 'ANULADO'];

const PlaceholderShow = () => {

    return (
        <div className="row">
            <div className="col-md-2"><Skeleton height="20px"/></div>
            <div className="col-md-10"><Skeleton height="20px"/></div>
            <div className="col-md-12"><hr/></div>
            <div className="col-md-2">
                <Skeleton height="120px" className="mb-3"/>
                <Skeleton height="10px"/>
                <Skeleton height="10px"/>
                <Skeleton height="10px"/>
                <Skeleton height="10px" className="mb-2"/>
                <Skeleton height="30px"/>
            </div>
            <div className="col-md-3">
                <Skeleton height="15px"/>
                <Skeleton height="10px"/>
                <Skeleton height="10px"/>
                <Skeleton height="20px" width="30px"/>
            </div>
            <div className="col-md-5"></div>
            <div className="col-md-2">
                <Skeleton height="30px" className="mb-3"/>
                <Skeleton height="130px"/>
            </div>
            
            <div className="col-md-12">
                <hr/>
            </div>

            <div className="col-md-2">
                <Skeleton height="15px" className="mb-2"/>
                <Skeleton height="30px" circle="100px"/>
            </div>
        </div>
    )
}

const RenderShow = () => {

    // app
    const app_context = useContext(AppContext);

    // tramite
    const tramite_context = useContext(TramiteContext);
    
    // estados
    const [current_tracking, setCurrentTracking] = useState({});
    const [action, setAction] = useState("");
    const [current_tramite, setCurrentTramite] = useState({});
    const isTramite = Object.keys(current_tracking || {}).length

    // realizar accion
    const handleNext = (act) => {
        tramite_context.setOption("NEXT");
        setAction(act);
    }

    // verificar tracking
    const verifyTracking = async () => {
        let answer = await Confirm(`warning`, `¿Estás seguro en revisar el trámite?`, 'Revisar');    
        if (answer) {
            app_context.fireLoading(true);
            await tramite.post(`tracking/${current_tracking.id}/verify`, {}, { headers: { DependenciaId: tramite_context.dependencia_id } })
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                tramite_context.setRefresh(true);
                tramite_context.setExecute(true);
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
        datos.append('object_id', current_tracking.first ? current_tramite.id : current_tracking.id);
        datos.append('object_type', object_type);
        await tramite.post(`file`, datos)
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message, files } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                tramite_context.setExecute(true);
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
    const getTracking = async (id = tramite_context.tracking.id) => {
        tramite_context.setLoading(true);
        await tramite.get(`auth/tramite/${id}/tracking`, {
            headers: { DependenciaId: tramite_context.dependencia_id } 
        }).then(res => {
            let { success, message, tracking } = res.data;
            if (!success) throw new Error(message);
            tramite_context.setTracking(tracking);
            setCurrentTracking(tracking);
            setCurrentTramite(tracking.tramite || {});
        }).catch(err => console.log(err));
        tramite_context.setLoading(false);
        tramite_context.setRefresh(true);
    }

    // actualizar tracking
    const handleOnSave = async (track) => {
        tramite_context.setOption("");
        await getTracking(track.id);
        tramite_context.setRefresh(true);
    }

    // crear tramite apartir del tracking
    const handleCreateTramite = async () => {
        if (typeof onCreate == 'function') onCreate(current_tramite);
    }

    // validar firma
    const validateFile = () => {
        if (!current_tramite.state) return ['delete', 'signature']; 
        // validar si es el dueño del documento
        if (app_context.auth.person_id == current_tramite.person_id || app_context.auth.id == current_tramite.user_id) return [];
        // validar a otros usuarios
        if (hidden.includes(current_tracking.status)) return ['delete', 'signature'];
        // response default
        return ['delete'];
    }

    // primera vez
    useEffect(() => {
        getTracking();
    }, []);

    // refrescar datos
    useEffect(() => {
        if (tramite_context.execute) getTracking();
    }, [tramite_context.execute])

    // holder
    if (tramite_context.loading) return <PlaceholderShow/>

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
                                onClick={(e) => tramite_context.setOption('TIMELINE')}
                            >
                                <i className="fas fa-search"></i> Seguímiento
                            </button>
                        </div>

                        <Show condicion={isTramite && current_tramite.code_qr}>
                            <img src={current_tramite.code_qr} alt="code_qr"
                                style={{ width: "100%", objectFit: 'contain' }}
                            />
                        </Show>
                    </div>

                    <div className="col-md-12 mb-2">
                        <hr/>
                        <b><i className="fas fa-clip-paper"></i> Archivos de trámite: </b>
                        <div className="row mt-3">
                            {isTramite && typeof current_tramite.files == 'object' ? current_tramite.files.map((f, indexF) => 
                                <div className="ml-5 col-xs" key={`item-tramite-${indexF}`}>
                                    <ItemFileCircle
                                        id={f.id}
                                        is_observation={f.observation}
                                        className="mb-3"
                                        key={`item-file-tramite-${indexF}`}
                                        url={f.url}
                                        name={f.name}
                                        extname={f.extname}
                                        hidden={validateFile()}
                                        edit={true}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            tramite_context.setFile(f);
                                            tramite_context.setOption('VISUALIZADOR');
                                        }}
                                        onAction={(e, file) => tramite_context.setExecute(true)}
                                    />
                                </div>
                            ) : null}
                            {/* agregar archivos */}
                            <Show condicion={
                                current_tramite.state &&
                                (current_tramite.user_id == app_context.auth.id || 
                                current_tramite.person_id == app_context.auth.person_id)
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

                    <Show condicion={isTramite && current_tramite.old_files && current_tramite.old_files.length}>
                        <div className="col-md-12 mb-2">
                            <hr/>
                            <b><i className="fas fa-clip-paper"></i> Archivos anidados: </b>
                            <div className="row mt-3">
                                {isTramite && typeof current_tramite.old_files == 'object' ? current_tramite.old_files.map((f, indexF) => 
                                    <div className="ml-5 col-xs" key={`item-old-tramite-${indexF}`}>
                                        <ItemFileCircle
                                            id={f.id}
                                            is_observation={f.observation}
                                            className="mb-3"
                                            key={`item-file-old-tramite-${indexF}`}
                                            url={f.url}
                                            name={f.name}
                                            extname={f.extname}
                                            hidden={['delete']}
                                            edit={true}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                tramite_context.setFile(f);
                                                tramite_context.setOption('VISUALIZADOR');
                                            }}
                                            onAction={(e, file) => tramite_context.setExecute(true)}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </Show>

                    {/* meta datos */}
                    <Show condicion={!current_tracking.first}>
                        <div className="col-md-12 mt-3">
                            <hr/>
                            <CardInfoTramite
                                image={current_tracking.person && current_tracking.person.image_images && current_tracking.person.image_images.image_200x200 || ""}
                                remitente={current_tracking.person && current_tracking.person.fullname || ""}
                                email={current_tracking.person && current_tracking.person.email_contact || ""}
                                dependencia={
                                    current_tracking.status == 'RECIBIDO' || current_tracking.status == 'PENDIENTE'
                                    ? current_tracking.dependencia_origen && current_tracking.dependencia_origen.nombre || ""
                                    : current_tracking.dependencia_destino && current_tracking.dependencia_destino.nombre || ""
                                }
                                status={current_tracking.status}
                                revisado={current_tracking.revisado}
                        />

                            <div className="mt-3">
                                <b>Descripción: </b> {current_tracking.description || 'No hay descripción disponible'}
                            </div>

                            <Show condicion={Object.keys(current_tracking || {}).length && current_tracking.files && current_tracking.files.length}>
                                <div className="row mt-3">
                                    <div className="col-md-12 mb-3">
                                        <b>Archivos del seguímiento:</b>
                                    </div>
                                    {current_tracking.files ? current_tracking.files.map((f, indexF) => 
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
                                                    tramite_context.setFile(f);
                                                    tramite_context.setOption('VISUALIZADOR');
                                                }}
                                                onAction={(e) => setCurrentRefesh(true)}
                                            />
                                        </div>
                                    ): null}
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

                                <Show condicion={current_tracking.status == 'RECIBIDO'}>
                                    <Button color="red" 
                                        basic 
                                        size="mini"
                                        disabled={!current_tracking.revisado}
                                        onClick={() => handleNext('RECHAZADO')}
                                    >
                                        Rechazar <i class="fas fa-times"></i>
                                    </Button>
                                </Show>

                                <Show condicion={current_tracking.status == 'RECIBIDO'}>
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
            <Show condicion={tramite_context.option == 'TIMELINE'}>
                <ModalTracking 
                    isClose={(e) => tramite_context.setOption("")}
                    slug={current_tramite.slug}
                    onFile={(f) => typeof onFile == 'function' ? onFile(f) : null}
                    current={current_tracking.id}
                />
            </Show>
            {/* ventana de acciones */}
            <Show condicion={current_tracking.current && tramite_context.option == 'NEXT'}>
                <ModalNextTracking
                    isClose={(e) => tramite_context.setOption("")}
                    action={action}
                    onSave={handleOnSave}
                />
            </Show>
            {/* boton flotante */}
            <Show condicion={current_tracking.current && current_tracking.status == 'PENDIENTE'}>
                <BtnFloat onClick={(e) => {
                    tramite_context.setTramite(current_tramite)
                    tramite_context.setOption('CREATE');
                }}>
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </Show>
        </div>
    )
}

// exportar
export default RenderShow;