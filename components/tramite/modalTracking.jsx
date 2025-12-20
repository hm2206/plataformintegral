import React, { useState, useEffect } from 'react';
import Modal from '../modal';
import { tramite } from '../../services/apis';
import Show from '../show';
import moment from 'moment';
import ModalFiles from './modalFiles';
import Swal from 'sweetalert2';
import ModalInfo from './modalInfo';
import Visualizador from '../visualizador';
import InfoMultiple from './infoMultiple';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Skeleton from 'react-loading-skeleton';

moment.locale('es');

const getStatusConfig = (status) => {
    const configs = {
        REGISTRADO: {
            icon: 'fa-file-alt',
            color: 'tw-bg-gray-500',
            borderColor: 'tw-border-gray-500',
            textColor: 'tw-text-gray-700',
            bgLight: 'tw-bg-gray-50',
            label: 'Registrado'
        },
        SUBTRAMITE: {
            icon: 'fa-copy',
            color: 'tw-bg-indigo-500',
            borderColor: 'tw-border-indigo-500',
            textColor: 'tw-text-indigo-700',
            bgLight: 'tw-bg-indigo-50',
            label: 'Sub-Trámite'
        },
        DERIVADO: {
            icon: 'fa-share',
            color: 'tw-bg-purple-500',
            borderColor: 'tw-border-purple-500',
            textColor: 'tw-text-purple-700',
            bgLight: 'tw-bg-purple-50',
            label: 'Derivado'
        },
        ACEPTADO: {
            icon: 'fa-check-circle',
            color: 'tw-bg-blue-500',
            borderColor: 'tw-border-blue-500',
            textColor: 'tw-text-blue-700',
            bgLight: 'tw-bg-blue-50',
            label: 'Aceptado'
        },
        RECHAZADO: {
            icon: 'fa-times-circle',
            color: 'tw-bg-pink-500',
            borderColor: 'tw-border-pink-500',
            textColor: 'tw-text-pink-700',
            bgLight: 'tw-bg-pink-50',
            label: 'Rechazado'
        },
        ANULADO: {
            icon: 'fa-ban',
            color: 'tw-bg-red-500',
            borderColor: 'tw-border-red-500',
            textColor: 'tw-text-red-700',
            bgLight: 'tw-bg-red-50',
            label: 'Anulado'
        },
        ENVIADO: {
            icon: 'fa-paper-plane',
            color: 'tw-bg-amber-500',
            borderColor: 'tw-border-amber-500',
            textColor: 'tw-text-amber-700',
            bgLight: 'tw-bg-amber-50',
            label: 'Enviado'
        },
        FINALIZADO: {
            icon: 'fa-flag-checkered',
            color: 'tw-bg-emerald-500',
            borderColor: 'tw-border-emerald-500',
            textColor: 'tw-text-emerald-700',
            bgLight: 'tw-bg-emerald-50',
            label: 'Finalizado'
        },
        RESPONDIDO: {
            icon: 'fa-reply',
            color: 'tw-bg-orange-500',
            borderColor: 'tw-border-orange-500',
            textColor: 'tw-text-orange-700',
            bgLight: 'tw-bg-orange-50',
            label: 'Respondido'
        },
        RECIBIDO: {
            icon: 'fa-inbox',
            color: 'tw-bg-cyan-500',
            borderColor: 'tw-border-cyan-500',
            textColor: 'tw-text-cyan-700',
            bgLight: 'tw-bg-cyan-50',
            label: 'Recibido'
        },
        PENDIENTE: {
            icon: 'fa-clock',
            color: 'tw-bg-yellow-500',
            borderColor: 'tw-border-yellow-500',
            textColor: 'tw-text-yellow-700',
            bgLight: 'tw-bg-yellow-50',
            label: 'Pendiente'
        },
        COPIA: {
            icon: 'fa-copy',
            color: 'tw-bg-slate-500',
            borderColor: 'tw-border-slate-500',
            textColor: 'tw-text-slate-700',
            bgLight: 'tw-bg-slate-50',
            label: 'Copia'
        }
    };
    return configs[status] || {
        icon: 'fa-file',
        color: 'tw-bg-gray-400',
        borderColor: 'tw-border-gray-400',
        textColor: 'tw-text-gray-600',
        bgLight: 'tw-bg-gray-50',
        label: status
    };
};

