import React, { useContext } from 'react';
import CardInfoTramite from '../../components/tramite/cardInfoTramite';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';
import Show from '../show';
import { Confirm } from '../../services/utils';
import { AppContext } from '../../contexts';
import TrackingProvider from '../../providers/tramite/TrackingProvider';
import Swal from 'sweetalert2';
import ItemFileCircle from '../itemFileCircle';
import { DropZone } from '../Utils';
import { AuthContext } from '../../contexts/AuthContext';
import FileProvider from '../../providers/tramite/FileProvider';
import { tramite } from '../../services/apis';

// providers
const trackingProvider = new TrackingProvider();
const fileProvider = new FileProvider();

const allowToggleVerify = ['REGISTRADO', 'PENDIENTE', 'SUBTRAMITE'];

const ShowInfo = ({ validateFile = [], onArchived = null }) => {

    // app
    const app_context = useContext(AppContext);

    // auth
    const { auth } = useContext(AuthContext);

    // tramite
    const { current_tracking, dependencia_id, dispatch, setOption, setFile } = useContext(TramiteContext);
    const current_tramite = current_tracking.tramite || {};
    const isTramite = Object.keys(current_tramite).length;

    let linkPath = `${tramite.path}/file?disk=tmp&path=/tramite/${current_tramite?.slug}/`;

    // verificar tracking
    const verifyTracking = async () => {
        let answer = await Confirm(`warning`, `¿Estás seguro en ${current_tracking.revisado ? 'quitar la autorización' : 'autorizar'} el trámite?`, 'Autorizar');    
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        // options
        let options = {
            headers: { DependenciaId: dependencia_id }
        }
        // request
        await trackingProvider.verify(current_tracking.id, { revisado: current_tracking.revisado ? 0 : 1 }, options)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            let newTracking = Object.assign({}, current_tracking);
            newTracking.revisado = !newTracking.revisado;
            dispatch({ type: tramiteTypes.CHANGE_TRACKING, payload: newTracking })
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: err.message });
        }); 
    }

    // agregar archivo
    const addFile = async ({ name, file }, object_id, object_type = 'App/Models/Tramite') => {
        let datos = new FormData;
        app_context.setCurrentLoading(true);
        datos.append('files', file);
        datos.append('object_id', object_id);
        datos.append('object_type', object_type);
        await fileProvider.store(datos)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message, files } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            dispatch({ type: tramiteTypes.ADD_FILE_TRACKING, payload: files });
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'warning', text: err.message });
        });
    }

    // action archivo
    const handleFile = (action, currentFile, file) => {
        if (action == 'delete') {
            dispatch({ type: tramiteTypes.DELETE_FILE_TRACKING, payload: currentFile });
        } else {
            dispatch({ type: tramiteTypes.UPDATE_FILE_TRACKING, payload: file });
        }
    }

    // render
    return (
        <>
            <div className="col-md-10 mb-2">
                <CardInfoTramite
                    image={current_tramite.person && current_tramite.person.image_images && current_tramite.person.image_images.image_200x200 || ""}
                    remitente={current_tramite.person && current_tramite.person.fullname || ""}
                    email={current_tramite.person && current_tramite.person.email_contact || ""}
                    dependencia={current_tramite.dependencia_origen && current_tramite.dependencia_origen.nombre || ""}
                    status={current_tracking.first ? current_tracking.status : ''}
                    revisado={current_tracking.revisado}
                    archived={current_tracking.archived ? true : false}
                    onArchived={current_tracking.first ? onArchived : null}
                />

                <div className="mt-4">
                    <b>Tipo Trámite: </b> {current_tramite.tramite_type && current_tramite.tramite_type.description || ""}
                    <br/>
                    <b>N° Trámite: </b> {current_tramite.document_number || ""}
                    <br/>
                    <b>Observación</b> {current_tramite.observation || ""} 
                    <br/>
                    <b>N° Folio: </b> {current_tramite.folio_count || 0}
                    <br/>

                    <Show condicion={allowToggleVerify.includes(current_tracking.status)}>
                        <Show condicion={
                                current_tracking.current && !current_tracking.revisado 
                                && current_tracking.user_verify_id == auth.id
                            }
                        >
                            <div className="mb-3 mt-3">
                                <button className="btn btn-outline-success"
                                    onClick={verifyTracking}
                                >
                                    <i className="fas fa-check"></i> Autorizar
                                </button>
                            </div>
                        </Show>

                        <Show condicion={
                                current_tracking.current 
                                && current_tracking.revisado 
                                && current_tracking.user_verify_id == auth.id
                            }
                        >
                            <div className="mb-3 mt-3">
                                <button className="btn btn-outline-danger"
                                    onClick={verifyTracking}
                                >
                                    <i className="fas fa-times"></i> Quitar Autorización
                                </button>
                            </div>
                        </Show>
                    </Show>
                </div>
            </div>
            {/* code QR */}
            <div className="col-md-2 mb-2">
                <div className="mb-2">
                    <button className="btn btn-outline-primary btn-block"
                        onClick={(e) => setOption(["TIMELINE"])}
                    >
                        <i className="fas fa-search"></i> Seguímiento
                    </button>
                </div>

                <Show condicion={isTramite && current_tramite.code_qr}>
                    <img src={current_tramite.code_qr} alt="code_qr"
                        style={{ width: "100%", objectFit: 'contain' }}
                    />
                </Show>
            </div>
            {/* tracking */}
            <div className="col-md-12 mb-2">
                <b><i className="fas fa-clip-paper"></i> Archivos de trámite: </b>
                <div className="row mt-3">
                    {isTramite && typeof current_tramite.files == 'object' ? current_tramite.files.map((f, indexF) => 
                        <div className="ml-5 col-xs" key={`item-tramite-${indexF}`}>
                            <ItemFileCircle
                                id={f.id}
                                is_observation={f.observation}
                                className="mb-3"
                                key={`item-file-tramite-${indexF}`}
                                url={f.url}
                                name={f.name}
                                extname={f.extname}
                                hidden={validateFile}
                                edit={true}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setFile(f);
                                    setOption(['VISUALIZADOR']);
                                }}
                                onAction={(e, file) => handleFile(e, f, file)}
                            />
                        </div>
                    ) : null}
                    {/* agregar archivos */}
                    <Show condicion={!validateFile.includes('create')}>
                        <div className="text-right ml-3">
                            <DropZone
                                id="file-tramite-datos"
                                title="Seleccionar archivo PDF"
                                linkCodeQr={linkPath}
                                accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                                multiple={false}
                                size={6}
                                basic={true}
                                icon="fas fa-plus"
                                onChange={async ({ files, name }) => await addFile({ name, file: files[0] }, current_tramite.id)}
                                onSigned={async ({ name, file }) => await addFile({ name, file }, current_tramite.id)}
                            />
                        </div>
                    </Show>
                </div>
            </div>
            {/* old files */}
            <Show condicion={isTramite && current_tramite.old_files && current_tramite.old_files.length}>
                <div className="col-md-12 mb-2">
                    <hr/>
                    <b><i className="fas fa-clip-paper"></i> Archivos anidados: </b>
                    <div className="row mt-3">
                        {isTramite && typeof current_tramite.old_files == 'object' ? current_tramite.old_files.map((f, indexF) => 
                            <div className="ml-5 col-xs" key={`item-old-tramite-${indexF}`}>
                                <ItemFileCircle
                                    id={f.id}
                                    is_observation={f.observation}
                                    className="mb-3"
                                    key={`item-file-old-tramite-${indexF}`}
                                    url={f.url}
                                    name={f.name}
                                    extname={f.extname}
                                    hidden={['delete']}
                                    edit={true}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFile(f);
                                        setOption(['VISUALIZADOR']);
                                    }}
                                    onAction={(e, file) => handleFile(e, f, file)}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </Show>
        </>
    );
}

export default ShowInfo;