import React, { useState, useContext, useEffect, Fragment } from 'react';
import Router from 'next/router';
import { Body } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { tramite } from '../../../services/apis';
import atob from 'atob';
import btoa from 'btoa';
import { BtnBack } from '../../../components/Utils';
import { Button } from 'semantic-ui-react';
import Show from '../../../components/show';
import { status } from '../../../components/tramite/env.json';
import { AppContext } from '../../../contexts/AppContext';
import ModalNextTracking from '../../../components/tramite/modalNextTracking';
import { Confirm, backUrl } from '../../../services/utils';
import Swal from 'sweetalert2';

const InboxIndex = ({ pathname, query, success, tracking }) => {

    // app 
    const app_context = useContext(AppContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [option, setOption] = useState("");
    const [action, setAction] = useState("");
    const [role, setRole] = useState({});
    const [boss, setBoss] = useState({});

    // obtener role
    const getRole = async () => {
        setCurrentLoading(true)
        await tramite.get(`auth/role`, { headers: { DependenciaId: tracking.dependencia_id } })
            .then(res => {
                let { success, message, role, boss } = res.data;
                if (!success) throw new Error(message);
                setRole(role);
                setBoss(boss);
            })
            .catch(err => {
                setRole({})
                setBoss({})
            });
        setCurrentLoading(false)
    }

    // atras
    const handleBack = () => {
        let { push } = Router;
        push(backUrl(pathname));
    }

    // manejador de siguiente acción
    const handleNext = (act) => {
        setOption("NEXT");
        setAction(act);
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
                    let { push } = Router;
                    await push(Router.asPath);
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

    // status
    const getStatus = () => status[tracking.status] || {};

    // manejador de guardado
    const handleOnSave = async (t) => {
        let { push } = Router;
        setOption("");
        setAction("");
        push(Router.asPath);
    }

    // extruir objecto
    let current_tramite = tracking.tramite;

    // motar componente
    useEffect(() => {
        if (success) getRole();
    }, []);

    // render
    return (
        <div className="col-md-12">
            <Body>
                <div className="card-header">
                    <BtnBack onClick={handleBack}/>
                    <span className="ml-2">Información detallada del trámite</span>
                </div>

                <div className="card-body">
                    <div className="row">
                        <div className="col-md-8">
                            <div className="row">
                                <div className="col-xs mb-2">
                                    <img 
                                        style={{ 
                                            width: "80px", height: "100px", 
                                            objectFit: 'cover', 
                                            border: "5px solid #fff", 
                                            boxShadow: "0px 0px 1px 1px rgba(0,0,0,0.2) inset, 0px 0px 1px 1px rgba(0,0,0,0.1)",
                                            borderRadius: '0.5em'
                                        }}
                                        src={current_tramite.person && current_tramite.person.image_images && current_tramite.person.image_images.image_200x200} 
                                        alt="persona"
                                    />
                                </div>
                                        
                                <div className="col-xs mb-2">
                                    <div className="ml-2">
                                        <div className="font-13">
                                            <b className="badge badge-dark">{current_tramite.slug || ""}</b>
                                        </div>
                                        <b className="font-15 lowercase">
                                            <span className="capitalize">{current_tramite.person && current_tramite.person.fullname || ""}</span>
                                        </b>
                                        <div className="text-primary font-12 lowercase">
                                            <u className="capitalize">{current_tramite.dependencia_origen && current_tramite.dependencia_origen.nombre || ""}</u>
                                        </div>
                                        <div className="text-muted font-12">{current_tramite.person && current_tramite.person.email_contact || ""}</div>
                                        <div>
                                            <b title={getStatus().title} className={`badge ${getStatus().className}`}>
                                                {getStatus().text}
                                            </b>
                                            <span className={`text-${tracking.revisado ? 'success' : 'danger'} ml-2`}>
                                                <i className={`fas fa-${tracking.revisado ? 'check' : 'times'}`}></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 text-center">
                            <img alt="code_qr"
                                width="130px"
                                height="130px"
                                src={current_tramite.code_qr || ""}
                            />
                        </div>
                        
                        <div className="col-md-12 mb-4 mt-3">
                            <b className="font-17">{current_tramite.asunto || ""}</b>
                            <hr/>
                        </div>

                        <div className="col-md-12">
                            <div className="row">
                                {/* información del trámite */}
                                <div className="col-md-8 mb-2">
                                    <div className="font-14 mb-1">
                                        <b>Tipo Trámite: </b> 
                                        <span className="ml-2 lowercase">
                                            <span className="uppercase">{current_tramite.tramite_type && current_tramite.tramite_type.description || ""}</span>
                                        </span>
                                    </div>

                                    <div className="font-14 mb-1">
                                        <b>N° Trámite: </b> 
                                        <span className="ml-2 lowercase">
                                            <span className="uppercase">{current_tramite.document_number || ""}</span>
                                        </span>
                                    </div>

                                    <div className="font-14 mb-1">
                                        <b>N° Folio: </b> 
                                        <span className="ml-2 lowercase">
                                            <span className="uppercase">{current_tramite.folio_count || ""}</span>
                                        </span>
                                    </div>

                                    <div className="font-14 mb-1">
                                        <b>Recorrido del trámite: </b> 
                                        <a href="#" className="font-15 ml-1">
                                            <i className="fas fa-search"></i>
                                        </a>
                                    </div>

                                    <Show condicion={!tracking.revisado && tracking.user_verify_id == app_context.auth.id}>
                                        <div className="font-14 mb-1">
                                            <button className="btn btn-outline-info"
                                                onClick={verifyTracking}
                                            >
                                                Revisar trámite
                                            </button>
                                        </div>
                                    </Show>
                                </div>
                                
                                {/* archivos de tracking */}
                                <div className="col-md-4 font-14 mb-2">
                                    <b className="font-14">Archivos del Trámite: </b>
                                    <div className="mt-1">
                                        {current_tramite.files.map((f, indexF) => 
                                            <a href={f.url || ""} 
                                                target="_blank" 
                                                className="item-attach font-12"
                                                title={f.name || ""}
                                                key={`list-file-tramite-${indexF}`}
                                            >
                                                <i className={`fas fa-file-${f.extname}`}></i> {f.name || ""} 
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <Show condicion={tracking.description}>
                                    <div className="col-md-12">
                                        <hr/>
                                    </div>
                                </Show>
                            </div>

                            <Show condicion={!tracking.first}>
                                <div className="font-13 mt-4">
                                    <span className="font-14">{tracking.description || ""}</span>
                                    <Show condicion={tracking.files && tracking.files.length}>
                                        <hr/>
                                        <b className="font-13"><i className="fas fa-paperclip"></i> Archivos del Seguimiento</b>
                                        {/* archivos de tracking */}
                                        <div className="mt-1">
                                            {tracking.files.map((f, indexF) => 
                                                <a href={f.url || ""} 
                                                    target="_blank" 
                                                    className="item-attach font-12"
                                                    title={f.name || ""}
                                                    key={`list-file-tracking-${indexF}`}
                                                >
                                                    <i className={`fas fa-file-${f.extname}`}></i> {f.name || ""} 
                                                </a>
                                            )}
                                        </div>
                                    </Show>
                                </div>
                            </Show>
                        </div>

                        <Show condicion={!current_loading}
                            predeterminado={
                                <Fragment>
                                    Obteniendo datos...
                                </Fragment>
                            }
                        >
                            <Show condicion={tracking.current}>
                                <div className="col-md-12 mt-4">
                                    <Show condicion={tracking.status == 'REGISTRADO'}>
                                        <Button color="red" 
                                            basic
                                            size="mini"
                                            disabled={!tracking.revisado}
                                            onClick={() => handleNext('ANULADO')}
                                        >
                                            Anular <i class="fas fa-times"></i>
                                        </Button>
                                    </Show>
                                        
                                    <Show condicion={tracking.status == 'PENDIENTE'}>
                                        <Button color="orange" 
                                            basic 
                                            size="mini"
                                            disabled={!tracking.revisado}
                                            onClick={() => handleNext('RESPONDIDO')}
                                        >
                                            Responder <i class="fas fa-reply"></i>
                                        </Button>
                                    </Show>

                                    <Show condicion={tracking.status == 'REGISTRADO' || tracking.status == 'PENDIENTE'}>
                                        <Button color="purple" 
                                            basic 
                                            size="mini"
                                            disabled={!tracking.revisado}
                                            onClick={() => handleNext('DERIVADO')}
                                        >
                                            Derivar <i class="fas fa-paper-plane"></i>
                                        </Button>
                                    </Show>

                                    <Show condicion={tracking.status == 'ENVIADO'}>
                                        <Button color="red" 
                                            basic 
                                            size="mini"
                                            disabled={!tracking.revisado}
                                            onClick={() => handleNext('RECHAZADO')}
                                        >
                                            Rechazar <i class="fas fa-times"></i>
                                        </Button>
                                    </Show>

                                    <Show condicion={tracking.status == 'ENVIADO'}>
                                        <Button color="green" 
                                            basic 
                                            size="mini"
                                            disabled={!tracking.revisado}
                                            onClick={() => handleNext('ACEPTADO')}
                                        >
                                            Aceptar <i class="fas fa-check"></i>
                                        </Button>
                                    </Show>
                                    <hr/>
                                </div>
                            </Show>
                        </Show>
                    </div>
                </div>
            </Body>
            {/* modales */}
            <Show condicion={tracking.current && option == 'NEXT'}>
                <ModalNextTracking
                    tracking={tracking}
                    role={role}
                    boss={boss}
                    isClose={(e) => setOption("")}
                    action={action}
                    onSave={handleOnSave}
                />
            </Show>
        </div>
    )
}

// server
InboxIndex.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    query.dependencia_id = typeof query.dependencia_id != 'undefined' ? query.dependencia_id : "";
    let { success, tracking } = await tramite.get(`auth/tramite/${query.slug}`, { headers: { DependenciaId: query.dependencia_id } }, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, tracking: {} })); 
    // response
    return { pathname, query, success, tracking };
}

// exportar
export default InboxIndex;