const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const ItemTracking = ({ current_tracking = {}, onFiles = null, onTramite = null, current = null, onMultiple = null, isFirst = false, isLast = false }) => {
    const config = getStatusConfig(current_tracking.status);
    const { dependencia, person } = current_tracking;
    const isCurrent = current === current_tracking.id;

    return (
        <div className="tw-relative tw-flex tw-gap-4">
            {/* Línea vertical */}
            <div className="tw-flex tw-flex-col tw-items-center">
                <div className={cn(
                    "tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-z-10 tw-border-2 tw-shadow-md tw-transition-transform",
                    config.color,
                    isCurrent && "tw-ring-4 tw-ring-offset-2 tw-ring-primary-300 tw-scale-110"
                )}>
                    <i className={cn("fas tw-text-white tw-text-sm", config.icon)}></i>
                </div>
                {!isLast && (
                    <div className="tw-w-0.5 tw-flex-1 tw-bg-gradient-to-b tw-from-gray-300 tw-to-gray-200 tw-my-2"></div>
                )}
            </div>

            {/* Contenido */}
            <div className={cn(
                "tw-flex-1 tw-pb-6",
                isLast && "tw-pb-0"
            )}>
                <div className={cn(
                    "tw-rounded-xl tw-border tw-p-4 tw-transition-all tw-duration-200 hover:tw-shadow-md",
                    config.bgLight,
                    config.borderColor,
                    isCurrent && "tw-ring-2 tw-ring-primary-400 tw-shadow-lg"
                )}>
                    {/* Header */}
                    <div className="tw-flex tw-items-start tw-justify-between tw-mb-3">
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <Badge className={cn("tw-text-xs tw-font-semibold", config.color)}>
                                {config.label}
                            </Badge>
                            {isCurrent && (
                                <Badge className="tw-bg-primary-500 tw-text-xs">
                                    <i className="fas fa-map-marker-alt tw-mr-1"></i>
                                    Actual
                                </Badge>
                            )}
                        </div>
                        <div className="tw-text-right">
                            <div className="tw-text-xs tw-font-medium tw-text-gray-900">
                                {moment(current_tracking.created_at).format('DD MMM YYYY')}
                            </div>
                            <div className="tw-text-xs tw-text-gray-500">
                                {moment(current_tracking.created_at).format('h:mm a')}
                            </div>
                        </div>
                    </div>

                    {/* Persona y dependencia */}
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3">
                        <Avatar className="tw-w-10 tw-h-10 tw-border-2 tw-border-white tw-shadow-sm">
                            <AvatarImage
                                src={person?.image_images?.image_200x200 || person?.image || '/img/perfil.jpg'}
                                alt={person?.fullname}
                            />
                            <AvatarFallback className="tw-bg-gray-200 tw-text-gray-600 tw-text-xs tw-font-semibold">
                                {getInitials(person?.fullname)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="tw-flex-1 tw-min-w-0">
                            <div className="tw-text-sm tw-font-semibold tw-text-gray-900 tw-capitalize tw-truncate">
                                {person?.fullname?.toLowerCase() || 'Sin nombre'}
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-text-gray-500">
                                <i className="fas fa-building"></i>
                                <span className="tw-capitalize tw-truncate">
                                    {dependencia?.nombre?.toLowerCase() || 'Exterior'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Descripción si existe */}
                    <Show condicion={current_tracking.info?.description}>
                        <div className="tw-bg-white/60 tw-rounded-lg tw-p-3 tw-mb-3 tw-border tw-border-gray-200/50">
                            <p className="tw-text-sm tw-text-gray-700 tw-m-0">
                                {current_tracking.info?.description}
                            </p>
                        </div>
                    </Show>

                    {/* Acciones */}
                    <div className="tw-flex tw-flex-wrap tw-gap-2">
                        <Show condicion={Object.keys(current_tracking.tramite || {}).length}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => typeof onTramite == 'function' ? onTramite(e, current_tracking.tramite || {}) : null}
                                className="tw-h-8 tw-text-xs tw-gap-1.5"
                            >
                                <i className="fas fa-info-circle"></i>
                                Ver Trámite
                            </Button>
                        </Show>

                        <Show condicion={current_tracking.info?.files?.length}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => typeof onFiles == 'function' ? onFiles(e, current_tracking.info?.files || []) : null}
                                className="tw-h-8 tw-text-xs tw-gap-1.5"
                            >
                                <i className="fas fa-paperclip"></i>
                                Archivos ({current_tracking.info?.files?.length || 0})
                            </Button>
                        </Show>

                        <Show condicion={current_tracking?.__meta__?.multiples_count}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => typeof onMultiple == 'function' ? onMultiple(current_tracking) : null}
                                className="tw-h-8 tw-text-xs tw-gap-1.5 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50"
                            >
                                <i className="fas fa-sitemap"></i>
                                Múltiples
                            </Button>
                        </Show>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlaceholderItem = () => (
    <div className="tw-relative tw-flex tw-gap-4">
        <div className="tw-flex tw-flex-col tw-items-center">
            <Skeleton circle width={40} height={40} />
            <div className="tw-w-0.5 tw-flex-1 tw-bg-gray-200 tw-my-2"></div>
        </div>
        <div className="tw-flex-1 tw-pb-6">
            <div className="tw-rounded-xl tw-border tw-border-gray-200 tw-p-4 tw-bg-gray-50">
                <div className="tw-flex tw-justify-between tw-mb-3">
                    <Skeleton width={80} height={20} borderRadius={10} />
                    <Skeleton width={60} height={16} />
                </div>
                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3">
                    <Skeleton circle width={40} height={40} />
                    <div className="tw-flex-1">
                        <Skeleton width="60%" height={14} />
                        <Skeleton width="40%" height={12} className="tw-mt-1" />
                    </div>
                </div>
                <Skeleton width={100} height={28} borderRadius={6} />
            </div>
        </div>
    </div>
);

