import React, { useContext, useMemo } from 'react';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import Show from '../show';
import { AuthContext } from '../../contexts/AuthContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';
import { Confirm } from '../../services/utils';
import { tramite } from '../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../contexts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ShowAction = ({ onAction = null, onAnularProcess = null, onEdit = null, onBackRecibido = null }) => {

    // auth
    const { auth } = useContext(AuthContext);

    // app
    const app_context = useContext(AppContext);

    // tramite
    const { current_tracking, setOption, setNext, dispatch } = useContext(TramiteContext);
    const current_tramite = current_tracking.tramite || {};
    const isDependenciaResponse = current_tracking?.tracking?.dependencia_id ? true : false;
    const isTramite = Object.keys(current_tramite).length;

    const options = {
        headers: {
            DependenciaId: current_tracking.dependencia_id
        }
    };

    // next action
    const handleNext = (act) => {
        setOption(["NEXT"]);
        if (typeof onAction == 'function') onAction(act);
    };

    const handleAnularProcess = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en anular el proceso del trámite?', 'Anular Proceso');
        if (!answer) return;
        app_context.setCurrentLoading(true);
        await tramite.post(`tramite/${current_tramite.id}/anular_process`)
        .then(async res => {
            let { tracking } = res.data;
            app_context.setCurrentLoading(false);
            await Swal.fire({ icon: 'success', text: 'El proceso del trámite se anulo correctamente!' });
            if (typeof onAnularProcess == 'function') onAnularProcess(tracking);
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: 'No se pudó anular el proceso del trámite' });
        });
    };

    const handleBackRecibido = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en regresar el trámite a recibido?', 'Regresar');
        if (!answer) return;
        app_context.setCurrentLoading(true);
        await tramite.post(`tracking/${current_tracking.id}/back_recibido?_method=DELETE`, {}, options)
        .then(async res => {
            let { tracking } = res.data;
            app_context.setCurrentLoading(false);
            await Swal.fire({ icon: 'success', text: 'El trámite regresó a recibido correctamente!' });
            if (typeof onBackRecibido == 'function') onBackRecibido(tracking);
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: 'No se pudó regresar el trámite' });
        });
    };

    const canEdit = useMemo(() => {
        let allower = current_tracking.current
            && !current_tracking.revisado
            && current_tracking.dependencia_id == current_tramite.dependencia_origen_id;
        if (current_tracking.modo == 'YO' && allower) return current_tramite.person_id == current_tracking.person_id;
        return allower;
    }, [current_tracking]);

    const canBackRecibido = useMemo(() => {
        if (!current_tracking.current || current_tracking.revisado) return false;
        return current_tracking?.tracking?.status == 'ACEPTADO' ? true : false;
    }, [current_tracking]);

    // render
    return (
        <div className="tw-space-y-4">
            {/* Acciones principales */}
            <Show condicion={current_tracking.current}>
                <div className="tw-flex tw-flex-wrap tw-gap-3">
                    {/* Anular */}
                    <Show condicion={
                        !current_tracking.revisado &&
                        auth.id == current_tracking.user_verify_id &&
                        current_tracking.status == 'REGISTRADO'
                    }>
                        <Button
                            variant="outline"
                            onClick={() => handleNext('ANULADO')}
                            className="tw-border-red-300 tw-text-red-600 hover:tw-bg-red-50 tw-gap-2"
                        >
                            <i className="fas fa-times"></i>
                            Anular
                        </Button>
                    </Show>

                    {/* Continuar trámite */}
                    <Show condicion={current_tracking.next}>
                        <Button
                            onClick={() => handleNext(current_tracking.next)}
                            disabled={!current_tracking.revisado}
                            className="tw-bg-teal-500 hover:tw-bg-teal-600 tw-gap-2"
                        >
                            <i className="fas fa-paper-plane"></i>
                            Continuar trámite
                        </Button>
                    </Show>

                    <Show condicion={!current_tracking.next}>
                        {/* Responder */}
                        <Show condicion={!current_tracking.alert
                            && current_tracking.status == 'PENDIENTE'
                            && isDependenciaResponse
                        }>
                            <Button
                                onClick={() => {
                                    setNext("RESPONDIDO");
                                    dispatch({ type: tramiteTypes.CHANGE_TRAMITE, payload: current_tramite });
                                    setOption(['CREATE']);
                                }}
                                disabled={!current_tracking.revisado}
                                className="tw-bg-amber-500 hover:tw-bg-amber-600 tw-gap-2"
                            >
                                <i className="fas fa-reply"></i>
                                Responder
                            </Button>
                        </Show>

                        {/* Enviar */}
                        <Show condicion={current_tracking.status == 'REGISTRADO' || current_tracking.status == 'SUBTRAMITE'}>
                            <Button
                                onClick={() => handleNext('ENVIADO')}
                                disabled={!current_tracking.revisado}
                                className="tw-bg-teal-500 hover:tw-bg-teal-600 tw-gap-2"
                            >
                                <i className="fas fa-paper-plane"></i>
                                Enviar
                            </Button>
                        </Show>

                        {/* Derivar */}
                        <Show condicion={current_tracking.status == 'PENDIENTE' && current_tracking.is_action}>
                            <Button
                                onClick={() => handleNext('DERIVADO')}
                                disabled={!current_tracking.revisado}
                                className="tw-bg-purple-500 hover:tw-bg-purple-600 tw-gap-2"
                            >
                                <i className="fas fa-share"></i>
                                Derivar
                            </Button>
                        </Show>

                        {/* Rechazar */}
                        <Show condicion={current_tracking.status == 'RECIBIDO'}>
                            <Button
                                variant="outline"
                                onClick={() => handleNext('RECHAZADO')}
                                disabled={!current_tracking.revisado}
                                className="tw-border-red-300 tw-text-red-600 hover:tw-bg-red-50 tw-gap-2"
                            >
                                <i className="fas fa-times"></i>
                                Rechazar
                            </Button>
                        </Show>

                        {/* Aceptar */}
                        <Show condicion={current_tracking.status == 'RECIBIDO'}>
                            <Button
                                onClick={() => handleNext('ACEPTADO')}
                                disabled={!current_tracking.revisado}
                                className="tw-bg-emerald-500 hover:tw-bg-emerald-600 tw-gap-2"
                            >
                                <i className="fas fa-check"></i>
                                Aceptar
                            </Button>
                        </Show>

                        {/* Finalizar */}
                        <Show condicion={!current_tracking.alert && current_tracking.status == 'PENDIENTE'}>
                            <Button
                                onClick={() => handleNext('FINALIZADO')}
                                disabled={!current_tracking.revisado}
                                className="tw-bg-teal-600 hover:tw-bg-teal-700 tw-gap-2"
                            >
                                <i className="fas fa-flag-checkered"></i>
                                Finalizar
                            </Button>
                        </Show>
                    </Show>
                </div>
            </Show>

            {/* Acciones secundarias */}
            <Show condicion={canEdit || canBackRecibido}>
                <div className="tw-flex tw-items-center tw-justify-end tw-gap-3 tw-pt-4 tw-border-t tw-border-gray-100">
                    <Show condicion={canBackRecibido}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBackRecibido}
                            className="tw-text-amber-600 hover:tw-bg-amber-50 tw-gap-2"
                            title="Regresar a recibido"
                        >
                            <i className="fas fa-history"></i>
                            Regresar
                        </Button>
                    </Show>

                    <Show condicion={canEdit}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => typeof onEdit == 'function' ? onEdit() : null}
                            className="tw-text-gray-600 hover:tw-bg-gray-100 tw-gap-2"
                            title="Editar Trámite"
                        >
                            <i className="fas fa-pencil-alt"></i>
                            Editar
                        </Button>
                    </Show>
                </div>
            </Show>
        </div>
    );
};

export default ShowAction;
