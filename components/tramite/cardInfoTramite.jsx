import React from 'react';
import Show from '../show';
import datos from './datos.json';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const current_status = datos.status;

const CardInfoTramite = ({ remitente, email, dependencia, status, image, revisado = 0, onArchived = null, archived }) => {

    // obtener status
    const getStatus = () => current_status[status] || {};

    const getStatusStyles = () => {
        const s = getStatus();
        if (s.className?.includes('success')) return 'tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200';
        if (s.className?.includes('warning')) return 'tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200';
        if (s.className?.includes('danger')) return 'tw-bg-red-50 tw-text-red-700 tw-border-red-200';
        if (s.className?.includes('primary')) return 'tw-bg-blue-50 tw-text-blue-700 tw-border-blue-200';
        if (s.className?.includes('info')) return 'tw-bg-cyan-50 tw-text-cyan-700 tw-border-cyan-200';
        return 'tw-bg-gray-50 tw-text-gray-600 tw-border-gray-200';
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // render
    return (
        <div className="tw-flex tw-items-start tw-gap-4">
            {/* Avatar */}
            <div className="tw-relative tw-flex-shrink-0">
                <Avatar className="tw-w-16 tw-h-20 tw-rounded-xl tw-border-2 tw-border-gray-100 tw-shadow-sm">
                    <AvatarImage
                        src={image || "/img/perfil.jpg"}
                        alt={remitente}
                        className="tw-object-cover"
                    />
                    <AvatarFallback className="tw-bg-primary-100 tw-text-primary-700 tw-text-lg tw-font-semibold tw-rounded-xl">
                        {getInitials(remitente)}
                    </AvatarFallback>
                </Avatar>
                {/* Indicador de verificación */}
                <Show condicion={status}>
                    <span className={cn(
                        "tw-absolute -tw-bottom-1 -tw-right-1 tw-w-5 tw-h-5 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-border-2 tw-border-white tw-shadow-sm",
                        revisado ? "tw-bg-emerald-500" : "tw-bg-amber-500"
                    )}>
                        <i className={cn(
                            "fas tw-text-white tw-text-[8px]",
                            revisado ? "fa-check" : "fa-clock"
                        )}></i>
                    </span>
                </Show>
            </div>

            {/* Info */}
            <div className="tw-flex-1 tw-min-w-0">
                <h3 className="tw-text-base tw-font-semibold tw-text-gray-900 tw-m-0 tw-mb-1 tw-capitalize">
                    {remitente?.toLowerCase() || "Sin nombre"}
                </h3>

                <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-primary-600 tw-mb-1">
                    <i className="fas fa-building tw-text-xs tw-text-gray-400"></i>
                    <span className="tw-capitalize">{dependencia?.toLowerCase() || "Exterior"}</span>
                </div>

                <Show condicion={email}>
                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-500 tw-mb-3">
                        <i className="fas fa-envelope tw-text-xs tw-text-gray-400"></i>
                        <span>{email}</span>
                    </div>
                </Show>

                {/* Estado y acciones */}
                <div className="tw-flex tw-items-center tw-gap-3 tw-flex-wrap">
                    <Show condicion={status}>
                        <Badge
                            variant="outline"
                            className={cn(
                                "tw-text-xs tw-px-2.5 tw-py-1 tw-font-medium tw-border",
                                getStatusStyles()
                            )}
                        >
                            {getStatus().text || status}
                        </Badge>

                        <div className="tw-flex tw-items-center tw-gap-1.5">
                            <span className={cn(
                                "tw-w-2 tw-h-2 tw-rounded-full",
                                revisado ? "tw-bg-emerald-500" : "tw-bg-amber-500"
                            )}></span>
                            <span className={cn(
                                "tw-text-xs tw-font-medium",
                                revisado ? "tw-text-emerald-600" : "tw-text-amber-600"
                            )}>
                                {revisado ? "Autorizado" : "Pendiente"}
                            </span>
                        </div>
                    </Show>

                    {/* Botón archivar */}
                    <Show condicion={onArchived && !archived}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onArchived}
                            className="tw-h-7 tw-px-2.5 tw-text-xs tw-text-gray-500 hover:tw-text-primary-600 hover:tw-bg-primary-50"
                        >
                            <i className="fas fa-archive tw-mr-1.5"></i>
                            Archivar
                        </Button>
                    </Show>

                    {/* Badge archivado */}
                    <Show condicion={archived}>
                        <Badge variant="secondary" className="tw-text-xs tw-bg-gray-100 tw-text-gray-600">
                            <i className="fas fa-archive tw-mr-1.5"></i>
                            Archivado
                        </Badge>
                    </Show>
                </div>
            </div>
        </div>
    );
};

export default CardInfoTramite;
