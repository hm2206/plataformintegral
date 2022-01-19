import React, { useState, useContext, useEffect } from 'react';
import { GUEST } from '../services/auth';
import { AppContext } from '../contexts/AppContext';
import Swal from 'sweetalert2';
import { authentication } from '../services/apis';
import Cookies from 'js-cookie';
import Show from '../components/show';
import Link from 'next/link';
import DownloadApps from '../components/downloadApps';
import VerificarAuthentication from '../components/verificarAuthentication';
import { Form } from 'semantic-ui-react';


const Login = ({ pathname, query }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [option, setOption] = useState("VERIFICATION");
    const [show_password, setShowPassword] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false); 

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

    // limpiar verificatión
    const settingVerification = () => {
        setTimeout(() => {
            setOption('')
        }, 3000);
    }

    // montar componente
    useEffect(() => {
        settingVerification();
    }, []);

    // validar verificatión
    if (option == 'VERIFICATION') return <VerificarAuthentication my_app={app_context.app || {}}/>

    // render
    return (
        <div className="auth" style={{ minHeight: "100vh" }}>

            <header
                id="auth-header"
                className={`auth-header bg-default`}
                style={{ paddingTop: "3em", backgroundImage: `url(${app_context.app.cover && app_context.app.cover || '/img/fondo.jpg'})` }}
            >

                <a href={app_context.app && app_context.app.support}>
                    <img src={app_context.app && app_context.app.icon_images && app_context.app.icon_images.icon_200x200}
                        alt={app_context && app_context.app.name || "Integración"}
                        style={{ width: "120px", borderRadius: "0.5em", padding: '0.5em', background: '#fff' }}
                    />
                </a>
                
                <h4 style={{ textShadow: "1px 1px #346cb0" }}>{app_context && app_context.app.name || "Integración"}</h4>

                <h1>
                    <span className="sr-only">Iniciar Sesión</span>
                </h1>
                <p>
                    {" "}
                </p>
            </header>

            <form
                className="auth-form"
                onSubmit={(e) => e.preventDefault()}
            >
                <Form.Field className="form-group" error={errors.email && errors.email[0] || null}>
                    <div className="form-label-group">
                    <input
                        type="text"
                        id="inputUser"
                        className={`form-control`}
                        placeholder="Correo Electrónico"
                        name="email"
                        onChange={({ target }) => handleInput(target)}
                        value={form.email || ""}
                        disabled={current_loading}
                    />{" "}
                        <label htmlFor="inputUser">Correo</label>
                    </div>
                    <label className="text-danger">{errors.email && errors.email[0]}</label>
                </Form.Field>

                <Form.Field className="form-group" error={ errors.password && errors.password[0] || null}>
                    <div className="form-label-group">
                        <input
                            type={`${show_password ? 'text' : 'password'}`}
                            id="inputPassword"
                            className={`form-control`}
                            placeholder="Contraseña"
                            name="password"
                            onChange={({ target }) => handleInput(target)}
                            value={form.password || ""}
                            disabled={current_loading || !form.email}
                        />{" "}
                        <label htmlFor="inputPassword">Contraseña</label>
                        <span style={{ position: 'absolute', top: '10px', right: '10px' }} 
                            className="cursor-pointer"
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            <i className={`fas fa-${show_password ? 'eye' : 'eye-slash'}`}></i>
                        </span>
                    </div>
                    <label className="text-danger">{errors.password && errors.password[0]}</label>
                </Form.Field>

                <div className="form-group">
                    <button
                        disabled={current_loading || !form.password || !form.email}
                        className={`btn btn-lg btn-primary btn-block btn-default`}
                        onClick={login}
                    >
                        {current_loading ? "Verificando...." : "Iniciar Sesión"}
                        <i className="icon-circle-right2 ml-2"></i>
                    </button>
                </div>

                <div className="text-center pt-0">
                    <Link href="/recovery_password">
                        <a className="link">
                            Recuperar cuenta
                        </a>
                    </Link>

                    <br/>
                    <br/>

                    <a className="link" style={{ cursor: 'pointer' }} onClick={(e) => {
                        e.preventDefault();
                        setOption('APPS')
                    }}>
                        <i className="fa fa-box mr-1"></i> Más apps
                    </a>
                </div>
            </form>

            <footer className="auth-footer text-center">
                {" "}
                © 2019 - {new Date().getFullYear()} {app_context?.app?.name} | Todos Los Derechos Reservados <a href="#">Privacidad</a> y
                <a href="#">Terminos</a>
            </footer>

            <Show condicion={option == 'APPS'}>
                <DownloadApps isClose={(e) => setOption("")}/>
            </Show>
        </div>
    )
}

// server
Login.getInitialProps = async (ctx) => {
    GUEST(ctx);
    let { query, pathname } = ctx;
    return { pathname, query };
}

// exportar
export default Login;
