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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// providors
const authTramiteProvider = new AuthTramiteProvider();
const trackingProvider = new TrackingProvider();

const hidden = ['RECIBIDO', 'RECHAZADO', 'FINALIZADO'];
const nothing = ['FINALIZADO', 'ANULADO'];

const PlaceholderShow = () => {
    return (
        <div className="tw-p-4 tw-space-y-4">
            {/* Header skeleton */}
            <div className="tw-flex tw-items-center tw-justify-between">
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Skeleton width={70} height={20} borderRadius={6} />
                    <Skeleton width={250} height={18} />
                </div>
                <Skeleton circle width={28} height={28} />
            </div>

            {/* Content skeleton */}
            <div className="tw-grid tw-grid-cols-12 tw-gap-4">
                <div className="tw-col-span-9">
                    <div className="tw-flex tw-gap-3">
                        <Skeleton width={70} height={80} borderRadius={10} />
                        <div className="tw-flex-1 tw-space-y-2">
                            <Skeleton width="60%" height={18} />
                            <Skeleton width="40%" height={14} />
                            <Skeleton width="30%" height={14} />
                            <Skeleton width={80} height={24} borderRadius={12} />
                        </div>
                    </div>
                </div>
                <div className="tw-col-span-3">
                    <Skeleton height={36} borderRadius={8} className="tw-mb-2" />
                    <Skeleton height={100} borderRadius={8} />
                </div>
            </div>

            {/* Files skeleton */}
            <div className="tw-space-y-2">
                <Skeleton width={120} height={14} />
                <div className="tw-flex tw-gap-2">
                    <Skeleton width={50} height={50} borderRadius={8} />
                    <Skeleton width={50} height={50} borderRadius={8} />
                    <Skeleton width={50} height={50} borderRadius={8} />
                </div>
            </div>
        </div>
    );
};

