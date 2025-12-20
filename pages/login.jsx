import React, { useState, useContext, useEffect } from 'react';
import { GUEST } from '../services/auth';
import { AppContext } from '../contexts/AppContext';
import Swal from 'sweetalert2';
import { authentication } from '../services/apis';
import Cookies from 'js-cookie';
import Show from '../components/show';
import Link from 'next/link';
import DownloadApps from '../components/downloadApps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const Login = () => {
    // app
    const app_context = useContext(AppContext);

    // estados
    const [show_password, setShowPassword] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [option, setOption] = useState("");

    // cambiar form
    const handleInput = ({ name, value }) => {
        const newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        const newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // authenticar usuario
    const login = async (e) => {
        setCurrentLoading(true);
        await authentication.post('login', form)
        .then(async res => {
            let { success, message, token } = res.data;
            if (!success) throw new Error(message);
            await Cookies.set('auth_token', token);
            localStorage.setItem('auth_token', token);
            history.go('/');
        })
        .catch(err => {
            try {
                setCurrentLoading(false);
                let { data } = err.response;
                if (typeof data != 'object') throw new Error(err.message);
                if (typeof data.errors != 'object') throw new Error(data.message);
                Swal.fire({ icon: 'warning', text: data.message });
                setErrors(data.errors || {});
            } catch (error) {
                Swal.fire({ icon: 'error', text: err.message })
            }
        });
    }

    // montar componente
    useEffect(() => {
        GUEST();
    }, []);

    const isButtonDisabled = current_loading || !form.password || !form.email;

    // render
    return (
        <>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div
                className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-5 tw-font-sans"
                style={{
                    background: `linear-gradient(135deg, rgba(52, 108, 176, 0.9) 0%, rgba(26, 54, 88, 0.95) 100%), url(${app_context.app?.cover || '/img/fondo.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                }}
            >
                <Card
                    className="tw-w-full tw-max-w-[420px] tw-bg-white/95 tw-backdrop-blur-xl tw-rounded-3xl tw-shadow-2xl tw-border-0"
                    style={{ animation: 'slideUp 0.6s ease-out' }}
                >
                    <CardHeader className="tw-text-center tw-pb-2">
                        {/* Logo */}
                        <a href={app_context.app?.support || '#'} className="tw-inline-block tw-mb-4">
                            <img
                                src={app_context.app?.icon_images?.icon_200x200 || '/img/base.png'}
                                alt={app_context.app?.name || "Integración"}
                                className="tw-w-20 tw-h-20 tw-rounded-2xl tw-object-contain tw-p-3 tw-bg-gradient-to-br tw-from-primary-500 tw-to-primary-800 tw-shadow-lg tw-shadow-primary-500/30 tw-mx-auto"
                            />
                        </a>
                        <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-2">
                            {app_context.app?.name || "Integración"}
                        </h1>
                        <p className="tw-text-sm tw-text-gray-500">
                            Ingresa tus credenciales para continuar
                        </p>
                    </CardHeader>

                    <CardContent className="tw-px-10 tw-pt-4">
                        <form onSubmit={(e) => { e.preventDefault(); login(); }}>
                            {/* Email */}
                            <div className="tw-mb-5">
                                <Label
                                    htmlFor="email"
                                    className={cn(
                                        "tw-mb-2 tw-block tw-text-[13px] tw-font-semibold tw-transition-colors",
                                        focusedField === 'email' ? 'tw-text-primary-500' : 'tw-text-gray-600'
                                    )}
                                >
                                    Correo Electrónico
                                </Label>
                                <div className="tw-relative">
                                    <i
                                        className={cn(
                                            "fas fa-envelope tw-absolute tw-left-4 tw-top-1/2 -tw-translate-y-1/2 tw-text-lg tw-transition-colors tw-z-10",
                                            focusedField === 'email' ? 'tw-text-primary-500' : 'tw-text-gray-400'
                                        )}
                                    />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        name="email"
                                        value={form.email || ""}
                                        onChange={({ target }) => handleInput(target)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        disabled={current_loading}
                                        className={cn(
                                            "tw-pl-12 tw-h-12 tw-text-[15px] tw-rounded-xl tw-border-2 tw-bg-gray-50 tw-transition-all",
                                            focusedField === 'email' && "tw-border-primary-500 tw-bg-white tw-ring-4 tw-ring-primary-500/10",
                                            errors.email?.[0] && "tw-border-red-500 tw-bg-red-50"
                                        )}
                                    />
                                </div>
                                {errors.email?.[0] && (
                                    <p className="tw-text-xs tw-text-red-500 tw-mt-1.5 tw-flex tw-items-center tw-gap-1">
                                        <i className="fas fa-exclamation-circle"></i>
                                        {errors.email[0]}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="tw-mb-6">
                                <Label
                                    htmlFor="password"
                                    className={cn(
                                        "tw-mb-2 tw-block tw-text-[13px] tw-font-semibold tw-transition-colors",
                                        focusedField === 'password' ? 'tw-text-primary-500' : 'tw-text-gray-600'
                                    )}
                                >
                                    Contraseña
                                </Label>
                                <div className="tw-relative">
                                    <i
                                        className={cn(
                                            "fas fa-lock tw-absolute tw-left-4 tw-top-1/2 -tw-translate-y-1/2 tw-text-lg tw-transition-colors tw-z-10",
                                            focusedField === 'password' ? 'tw-text-primary-500' : 'tw-text-gray-400'
                                        )}
                                    />
                                    <Input
                                        id="password"
                                        type={show_password ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        name="password"
                                        value={form.password || ""}
                                        onChange={({ target }) => handleInput(target)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        disabled={current_loading || !form.email}
                                        className={cn(
                                            "tw-pl-12 tw-pr-12 tw-h-12 tw-text-[15px] tw-rounded-xl tw-border-2 tw-bg-gray-50 tw-transition-all",
                                            focusedField === 'password' && "tw-border-primary-500 tw-bg-white tw-ring-4 tw-ring-primary-500/10",
                                            errors.password?.[0] && "tw-border-red-500 tw-bg-red-50"
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-bg-transparent tw-border-0 tw-text-gray-400 tw-cursor-pointer tw-p-1 tw-text-lg hover:tw-text-gray-600 tw-transition-colors"
                                        tabIndex={-1}
                                    >
                                        <i className={`fas fa-${show_password ? 'eye' : 'eye-slash'}`}></i>
                                    </button>
                                </div>
                                {errors.password?.[0] && (
                                    <p className="tw-text-xs tw-text-red-500 tw-mt-1.5 tw-flex tw-items-center tw-gap-1">
                                        <i className="fas fa-exclamation-circle"></i>
                                        {errors.password[0]}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isButtonDisabled}
                                className={cn(
                                    "tw-w-full tw-h-12 tw-text-base tw-font-semibold tw-rounded-xl tw-bg-gradient-to-r tw-from-primary-500 tw-to-primary-600 tw-shadow-lg tw-shadow-primary-500/40 tw-transition-all tw-duration-300",
                                    !isButtonDisabled && "hover:tw-shadow-xl hover:tw-shadow-primary-500/50 hover:-tw-translate-y-0.5",
                                    isButtonDisabled && "tw-opacity-60 tw-cursor-not-allowed tw-shadow-none"
                                )}
                            >
                                {current_loading ? (
                                    <>
                                        <Spinner size="sm" variant="white" className="tw-mr-2" />
                                        Verificando...
                                    </>
                                ) : (
                                    <>
                                        Iniciar Sesión
                                        <i className="fas fa-arrow-right tw-ml-2"></i>
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="tw-flex-col tw-px-10 tw-pb-8">
                        {/* Links */}
                        <div className="tw-w-full tw-pt-6 tw-border-t tw-border-gray-200">
                            <Link
                                href="/recovery_password"
                                className="tw-flex tw-items-center tw-justify-center tw-gap-1.5 tw-text-sm tw-text-primary-500 tw-font-medium tw-no-underline hover:tw-text-primary-600 tw-transition-colors"
                            >
                                <i className="fas fa-key"></i>
                                ¿Olvidaste tu contraseña?
                            </Link>

                            <div className="tw-flex tw-items-center tw-my-4">
                                <div className="tw-flex-1 tw-h-px tw-bg-gray-200"></div>
                                <span className="tw-px-3 tw-text-xs tw-text-gray-400">o</span>
                                <div className="tw-flex-1 tw-h-px tw-bg-gray-200"></div>
                            </div>

                            <button
                                onClick={() => setOption('APPS')}
                                className="tw-flex tw-items-center tw-justify-center tw-gap-1.5 tw-w-full tw-text-sm tw-text-primary-500 tw-font-medium tw-bg-transparent tw-border-0 tw-cursor-pointer hover:tw-text-primary-600 tw-transition-colors"
                            >
                                <i className="fas fa-th-large"></i>
                                Explorar más aplicaciones
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="tw-text-center tw-mt-6 tw-text-xs tw-text-gray-400">
                            © {new Date().getFullYear()} {app_context.app?.name || 'Integración'}
                            <br />
                            Todos los derechos reservados
                        </div>
                    </CardFooter>
                </Card>

                <Show condicion={option === 'APPS'}>
                    <DownloadApps isClose={() => setOption("")}/>
                </Show>
            </div>
        </>
    );
}

export default Login;
