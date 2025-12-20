import React, { useContext, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';
import Show from '../show';
import { status } from './datos.json';
import AuthTrackingProvider from '../../providers/tramite/auth/AuthTrackingProvider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import moment from 'moment';

const authTrackingProvider = new AuthTrackingProvider();

const PlaceholderItem = ({ index }) => (
    <div
        className="tw-mx-3 tw-my-2 tw-bg-white tw-rounded-xl tw-p-4 tw-shadow-sm tw-border tw-border-gray-100"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className="tw-flex tw-items-start tw-gap-4">
            <Skeleton circle width={44} height={44} />
            <div className="tw-flex-1">
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                    <Skeleton width={100} height={12} />
                    <Skeleton width={60} height={10} />
                </div>
                <Skeleton width="80%" height={16} className="tw-mb-2" />
                <div className="tw-flex tw-items-center tw-gap-3">
                    <Skeleton width={80} height={10} />
                    <Skeleton width={60} height={20} borderRadius={10} />
                </div>
            </div>
        </div>
    </div>
);

const ItemTracking = ({ tracking, index }) => {
    const { dispatch } = useContext(TramiteContext);
    const { tramite, dependencia, person } = tracking || {};
    const [isHovered, setIsHovered] = useState(false);

    const getStatus = (current_status) => status[current_status] || {};
    const current_status = getStatus(tracking.status);

    const isUnread = !tracking.readed_at;

    const formatDate = (date) => {
        const m = moment(date);
        const today = moment();
        if (m.isSame(today, 'day')) return m.format('HH:mm');
        if (m.isSame(today, 'year')) return m.format('D MMM');
        return m.format('D/MM/YY');
    };

    const getSemaforoColor = (semaforo) => {
        const colors = {
            green: 'tw-bg-emerald-500',
            yellow: 'tw-bg-amber-500',
            red: 'tw-bg-red-500',
        };
        return colors[semaforo] || 'tw-bg-gray-400';
    };

    const getStatusStyles = () => {
        if (current_status.className?.includes('success')) return 'tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200';
        if (current_status.className?.includes('warning')) return 'tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200';
        if (current_status.className?.includes('danger')) return 'tw-bg-red-50 tw-text-red-700 tw-border-red-200';
        if (current_status.className?.includes('primary')) return 'tw-bg-blue-50 tw-text-blue-700 tw-border-blue-200';
        if (current_status.className?.includes('info')) return 'tw-bg-cyan-50 tw-text-cyan-700 tw-border-cyan-200';
        return 'tw-bg-gray-50 tw-text-gray-600 tw-border-gray-200';
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleClick = () => {
        dispatch({ type: tramiteTypes.CHANGE_TRACKING, payload: tracking });
        dispatch({ type: tramiteTypes.CHANGE_RENDER, payload: "SHOW" });
    };

    return (
        <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "tw-group tw-mx-3 tw-my-2 tw-rounded-xl tw-p-4 tw-cursor-pointer tw-transition-all tw-duration-300 tw-border",
                isUnread
                    ? "tw-bg-gradient-to-r tw-from-blue-50/80 tw-to-white tw-border-blue-200 tw-shadow-sm"
                    : "tw-bg-white tw-border-gray-100 hover:tw-border-gray-200",
                "hover:tw-shadow-lg hover:-tw-translate-y-0.5"
            )}
        >
            <div className="tw-flex tw-items-start tw-gap-4">
                {/* Avatar del remitente con indicador de semáforo */}
                <div className="tw-relative tw-flex-shrink-0">
                    <Avatar className={cn(
                        "tw-w-11 tw-h-11 tw-border-2 tw-transition-transform tw-duration-300",
                        isUnread ? "tw-border-blue-300" : "tw-border-gray-200",
                        isHovered && "tw-scale-110"
                    )}>
                        <AvatarImage
                            src={person?.image_images?.image_200x200 || person?.image || '/img/perfil.jpg'}
                            alt={person?.fullname || 'Usuario'}
                        />
                        <AvatarFallback className="tw-bg-primary-100 tw-text-primary-700 tw-text-sm tw-font-semibold">
                            {getInitials(person?.fullname)}
                        </AvatarFallback>
                    </Avatar>
                    {/* Indicador de semáforo */}
                    <span className={cn(
                        "tw-absolute -tw-bottom-0.5 -tw-right-0.5 tw-w-3.5 tw-h-3.5 tw-rounded-full tw-border-2 tw-border-white",
                        getSemaforoColor(tracking.semaforo)
                    )}></span>
                    {/* Indicador de no leído */}
                    {isUnread && (
                        <span className="tw-absolute -tw-top-1 -tw-left-1 tw-w-3 tw-h-3 tw-bg-blue-500 tw-rounded-full tw-border-2 tw-border-white tw-animate-pulse"></span>
                    )}
                </div>

                {/* Contenido principal */}
                <div className="tw-flex-1 tw-min-w-0">
                    {/* Header: remitente, código y fecha */}
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                        <div className="tw-flex tw-items-center tw-gap-2 tw-min-w-0">
                            <span className={cn(
                                "tw-text-sm tw-truncate",
                                isUnread ? "tw-font-bold tw-text-gray-900" : "tw-font-medium tw-text-gray-700"
                            )}>
                                {person?.fullname || 'Remitente desconocido'}
                            </span>
                            <span className={cn(
                                "tw-text-xs tw-font-mono tw-px-1.5 tw-py-0.5 tw-rounded tw-flex-shrink-0",
                                isUnread
                                    ? "tw-bg-primary-100 tw-text-primary-700"
                                    : "tw-bg-gray-100 tw-text-gray-500"
                            )}>
                                {tramite?.slug || '-'}
                            </span>
                            {tramite?.files?.length > 0 && (
                                <span className="tw-flex tw-items-center tw-gap-1 tw-text-xs tw-text-gray-400 tw-flex-shrink-0">
                                    <i className="fas fa-paperclip"></i>
                                    <span>{tramite.files.length}</span>
                                </span>
                            )}
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2 tw-flex-shrink-0">
                            <span className={cn(
                                "tw-text-xs tw-font-medium tw-px-2 tw-py-0.5 tw-rounded-full",
                                tracking.day > 5
                                    ? "tw-bg-red-100 tw-text-red-600"
                                    : tracking.day > 2
                                        ? "tw-bg-amber-100 tw-text-amber-600"
                                        : "tw-bg-gray-100 tw-text-gray-500"
                            )}>
                                {tracking.day}d
                            </span>
                            <span className={cn(
                                "tw-text-xs tw-tabular-nums",
                                isUnread ? "tw-font-semibold tw-text-gray-900" : "tw-text-gray-400"
                            )}>
                                {formatDate(tracking.created_at)}
                            </span>
                        </div>
                    </div>

                    {/* Asunto */}
                    <h4 className={cn(
                        "tw-text-sm tw-mb-1.5 tw-leading-snug tw-transition-colors",
                        isUnread
                            ? "tw-font-semibold tw-text-gray-900"
                            : "tw-text-gray-700 group-hover:tw-text-gray-900"
                    )}>
                        {tramite?.asunto || 'Sin asunto'}
                    </h4>

                    {/* Footer: dependencia, tipo y estado */}
                    <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
                        <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-gray-500 tw-min-w-0">
                            <span className="tw-flex tw-items-center tw-gap-1.5 tw-truncate">
                                <i className="fas fa-building tw-text-gray-400"></i>
                                {dependencia?.nombre || 'Exterior'}
                            </span>
                            {tramite?.tramite_type?.description && (
                                <>
                                    <span className="tw-text-gray-300">|</span>
                                    <span className="tw-flex tw-items-center tw-gap-1.5 tw-truncate">
                                        <i className="fas fa-file-alt tw-text-gray-400"></i>
                                        {tramite.tramite_type.description}
                                    </span>
                                </>
                            )}
                        </div>

                        <Badge
                            variant="outline"
                            className={cn(
                                "tw-text-[10px] tw-px-2.5 tw-py-1 tw-flex-shrink-0 tw-font-medium tw-border tw-transition-all tw-duration-200",
                                getStatusStyles(),
                                isHovered && "tw-shadow-sm"
                            )}
                        >
                            {current_status.title || tracking.status}
                        </Badge>
                    </div>
                </div>

                {/* Flecha indicadora */}
                <div className={cn(
                    "tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-transition-all tw-duration-300 tw-self-center",
                    isHovered
                        ? "tw-bg-primary-100 tw-text-primary-600 tw-translate-x-1"
                        : "tw-bg-transparent tw-text-gray-300"
                )}>
                    <i className="fas fa-chevron-right tw-text-sm"></i>
                </div>
            </div>
        </div>
    );
};

