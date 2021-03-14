import React, { Component, useState } from 'react';
import { Form, Button } from 'semantic-ui-react'
import { authentication, handleErrorRequest } from '../services/apis';
import Swal from 'sweetalert2';

const CardChangePassword = () => {

    // estados
    const [password_validation, setPasswordValidation] = useState("");
    const [password_new, setPasswordNew] = useState("");
    const [password_confirm, setPasswordConfirm] = useState("");
    const [current_loading, setCurrentLoading] = useState("");
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
    
    // render
    return (
        <div className="card">
            <div className="card-header">
                <i className="fas fa-key"></i> Cambiar Contraseña
            </div>

            <div className="card-body">
                <Form>
                    <Form.Field error={errors.password_validation && errors.password_validation[0] ? true : false}>
                        <label htmlFor="">Contraseña actual</label>
                        <input type="password"
                            placeholder="Ingrese su contraseña actual"
                            name="password_validation"
                            value={password_validation || ""}
                            onChange={({ target }) => handleInput(target, setPasswordValidation)}
                            disabled={current_loading}
                        />
                        <label>{errors.password_validation && errors.password_validation[0] ? true : false}</label>
                    </Form.Field>

                    <Form.Field error={errors.password_new && errors.password_new[0] ? true : false}>
                        <label htmlFor="">Contraseña Nueva</label>
                        <input type="password"
                            placeholder="Ingrese Contraseña Nueva"
                            name="password_new"
                            value={password_new || ""}
                            onChange={({ target }) => handleInput(target, setPasswordNew)}
                            disabled={current_loading || !password_validation}
                        />
                        <label>{errors.password_new && errors.password_new[0] || ""}</label>
                    </Form.Field>

                    <Form.Field error={!val_password_confimation() ? true : false}>
                        <label htmlFor="">Confirmar Contraseña Nueva</label>
                        <input type="password"
                            placeholder="Confirmar Contraseña Nueva"
                            name="password_confirm"
                            value={password_confirm || ""}
                            onChange={({ target }) => handleInput(target, setPasswordConfirm)}
                            disabled={current_loading || !password_new}
                        />
                    </Form.Field>

                    <div className="text-right">
                        <hr/>
                        <Button color="teal"
                            disabled={!password_validation || !password_new || !password_confirm || !val_password_confimation()}
                            onClick={changePassword}
                            loading={current_loading ? true : false}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}


export default CardChangePassword;