const InboxShow = ({ onRefresh }) => {
    // auth
    const { auth } = useContext(AuthContext);

    // app
    const app_context = useContext(AppContext);

    // tramite
    const tramite_context = useContext(TramiteContext);
    const { current_tracking, dispatch, menu, socket } = tramite_context;
    const current_tramite = current_tracking.tramite || {};
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
        await authTramiteProvider.show(id, {}, options)
            .then(res => {
                let { tracking } = res.data;
                dispatch({ type: tramiteTypes.CHANGE_TRACKING, payload: tracking });
            }).catch(err => console.log(err));
        setCurrentLoading(false);
    };

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
    };

    // actualizar tracking
    const handleOnSave = async (track) => {
        tramite_context.setOption("");
        await getTracking(track.id);
    };

    // validar firma
    const validateFile = () => {
        if (!current_tramite.state) return ['delete', 'signature', 'create'];
        if (current_tracking?.revisado) return ['delete', 'create'];
        if ((auth.person_id == current_tramite.person_id ||
            auth.id == current_tramite.user_id) &&
            (current_tracking.current) &&
            current_tramite.dependencia_origen_id == tramite_context.dependencia_id) return [];
        if (hidden.includes(current_tracking.status)) return ['delete', 'signature', 'create'];
        return ['delete', 'create'];
    };

    // marcar visto
    const markRead = () => {
        if (!current_tracking.readed_at) {
            dispatch({ type: tramiteTypes.DECREMENT_FILTRO, payload: menu });
        }
    };

    // action archivo
    const handleFile = (action, currentFile, file) => {
        if (action == 'delete') {
            dispatch({ type: tramiteTypes.DELETE_FILE_TRACKING, payload: currentFile });
        } else {
            dispatch({ type: tramiteTypes.UPDATE_FILE_TRACKING, payload: file });
        }
    };

    // update verificacion por socket
    const socketUpdateVerify = () => {
        if (!current_tracking.revisado) setIsRefresh(true);
    };

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

    // Volver a la lista
    const handleBack = () => {
        dispatch({ type: tramiteTypes.CHANGE_RENDER, payload: "TAB" });
    };

    // holder
    if (current_loading) return <PlaceholderShow />;

    // render
    return (
        <>
            <div className="tw-h-full tw-flex tw-flex-col tw-bg-gray-50/50">
                {/* Header con navegación */}
                <div className="tw-bg-white tw-border-b tw-border-gray-200 tw-px-4 tw-py-2">
                    <div className="tw-flex tw-items-center tw-justify-between">
                        <div className="tw-flex tw-items-center tw-gap-3">
                            {/* Botón volver */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                                className="tw-w-8 tw-h-8 tw-rounded-lg hover:tw-bg-gray-100"
                            >
                                <i className="fas fa-arrow-left tw-text-gray-600 tw-text-sm"></i>
                            </Button>

                            {/* Código y asunto */}
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <Badge className="tw-bg-gray-900 tw-text-white tw-font-mono tw-text-[10px] tw-px-2 tw-py-0.5">
                                    {current_tramite.slug || ""}
                                </Badge>
                                <h1 className="tw-text-sm tw-font-semibold tw-text-gray-900 tw-m-0 tw-truncate tw-max-w-md">
                                    {current_tramite.asunto || "Sin asunto"}
                                </h1>
                            </div>
                        </div>

                        {/* Acciones del header */}
                        <div className="tw-flex tw-items-center tw-gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsRefresh(true)}
                                className="tw-w-8 tw-h-8 tw-rounded-lg hover:tw-bg-gray-100"
                                title="Actualizar"
                            >
                                <i className="fas fa-sync-alt tw-text-gray-500 tw-text-xs"></i>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="tw-flex-1 tw-overflow-y-auto tw-p-3">
                    <div className="tw-space-y-3">
                        {/* Card principal */}
                        <Card className="tw-border tw-border-gray-200 tw-shadow-sm tw-rounded-xl tw-overflow-hidden">
                            <div className="tw-p-4">
                                <div className="tw-grid tw-grid-cols-12 tw-gap-4">
                                    {/* Info del trámite */}
                                    <ShowInfo
                                        validateFile={validateFile()}
                                        onArchived={handleArchived}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Card del remitente (si no es el primero) */}
                        <Show condicion={!current_tracking.first}>
                            <Card className="tw-border tw-border-gray-200 tw-shadow-sm tw-rounded-xl tw-overflow-hidden">
                                <div className="tw-px-4 tw-py-2 tw-bg-gray-50 tw-border-b tw-border-gray-200">
                                    <h3 className="tw-text-xs tw-font-semibold tw-text-gray-700 tw-m-0 tw-flex tw-items-center tw-gap-2">
                                        <i className="fas fa-user-circle tw-text-gray-400"></i>
                                        Remitente del seguimiento
                                    </h3>
                                </div>
                                <div className="tw-p-4">
                                    <CardInfoTramite
                                        image={current_tracking.person?.image_images?.image_200x200 || ""}
                                        remitente={current_tracking.person?.fullname || ""}
                                        email={current_tracking.person?.email_contact || ""}
                                        dependencia={current_tracking.dependencia?.nombre || ""}
                                        status={current_tracking.status}
                                        revisado={current_tracking.revisado}
                                        archived={current_tracking.archived ? true : false}
                                        onArchived={handleArchived}
                                    />

                                    <Show condicion={Object.keys(current_tracking.info || {}).length}>
                                        <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-gray-100">
                                            <div className="tw-bg-gray-50 tw-rounded-lg tw-p-3">
                                                <h4 className="tw-text-[10px] tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1">
                                                    Descripción
                                                </h4>
                                                <p className="tw-text-xs tw-text-gray-700 tw-m-0">
                                                    {current_tracking.info?.description || 'No hay descripción disponible'}
                                                </p>
                                            </div>

                                            <Show condicion={current_tracking.info?.files?.length}>
                                                <div className="tw-mt-3">
                                                    <h4 className="tw-text-[10px] tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-2">
                                                        Archivos del seguimiento
                                                    </h4>
                                                    <div className="tw-flex tw-flex-wrap tw-gap-2 tw-p-3 tw-bg-gray-50/50 tw-rounded-lg">
                                                        {current_tracking.info?.files?.map((f, indexF) =>
                                                            <ItemFileCircle
                                                                key={`item-tracking-${indexF}`}
                                                                id={f.id}
                                                                is_observation={f.observation}
                                                                className="mb-3"
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
                                                        )}
                                                    </div>
                                                </div>
                                            </Show>
                                        </div>
                                    </Show>
                                </div>
                            </Card>
                        </Show>

                        {/* Acciones */}
                        <Card className="tw-border tw-border-gray-200 tw-shadow-sm tw-rounded-xl tw-overflow-hidden">
                            <div className="tw-p-4">
                                <ShowAction
                                    onAction={setAction}
                                    onAnularProcess={handleOnSave}
                                    onBackRecibido={handleOnSave}
                                    onEdit={() => setCurrentEdit(true)}
                                />

                                {/* Multiple */}
                                <Show condicion={current_tracking?.__meta__?.multiples_count}>
                                    <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-gray-100">
                                        <Button
                                            variant="outline"
                                            onClick={() => setAction("MULTIPLE")}
                                            className="tw-gap-2"
                                        >
                                            <i className="fas fa-chart-line"></i>
                                            Ver Múltiples
                                        </Button>
                                    </div>
                                </Show>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <EditTramite
                show={current_edit}
                onClose={() => setCurrentEdit(false)}
                onSave={(track) => {
                    setCurrentEdit(false);
                    handleOnSave(track);
                }}
            />

            <EditDescriptionTracking />

            <Show condicion={tramite_context.option.includes('TIMELINE')}>
                <ModalTracking
                    isClose={() => tramite_context.setOption([])}
                    slug={current_tramite.slug}
                    onFile={(f) => typeof onFile == 'function' ? onFile(f) : null}
                    current={current_tracking.id}
                />
            </Show>

            <Show condicion={(current_tracking.current && tramite_context.option.includes('NEXT')) || (action == 'ANULADO' && tramite_context.option.includes('NEXT'))}>
                <ModalNextTracking
                    isClose={() => tramite_context.setOption([])}
                    action={action}
                    onSave={handleOnSave}
                />
            </Show>

            <Show condicion={current_tracking.revisado && current_tracking.current && current_tracking.status == 'PENDIENTE'}>
                <BtnFloat
                    onClick={() => {
                        tramite_context.setNext("");
                        tramite_context.setOption(['CREATE']);
                        dispatch({ type: tramiteTypes.CHANGE_TRAMITE, payload: current_tramite });
                    }}
                    theme="bg-warning"
                >
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </Show>

            <Show condicion={action == 'MULTIPLE'}>
                <InfoMultiple
                    current_tracking={current_tracking}
                    isClose={() => setAction("")}
                />
            </Show>
        </>
    );
};

export default InboxShow;