const InboxTab = () => {
    const tramite_context = useContext(TramiteContext);
    const { setTab, tab, isRole, role, dispatch, current_loading, trackings, socket, is_created, current_tracking, menu, page, last_page, setPage, total } = tramite_context;

    const handleTab = (value) => {
        if (current_loading) return;
        setPage(1);
        setTab(value);
    };

    const socketCreateTramite = async (tracking) => {
        if (!is_created) return dispatch({ type: tramiteTypes.IS_CREATED, payload: tracking });
        let query_string = { page: 1, status: [tracking.status], tracking_id: [tracking.id] };
        let options = { headers: { DependenciaId: tramite_context.dependencia_id } };
        await authTrackingProvider.index(tab, query_string, options)
            .then(res => {
                let { trackings } = res.data;
                dispatch({ type: tramiteTypes.ADD, payload: trackings.data });
                dispatch({ type: tramiteTypes.INCREMENT_FILTRO, payload: "SENT" });
            }).catch(() => {
                dispatch({ type: tramiteTypes.CHANGE_IS_CREATED, payload: false });
            });
    };

    useEffect(() => {
        if (is_created) socketCreateTramite(current_tracking);
    }, [is_created]);

    useEffect(() => {
        if (menu == 'SENT') socket?.on('Tramite/TramiteListener.store', (data) => socketCreateTramite(data.tracking));
    }, [socket, menu]);

    // Obtener nombre del menú actual (keys del reducer)
    const getMenuName = () => {
        const menuNames = {
            INBOX: 'Recibidos',
            SENT: 'Enviados',
            ANULADO: 'Anulados',
            FINALIZADOS: 'Finalizados',
            ARCHIVED: 'Archivados',
        };
        return menuNames[menu] || menu;
    };

    return (
        <div className="tw-h-full tw-flex tw-flex-col tw-bg-gray-50/50">
            {/* Toolbar mejorado */}
            <div className="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3 tw-bg-white tw-border-b tw-border-gray-200 tw-shadow-sm">
                {/* Info del menú actual y tabs */}
                <div className="tw-flex tw-items-center tw-gap-4">
                    {/* Indicador del menú actual */}
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <span className="tw-text-sm tw-font-semibold tw-text-gray-900">
                            {getMenuName()}
                        </span>
                        {total > 0 && (
                            <Badge variant="secondary" className="tw-text-xs tw-bg-gray-100">
                                {total}
                            </Badge>
                        )}
                    </div>

                    {/* Separador */}
                    <div className="tw-w-px tw-h-6 tw-bg-gray-200"></div>

                    {/* Tabs con diseño pill */}
                    <div className="tw-flex tw-items-center tw-gap-1 tw-p-1 tw-bg-gray-100 tw-rounded-lg">
                        <Show condicion={isRole && role.level == 'SECRETARY'}>
                            <button
                                onClick={() => handleTab('DEPENDENCIA')}
                                disabled={current_loading}
                                className={cn(
                                    "tw-px-3 tw-py-1.5 tw-rounded-md tw-text-xs tw-font-medium tw-border-0 tw-cursor-pointer tw-transition-all tw-duration-200",
                                    tab == 'DEPENDENCIA'
                                        ? "tw-bg-primary-500 tw-text-white tw-shadow-md"
                                        : "tw-bg-transparent tw-text-gray-600 hover:tw-bg-white/50 hover:tw-text-gray-900"
                                )}
                            >
                                <i className="fas fa-building tw-mr-1.5"></i>
                                Dependencia
                            </button>
                        </Show>
                        <button
                            onClick={() => handleTab('YO')}
                            disabled={current_loading}
                            className={cn(
                                "tw-px-3 tw-py-1.5 tw-rounded-md tw-text-xs tw-font-medium tw-border-0 tw-cursor-pointer tw-transition-all tw-duration-200",
                                tab == 'YO'
                                    ? "tw-bg-primary-500 tw-text-white tw-shadow-md"
                                    : "tw-bg-transparent tw-text-gray-600 hover:tw-bg-white/50 hover:tw-text-gray-900"
                            )}
                        >
                            <i className="fas fa-user tw-mr-1.5"></i>
                            Yo
                        </button>
                    </div>
                </div>

                {/* Paginación elegante */}
                <Show condicion={total > 0}>
                    <div className="tw-flex tw-items-center tw-gap-3">
                        <span className="tw-text-xs tw-text-gray-500 tw-font-medium">
                            <span className="tw-text-gray-900">{((page - 1) * 20) + 1}-{Math.min(page * 20, total)}</span>
                            {' '}de{' '}
                            <span className="tw-text-gray-900">{total}</span>
                        </span>
                        <div className="tw-flex tw-items-center tw-gap-1">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={current_loading || page <= 1}
                                className="tw-w-8 tw-h-8 tw-rounded-lg tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-flex tw-items-center tw-justify-center tw-transition-all hover:tw-bg-gray-50 hover:tw-border-gray-300 disabled:tw-opacity-40 disabled:tw-cursor-not-allowed"
                            >
                                <i className="fas fa-chevron-left tw-text-xs"></i>
                            </button>
                            <button
                                onClick={() => setPage(Math.min(last_page, page + 1))}
                                disabled={current_loading || page >= last_page}
                                className="tw-w-8 tw-h-8 tw-rounded-lg tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-flex tw-items-center tw-justify-center tw-transition-all hover:tw-bg-gray-50 hover:tw-border-gray-300 disabled:tw-opacity-40 disabled:tw-cursor-not-allowed"
                            >
                                <i className="fas fa-chevron-right tw-text-xs"></i>
                            </button>
                        </div>
                    </div>
                </Show>
            </div>

            {/* Lista de items con fondo sutil */}
            <div className="tw-flex-1 tw-overflow-y-auto tw-py-2">
                {/* Loading con animación */}
                <Show condicion={current_loading}>
                    {[1, 2, 3, 4, 5].map(i => <PlaceholderItem key={`placeholder-${i}`} index={i} />)}
                </Show>

                {/* Items */}
                <Show condicion={!current_loading}>
                    {trackings.map((tracking, index) => (
                        <ItemTracking
                            key={`tracking-item-${index}-${tracking.id}`}
                            tracking={tracking}
                            index={index}
                        />
                    ))}

                    {/* Empty state mejorado */}
                    <Show condicion={!trackings.length}>
                        <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-20">
                            <div className="tw-w-24 tw-h-24 tw-bg-gradient-to-br tw-from-gray-100 tw-to-gray-200 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mb-6 tw-shadow-inner">
                                <i className="fas fa-inbox tw-text-4xl tw-text-gray-400"></i>
                            </div>
                            <h3 className="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-2">
                                Bandeja vacía
                            </h3>
                            <p className="tw-text-sm tw-text-gray-500 tw-text-center tw-max-w-xs">
                                No hay trámites en esta bandeja. Los nuevos trámites aparecerán aquí.
                            </p>
                        </div>
                    </Show>
                </Show>
            </div>
        </div>
    );
};

export default InboxTab;
