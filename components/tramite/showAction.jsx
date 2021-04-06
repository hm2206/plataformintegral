import React, { useContext } from 'react';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import Show from '../show';
import { Button } from 'semantic-ui-react';
import { AuthContext } from '../../contexts/AuthContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';

const ShowAction = ({ onAction = null }) => {

    // auth
    const { auth } = useContext(AuthContext);

    // tramite
    const { current_tracking, setOption, setNext, dispatch } = useContext(TramiteContext);
    const current_tramite = current_tracking.tramite || {};
    const isTramite = Object.keys(current_tramite).length;

    // next action
    const handleNext = (act) => {
        setOption(["NEXT"]);
        if (typeof onAction == 'function') onAction(act);
    }
    
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
                        <Show condicion={!current_tracking.alert && current_tracking.status == 'PENDIENTE'}>
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

                        <Show condicion={current_tracking.status == 'REGISTRADO'}>
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

                        <Show condicion={current_tracking.status == 'RECIBIDO' || current_tracking.status == 'COPIA'}>
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
        </div>
    )
}

export default ShowAction;