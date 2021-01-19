import React, { useState, useContext, useEffect, Fragment } from 'react';
import Router from 'next/router';
import { Body, BtnBack, DropZone } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { tramite } from '../../../services/apis';
import { Button } from 'semantic-ui-react';
import Show from '../../../components/show';
import { status } from '../../../components/tramite/datos.json';
import { AppContext } from '../../../contexts/AppContext';
import ModalNextTracking from '../../../components/tramite/modalNextTracking';
import { Confirm, backUrl } from '../../../services/utils';
import Swal from 'sweetalert2';
import ModalTracking from '../../../components/tramite/modalTracking';
import ItemFileCircle from '../../../components/itemFileCircle';
import Visualizador from '../../../components/visualizador';

const InboxIndex = ({ pathname, query, success, tracking }) => {

    // app 
    const app_context = useContext(AppContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [option, setOption] = useState("");
    const [action, setAction] = useState("");
    const [role, setRole] = useState({});
    const [boss, setBoss] = useState({});
    const [current_file, setCurrentFile] = useState({});

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

    // agregar archivo
    const addFile = async ({ name, file }, object_type = 'App/Models/Tramite') => {
        let datos = new FormData;
        app_context.fireLoading(true);
        datos.append('files', file);
        datos.append('object_id', tracking.first ? current_tramite.id : tracking.id);
        datos.append('object_type', object_type);
        await tramite.post(`file`, datos)
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message, files } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                let { push } = Router;
                await push(location.href);
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

    // extruir objecto
    let current_tramite = tracking.tramite || {};

    // motar componente
    useEffect(() => {
        if (success) getRole();
    }, []);

    if (!success) return (
        <div className="col-md-12">
            <Body>
                <div className="card-header">
                    <BtnBack onClick={handleBack}/>
                    <span className="ml-2">Información detallada del trámite</span>
                </div>

                <div className="card-body">
                    <div className="text-center mt-5">
                        <h5>No se encontró el regístro</h5>
                    </div>
                </div>
            </Body>
        </div>
    )
    // render
    return (
        <div className="col-md-12">
            <Body>
                <div className="card-header">
                    <BtnBack onClick={handleBack}/>
                    <span className="ml-2">Información detallada del trámite</span>
                </div>
                {/* mostrar datos */}
                <Show condicion={success}>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card card-body">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="row">
                                                <div className="ml-4 col-xs mb-2">
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
                                                        <Show condicion={tracking.first}>
                                                            <div>
                                                                <b title={getStatus().title} className={`badge ${getStatus().className}`}>
                                                                    {getStatus().text}
                                                                </b>
                                                                <span className={`text-${tracking.revisado ? 'success' : 'danger'} ml-2`}>
                                                                    <i className={`fas fa-${tracking.revisado ? 'check' : 'times'}`}></i>
                                                                </span>
                                                            </div>
                                                        </Show>
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
                                            <b className="font-17">Asunto: {current_tramite.asunto || ""}</b>
                                            <hr/>
                                            {current_tramite.observation || ""}
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
                                                        <a href="#" className="font-12 ml-1" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setOption('TIMELINE');
                                                            }}
                                                        >
                                                            <i className="fas fa-search font-17"></i> Seguímiento
                                                        </a>
                                                    </div>

                                                    <Show condicion={tracking.first}>
                                                        <div className="row mb-4 mt-3">
                                                            <div className="col-md-10">
                                                                <label htmlFor="">Observación</label>
                                                                <textarea name="" rows="3" className="form-control"/>
                                                            </div>
                                                        </div>
                                                    </Show>

                                                    <Show condicion={!tracking.revisado && tracking.user_verify_id == app_context.auth.id}>
                                                        <div className="font-14 mb-1">
                                                            <button className="btn btn-outline-info"
                                                                onClick={verifyTracking}
                                                            >
                                                                Autorizar
                                                            </button>
                                                        </div>
                                                    </Show>
                                                </div>

                                                {/* archivos de tramite */}
                                                <div className="col-md-4 font-14 mt-5">
                                                    <b className="font-14">Archivos del Trámite: </b>
                                                    <div className="mt-1 ml-2">
                                                        {current_tramite.files.map((f, indexF) => 
                                                            <ItemFileCircle
                                                                id={f.id}
                                                                className="mb-3"
                                                                key={`item-file-tramite-${indexF}`}
                                                                url={f.url}
                                                                name={f.name}
                                                                extname={f.extname}
                                                                edit={!tracking.revisado && tracking.first &&
                                                                    (tracking.user_verify_id == app_context.auth.id || 
                                                                    tracking.user_id == app_context.auth.id)
                                                                }
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setCurrentFile(f);
                                                                    setOption("VISUALIZADOR");
                                                                }}
                                                                onAction={(e) => {
                                                                    let { push } = Router;
                                                                    push(location.href);
                                                                }}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* agregar archivos */}
                                                    <Show condicion={tracking.user_verify_id == app_context.auth.id && tracking.first && !tracking.revisado}>
                                                        <div className="text-right">
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
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div className="card card-body">
                                    <div className="row">
                                        {/* datos del tracking */}
                                        <Show condicion={!tracking.first}>
                                            {/* <div className="col-md-12"><hr/></div> */}
                                                    
                                            <div className="col-md-8">
                                                <div className="row">
                                                    <div className="col-xs mb-2 ml-4">
                                                        <img 
                                                            style={{ 
                                                                width: "80px", height: "100px", 
                                                                objectFit: 'cover', 
                                                                border: "5px solid #fff", 
                                                                boxShadow: "0px 0px 1px 1px rgba(0,0,0,0.2) inset, 0px 0px 1px 1px rgba(0,0,0,0.1)",
                                                                borderRadius: '0.5em'
                                                            }}
                                                            src={tracking.person && tracking.person.image_images && tracking.person.image_images.image_200x200} 
                                                            alt="persona"
                                                        />
                                                    </div>
                                                                    
                                                    <div className="col-xs mb-2">
                                                        <div className="ml-2">
                                                            <b className="font-15 lowercase">
                                                                <span className="capitalize">{tracking.person && tracking.person.fullname || ""}</span>
                                                            </b>
                                                            
                                                            <div className="text-primary font-12 lowercase">
                                                                <u className="capitalize">{tracking.dependencia_destino && tracking.dependencia_destino.nombre || ""}</u>
                                                            </div>

                                                            <div className="text-muted font-12">{tracking.person && tracking.person.email_contact || ""}</div>
                                                                    
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

                                            {/* archivos de tracking */}
                                            <div className="col-md-4 font-14 mt-5">
                                                <b className="font-14">Archivos del Seguímiento: </b>
                                                <div className="mt-1">
                                                    {tracking.files.map((f, indexF) => 
                                                        <ItemFileCircle
                                                            id={f.id}
                                                            className="mb-3"
                                                            key={`item-file-tracking-${indexF}`}
                                                            url={f.url}
                                                            name={f.name}
                                                            extname={f.extname}
                                                            edit={tracking.user_verify_id == app_context.auth.id && !tracking.revisado}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setCurrentFile(f);
                                                                setOption("VISUALIZADOR");
                                                            }}
                                                            onAction={(e) => {
                                                                let { push } = Router;
                                                                push(location.href);
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </Show>

                                        {/* configuración de los archivos del tracking */}
                                        <Show condicion={!current_loading}
                                            predeterminado={
                                                <Fragment>
                                                    Obteniendo datos...
                                                </Fragment>
                                            }
                                        >
                                                <Show condicion={tracking.current}>
                                                    <div className="col-md-12 mt-4">
                                                        <Show condicion={!tracking.revisado && 
                                                            app_context.auth.id == tracking.user_verify_id && 
                                                            tracking.status == 'REGISTRADO'
                                                        }>
                                                            <Button color="red" 
                                                                basic
                                                                size="mini"
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

                                                        <Show condicion={tracking.status == 'PENDIENTE'}>
                                                            <Button color="teal" 
                                                                size="mini"
                                                                disabled={!tracking.revisado}
                                                                onClick={() => handleNext('FINALIZADO')}
                                                            >
                                                                Finalizar <i class="fas fa-check"></i>
                                                            </Button>
                                                        </Show>
                                                    </div>
                                            </Show>
                                        </Show>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Show>
                {/* mostrar error */}
                <Show condicion={!success}>
                    <div className="card-body">
                        No se encontró el seguimiento de trámite
                    </div>
                </Show>                        
            </Body>
            {/* datos correctos */}
            <Show condicion={success}>
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
                {/* liniea de tiempo */}
                <Show condicion={option == 'TIMELINE'}>
                    <ModalTracking 
                        isClose={(e) => setOption("")}
                        slug={current_tramite.slug}
                    />
                </Show>
                {/* visualizador */}
                <Show condicion={option == 'VISUALIZADOR'}>
                    <Visualizador
                        name={current_file.name || ""}
                        extname={current_file.extname || ""}
                        url={current_file.url || ""}
                        onClose={(e) => setOption("")}
                    />
                </Show>
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