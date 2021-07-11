import React, { useState, useContext, useEffect } from 'react';
import CardInfoTramite from './cardInfoTramite';
import ItemFileCircle from '../itemFileCircle';
import ModalNextTracking from './modalNextTracking';
import ModalTracking from './modalTracking';
import { AppContext } from '../../contexts/AppContext';
import Show from '../show';
import { tramite } from '../../services/apis';
import { BtnFloat } from '../Utils';
import Swal from 'sweetalert2';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import Skeleton from 'react-loading-skeleton';
import InfoMultiple from './infoMultiple';
import { AuthContext } from '../../contexts/AuthContext';
import AuthTramiteProvider from '../../providers/tramite/auth/AuthTramiteProvider';
import TrackingProvider from '../../providers/tramite/TrackingProvider';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';
import ShowInfo from './showInfo';
import ShowAction from './showAction';
import EditDescriptionTracking from './editDescriptionTracking';
import EditTramite from './editTramite';

// providors
const authTramiteProvider = new AuthTramiteProvider();
const trackingProvider = new TrackingProvider();

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

const InboxShow = ({ onRefresh }) => {

    // auth
    const { auth } = useContext(AuthContext);

    // app
    const app_context = useContext(AppContext);

    // tramite
    const tramite_context = useContext(TramiteContext);
    const { current_tracking, dispatch, menu, socket } = tramite_context;
    const  current_tramite = current_tracking.tramite || {};
    const [current_edit, setCurrentEdit] = useState(false);
    const isTramite = Object.keys(current_tramite).length;
    
    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [action, setAction] = useState("");
    const [is_refresh, setIsRefresh] = useState(false);

    // config options
    let options = {
        headers: { DependenciaId: tramite_context.dependencia_id } 
    };

    // obtener tracking
    const getTracking = async (id = current_tracking.id) => {
        setCurrentLoading(true);
        // request
        await authTramiteProvider.show(id, {}, options)
            .then(res => {
                let { tracking } = res.data;
                dispatch({ type: tramiteTypes.CHANGE_TRACKING, payload: tracking });
            }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // archivar
    const handleArchived = async () => {
        app_context.setCurrentLoading(true);
        await trackingProvider.archived(current_tracking.id, current_tracking.archived ? false : true, options)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setIsRefresh(true);
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: err.message });
        });
    }

    // actualizar tracking
    const handleOnSave = async (track) => {
        tramite_context.setOption("");
        await getTracking(track.id);
    }

    // validar firma
    const validateFile = () => {
        if (!current_tramite.state) return ['delete', 'signature', 'create'];
        if (current_tracking?.revisado) return ['delete', 'create'];
        // validar si es el dueño del documento y esta en la dependencia
        if ((auth.person_id == current_tramite.person_id || 
            auth.id == current_tramite.user_id) && 
            (current_tracking.current) && 
            current_tramite.dependencia_origen_id == tramite_context.dependencia_id) return [];
        // validar a otros usuarios
        if (hidden.includes(current_tracking.status)) return ['delete', 'signature', 'create'];
        // response default
        return ['delete', 'create'];
    }

    // marcar visto
    const markRead = () => {
        if (!current_tracking.readed_at) {
            dispatch({ type: tramiteTypes.DECREMENT_FILTRO, payload: menu })
        }
    }

    // action archivo
    const handleFile = (action, currentFile, file) => {
        if (action == 'delete') {
            dispatch({ type: tramiteTypes.DELETE_FILE_TRACKING, payload: currentFile });
        } else {
            dispatch({ type: tramiteTypes.UPDATE_FILE_TRACKING, payload: file });
        }
    }

    // update verificacion por socket
    const socketUpdateVerify = () => {
        if (!current_tracking.revisado) setIsRefresh(true);
    }

    // executar marcado
    useEffect(() => {
        markRead();
    }, [current_tracking.id]);

    // primera vez
    useEffect(() => {
        getTracking();
    }, [current_tracking.id]);

    // refrescar datos
    useEffect(() => {
        if (is_refresh) getTracking();
    }, [is_refresh]);

    // disable refresh
    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    // executar socket
    useEffect(() => {
        socket?.on('Tramite/TramiteListener.verify', socketUpdateVerify);
    }, [socket]);

    // holder
    if (current_loading) return <PlaceholderShow/>
    

    // render
    return (
        <>
            <div className="card mt-3">
                <div className="card-header">
                    <span className="badge badge-dark">
                        {current_tramite.slug || ""}
                    </span>
                    <i className="fas fa-arrow-right ml-1 mr-1"></i>
                    <span style={{ wordWrap: 'break-word' }}>{current_tramite.asunto || ""}</span>
                    
                    <span className="close cursor-pointer"
                        onClick={(e) => setIsRefresh(true)}
                    >
                        <i className="fas fa-sync"></i>
                    </span>
                </div>

                <div className="card-body">
                    <div className="row">
                        {/* info tramite */}
                        <ShowInfo validateFile={validateFile()}
                            onArchived={handleArchived}
                        />
                        {/* meta datos */}
                        <Show condicion={!current_tracking.first}>
                            <div className="col-md-12 mt-3">
                                <hr/>

                                <CardInfoTramite
                                    image={current_tracking.person && current_tracking.person.image_images && current_tracking.person.image_images.image_200x200 || ""}
                                    remitente={current_tracking.person && current_tracking.person.fullname || ""}
                                    email={current_tracking.person && current_tracking.person.email_contact || ""}
                                    dependencia={current_tracking.dependencia && current_tracking.dependencia.nombre || ""}
                                    status={current_tracking.status}
                                    revisado={current_tracking.revisado}
                                    archived={current_tracking.archived ? true : false}
                                    onArchived={handleArchived}
                                />

                                <Show condicion={Object.keys(current_tracking.info || {}).length}>
                                    <div className="mt-3">
                                        <b>Descripción: </b> {current_tracking.info && current_tracking.info.description || 'No hay descripción disponible'}
                                    </div>

                                    <Show condicion={current_tracking.info && current_tracking.info.files && current_tracking.info.files.length}>
                                        <div className="row mt-3">
                                            <div className="col-md-12 mb-3">
                                                <b>Archivos del seguímiento:</b>
                                            </div>
                                            {current_tracking.info && current_tracking.info.files ? current_tracking.info.files.map((f, indexF) => 
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
                                                        onAction={(e, file) => handleFile(e, f, file)}
                                                    />
                                                </div>
                                            ): null}
                                        </div>
                                    </Show>
                                </Show>
                            </div>
                        </Show>
                        {/* info action */}
                        <ShowAction onAction={setAction}
                            onAnularProcess={handleOnSave}
                            onBackRecibido={handleOnSave}
                            onEdit={() => setCurrentEdit(true)}
                        />
                        {/* multiple */}
                        <Show condicion={current_tracking?.__meta__?.multiples_count}>
                            <div className="col-md-12 mt-4">
                                <hr/>
                                <button className="btn btn-primary"
                                    onClick={(e) => setAction("MULTIPLE")}
                                >
                                    <i className="fas fa-chart-line"></i> Multiples
                                </button>
                            </div>
                        </Show>
                    </div>
                </div>
            </div>
            {/* editar trámite */}
            <EditTramite show={current_edit}
                onClose={() => setCurrentEdit(false)}
                onSave={(track) => {
                    setCurrentEdit(false);
                    handleOnSave(track);
                }}
            />
            {/* tracking description */}
            <EditDescriptionTracking/>
            {/* línea de tiempo */}
            <Show condicion={tramite_context.option.includes('TIMELINE')}>
                <ModalTracking 
                    isClose={(e) => tramite_context.setOption([])}
                    slug={current_tramite.slug}
                    onFile={(f) => typeof onFile == 'function' ? onFile(f) : null}
                    current={current_tracking.id}
                />
            </Show>
            {/* ventana de acciones */}
            <Show condicion={(current_tracking.current && tramite_context.option.includes('NEXT')) || (action == 'ANULADO' && tramite_context.option.includes('NEXT'))}>
                <ModalNextTracking
                    isClose={(e) => tramite_context.setOption([])}
                    action={action}
                    onSave={handleOnSave}
                />
            </Show>
            {/* botón flotante */}
            <Show condicion={current_tracking.revisado && current_tracking.current && current_tracking.status == 'PENDIENTE'}>
                <BtnFloat onClick={(e) => {
                    tramite_context.setNext("");
                    tramite_context.setOption(['CREATE']);
                    dispatch({ type: tramiteTypes.CHANGE_TRAMITE, payload: current_tramite });
                }} theme="bg-warning">
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </Show>
            {/* multiple tracking */}
            <Show condicion={action == 'MULTIPLE'}>
                <InfoMultiple
                    current_tracking={current_tracking}
                    isClose={(e) => setAction("")}
                />
            </Show>
        </>
    )
}

// exportar
export default InboxShow;