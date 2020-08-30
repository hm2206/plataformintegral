import React, { Component } from 'react';
import { app } from '../env.json';
import Link from 'next/link';
import { authentication } from '../services/apis';
import Swal from 'sweetalert2';
import Show from '../components/show';
import { GUEST } from '../services/auth';
import Router from 'next/dist/client/router';

export default class RecoveryPassword extends Component {

    state = {
        email: "",
        password: "",
        password_confirmation: "",
        loading: false,
        redirect: "",
        block: false,
        reset_password: "",
        error: false,
        send: false,
        time: 0,
        errors: {}
    }

    static getInitialProps = async (ctx) => {
        await GUEST(ctx);
        let { query, pathname } = ctx;
        return { query, pathname }
    }

    componentDidMount = () => {
        this.setting(this.props.query);
        if (typeof location == 'object') {
            this.setState({ redirect: `${location.origin}/recovery_password` });
        }
    }

    setting = (query) => {
        this.setState({
            block: query.reset_password ? true : false,
            email: query.email || "",
            reset_password: query.reset_password || ""
        })
    }

    handleInput = ({ name, value }) => {
        this.setState(state => {
            state.errors[name] = null;
            return { [name]: value, errors: state.errors }
        });
    }

    countTime = () => {
        this.setState({ time: 30 });
        this.timer = setInterval(() => {
            this.setState(state => {
                if (state.time > 0) {
                    return { time: state.time - 1 };
                }
                // response
                clearInterval(this.timer);
                return { time: 0, send: false };
            })
        }, 1000);
    }

    send = async () => {
        this.setState({ loading: true });
        await authentication.post('recovery_password', this.state)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message }); 
            if (success) {
                this.setState({ send: true });
                this.countTime();
            }
        })
        .catch(err => Swal.fire({ icon: 'error', text: 'Algo salió mal' }));
        this.setState({ loading: false });
    }

    resetPassword = async () => {
        this.setState({ loading: true });
        this.state.reset_password = this.state.reset_password.replace(" ", "+");
        await authentication.post('reset_password', this.state)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message }); 
            Router.push('/login');
        })
        .catch(async err => {
            try {
                let response = JSON.parse(err.message);
                this.setState({ errors: response.errors || {} });
                Swal.fire({ icon: 'warning', text: response.message });
            } catch (error) {
                await Swal.fire({ icon: 'error', text: err.message });
            }
        });
        this.setState({ loading: false });
    }

    render() {

        let { errors } = this.state;
        let { app } = this.props;

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
                        <h1 class="h3"> {this.state.block ? 'Cambiar Contraseña' : 'Restablecer su contraseña'} </h1>
                    </div>
                    <Show condicion={!this.state.block}>
                        <p class="mb-4">Si se olvidó su contraseña, usted puede restablecer enviandonos su correo electrónico o Nombre de usuario.</p>
                    </Show>
                    <Show condicion={this.state.block}>
                        <p class="mb-4">Ingrese una nueva contraseña</p>
                    </Show>
                    <div class="form-group mb-4">
                        <label class="d-block text-left" for="inputUser">Correo electrónico o Nombre de usuario</label> 
                        <input type="text" id="inputUser" class="form-control form-control-lg" required="" autofocus=""
                            name="email"
                            placeholder="Ejemplo@ejemplo.com"
                            value={this.state.email || ""}
                            onChange={(e) => this.handleInput(e.target)}
                            disabled={this.state.loading || this.state.block || this.state.send}
                        />
                        <Show condicion={!this.state.block}>
                            <p class="text-muted">
                                <Show condicion={!this.state.send}>
                                    <small>Le enviaremos un enlace para restablecer la contraseña a su correo electrónico.</small>
                                </Show>
                                <Show condicion={this.state.send}>
                                    <small>Volver a reenviar codigo en {this.state.time} seg</small>
                                </Show>
                            </p>
                        </Show>

                        <Show condicion={this.state.block}>
                            <span className={errors && errors.password && errors.password[0] ? 'form-error' : ''}>
                                <label class="d-block text-left mt-3" for="inputUser">Nueva Contraseña</label> 
                                <input type="password"  class="form-control form-control-lg" required="" autofocus=""
                                    name="password"
                                    value={this.state.password}
                                    onChange={(e) => this.handleInput(e.target)}
                                />
                                <b>{errors && errors.password && errors.password[0]}</b>
                            </span>
                            
                            <span className={errors && errors.password && errors.password[0] ? 'form-error' : ''}>
                                <label class="d-block text-left mt-3" for="inputUser">Confirmar Nueva Contraseña</label> 
                                <input type="password"  class="form-control form-control-lg" required="" autofocus=""
                                    name="password_confirmation"
                                    value={this.state.password_confirmation}
                                    onChange={(e) => this.handleInput(e.target)}
                                />
                                <b>{errors && errors.password && errors.password[0]}</b>
                            </span>
                        </Show>
                    </div>
                    {/* <!-- actions --> */}
                        <div class="d-block d-md-inline-block mb-2">
                            <Show condicion={!this.state.block}>
                                <button class="btn btn-lg btn-block btn-primary" 
                                    onClick={this.send}
                                    disabled={this.state.loading || !this.state.email || this.state.send}
                                >
                                    Restablecer la contraseña
                                </button>
                            </Show>
                            <Show condicion={this.state.block}>
                                <button class="btn btn-lg btn-block btn-primary" 
                                    onClick={this.resetPassword}
                                    disabled={this.state.loading || !this.state.email || !this.state.password || !this.state.password_confirmation}
                                >
                                   Cambiar Contraseña
                                </button>
                            </Show>
                        </div>
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

}