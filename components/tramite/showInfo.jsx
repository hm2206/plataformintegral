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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
        let options = {
            headers: { DependenciaId: dependencia_id }
        };
        await trackingProvider.verify(current_tracking.id, { revisado: current_tracking.revisado ? 0 : 1 }, options)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            let newTracking = Object.assign({}, current_tracking);
            newTracking.revisado = !newTracking.revisado;
            dispatch({ type: tramiteTypes.CHANGE_TRACKING, payload: newTracking });
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: err.message });
        });
    };

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
    };

    // action archivo
    const handleFile = (action, currentFile, file) => {
        if (action == 'delete') {
            dispatch({ type: tramiteTypes.DELETE_FILE_TRACKING, payload: currentFile });
        } else {
            dispatch({ type: tramiteTypes.UPDATE_FILE_TRACKING, payload: file });
        }
    };

    // render
    return (
        <>
            {/* Información principal */}
            <div className="tw-col-span-9">
                <CardInfoTramite
                    image={current_tramite.person?.image_images?.image_200x200 || ""}
                    remitente={current_tramite.person?.fullname || ""}
                    email={current_tramite.person?.email_contact || ""}
                    dependencia={current_tramite.dependencia_origen?.nombre || ""}
                    status={current_tracking.first ? current_tracking.status : ''}
                    revisado={current_tracking.revisado}
                    archived={current_tracking.archived ? true : false}
                    onArchived={current_tracking.first ? onArchived : null}
                />

                {/* Detalles del trámite */}
                <div className="tw-mt-6 tw-grid tw-grid-cols-2 tw-gap-4">
                    <div className="tw-bg-gray-50 tw-rounded-lg tw-p-4">
                        <div className="tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1">
                            Tipo de Trámite
                        </div>
                        <div className="tw-text-sm tw-font-semibold tw-text-gray-900">
                            {current_tramite.tramite_type?.description || "-"}
                        </div>
                    </div>
                    <div className="tw-bg-gray-50 tw-rounded-lg tw-p-4">
                        <div className="tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1">
                            N° Documento
                        </div>
                        <div className="tw-text-sm tw-font-semibold tw-text-gray-900">
                            {current_tramite.document_number || "-"}
                        </div>
                    </div>
                    <div className="tw-bg-gray-50 tw-rounded-lg tw-p-4">
                        <div className="tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1">
                            N° Folios
                        </div>
                        <div className="tw-text-sm tw-font-semibold tw-text-gray-900">
                            {current_tramite.folio_count || 0}
                        </div>
                    </div>
                    <Show condicion={current_tramite.observation}>
                        <div className="tw-bg-gray-50 tw-rounded-lg tw-p-4">
                            <div className="tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1">
                                Observación
                            </div>
                            <div className="tw-text-sm tw-text-gray-700">
                                {current_tramite.observation}
                            </div>
                        </div>
                    </Show>
                </div>

                {/* Botón de autorización */}
                <Show condicion={allowToggleVerify.includes(current_tracking.status)}>
                    <div className="tw-mt-6">
                        <Show condicion={
                            current_tracking.current && !current_tracking.revisado
                            && current_tracking.user_verify_id == auth.id
                        }>
                            <Button
                                onClick={verifyTracking}
                                className="tw-bg-emerald-500 hover:tw-bg-emerald-600 tw-gap-2"
                            >
                                <i className="fas fa-check"></i>
                                Autorizar Trámite
                            </Button>
                        </Show>

                        <Show condicion={
                            current_tracking.current
                            && current_tracking.revisado
                            && current_tracking.user_verify_id == auth.id
                        }>
                            <Button
                                variant="outline"
                                onClick={verifyTracking}
                                className="tw-border-red-300 tw-text-red-600 hover:tw-bg-red-50 tw-gap-2"
                            >
                                <i className="fas fa-times"></i>
                                Quitar Autorización
                            </Button>
                        </Show>
                    </div>
                </Show>
            </div>

            {/* QR y seguimiento */}
            <div className="tw-col-span-3">
                <Button
                    variant="outline"
                    onClick={() => setOption(["TIMELINE"])}
                    className="tw-w-full tw-mb-4 tw-gap-2 tw-border-primary-300 tw-text-primary-600 hover:tw-bg-primary-50"
                >
                    <i className="fas fa-route"></i>
                    Ver Seguimiento
                </Button>

                <Show condicion={isTramite && current_tramite.code_qr}>
                    <div className="tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-p-3 tw-shadow-sm">
                        <img
                            src={current_tramite.code_qr}
                            alt="Código QR"
                            className="tw-w-full tw-object-contain tw-rounded-lg"
                        />
                        <div className="tw-text-center tw-mt-2 tw-text-xs tw-text-gray-500">
                            Código QR del trámite
                        </div>
                    </div>
                </Show>
            </div>

            {/* Archivos del trámite */}
            <div className="tw-col-span-12 tw-mt-8 tw-pt-6 tw-border-t tw-border-gray-100">
                <h3 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-5 tw-flex tw-items-center tw-gap-2">
                    <i className="fas fa-paperclip tw-text-gray-400"></i>
                    Archivos del trámite
                    <Badge variant="secondary" className="tw-text-xs tw-bg-gray-100">
                        {current_tramite.files?.length || 0}
                    </Badge>
                </h3>

                <div className="tw-flex tw-flex-wrap tw-gap-4 tw-items-start tw-p-4 tw-bg-gray-50/50 tw-rounded-xl">
                    {isTramite && typeof current_tramite.files == 'object' ? current_tramite.files.map((f, indexF) =>
                        <ItemFileCircle
                            key={`item-tramite-${indexF}`}
                            id={f.id}
                            is_observation={f.observation}
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
                    ) : null}

                    {/* Agregar archivos */}
                    <Show condicion={!validateFile.includes('create')}>
                        <DropZone
                            id="file-tramite-datos"
                            title="Agregar archivo"
                            linkCodeQr={linkPath}
                            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                            multiple={false}
                            size={6}
                            basic={true}
                            icon="fas fa-plus"
                            onChange={async ({ files, name }) => await addFile({ name, file: files[0] }, current_tramite.id)}
                            onSigned={async ({ name, file }) => await addFile({ name, file }, current_tramite.id)}
                        />
                    </Show>
                </div>
            </div>

            {/* Archivos anidados */}
            <Show condicion={isTramite && current_tramite.old_files?.length}>
                <div className="tw-col-span-12 tw-mt-6 tw-pt-6 tw-border-t tw-border-gray-100">
                    <h3 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
                        <i className="fas fa-link tw-text-gray-400"></i>
                        Archivos anidados
                        <Badge variant="secondary" className="tw-text-xs tw-bg-gray-100">
                            {current_tramite.old_files?.length || 0}
                        </Badge>
                    </h3>

                    <div className="tw-flex tw-flex-wrap tw-gap-4 tw-items-start tw-p-4 tw-bg-gray-50/50 tw-rounded-xl">
                        {current_tramite.old_files?.map((f, indexF) =>
                            <ItemFileCircle
                                key={`item-old-tramite-${indexF}`}
                                id={f.id}
                                is_observation={f.observation}
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
                        )}
                    </div>
                </div>
            </Show>
        </>
    );
};

export default ShowInfo;
