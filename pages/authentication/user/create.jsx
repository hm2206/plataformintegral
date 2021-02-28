import React, { useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import Router from 'next/router';
import { Form, Button } from 'semantic-ui-react'
import { authentication, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import AssignPerson from '../../../components/authentication/user/assignPerson';
import {  AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl'
import { Confirm } from '../../../services/utils';


const CreateUser = ({ pathname, query }) => {

    // estados
    const [person, setPerson] = useState({});
    const isPerson = Object.keys(person).length;
    const [current_loading, setCurrentLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({});
    const [option, setOption] = useState("");

    // manejador de cambio del form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // guardar datos
    const save = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en guardar los datos?', 'Estoy seguro')
        if (!answer) return false;
        let payload = Object.assign({}, form);
        payload.redirect = `${location.origin}/login`;
        payload.person_id = person.id
        await authentication.post('register', payload)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setErrors({});
            setForm({});
            setPerson({});
        })
        .catch(async err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }


    const getAdd = async (obj) => {
        setPerson(obj)
        setOption("");
    }

    // validar envio
    const validate = () => {
        let { username, email, password, confirm_password } = form;
        return username && email && password && password == confirm_password;
    }

    // validar contraseña
    const validatePassword = () => {
        let { password } = form;
        let message = "";
        if (password && password.length < 8) message =  "La contraseña debe contener al menos 8 caracteres!";
        else if(password && password.length >= 8) {
            if (!/[A-Z]/.test(password)) message = "La contraseña debe contener al menos una mayúscula";
            else if (!/[0-9]/.test(password)) message = "La contraseña debe contener al menos un valor numérico";
        }
        // sin errores
        return message;
    }

    // validar contraseña de confirmación
    const validateConfirmPassword = () => {
        let { password, confirm_password } = form;
        let message = "";
        if (password != confirm_password) return "La confirmación es incorrecta!";
        return message;
    }

    // render
    return (
        <div className="col-md-12">
            <BoardSimple
                prefix={<BtnBack/>}
                title="Usuario"
                info={["Crear usuario"]}
                bg="light"
                options={[]}
            >
                <Form className="card-body">
                    <div className="row justify-content-center">
                        <div className="col-md-9">
                            <div className="row justify-content-end">
                                <div className="col-md-12 mb-4">
                                    <h4><i className="fas fa-fingerprint"></i> Seleccionar Persona</h4>
                                    <hr/>

                                    <div className="row">
                                        <Show condicion={!isPerson}>
                                            <div className="col-md-4">
                                                <Button
                                                    disabled={current_loading}
                                                    onClick={(e) => setOption("ASSIGN")}
                                                >
                                                    <i className="fas fa-plus"></i> Asignar
                                                </Button>
                                            </div>
                                        </Show>

                                        <Show condicion={isPerson}>
                                            <div className="col-md-4 mb-3">
                                                <Form.Field>
                                                    <label htmlFor="">Tip. Documento</label>
                                                    <input value={person.document_type && person.document_type.name || ""} readOnly/>
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-4">
                                                <Form.Field>
                                                    <label htmlFor="">N° Documento</label>
                                                    <input type="text"
                                                        value={person.document_number || ""}
                                                        readOnly
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-4">
                                                <Form.Field>
                                                    <label htmlFor="">Apellidos y Nombres</label>
                                                    <input type="text"
                                                        className="capitalize"
                                                        value={person.fullname || ""}
                                                        readOnly
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-4">
                                                <Button
                                                    onClick={(e) => setOption("ASSIGN")}
                                                    disabled={current_loading}
                                                >
                                                    <i className="fas fa-sync"></i> Cambiar
                                                </Button>
                                            </div>
                                        </Show>
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <hr/>
                                    <h4><i className="fas fa-user"></i> Datos del usuario</h4>
                                    <hr/>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field error={errors && errors.username && errors.username[0]}>
                                        <label htmlFor="">Username <b className="text-red">*</b></label>
                                        <input type="text" 
                                            name="username"
                                            disabled={current_loading}
                                            placeholder="Ingrese un username"
                                            value={form.username || ""}
                                            onChange={(e) => handleInput(e.target)}
                                        />
                                        <label>{errors && errors.username && errors.username[0]}</label>
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field  error={errors && errors.email && errors.email[0]}>
                                        <label htmlFor="">Email <b className="text-red">*</b></label>
                                        <input type="text"
                                            name="email"
                                            value={form.email || ""}
                                            disabled={current_loading}
                                            placeholder="Ingrese un correo eléctronico válido"
                                            onChange={(e) => handleInput(e.target)}
                                        />
                                        <label>{errors && errors.email && errors.email[0]}</label>
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field  error={errors && errors.password && errors.password[0] || validatePassword()}>
                                        <label htmlFor="">Contraseña <b className="text-red">*</b></label>
                                        <input type="password"
                                            placeholder="Ingrese una contraseña"
                                            name="password"
                                            disabled={current_loading}
                                            onChange={(e) => handleInput(e.target)}
                                            value={form.password || ""}
                                        />
                                        <label>{errors && errors.password && errors.password[0] || validatePassword()}</label>
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field  error={errors && errors.confirm_password && errors.confirm_password[0] || validateConfirmPassword()}>
                                        <label htmlFor="">Confirmar Contraseña <b className="text-red">*</b></label>
                                        <input type="password"
                                            placeholder="Confirme la contraseña"
                                            name="confirm_password"
                                            disabled={current_loading}
                                            value={form.confirm_password || ""}
                                            onChange={(e) => handleInput(e.target)}
                                        />
                                        <label>{errors && errors.confirm_password && errors.confirm_password[0] || validateConfirmPassword()}</label>
                                    </Form.Field>
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            </BoardSimple>

            {/* panel de control */}
            <ContentControl>
                <div className="col-lg-2 col-6">
                    <Button color="teal" fluid
                        disabled={current_loading || !validate() || !isPerson}
                        onClick={save}
                        loading={current_loading}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </ContentControl>

            <Show condicion={option == 'ASSIGN'}>
                <AssignPerson
                    getAdd={getAdd}
                    isClose={(e) => setOption("")}
                />
            </Show>
        </div>
    )
}

// server
CreateUser.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query }
}

// exportar
export default CreateUser;