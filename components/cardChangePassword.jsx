import React, { useState } from 'react';
import { authentication, handleErrorRequest } from '../services/apis';
import Swal from 'sweetalert2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const CardChangePassword = () => {

    // estados
    const [password_validation, setPasswordValidation] = useState("");
    const [password_new, setPasswordNew] = useState("");
    const [password_confirm, setPasswordConfirm] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // cambiar form
    const handleInput = ({ name, value }, setChange) => {
        setChange(value);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // validar contraseña de confirmación
    const val_password_confimation = () => {
        return password_confirm ? password_new == password_confirm : true;
    }

    // cambiar contraseña
    const changePassword = async () => {
        setCurrentLoading(true);
        await authentication.post('auth/change_password?_method=PUT', { password_confirm, password_new, password_validation })
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setPasswordConfirm("");
            setPasswordValidation("");
            setPasswordNew("");
        }).catch(err => handleErrorRequest(err, setErrors))
        setCurrentLoading(false);
    }

    const isDisabled = !password_validation || !password_new || !password_confirm || !val_password_confimation();

    // render
    return (
        <Card className="tw-border-0 tw-shadow-md tw-rounded-xl tw-overflow-hidden">
            <CardHeader className="tw-bg-gradient-to-r tw-from-primary-500 tw-to-primary-600 tw-py-4">
                <CardTitle className="tw-text-white tw-text-base tw-font-medium tw-flex tw-items-center tw-gap-2">
                    <i className="fas fa-key"></i>
                    Cambiar Contraseña
                </CardTitle>
            </CardHeader>

            <CardContent className="tw-p-5 tw-space-y-4">
                {/* Contraseña actual */}
                <div className="tw-space-y-1.5">
                    <Label htmlFor="password_validation" className="tw-text-gray-700 tw-text-sm tw-font-medium">
                        Contraseña actual
                    </Label>
                    <Input
                        id="password_validation"
                        type="password"
                        placeholder="Ingrese su contraseña actual"
                        name="password_validation"
                        value={password_validation || ""}
                        onChange={({ target }) => handleInput(target, setPasswordValidation)}
                        disabled={current_loading}
                        className={cn(
                            "tw-h-10 tw-rounded-lg tw-border-gray-200",
                            errors.password_validation?.[0] && "tw-border-red-500"
                        )}
                    />
                    {errors.password_validation?.[0] && (
                        <p className="tw-text-xs tw-text-red-500">{errors.password_validation[0]}</p>
                    )}
                </div>

                {/* Contraseña nueva */}
                <div className="tw-space-y-1.5">
                    <Label htmlFor="password_new" className="tw-text-gray-700 tw-text-sm tw-font-medium">
                        Contraseña Nueva
                    </Label>
                    <Input
                        id="password_new"
                        type="password"
                        placeholder="Ingrese Contraseña Nueva"
                        name="password_new"
                        value={password_new || ""}
                        onChange={({ target }) => handleInput(target, setPasswordNew)}
                        disabled={current_loading || !password_validation}
                        className={cn(
                            "tw-h-10 tw-rounded-lg tw-border-gray-200",
                            errors.password_new?.[0] && "tw-border-red-500"
                        )}
                    />
                    {errors.password_new?.[0] && (
                        <p className="tw-text-xs tw-text-red-500">{errors.password_new[0]}</p>
                    )}
                </div>

                {/* Confirmar contraseña */}
                <div className="tw-space-y-1.5">
                    <Label htmlFor="password_confirm" className="tw-text-gray-700 tw-text-sm tw-font-medium">
                        Confirmar Contraseña Nueva
                    </Label>
                    <Input
                        id="password_confirm"
                        type="password"
                        placeholder="Confirmar Contraseña Nueva"
                        name="password_confirm"
                        value={password_confirm || ""}
                        onChange={({ target }) => handleInput(target, setPasswordConfirm)}
                        disabled={current_loading || !password_new}
                        className={cn(
                            "tw-h-10 tw-rounded-lg tw-border-gray-200",
                            !val_password_confimation() && "tw-border-red-500"
                        )}
                    />
                    {!val_password_confimation() && (
                        <p className="tw-text-xs tw-text-red-500">Las contraseñas no coinciden</p>
                    )}
                </div>

                {/* Botón */}
                <div className="tw-pt-3 tw-border-t tw-border-gray-100">
                    <Button
                        onClick={changePassword}
                        disabled={isDisabled || current_loading}
                        className={cn(
                            "tw-w-full tw-h-10 tw-rounded-lg tw-font-medium tw-bg-gradient-to-r tw-from-primary-500 tw-to-primary-600",
                            isDisabled && "tw-opacity-50"
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
            </CardContent>
        </Card>
    )
}

export default CardChangePassword;
