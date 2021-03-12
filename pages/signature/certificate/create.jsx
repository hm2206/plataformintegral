import React, { useEffect, useContext, useState } from 'react';
import { Body, BtnBack, InputFile } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { signature } from '../../../services/apis';
import { AppContext } from '../../../contexts/AppContext';
import { backUrl, Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Button, Form } from 'semantic-ui-react';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import AssignPerson from '../../../components/authentication/user/assignPerson';
import { EntityContext } from '../../../contexts/EntityContext';

const CreateCertificate = () => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // datos
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [person, setPerson] = useState({});
    const isPerson = Object.keys(person).length;
    const [option, setOption] = useState("");

    // primera carga
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // change form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // agregar persona
    const getAdd = (obj) => {
        setPerson(obj);
        setOption("");
    }

    // guardar area
    const saveCertificate = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar el certificado?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            let newForm = new FormData();
            newForm.append("person_id", person.id);
            newForm.append("pfx", form.pfx);
            newForm.append("image", form.image);
            newForm.append("password", form.password);
            newForm.append("password_confirmation", form.password_confirmation)
            await signature.post('certificate', newForm)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                    setPerson({});
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { message, errors } = err.response.data;
                        if (typeof errors != 'object') throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                        setErrors(errors || {});
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                })
        }
    }

    // render
    return (
        <div className="col-md-12">
            <Body>
                <div className="card-">
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(Router.pathname))}/> Crear Certificado
                    </div>
                    <div className="card-body">
                        <div className="row justify-content-center">
                            <div className="col-md-9">
                                <Form>
                                    <div className="row">

                                        <Show condicion={isPerson}>
                                            <div className="col-md-6 mb-4">
                                                <label htmlFor="">Apellidos y Nombres</label>
                                                <input type="text"
                                                    value={person.fullname}
                                                    readOnly
                                                />
                                            </div>

                                            <div className="col-md-6 mb-4">
                                                <label htmlFor="">N° Documento</label>
                                                <input type="text"
                                                    value={person.document_number}
                                                    readOnly
                                                />
                                            </div>
                                        </Show>

                                        <div className="col-md-12 mb-4">
                                            <Button onClick={(e) => setOption("assign")}>
                                                <i className={`fas fa-${isPerson ? 'sync' : 'plus'}`}></i> {isPerson ? 'Cambiar' : 'Asignar'}
                                            </Button>
                                        </div>

                                        <div className="col-md-12 mb-4">
                                            <hr/>
                                        </div>

                                        <div className="col-md-6 mb-4">
                                            <Form.Field error={errors.pfx && errors.pfx[0] || ""}>
                                                <InputFile
                                                    id="file_pfx"
                                                    name="pfx"
                                                    title="Seleccionar Pfx"
                                                    label="Archivo Pfx"
                                                    icon="signature"
                                                    onChange={(obj) => handleInput({ name: obj.name, value: obj.file })}
                                                />
                                                <label htmlFor="">{errors.pfx && errors.pfx[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-4">
                                            <Form.Field error={errors.image && errors.image[0] || ""}>
                                                <InputFile
                                                    id="file_image"
                                                    name="image"
                                                    title="Seleccionar Imagen"
                                                    label="Imagen para la Firma"
                                                    accept="image/*"
                                                    onChange={(obj) => handleInput({ name: obj.name, value: obj.file })}
                                                />
                                                <label htmlFor="">{errors.image && errors.image[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-4">
                                            <Form.Field error={errors.password && errors.password[0] || ""}>
                                                <label htmlFor="">Contraseña</label>
                                                <input type="password"
                                                    name="password"
                                                    value={form.password || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                <label htmlFor="">{errors.password && errors.password[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-4">
                                            <Form.Field  error={errors.password && errors.password[0] || ""}>
                                                <label htmlFor="">Confirmar Contraseña</label>
                                                <input type="password"
                                                    name="password_confirmation"
                                                    value={form.password_confirmation || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                <label htmlFor="">{errors.password && errors.password[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-12">
                                            <hr/>

                                            <div className="text-right">
                                                <Button color="teal" onClick={saveCertificate}
                                                    disabled={!isPerson}
                                                >
                                                    <i className="fas fa-save"></i> Guardar
                                                </Button>
                                            </div>
                                        </div>                                        
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </Body>

            <Show condicion={option == 'assign'}>
                <AssignPerson
                    local={true}
                    getAdd={getAdd}
                    isClose={(e) => setOption("")}
                />
            </Show>
        </div>
    )
}

// rendering server
CreateCertificate.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query } = ctx; 
    // response
    return { query };
}

export default CreateCertificate;