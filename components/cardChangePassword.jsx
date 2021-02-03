import React, { Component } from 'react';
import { Form, Button } from 'semantic-ui-react'
import { authentication } from '../services/apis';
import Swal from 'sweetalert2';

export default class CardChangePassword extends Component
{

    state = {
        loader: false,
        password_validation: "",
        password_new: "",
        password_confirm: "",
        errors: {}
    }

    handleInput = ({ name, value }) => {
        this.setState(state => {
            state.errors[name] = "";
            return { [name]: value, errors: state.errors };
        });
    }

    val_password_confimation = () => {
        let { password_confirm, password_new } = this.state;
        return password_confirm ? password_new == password_confirm : true;
    }

    changePassword = async () => {
        this.props.fireLoading(true);
        let { password_confirm, password_new, password_validation } = this.state;
        // send request
        await authentication.post('auth/change_password', { password_confirm, password_new, password_validation })
        .then(res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            Swal.fire({ icon: 'success', text: message })
            this.setState({ password_confirm: "", password_new: "", password_validation: "" });
        }).catch(err => {
            try {
                let response = JSON.parse(err.message);
                Swal.fire({ icon: 'warning', text: response.message });
                this.setState({ errors: response.errors });
            } catch (error) {
                Swal.fire({ icon: 'error', text: err.message });                
            }
        })
        this.props.fireLoading(false);
    }

    render() {

        let { password_validation, password_new, password_confirm, loader, errors } = this.state;

        return (
            <div className="card">
                <div className="card-header">
                    <i className="fas fa-key"></i> Cambiar Contraseña
                </div>

                <div className="card-body">
                    <Form>
                        <Form.Field error={errors.password_validation && errors.password_validation[0] || ""}>
                            <label htmlFor="">Contraseña actual</label>
                            <input type="password"
                                placeholder="Ingrese su contraseña actual"
                                name="password_validation"
                                value={password_validation || ""}
                                onChange={(e) => this.handleInput(e.target)}
                                disabled={loader}
                            />
                            <label>{errors.password_validation && errors.password_validation[0] || ""}</label>
                        </Form.Field>

                        <Form.Field error={errors.password_new && errors.password_new[0] || ""}>
                            <label htmlFor="">Contraseña Nueva</label>
                            <input type="password"
                                placeholder="Ingrese Contraseña Nueva"
                                name="password_new"
                                value={password_new || ""}
                                onChange={(e) => this.handleInput(e.target)}
                                disabled={loader || !password_validation}
                            />
                            <label>{errors.password_new && errors.password_new[0] || ""}</label>
                        </Form.Field>

                        <Form.Field error={!this.val_password_confimation()}>
                            <label htmlFor="">Confirmar Contraseña Nueva</label>
                            <input type="password"
                                placeholder="Confirmar Contraseña Nueva"
                                name="password_confirm"
                                value={password_confirm || ""}
                                onChange={(e) => this.handleInput(e.target)}
                                disabled={loader || !password_new}
                            />
                        </Form.Field>

                        <div className="text-right">
                            <hr/>
                            <Button color="teal"
                                disabled={!password_validation || !password_new || !password_confirm || !this.val_password_confimation()}
                                onClick={this.changePassword}
                            >
                                <i className="fas fa-save"></i> Guardar
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }

}