const ModalTracking = ({ isClose = null, slug = "", current = null }) => {
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [is_error, setIsError] = useState(false);
    const [option, setOption] = useState("");
    const [current_files, setCurrentFiles] = useState([]);
    const [current_tramite, setCurrentTramite] = useState({});
    const [current_file, setCurrentFile] = useState({});
    const [is_visualizador, setIsVisualizador] = useState(false);
    const [multiple, setMultiple] = useState({});

    const getTracking = async (add = false) => {
        setCurrentLoading(true);
        await tramite.get(`tramite/${slug}/timeline?page=${current_page}`)
            .then(res => {
                let { trackings, success, message } = res.data;
                if (!success) throw new Error(message);
                setCurrentPage(trackings.page);
                setCurrentTotal(trackings.total);
                setCurrentLastPage(trackings.lastPage);
                setDatos(add ? [...datos, ...trackings.data] : trackings.data);
                setIsError(false);
            }).catch(err => setIsError(true));
        setCurrentLoading(false);
    };

    useEffect(() => {
        getTracking();
    }, []);

    useEffect(() => {
        if (current_page > 1) getTracking(true);
    }, [current_page]);

    return (
        <Modal
            show={true}
            md="10"
            isClose={isClose}
            titulo={
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-primary-500 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                        <i className="fas fa-route tw-text-white tw-text-sm"></i>
                    </div>
                    <div>
                        <span className="tw-font-semibold">Seguimiento del Trámite</span>
                        <Badge className="tw-ml-2 tw-bg-gray-800 tw-text-xs tw-font-mono">
                            {slug}
                        </Badge>
                    </div>
                </div>
            }
        >
            <div className="tw-p-6 tw-bg-gray-50/50 tw-min-h-[400px]">
                {/* Resumen */}
                <Show condicion={datos.length > 0 && !current_loading}>
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-6 tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-gray-200">
                        <div className="tw-flex tw-items-center tw-gap-4">
                            <div className="tw-text-center">
                                <div className="tw-text-2xl tw-font-bold tw-text-gray-900">{current_total}</div>
                                <div className="tw-text-xs tw-text-gray-500">Total eventos</div>
                            </div>
                            <div className="tw-w-px tw-h-10 tw-bg-gray-200"></div>
                            <div className="tw-text-center">
                                <div className="tw-text-2xl tw-font-bold tw-text-primary-600">{datos.length}</div>
                                <div className="tw-text-xs tw-text-gray-500">Mostrando</div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            className="tw-gap-2"
                        >
                            <i className="fas fa-print"></i>
                            Imprimir
                        </Button>
                    </div>
                </Show>

                {/* Timeline */}
                <div className="tw-space-y-0">
                    {datos.map((d, indexD) =>
                        <ItemTracking
                            key={`tracking-timeline-${indexD}`}
                            current={current}
                            current_tracking={d}
                            isFirst={indexD === 0}
                            isLast={indexD === datos.length - 1}
                            onFiles={(e, files) => {
                                setCurrentFiles(files);
                                setOption("SHOW_FILE");
                            }}
                            onTramite={(e, info) => {
                                setCurrentTramite(info);
                                setOption('SHOW_INFO');
                            }}
                            onMultiple={(m) => {
                                setMultiple(m);
                                setOption('MULTIPLE');
                            }}
                        />
                    )}
                </div>

                {/* Loading */}
                <Show condicion={current_loading}>
                    <div className="tw-space-y-0">
                        {[1, 2, 3].map(i => <PlaceholderItem key={`placeholder-${i}`} />)}
                    </div>
                </Show>

                {/* Error */}
                <Show condicion={is_error && !current_loading}>
                    <div className="tw-text-center tw-py-12">
                        <div className="tw-w-16 tw-h-16 tw-bg-red-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                            <i className="fas fa-exclamation-triangle tw-text-red-500 tw-text-2xl"></i>
                        </div>
                        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2">Error al cargar</h3>
                        <p className="tw-text-gray-500 tw-mb-4">No se pudo cargar el seguimiento del trámite</p>
                        <Button onClick={() => getTracking()}>
                            <i className="fas fa-redo tw-mr-2"></i>
                            Reintentar
                        </Button>
                    </div>
                </Show>

                {/* Empty */}
                <Show condicion={!current_loading && !is_error && datos.length === 0}>
                    <div className="tw-text-center tw-py-12">
                        <div className="tw-w-16 tw-h-16 tw-bg-gray-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                            <i className="fas fa-route tw-text-gray-400 tw-text-2xl"></i>
                        </div>
                        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2">Sin seguimiento</h3>
                        <p className="tw-text-gray-500">Este trámite aún no tiene eventos de seguimiento</p>
                    </div>
                </Show>

                {/* Cargar más */}
                <Show condicion={(current_page + 1) <= current_last_page && !current_loading}>
                    <div className="tw-text-center tw-mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="tw-gap-2"
                        >
                            <i className="fas fa-chevron-down"></i>
                            Cargar más eventos
                        </Button>
                    </div>
                </Show>

                {/* Modales */}
                <Show condicion={option == 'SHOW_FILE'}>
                    <ModalFiles
                        files={current_files}
                        isClose={() => setOption("")}
                        onFile={(e, f) => {
                            setCurrentFile(f);
                            setIsVisualizador(true);
                        }}
                    />
                </Show>

                <Show condicion={option == 'SHOW_INFO'}>
                    <ModalInfo
                        current_tramite={current_tramite}
                        isClose={() => setOption("")}
                        onFile={(e, f) => {
                            setCurrentFile(f);
                            setIsVisualizador(true);
                        }}
                    />
                </Show>

                <Show condicion={is_visualizador}>
                    <Visualizador
                        id="visualizador-info"
                        name={current_file.name}
                        extname={current_file.extname}
                        url={current_file.url}
                        onClose={() => setIsVisualizador(false)}
                    />
                </Show>

                <Show condicion={option == 'MULTIPLE'}>
                    <InfoMultiple
                        current_tracking={multiple}
                        isClose={() => setOption("")}
                    />
                </Show>
            </div>
        </Modal>
    );
};

export default ModalTracking;
