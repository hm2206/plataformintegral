import React, { useState, useContext, Fragment, useMemo } from 'react';
import Modal from '../modal';
import { DropZone } from '../Utils';
import { Confirm, formatBytes } from '../../services/utils';
import { tramite, CancelRequest, handleErrorRequest } from '../../services/apis';
import Swal from 'sweetalert2';
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { SelectAuthEntityDependencia } from '../select/authentication';
import { SelectTramiteType } from '../select/tramite';
import { onProgress } from '../../services/apis';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import { EntityContext } from '../../contexts/EntityContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';
import uid from '../../utils/uid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const CreateTramite = ({ show = true, isClose = null, user = {}, onSave = null }) => {
    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // tramite
    const tramite_context = useContext(TramiteContext);
    const { current_tramite, dispatch, setNext } = tramite_context;

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const isUser = Object.keys(user).length;
    const isTramite = Object.keys(current_tramite).length;
    const [current_files, setCurrentFiles] = useState([]);
    const [current_loading, setCurrentLoading] = useState(false);
    const [percent, setPercent] = useState(0);
    const [current_cancel, setCurrentCancel] = useState(null);
    const [slug, setSlug] = useState(`${uid(10)}`.toUpperCase());

    let linkPath = useMemo(() => {
        return `${tramite.path}/file?disk=tmp&path=/tramite/${slug}/`;
    }, [slug]);

    const generateSlug = () => {
        return `${uid(10)}`.toUpperCase();
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // cambio de form
    const handleInput = async ({ name, value }, callback = true) => {
        let newForm = Object.assign({}, form);
        let newErrors = Object.assign({}, errors);
        if (typeof callback == 'function') {
            let _result = callback(value);
            if (_result) {
                newForm[name] = value;
                setForm(newForm);
                newErrors[name] = [];
                setErrors(newErrors);
            }
        } else {
            newForm[name] = value;
            setForm(newForm);
            newErrors[name] = [];
            setErrors(newErrors);
        }
    };

    // obtener files
    const handleFile = async (file) => {
        let size = 0;
        await current_files.map(f => size += f.size);
        let limite = 1024 * 25;
        if (limite >= (size / 1024)) setCurrentFiles([...current_files, file]);
        else Swal.fire({ icon: 'warning', text: `El límite de 25MB fué superado (${formatBytes(size)})` });
    };

    // eliminar archivo del array
    const handleDeleteFile = async ({ index }) => {
        let newFiles = [];
        await current_files.filter((f, indexF) => indexF != index ? newFiles.push(f) : null);
        setCurrentFiles(newFiles);
    };

    // limpiar datos anteriores
    const handleClose = () => {
        setNext("");
        dispatch({ type: tramiteTypes.CHANGE_TRAMITE });
        if (typeof isClose == 'function') isClose();
    };

    // cancelar solicitud
    const handleCancel = () => current_cancel && current_cancel.cancel();

    // guardar el tramite
    const save = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar el tramite?`);
        if (!answer) return false;
        let cancelToken = CancelRequest();
        setCurrentCancel(cancelToken);
        setCurrentLoading(true);
        let datos = new FormData;
        datos.append('person_id', user.person_id);
        datos.append('next', tramite_context.next);
        datos.append('slug', slug);
        if (isTramite) datos.append('tramite_id', current_tramite.id || "");
        await Object.keys(form).map(key => datos.append(key, form[key]));
        await current_files.map(f => datos.append('files', f));
        await tramite.post(`tramite`, datos, {
            onUploadProgress: (evt) => onProgress(evt, setPercent),
            onDownloadProgress: (evt) => onProgress(evt, setPercent),
            cancelToken: cancelToken.token,
            headers: { DependenciaId: tramite_context.dependencia_id }
        }).then(res => {
            let { success, message, tramite } = res.data;
            if (!success) throw new Error(message);
            Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
            setCurrentFiles([]);
            setSlug(generateSlug());
            if (typeof onSave == 'function') onSave(tramite);
        }).catch(err => handleErrorRequest(err, setErrors));
        setTimeout(() => setCurrentLoading(false), 1000);
    };

    // render
    return (
        <Modal
            show={show}
            isClose={handleClose}
            disabled={current_loading}
            titulo={
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-gradient-to-br tw-from-primary-500 tw-to-primary-600 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-shadow-md">
                        <i className="fas fa-plus tw-text-white tw-text-sm"></i>
                    </div>
                    <div>
                        <span className="tw-font-semibold">Nuevo Trámite</span>
                        {tramite_context.next && (
                            <Badge className="tw-ml-2 tw-bg-amber-500 tw-text-xs">
                                {tramite_context.next}
                            </Badge>
                        )}
                    </div>
                </div>
            }
        >
            <div className="tw-p-6 tw-bg-gray-50/50 tw-space-y-6">
                {/* Trámite raíz si existe */}
                <Show condicion={isTramite}>
                    <Card className="tw-border tw-border-amber-200 tw-bg-amber-50/50 tw-rounded-xl tw-overflow-hidden">
                        <div className="tw-px-4 tw-py-3 tw-bg-amber-100 tw-border-b tw-border-amber-200">
                            <h3 className="tw-text-sm tw-font-semibold tw-text-amber-800 tw-m-0 tw-flex tw-items-center tw-gap-2">
                                <i className="fas fa-file-alt"></i>
                                Trámite de Referencia
                            </h3>
                        </div>
                        <div className="tw-p-4 tw-space-y-3">
                            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                                <div>
                                    <Label className="tw-text-xs tw-text-gray-500 tw-uppercase tw-tracking-wide">Dependencia Origen</Label>
                                    <p className="tw-text-sm tw-font-medium tw-text-gray-900 tw-m-0 tw-capitalize">
                                        {current_tramite.dependencia_origen?.nombre?.toLowerCase() || "Externo"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="tw-text-xs tw-text-gray-500 tw-uppercase tw-tracking-wide">Tipo de Documento</Label>
                                    <p className="tw-text-sm tw-font-medium tw-text-gray-900 tw-m-0">
                                        {current_tramite.tramite_type?.description || "-"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="tw-text-xs tw-text-gray-500 tw-uppercase tw-tracking-wide">N° Documento</Label>
                                    <p className="tw-text-sm tw-font-medium tw-text-gray-900 tw-m-0">
                                        {current_tramite.document_number || "-"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="tw-text-xs tw-text-gray-500 tw-uppercase tw-tracking-wide">Código</Label>
                                    <Badge className="tw-bg-gray-800 tw-font-mono tw-text-xs">
                                        {current_tramite.slug}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="tw-text-xs tw-text-gray-500 tw-uppercase tw-tracking-wide">Asunto</Label>
                                <p className="tw-text-sm tw-text-gray-700 tw-m-0 tw-bg-white tw-rounded-lg tw-p-3 tw-border tw-border-amber-200">
                                    {current_tramite.asunto || "-"}
                                </p>
                            </div>
                            <Show condicion={current_tramite.observation}>
                                <div>
                                    <Label className="tw-text-xs tw-text-gray-500 tw-uppercase tw-tracking-wide">Observación</Label>
                                    <p className="tw-text-sm tw-text-gray-600 tw-m-0 tw-italic">
                                        {current_tramite.observation}
                                    </p>
                                </div>
                            </Show>
                        </div>
                    </Card>
                </Show>

                {/* Datos del Remitente */}
                <Card className="tw-border tw-border-gray-200 tw-rounded-xl tw-overflow-hidden">
                    <div className="tw-px-4 tw-py-3 tw-bg-gray-100 tw-border-b tw-border-gray-200">
                        <h3 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-m-0 tw-flex tw-items-center tw-gap-2">
                            <i className="fas fa-user"></i>
                            Datos del Remitente
                        </h3>
                    </div>
                    <div className="tw-p-4">
                        <Show
                            condicion={isUser}
                            predeterminado={
                                <div className="tw-text-center tw-py-6">
                                    <div className="tw-w-12 tw-h-12 tw-bg-red-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-3">
                                        <i className="fas fa-user-slash tw-text-red-500"></i>
                                    </div>
                                    <p className="tw-text-sm tw-text-gray-500 tw-m-0">No se encontró al remitente</p>
                                </div>
                            }
                        >
                            <div className="tw-flex tw-items-center tw-gap-4">
                                <Avatar className="tw-w-14 tw-h-14 tw-border-2 tw-border-gray-200 tw-shadow-sm">
                                    <AvatarImage
                                        src={user?.person?.image_images?.image_200x200 || user?.person?.image || '/img/perfil.jpg'}
                                        alt={user?.person?.fullname}
                                    />
                                    <AvatarFallback className="tw-bg-primary-100 tw-text-primary-700 tw-font-semibold">
                                        {getInitials(user?.person?.fullname)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="tw-flex-1">
                                    <h4 className="tw-text-base tw-font-semibold tw-text-gray-900 tw-m-0 tw-capitalize">
                                        {user?.person?.fullname?.toLowerCase() || "Sin nombre"}
                                    </h4>
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-mt-1">
                                        <Badge variant="outline" className="tw-text-xs tw-font-mono">
                                            <i className="fas fa-id-card tw-mr-1.5 tw-text-gray-400"></i>
                                            {user?.person?.document_number || "-"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Show>
                    </div>
                </Card>

                {/* Datos del Documento */}
                <Card className="tw-border tw-border-gray-200 tw-rounded-xl tw-overflow-hidden">
                    <div className="tw-px-4 tw-py-3 tw-bg-gray-100 tw-border-b tw-border-gray-200">
                        <h3 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-m-0 tw-flex tw-items-center tw-gap-2">
                            <i className="fas fa-file-alt"></i>
                            Datos del Documento
                        </h3>
                    </div>
                    <div className="tw-p-4 tw-space-y-4">
                        {/* Dependencia Origen */}
                        <div className="tw-space-y-1.5">
                            <Label className="tw-text-sm tw-font-medium tw-text-gray-700">
                                Dependencia Origen
                            </Label>
                            <div className="form-select-wrapper">
                                <SelectAuthEntityDependencia
                                    entity_id={entity_context.entity_id}
                                    value={tramite_context.dependencia_id}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Tipo de Documento */}
                        <div className="tw-space-y-1.5">
                            <Label className="tw-text-sm tw-font-medium tw-text-gray-700">
                                Tipo de Documento <span className="tw-text-red-500">*</span>
                            </Label>
                            <div className={cn(
                                "form-select-wrapper",
                                errors.tramite_type_id?.[0] && "tw-ring-2 tw-ring-red-500 tw-rounded-lg"
                            )}>
                                <SelectTramiteType
                                    name="tramite_type_id"
                                    value={form.tramite_type_id}
                                    onChange={(e, target) => handleInput(target)}
                                    error={errors.tramite_type_id?.[0] ? true : false}
                                />
                            </div>
                            {errors.tramite_type_id?.[0] && (
                                <p className="tw-text-xs tw-text-red-500 tw-m-0 tw-mt-1">
                                    {errors.tramite_type_id[0]}
                                </p>
                            )}
                        </div>

                        {/* N° Documento */}
                        <div className="tw-space-y-1.5">
                            <Label className="tw-text-sm tw-font-medium tw-text-gray-700">
                                N° Documento <span className="tw-text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                name="document_number"
                                value={form.document_number || ""}
                                onChange={({ target }) => handleInput(target)}
                                placeholder="Ingrese el número de documento"
                                className={cn(
                                    "tw-h-10",
                                    errors.document_number?.[0] && "tw-border-red-500 tw-ring-red-500"
                                )}
                            />
                            {errors.document_number?.[0] && (
                                <p className="tw-text-xs tw-text-red-500 tw-m-0">
                                    {errors.document_number[0]}
                                </p>
                            )}
                        </div>

                        {/* Asunto */}
                        <div className="tw-space-y-1.5">
                            <Label className="tw-text-sm tw-font-medium tw-text-gray-700">
                                Asunto <span className="tw-text-red-500">*</span>
                            </Label>
                            <textarea
                                name="asunto"
                                rows="3"
                                value={form.asunto || ""}
                                onChange={({ target }) => handleInput(target)}
                                placeholder="Describa el asunto del trámite"
                                className={cn(
                                    "tw-w-full tw-px-3 tw-py-2 tw-text-sm tw-border tw-border-gray-300 tw-rounded-lg tw-resize-none focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary-500 focus:tw-border-transparent tw-transition-all",
                                    errors.asunto?.[0] && "tw-border-red-500 tw-ring-red-500"
                                )}
                            />
                            {errors.asunto?.[0] && (
                                <p className="tw-text-xs tw-text-red-500 tw-m-0">
                                    {errors.asunto[0]}
                                </p>
                            )}
                        </div>

                        {/* Observación */}
                        <div className="tw-space-y-1.5">
                            <Label className="tw-text-sm tw-font-medium tw-text-gray-700">
                                Observación
                                <span className="tw-text-gray-400 tw-font-normal tw-ml-1">(opcional)</span>
                            </Label>
                            <textarea
                                name="observation"
                                rows="3"
                                value={form.observation || ""}
                                onChange={({ target }) => handleInput(target)}
                                placeholder="Observaciones adicionales..."
                                className={cn(
                                    "tw-w-full tw-px-3 tw-py-2 tw-text-sm tw-border tw-border-gray-300 tw-rounded-lg tw-resize-none focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary-500 focus:tw-border-transparent tw-transition-all",
                                    errors.observation?.[0] && "tw-border-red-500 tw-ring-red-500"
                                )}
                            />
                        </div>

                        {/* Archivos */}
                        <div className="tw-space-y-1.5">
                            <Label className="tw-text-sm tw-font-medium tw-text-gray-700">
                                Archivos <span className="tw-text-red-500">*</span>
                                <span className="tw-text-gray-400 tw-font-normal tw-ml-1">(máx. 25MB)</span>
                            </Label>
                            <div className={cn(
                                "tw-border tw-border-dashed tw-border-gray-300 tw-rounded-lg tw-p-4 tw-bg-gray-50/50",
                                errors.files?.[0] && "tw-border-red-500 tw-bg-red-50/50"
                            )}>
                                <DropZone
                                    linkCodeQr={linkPath}
                                    id="file-tramite-serve"
                                    name="files"
                                    title="Seleccionar archivos (*.pdf y *.docx)"
                                    multiple={false}
                                    size={25}
                                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                                    result={current_files}
                                    onSigned={({ file }) => handleFile(file)}
                                    onChange={({ files }) => handleFile(files[0])}
                                    onDelete={handleDeleteFile}
                                />
                            </div>
                            {errors.files?.[0] && (
                                <p className="tw-text-xs tw-text-red-500 tw-m-0">
                                    {errors.files[0]}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Acciones */}
                <div className="tw-flex tw-items-center tw-justify-end tw-gap-3 tw-pt-2">
                    <Show condicion={!current_loading}>
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="tw-gap-2"
                        >
                            <i className="fas fa-times"></i>
                            Cancelar
                        </Button>
                        <Button
                            onClick={save}
                            disabled={!isUser}
                            className="tw-bg-gradient-to-r tw-from-primary-500 tw-to-primary-600 tw-gap-2 tw-shadow-md hover:tw-shadow-lg"
                        >
                            <i className="fas fa-save"></i>
                            Guardar Trámite
                        </Button>
                    </Show>

                    <Show condicion={current_loading}>
                        <div className="tw-flex-1">
                            <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                                <span className="tw-text-sm tw-text-gray-600">Subiendo archivos...</span>
                                <span className="tw-text-sm tw-font-semibold tw-text-primary-600">{percent}%</span>
                            </div>
                            <div className="tw-w-full tw-h-2 tw-bg-gray-200 tw-rounded-full tw-overflow-hidden">
                                <div
                                    className="tw-h-full tw-bg-gradient-to-r tw-from-primary-500 tw-to-primary-600 tw-rounded-full tw-transition-all tw-duration-300"
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                                className="tw-mt-2 tw-text-red-500 hover:tw-bg-red-50"
                            >
                                <i className="fas fa-times tw-mr-1"></i>
                                Cancelar subida
                            </Button>
                        </div>
                    </Show>
                </div>
            </div>
        </Modal>
    );
};

export default CreateTramite;
