import React, { useEffect, useContext, useState } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import moment from 'moment';
import { unujobs } from '../../services/apis';
import { Confirm, parseOptions } from '../../services/utils';
import Swal from 'sweetalert2';
import Show from '../../components/show';
import Router from 'next/router';
import { SelectBanco, SelectAfp } from '../select/cronograma';
import { AppContext } from '../../contexts/AppContext'

const  General = ({ work }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [person, setPerson] = useState(JSON.parse(JSON.stringify(work.person)) || {});
    const [current_work, setCurrentWork] = useState(work || {});
    const [edit, setEdit] = useState(false);

    const handleInput = ({ name, value }) => {
        let newObject = Object.assign({}, current_work);
        newObject[name] = value;
        setCurrentWork(newObject);
        setEdit(true);
    }

    const leaveForm = async (e) => {
        e.preventDefault();
        let answer = await Swal.fire({
            icon: 'warning',
            text: "¿Está seguro en cancelar la edición?",
            confirmButtonText: "Continuar",
            showCancelButton: true
        });
        // verify
        if (answer) {
            setCurrentWork(JSON.parse(JSON.stringify(work)))
            setEdit(false);
        }
    }

    const updateWork = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en guardar los datos?`, 'Estoy Seguro')
        if (answer) {
            app_context.setCurrentLoading(true);
            let payload = {};
            payload.fecha_de_ingreso = current_work.fecha_de_ingreso || "";
            payload.banco_id = current_work.banco_id || "";
            payload.numero_de_cuenta = current_work.numero_de_cuenta || "";
            payload.afp_id = current_work.afp_id || "";
            payload.numero_de_cussp = current_work.numero_de_cussp || "";
            payload.fecha_de_afiliacion = current_work.fecha_de_ingreso || "";
            payload.fecha_de_essalud = current_work.fecha_de_essalud || "";
            payload.prima_seguro = current_work.prima_seguro ? 1 : 0;
            payload._method = 'PUT';
            await unujobs.post(`work/${work.id}`, payload)
            .then(res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                setEdit(false);
                Swal.fire({ icon: 'success', text: message });
            })
            .catch(err => {
                try {
                    app_context.setCurrentLoading(false);
                    let { data } = err.response;
                    if (!data) throw new Error(err.message);
                    let { message, errors } = data;
                    if (!errors) throw new Error(message);
                    Swal.fire({ icon: 'warning', text: message });
                } catch (error) {
                    Swal.fire({ icon: 'error', text: error.message });
                }
            });
        }
    }

    // render
    return (
        <Form>
            <div className="row">
                <div className="col-md-12 mb-4">
                    <h4><i className="fas fa-info-circle"></i> Datos Generales del Trabajador</h4>
                </div>

                <div className="col-md-4">
                    <div>
                        <b><i className="fas fa-place"></i> Ubicación</b>
                        <hr/>
                    </div>
                    <iframe src={`https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d63151.44781604753!2d-74.58435273334369!3d-8.405050255752414!3m2!1i1024!2i768!4f13.1!2m1!1s${person && person.address}!5e0!3m2!1ses!2spe!4v1586299621785!5m2!1ses!2spe`} 
                        frameborder="0" 
                        style={{ border: "0px", width: "100%", height: "200px" }}
                        aria-hidden="false" 
                        tabindex="0"
                    />
                </div>

                    <div className="col-md-8">
                        <b><i className="fas fa-user"></i> Datos Personales</b>
                        <hr/>
                        <div className="row">
                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Prefijo</label>
                                    <input type="text" className="uppercase" value={person.profession} readOnly={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Nombre Completo</label>
                                    <input type="text" className="uppercase" value={person.fullname} readOnly={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Tipo. Documento</label>
                                    <input type="text" className="uppercase" value={person.document_type} readOnly={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Documento</label>
                                    <input type="text" value={person.document_number} readOnly={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Genero <b className="text-red">*</b></label>
                                    <Select placeholder="Select. Ubigeo" 
                                        value={person.gender}
                                        name="gender"
                                        disabled
                                        onChange={(e, obj) => this.handleInput(obj, 'person')}
                                        options={[
                                            { key: "M", value: "M", text: "Masculino" },
                                            { key: "F", value: "F", text: "Femenino" },
                                            { key: "I", value: "I", text: "No Binario" }
                                        ]}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Fecha de Nacimiento</label>
                                    <input type="date" value={moment.utc(person.date_of_birth).format('YYYY-MM-DD')} readOnly={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-12 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Ubigeo <b className="text-red">*</b></label>
                                    <input type="text" readOnly value={
                                        `${person && person.departamento || ""} - ${person && person.provincia || ""} - ${person && person.distrito || ""}`
                                    }/>
                                </Form.Field>
                            </div>

                            <div className="col-md-12 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Dirección</label>
                                    <input type="text" 
                                        value={person.address || ""}
                                        name="address"
                                        readOnly
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Telefono</label>
                                    <input type="tel" 
                                        value={person.phone || ""}
                                        name="phone"
                                        readOnly
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Correo de Contacto</label>
                                    <input type="email" 
                                        value={person.email_contact || ""}
                                        name="email_contact"
                                        readOnly
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-12 mb-4 mt-4 text-right col-6">
                                <hr/>
                            </div>

                            <div className="col-md-12">
                                <h4><i className="fas fa-file-alt"></i> Datos del Trabajador</h4>
                                <hr/>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Fecha de Ingreso</label>
                                    <input type="date" 
                                        value={current_work.fecha_de_ingreso || ""}
                                        name="fecha_de_ingreso"
                                        onChange={(e) => handleInput(e.target)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Banco <b className="text-red">*</b></label>
                                    <SelectBanco
                                        value={current_work.banco_id}
                                        name="banco_id"
                                        onChange={(e, data) => handleInput(data)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Cuenta</label>
                                    <input type="text" 
                                        value={current_work.numero_de_cuenta || ""}
                                        name="numero_de_cuenta"
                                        onChange={(e) => handleInput(e.target)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Ley Social <b className="text-red">*</b></label>
                                    <SelectAfp
                                        name="afp_id"
                                        value={current_work.afp_id}
                                        onChange={(e, data) => handleInput(data)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Cussp</label>
                                    <input type="text" 
                                        value={current_work.numero_de_cussp || ""}
                                        name="numero_de_cussp"
                                        onChange={(e) => handleInput(e.target)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Fecha de Afiliación</label>
                                    <input type="date" 
                                        value={current_work.fecha_de_afiliacion || ""}
                                        name="fecha_de_afiliacion"
                                        onChange={(e) => handleInput(e.target)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Essalud</label>
                                    <input type="text" 
                                        value={current_work.numero_de_essalud || ""}
                                        name="numero_de_essalud"
                                        onChange={(e) => handleInput(e.target)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Prima Seguro</label>
                                    <Select
                                        options={[
                                            {key: "0", value: 0, text: "No Afecto"},
                                            {key: "1", value: 1, text: "Afecto"}
                                        ]}
                                        placeholder="Select. Prima Seguro"
                                        value={current_work.prima_seguro}
                                        name="prima_seguro"
                                        onChange={(e, obj) => handleInput(obj)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-12 mt-4 text-right col-12">
                                <Show condicion={edit}>
                                    <div className="row">
                                        <div className="col-6">
                                            <Button color="red"
                                                fluid
                                                onClick={leaveForm}
                                            >
                                                <i className="fas fa-trash-alt"></i> Cancelar Cambios
                                            </Button>
                                        </div>
                                        <div className="col-6">
                                            <Button color="teal"
                                                fluid
                                                onClick={updateWork}
                                            >
                                                <i className="fas fa-save"></i> Actualizar Información
                                            </Button>
                                        </div>
                                    </div>
                                </Show>
                                
                                <hr/>
                            </div>
                        </div>
                    </div>
                </div>
            </Form>
        );
}

// export 
export default General;