import React, { useContext, useState, useEffect } from "react";
import { Form, Select } from 'semantic-ui-react';
import { authentication, handleErrorRequest, onProgress } from '../services/apis';
import Show from '../components/show';
import Swal from "sweetalert2";
import { LoadFile } from '../components/Utils';
import { SelectDepartamento, SelectProvincia, SelectDistrito } from '../components/select/authentication';
import { AuthContext } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const CardProfile = () => {

    // app
    const { auth, setAuth } = useContext(AuthContext);

    // estados
    const [current_person, setCurrentPerson] = useState({});
    const [current_user, setCurrentUser] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const [option, setOption] = useState("");
    const [errors, setErrors] = useState({});
    const [percent, setPercent] = useState(0);

    // setting auth
    const settingAuth = () => {
        const { person } = auth || {};
        setCurrentUser(JSON.parse(JSON.stringify(auth || {})));
        setCurrentPerson(JSON.parse(JSON.stringify(person || {})));
    }

    // primera carga
    useEffect(() => {
        if (auth) settingAuth();
    }, [auth]);

    // cancelar edición
    useEffect(() => {
        if (!edit) settingAuth();
    }, [edit]);

    // manejador de cambio del person
    const handleInputPerson = ({ name, value }) => {
        let newForm = Object.assign({}, current_person);
        newForm[name] = value;
        setCurrentPerson(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // manejador de cambio del user
    const handleInputUser = ({ name, value }) => {
        let newForm = Object.assign({}, current_user);
        newForm[name] = value;
        setCurrentUser(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // limpiar provincia
    useEffect(() => {
        if (edit) handleInputPerson({ name: 'cod_pro', value: '' });
    }, [current_person.cod_dep]);

    // limpiar distrito
    useEffect(() => {
        if (edit) handleInputPerson({ name: 'cod_dis', value: '' });
    }, [current_person.cod_pro]);

    // validar actualización
    const getPass = async () => {
        return await Swal.fire({
            icon: 'warning',
            text: `Ingrese su contraseña para actualizar los datos`,
            input: 'password',
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            preConfirm: (pass) => {
                if (pass.length < 6) Swal.showValidationMessage(`La contraseña debe tener como mínimo 6 carácteres`)
            }
        })
    }

    // actualizar datos
    const update = async () => {
        let answer = await getPass();
        if (!answer.value) return false;
        setCurrentLoading(true);
        let form = new FormData();
        form.append('email', current_user.email || "");
        form.append('date_of_birth', current_person.date_of_birth || "");
        form.append('marital_status', current_person.marital_status || "");
        form.append('gender', current_person.gender || "");
        form.append('cod_dep', current_person.cod_dep || "");
        form.append('cod_pro', current_person.cod_pro || "");
        form.append('cod_dis', current_person.cod_dis || "");
        form.append('address', current_person.address || "");
        form.append('phone', current_person.phone || "");
        form.append('password_confirm', answer.value || "");
        // request
        await authentication.post(`auth/update?_method=PUT`, form)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setEdit(false);
            setAuth({ ...auth, ...current_user, person: current_person });
        }).catch(async err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    // cambiar imagen
    const handleSaveImg = async (img) => {
        setCurrentLoading(true);
        let form = new FormData;
        form.append('image', img);
        let options = {
            onUploadProgress: (evt) => onProgress(evt, setPercent)
        }
        await authentication.post(`auth/change_image`, form, options)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            location.href = '/';
        }).catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
        setPercent(0);
    }

    // get initials
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // renderizado
    return (
        <>
            <Card className="tw-border-0 tw-shadow-md tw-rounded-xl tw-overflow-hidden">
                {/* Header con avatar */}
                <CardHeader className="tw-bg-gradient-to-br tw-from-primary-500 tw-via-primary-600 tw-to-primary-700 tw-pb-16 tw-pt-8">
                    <div className="tw-text-center">
                        {/* Avatar con botón de cambiar imagen */}
                        <div className="tw-relative tw-inline-block">
                            <Avatar className="tw-w-24 tw-h-24 tw-border-4 tw-border-white/30 tw-shadow-xl">
                                <AvatarImage
                                    src={current_user.image_images?.image_200x200 || '/img/perfil.jpg'}
                                    alt="perfil"
                                />
                                <AvatarFallback className="tw-bg-primary-800 tw-text-white tw-text-2xl">
                                    {getInitials(current_person.fullname)}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                onClick={() => setOption("CHANGE_IMAGE")}
                                className="tw-absolute tw-bottom-0 tw-right-0 tw-w-8 tw-h-8 tw-bg-white tw-rounded-full tw-shadow-lg tw-flex tw-items-center tw-justify-center tw-text-primary-500 tw-border-0 tw-cursor-pointer tw-transition-all hover:tw-bg-gray-50 hover:tw-scale-110"
                                title="Cambiar imagen de perfil"
                            >
                                <i className="fas fa-camera tw-text-sm"></i>
                            </button>
                        </div>

                        <h2 className="tw-text-white tw-text-xl tw-font-bold tw-mt-4 tw-mb-1 tw-uppercase">
                            {current_person.fullname || ""}
                        </h2>
                        <p className="tw-text-white/70 tw-text-sm">
                            {current_person.address || "Sin dirección"}
                        </p>
                    </div>
                </CardHeader>

                {/* Stats */}
                <div className="tw-relative tw-px-6 -tw-mt-8">
                    <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-p-4 tw-grid tw-grid-cols-3 tw-gap-4">
                        <div className="tw-text-center">
                            <p className="tw-text-lg tw-font-bold tw-text-gray-900">{current_person.phone || "-"}</p>
                            <p className="tw-text-xs tw-text-gray-500 tw-uppercase tw-tracking-wide">Teléfono</p>
                        </div>
                        <div className="tw-text-center tw-border-x tw-border-gray-100">
                            <p className="tw-text-lg tw-font-bold tw-text-gray-900">{current_user.username || "-"}</p>
                            <p className="tw-text-xs tw-text-gray-500 tw-uppercase tw-tracking-wide">Usuario</p>
                        </div>
                        <div className="tw-text-center">
                            <p className="tw-text-lg tw-font-bold tw-text-gray-900">{current_person.edad || "-"}</p>
                            <p className="tw-text-xs tw-text-gray-500 tw-uppercase tw-tracking-wide">Edad</p>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <CardContent className="tw-p-6 tw-pt-8">
                    <Form>
                        {/* Sección: Datos Personales */}
                        <div className="tw-mb-6">
                            <h3 className="tw-text-sm tw-font-semibold tw-text-gray-900 tw-uppercase tw-tracking-wide tw-mb-4 tw-flex tw-items-center tw-gap-2">
                                <i className="fas fa-user tw-text-primary-500"></i>
                                Datos Personales
                            </h3>

                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                                <div className="tw-space-y-1.5">
                                    <Label className="tw-text-gray-600 tw-text-sm">
                                        Correo Electrónico <span className="tw-text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={current_user.email || ""}
                                        onChange={({ target }) => handleInputUser(target)}
                                        disabled={current_loading}
                                        className={cn(
                                            "tw-h-10 tw-rounded-lg",
                                            errors.email?.[0] && "tw-border-red-500"
                                        )}
                                    />
                                    {errors.email?.[0] && (
                                        <p className="tw-text-xs tw-text-red-500">{errors.email[0]}</p>
                                    )}
                                </div>

                                <div className="tw-space-y-1.5">
                                    <Label className="tw-text-gray-600 tw-text-sm">Tipo Documento</Label>
                                    <Input
                                        type="text"
                                        readOnly
                                        value={current_person.document_type?.name || ""}
                                        className="tw-h-10 tw-rounded-lg tw-bg-gray-50"
                                    />
                                </div>

                                <div className="tw-space-y-1.5">
                                    <Label className="tw-text-gray-600 tw-text-sm">N° Documento</Label>
                                    <Input
                                        type="text"
                                        readOnly
                                        value={current_person.document_number || ""}
                                        className="tw-h-10 tw-rounded-lg tw-bg-gray-50"
                                    />
                                </div>

                                <div className="tw-space-y-1.5">
                                    <Label className="tw-text-gray-600 tw-text-sm">
                                        Fecha de Nacimiento <span className="tw-text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="date"
                                        name="date_of_birth"
                                        value={current_person.date_of_birth || ""}
                                        onChange={({ target }) => handleInputPerson(target)}
                                        disabled={current_loading}
                                        className={cn(
                                            "tw-h-10 tw-rounded-lg",
                                            errors.date_of_birth?.[0] && "tw-border-red-500"
                                        )}
                                    />
                                    {errors.date_of_birth?.[0] && (
                                        <p className="tw-text-xs tw-text-red-500">{errors.date_of_birth[0]}</p>
                                    )}
                                </div>

                                <Form.Field error={errors.marital_status?.[0] ? true : false}>
                                    <Label className="tw-text-gray-600 tw-text-sm tw-block tw-mb-1.5">
                                        Estado Civil <span className="tw-text-red-500">*</span>
                                    </Label>
                                    <Select
                                        fluid
                                        options={[
                                            { key: "SOL", value: "S", text: "Soltero(a)" },
                                            { key: "CAS", value: "C", text: "Casado(a)" },
                                            { key: "DIV", value: "D", text: "Divorciado(a)" },
                                            { key: "VIU", value: "V", text: "Viudo(a)" }
                                        ]}
                                        placeholder="Seleccionar"
                                        name="marital_status"
                                        value={current_person.marital_status || ""}
                                        onChange={(e, obj) => handleInputPerson(obj)}
                                        disabled={current_loading}
                                    />
                                    {errors.marital_status?.[0] && (
                                        <p className="tw-text-xs tw-text-red-500 tw-mt-1">{errors.marital_status[0]}</p>
                                    )}
                                </Form.Field>

                                <Form.Field error={errors.gender?.[0] ? true : false}>
                                    <Label className="tw-text-gray-600 tw-text-sm tw-block tw-mb-1.5">
                                        Género <span className="tw-text-red-500">*</span>
                                    </Label>
                                    <Select
                                        fluid
                                        options={[
                                            { key: "GEN-M", value: "M", text: "Masculino" },
                                            { key: "GEN-F", value: "F", text: "Femenino" },
                                            { key: "GEN-I", value: "I", text: "No Binario" }
                                        ]}
                                        placeholder="Seleccionar"
                                        name="gender"
                                        value={current_person.gender || ""}
                                        onChange={(e, obj) => handleInputPerson(obj)}
                                        disabled={current_loading}
                                    />
                                    {errors.gender?.[0] && (
                                        <p className="tw-text-xs tw-text-red-500 tw-mt-1">{errors.gender[0]}</p>
                                    )}
                                </Form.Field>
                            </div>
                        </div>

                        {/* Sección: Lugar de Nacimiento */}
                        <div className="tw-mb-6">
                            <h3 className="tw-text-sm tw-font-semibold tw-text-gray-900 tw-uppercase tw-tracking-wide tw-mb-4 tw-flex tw-items-center tw-gap-2">
                                <i className="fas fa-map-marker-alt tw-text-primary-500"></i>
                                Lugar de Nacimiento
                            </h3>

                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                                <Form.Field error={errors.cod_dep?.[0] ? true : false}>
                                    <Label className="tw-text-gray-600 tw-text-sm tw-block tw-mb-1.5">
                                        Departamento <span className="tw-text-red-500">*</span>
                                    </Label>
                                    <SelectDepartamento
                                        id="cod_dep"
                                        name="cod_dep"
                                        value={current_person.cod_dep}
                                        onChange={(e, obj) => handleInputPerson(obj)}
                                        disabled={current_loading}
                                    />
                                    {errors.cod_dep?.[0] && (
                                        <p className="tw-text-xs tw-text-red-500 tw-mt-1">{errors.cod_dep[0]}</p>
                                    )}
                                </Form.Field>

                                <Form.Field error={errors.cod_pro?.[0] ? true : false}>
                                    <Label className="tw-text-gray-600 tw-text-sm tw-block tw-mb-1.5">
                                        Provincia <span className="tw-text-red-500">*</span>
                                    </Label>
                                    <SelectProvincia
                                        id="cod_pro"
                                        departamento_id={current_person.cod_dep}
                                        name="cod_pro"
                                        value={current_person.cod_pro}
                                        refresh={current_person.cod_dep}
                                        onChange={(e, obj) => handleInputPerson(obj)}
                                        disabled={current_loading || !current_person.cod_dep}
                                    />
                                    {errors.cod_pro?.[0] && (
                                        <p className="tw-text-xs tw-text-red-500 tw-mt-1">{errors.cod_pro[0]}</p>
                                    )}
                                </Form.Field>

                                <Form.Field error={errors.cod_dis?.[0] ? true : false}>
                                    <Label className="tw-text-gray-600 tw-text-sm tw-block tw-mb-1.5">
                                        Distrito <span className="tw-text-red-500">*</span>
                                    </Label>
                                    <SelectDistrito
                                        id="cod_dis"
                                        departamento_id={current_person.cod_dep}
                                        provincia_id={current_person.cod_pro}
                                        name="cod_dis"
                                        value={current_person.cod_dis}
                                        refresh={current_person.cod_pro}
                                        onChange={(e, obj) => handleInputPerson(obj)}
                                        disabled={current_loading || !current_person.cod_pro}
                                    />
                                    {errors.cod_dis?.[0] && (
                                        <p className="tw-text-xs tw-text-red-500 tw-mt-1">{errors.cod_dis[0]}</p>
                                    )}
                                </Form.Field>
                            </div>
                        </div>

                        {/* Sección: Contacto */}
                        <div className="tw-mb-6">
                            <h3 className="tw-text-sm tw-font-semibold tw-text-gray-900 tw-uppercase tw-tracking-wide tw-mb-4 tw-flex tw-items-center tw-gap-2">
                                <i className="fas fa-phone tw-text-primary-500"></i>
                                Contacto
                            </h3>

                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                                <div className="md:tw-col-span-2 tw-space-y-1.5">
                                    <Label className="tw-text-gray-600 tw-text-sm">
                                        Dirección <span className="tw-text-red-500">*</span>
                                    </Label>
                                    <textarea
                                        name="address"
                                        rows="3"
                                        value={current_person.address || ""}
                                        onChange={({ target }) => handleInputPerson(target)}
                                        disabled={current_loading}
                                        className={cn(
                                            "tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-border tw-border-gray-300 tw-text-sm tw-resize-none focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary-500 focus:tw-border-transparent",
                                            errors.address?.[0] && "tw-border-red-500"
                                        )}
                                    />
                                    {errors.address?.[0] && (
                                        <p className="tw-text-xs tw-text-red-500">{errors.address[0]}</p>
                                    )}
                                </div>

                                <div className="tw-space-y-1.5">
                                    <Label className="tw-text-gray-600 tw-text-sm">
                                        Teléfono <span className="tw-text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        name="phone"
                                        value={current_person.phone || ""}
                                        onChange={({ target }) => handleInputPerson(target)}
                                        disabled={current_loading}
                                        className={cn(
                                            "tw-h-10 tw-rounded-lg",
                                            errors.phone?.[0] && "tw-border-red-500"
                                        )}
                                    />
                                    {errors.phone?.[0] && (
                                        <p className="tw-text-xs tw-text-red-500">{errors.phone[0]}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="tw-flex tw-items-center tw-justify-end tw-gap-3 tw-pt-4 tw-border-t tw-border-gray-100">
                            <Show condicion={edit}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEdit(false)}
                                    disabled={current_loading}
                                    className="tw-h-10 tw-px-5 tw-rounded-lg tw-border-gray-300 tw-text-gray-600 hover:tw-bg-gray-50"
                                >
                                    <i className="fas fa-times tw-mr-2"></i>
                                    Cancelar
                                </Button>
                            </Show>

                            <Button
                                type="button"
                                onClick={update}
                                disabled={!edit || current_loading}
                                className={cn(
                                    "tw-h-10 tw-px-5 tw-rounded-lg tw-bg-gradient-to-r tw-from-primary-500 tw-to-primary-600",
                                    !edit && "tw-opacity-50"
                                )}
                            >
                                {current_loading ? (
                                    <>
                                        <Spinner size="sm" variant="white" className="tw-mr-2" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save tw-mr-2"></i>
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>

            <Show condicion={option == 'CHANGE_IMAGE'}>
                <LoadFile
                    defaultImg={current_user.image_images?.image_200x200}
                    info="Cambiar Foto de perfil"
                    isClose={() => setOption("")}
                    accept="image/*"
                    onSave={handleSaveImg}
                    porcentaje={percent}
                    disabled={current_loading}
                />
            </Show>
        </>
    )
}

export default CardProfile;
