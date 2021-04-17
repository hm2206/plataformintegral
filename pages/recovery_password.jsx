import React, { useState, useContext, useRef } from 'react';
import Link from 'next/link';
import { authentication, handleErrorRequest } from '../services/apis';
import Swal from 'sweetalert2';
import Show from '../components/show';
import { GUEST } from '../services/auth';
import Router from 'next/dist/client/router';
import { AppContext } from '../contexts/AppContext';
import { useEffect } from 'react';


const RecoveryPassword = ({ pathname, query }) => {

    // app
    const { app } = useContext(AppContext);
 
    // estados
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password_confirmation, setPasswordConfirmation] = useState("");
    const [code, setCode] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [redirect, setRedirect] = useState("");
    const [reset_password, setResetPassword] = useState("");
    const [error, setError] = useState(false);
    const [time, setTime] = useState(0);
    const [errors, setErrors] = useState({});
    const [is_code, setIsCode] = useState(false);
    const [is_send, setIsSend] = useState(false);

    let timeInterval = useRef();
    
    // tiempo de espera de envio
    const countTime = () => setTime(prev => prev - 1);

    // generar password
    const generatePassword = async () => {
        setCurrentLoading(true);
        await authentication.post('recovery_password', { email })
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message }); 
            setIsSend(true);
            setTime(30);
            timeInterval.current = setInterval(countTime, 1000);
        })
        .catch(err => handleErrorRequest((error) => Swal.fire({ icon: 'error', text: error.message })));
        setCurrentLoading(false);
    }

    // reset
    const resetPassword = async () => {
        setCurrentLoading(true);
        let payload = {
            email,
            password,
            password_confirmation,
            code,
            redirect,
        }
        // request
        await authentication.post('reset_password', payload)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message }); 
            Router.push('/login');
        }).catch(err => handleErrorRequest(err, (error) => {
            Swal.fire({ icon: 'error', text: error.message });
        }));
        setCurrentLoading(false);
    }

    // remove interval
    const removeInterval = () => {
        if (timeInterval.current) clearInterval(timeInterval.current);
    }

    // detener timer
    useEffect(() => {
        if (!time) removeInterval();
    }, [time]);

    // desmontar
    useEffect(() => {
        return () =>  removeInterval();
    }, []);

    // render
    return (
        <div className="auth" style={{ height: "100vh" }}>
            <div class="auth-form auth-form-reflow">
                <div class="text-center mb-4 mt-5 pt-5">
                    <div class="mb-4">
                        <img 
                            style={{ 
                                width: "75px", height: "75px",
                                borderRadius: "0.7em",
                                border: "4px solid #fff",
                                boxShadow: "10px 10px rgba(0, 0, 0, .15)",
                                objectFit: "contain",
                                background: "#346cb0",
                                padding: "0.35em"
                            }}
                            src={app.icon && app.icon_images && app.icon_images.icon_200x200 || '/img/base.png'} 
                            alt="logo"
                        />
                    </div>
                    <h1 class="h3"> {is_code ? 'Cambiar Contraseña' : 'Restablecer su contraseña'} </h1>
                </div>
                <Show condicion={!is_code}>
                    <p class="mb-4">Si se olvidó su contraseña, usted puede restablecer enviandonos su correo electrónico o Nombre de usuario.</p>
                </Show>
                <div class="form-group mb-4">
                    <label class="d-block text-left" for="inputUser">Correo electrónico o Nombre de usuario</label> 
                    <input type="text" id="inputUser" className="form-control form-control-lg"
                        name="email"
                        placeholder="Ejemplo@ejemplo.com"
                        value={email || ""}
                        onChange={({ target }) => setEmail(target.value)}
                        disabled={current_loading || is_send}
                    />

                    <Show condicion={!is_code}>
                        <p class="text-muted">
                            <Show condicion={!is_send}>
                                <small>Le enviaremos un código de recuperación a su correo electrónico.</small>
                            </Show>
                            <Show condicion={is_send}>
                                <Show condicion={time}>
                                    <small>Volver a reenviar codigo en {time} seg</small>
                                </Show>

                                <Show condicion={!time}>
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        generatePassword();
                                    }}>Reenviar Código</a>
                                </Show>
                            </Show>
                        </p>
                    </Show>

                    <Show condicion={is_code}>
                        <span className={errors && errors.password && errors.password[0] ? 'form-error' : ''}>
                            <label class="d-block text-left mt-3" for="inputUser">Nueva Contraseña</label> 
                            <input type="password"  class="form-control form-control-lg" required="" autofocus=""
                                name="password"
                                value={password}
                                onChange={({ target }) => setPassword(target.value)}
                            />
                            <b>{errors && errors.password && errors.password[0]}</b>
                        </span>
                        
                        <span className={errors && errors.password && errors.password[0] ? 'form-error' : ''}>
                            <label class="d-block text-left mt-3" for="inputUser">Confirmar Nueva Contraseña</label> 
                            <input type="password"  class="form-control form-control-lg" required="" autofocus=""
                                name="password_confirmation"
                                value={password_confirmation}
                                onChange={({ target }) => setPasswordConfirmation(target.value)}
                            />
                            <b>{errors && errors.password && errors.password[0]}</b>
                        </span>

                        <span className={errors && errors.code && errors.code[0] ? 'form-error' : ''}>
                            <label class="d-block text-left mt-3" for="inputUser">Código de Verificación</label> 
                            <input type="text"  class="form-control form-control-lg" required="" autofocus=""
                                name="code"
                                value={code}
                                placeholder="Ingrese el código de 8 dígitos"
                                onChange={({ target }) => setCode(target.value)}
                            />
                            <b>{errors && errors.code && errors.code[0]}</b>
                        </span>
                    </Show>
                </div>
                {/* <!-- actions --> */}
                <Show condicion={!is_code}>
                    <button class={`btn btn-lg btn-block ${true ? 'btn-outline-primary' : 'btn-primary'}`} 
                        onClick={() => is_send ? setIsCode(true) : generatePassword()}
                        disabled={current_loading || !email}
                    >
                        { is_send ? <span>Ya tengo el código <i className="ml-2 fas fa-arrow-right"></i></span> : 'Restablecer la contraseña' }
                    </button>
                </Show>
    
                <Show condicion={is_code}>
                    <div class="d-block d-md-inline-block mb-2">
                        <button class="btn btn-lg btn-block btn-primary" 
                            onClick={resetPassword}
                            disabled={current_loading || !email || !password || !password_confirmation}
                        >
                            Cambiar Contraseña
                        </button>
                    </div>
                </Show>
                <br/>
                <div class="d-block d-md-inline-block">
                    <Link href="/login">
                        <a class="btn btn-block btn-light">Regresar a iniciar sesión</a>
                    </Link>
                </div>
            </div>
        </div>
    )
}

// server
RecoveryPassword.getInitialProps = (ctx) => {
    GUEST(ctx);
    let { query, pathname } = ctx;
    return { query, pathname };
}

// exportar
export default RecoveryPassword;