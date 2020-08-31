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
        code: "",
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
                return { time: 0 };
            })
        }, 1000);
    }

    readyCode = () => {
        this.setState({ block: true });
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

        let { errors, send, time } = this.state;
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
                                    <Show condicion={time}>
                                        <small>Volver a reenviar codigo en {time} seg</small>
                                    </Show>

                                    <Show condicion={!time}>
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault();
                                            this.send();
                                        }}>Reenviar Código</a>
                                    </Show>
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

                            <span className={errors && errors.code && errors.code[0] ? 'form-error' : ''}>
                                <label class="d-block text-left mt-3" for="inputUser">Código de Verificación</label> 
                                <input type="text"  class="form-control form-control-lg" required="" autofocus=""
                                    name="code"
                                    value={this.state.code}
                                    placeholder="Ingrese el código de 8 dígitos"
                                    onChange={(e) => this.handleInput(e.target)}
                                />
                                <b>{errors && errors.code && errors.code[0]}</b>
                            </span>
                        </Show>
                    </div>
                    {/* <!-- actions --> */}
                        <Show condicion={!this.state.block}>
                            <button class={`btn btn-lg btn-block ${send ? 'btn-outline-primary' : 'btn-primary'}`} 
                                onClick={send ? this.readyCode : this.send}
                                disabled={this.state.loading || !this.state.email}
                            >
                                { send ? <span>Ya tengo el código <i className="ml-2 fas fa-arrow-right"></i></span> : 'Restablecer la contraseña' }
                            </button>
                        </Show>
            
                        <Show condicion={this.state.block}>
                            <div class="d-block d-md-inline-block mb-2">
                                <button class="btn btn-lg btn-block btn-primary" 
                                    onClick={this.resetPassword}
                                    disabled={this.state.loading || !this.state.email || !this.state.password || !this.state.password_confirmation}
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

}