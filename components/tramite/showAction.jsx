import React, { useContext, useMemo } from 'react';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import Show from '../show';
import { Button } from 'semantic-ui-react';
import { AuthContext } from '../../contexts/AuthContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';
import { Confirm } from '../../services/utils';
import { tramite } from '../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../contexts';

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
    }

    // next action
    const handleNext = (act) => {
        setOption(["NEXT"]);
        if (typeof onAction == 'function') onAction(act);
    }
    
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
    }

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
    }

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
        <div className="col-md-12">
            {/* configuración de los archivos del tracking */}
            <Show condicion={current_tracking.current}>
                <div className="col-md-12 mt-4">
                    <Show condicion={
                        !current_tracking.revisado && 
                        auth.id == current_tracking.user_verify_id && 
                        current_tracking.status == 'REGISTRADO'
                    }>
                        <Button color="red" 
                            basic
                            size="mini"
                            onClick={() => handleNext('ANULADO')}
                        >
                            Anular <i className="fas fa-times"></i>
                        </Button>
                    </Show>
                                                    
                    <Show condicion={!current_tracking.next}
                        predeterminado={
                            <Button color="teal" 
                                basic 
                                size="mini"
                                disabled={!current_tracking.revisado}
                                onClick={() => handleNext(current_tracking.next)}
                            >
                                Continuar trámite <i className="fas fa-paper-plane"></i>
                            </Button>
                        }
                    >
                        <Show condicion={!current_tracking.alert 
                            && current_tracking.status == 'PENDIENTE' 
                            && isDependenciaResponse
                        }>
                            <Button color="orange" 
                                basic 
                                size="mini"
                                disabled={!current_tracking.revisado}
                                onClick={() => {
                                    setNext("RESPONDIDO");
                                    dispatch({ type: tramiteTypes.CHANGE_TRAMITE, payload: current_tramite });
                                    setOption(['CREATE']);
                                }}
                            >
                                Responder <i className="fas fa-reply"></i>
                            </Button>
                        </Show>

                        <Show condicion={current_tracking.status == 'REGISTRADO' || current_tracking.status == 'SUBTRAMITE'}>
                            <Button color="teal" 
                                basic 
                                size="mini"
                                disabled={!current_tracking.revisado}
                                onClick={() => handleNext('ENVIADO')}
                            >
                                Enviar <i className="fas fa-paper-plane"></i>
                            </Button>
                        </Show>

                        <Show condicion={current_tracking.status == 'PENDIENTE' && current_tracking.is_action}>
                            <Button color="purple" 
                                basic 
                                size="mini"
                                disabled={!current_tracking.revisado}
                                onClick={() => handleNext('DERIVADO')}
                            >
                                Derivar <i className="fas fa-paper-plane"></i>
                            </Button>
                        </Show>

                        <Show condicion={current_tracking.status == 'RECIBIDO'}>
                            <Button color="red" 
                                basic 
                                size="mini"
                                disabled={!current_tracking.revisado}
                                onClick={() => handleNext('RECHAZADO')}
                            >
                                Rechazar <i className="fas fa-times"></i>
                            </Button>
                        </Show>

                        <Show condicion={current_tracking.status == 'RECIBIDO'}>
                            <Button color="green" 
                                basic 
                                size="mini"
                                disabled={!current_tracking.revisado}
                                onClick={() => handleNext('ACEPTADO')}
                            >
                                Aceptar <i className="fas fa-check"></i>
                            </Button>
                        </Show>

                        <Show condicion={!current_tracking.alert && current_tracking.status == 'PENDIENTE'}>
                            <Button color="teal" 
                                size="mini"
                                disabled={!current_tracking.revisado}
                                onClick={() => handleNext('FINALIZADO')}
                            >
                                Finalizar <i className="fas fa-check"></i>
                            </Button>
                        </Show>
                    </Show>
                </div>
            </Show>
            {/* editar  tramite*/}
            <div className="col-md-12 text-right">
                <Show condicion={canEdit}>
                    <span className="close cursor-pointer" 
                        title="Editar Trámite"
                        onClick={() => typeof onEdit == 'function' ? onEdit() : null}>
                        <i className="fas fa-pencil-alt text-dark"></i>
                    </span>
                </Show>
                
                <Show condicion={canBackRecibido}>
                    <span className="close cursor-pointer mr-4" 
                        title="Regresar a recibido"
                        onClick={handleBackRecibido}>
                        <i className="fas fa-history text-danger"></i>
                    </span>
                </Show>
            </div>
        </div>
    )
}

export default ShowAction;