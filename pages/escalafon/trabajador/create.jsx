import React, { Fragment, useState } from 'react';
import {  BtnBack } from '../../../components/Utils';
import { Confirm, parseUrl } from '../../../services/utils';
import { Form, Button, Checkbox, Message } from 'semantic-ui-react'
import { escalafon, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import AssignPerson from '../../../components/authentication/user/assignPerson';
import { AUTHENTICATE } from '../../../services/auth';
import { SelectAfp, SelectBanco } from '../../../components/select/escalafon';
import BoardSimple from '../../../components/boardSimple'
import ContentControl from '../../../components/contentControl';
import Router from 'next/router';
import CreatePerson from '../../../components/authentication/person/createPerson'


const CreateWork = ({ pathname, query }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [option, setOption] = useState("");
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [person, setPerson] = useState({});
    let isPerson = Object.keys(person).length;

    // manejador de cambios del form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // obtener persona
    const handleAdd = async (obj) => {
        setPerson(obj)
        setOption("");
        setErrors({ ...errors, person_id: [] });
    }

    // guardar datos
    const save = async () => {
        let answer = await Confirm('warning', '¿Desea guardar los datos?', 'Aceptar');
        if (!answer) return false;
        setCurrentLoading(true);
        let payload = Object.assign({}, form);
        payload.person_id = person.id;
        payload.orden = person.fullname;
        await escalafon.post('works', payload)
        .then(async res => {
            let { message, work } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
            setPerson({});
            if (Object.keys(work || {}).length) {
                let idWork = btoa(work.id);
                let href = btoa(location.href);
                let newQuery = { id: idWork, href };
                let newPath = parseUrl(pathname, `profile`);
                Router.push({ pathname: newPath, query: newQuery })
            }
        })
        .catch(err => handleErrorRequest(err, setErrors))
        setCurrentLoading(false);
    }

    // renderizado
        return (
            <Fragment>
                <div className="col-md-12">
                    <BoardSimple
                        title={<span>Trabajador</span>}
                        info={["Crear trabajador"]}
                        options={[]}
                        prefix={<BtnBack/>}
                        bg="light"
                    >
                        <div className="card-body">
                            <Form className="row justify-content-center">
                                <div className="col-md-9">
                                    <div className="row justify-content-end">
                                        <div className="col-md-12 mb-4">
                                            <h4><i className="fas fa-fingerprint"></i> Seleccionar Persona</h4>
                                            <hr/>

                                            <div className="row">
                                                <Show condicion={!isPerson}>
                                                    <div className="col-md-4">
                                                        <Button color="green"
                                                            basic
                                                            disabled={current_loading}
                                                            onClick={(e) => setOption("CREATE")}
                                                        >
                                                            <i className="fas fa-plus"></i> Nueva Persona
                                                        </Button>

                                                        <Button
                                                            disabled={current_loading}
                                                            onClick={(e) => setOption("ASSIGN")}
                                                        >
                                                            <i className="fas fa-arrow-down"></i> Asignar
                                                        </Button>
                                                    </div>
                                                </Show>

                                                <Show condicion={isPerson}>
                                                    <div className="col-md-4 mb-3">
                                                        <Form.Field>
                                                            <label htmlFor="">Tip. Documento</label>
                                                            <input
                                                                readOnly
                                                                value={person.document_type && person.document_type.name || ""}
                                                            />
                                                        </Form.Field>
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <Form.Field>
                                                            <label htmlFor="">N° Documento</label>
                                                            <input type="text"
                                                                value={person.document_number || ""}
                                                                readOnly
                                                            />
                                                        </Form.Field>
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <Form.Field>
                                                            <label htmlFor="">Apellidos y Nombres</label>
                                                            <input type="text"
                                                                className="uppercase"
                                                                value={person.fullname || ""}
                                                                readOnly
                                                            />
                                                        </Form.Field>
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <Button color="red"
                                                            basic
                                                            onClick={(e) => setPerson({})}
                                                            disabled={current_loading}
                                                        >
                                                            <i className="fas fa-times"></i> Cancelar 
                                                        </Button>

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

                                        {/* mensaje */}
                                        <div className="col-md-12">
                                            <Show condicion={errors.person_id && errors.person_id[0]}>
                                                <Message color="red">
                                                    <Message.Header>
                                                        {errors.person_id && errors.person_id[0]}
                                                    </Message.Header>
                                                </Message>
                                            </Show>
                                        </div>

                                        <div className="col-md-12">
                                            <hr/>
                                            <h4><i className="fas fa-praying-hands"></i> Datos del Trabajador</h4>
                                            <hr/>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <Form.Field error={errors.fecha_de_ingreso && errors.fecha_de_ingreso[0] ? true : false}>
                                                <label htmlFor="">Fecha de Ingreso <b className="text-red">*</b></label>
                                                <input type="date" 
                                                    name="fecha_de_ingreso"
                                                    value={form.fecha_de_ingreso}
                                                    onChange={(e) => handleInput(e.target)}
                                                    disabled={current_loading}
                                                />
                                                <label>{errors.fecha_de_ingreso && errors.fecha_de_ingreso[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-2">
                                            <Form.Field error={errors.numero_de_essalud && errors.numero_de_essalud[0] ? true : false}>
                                                <label htmlFor="">N° de Essalud</label>
                                                <input type="text" 
                                                    placeholder="Ingrese su autogenerado de essalud"
                                                    value={form.numero_de_essalud || ""} 
                                                    name="numero_de_essalud"
                                                    onChange={(e) => handleInput(e.target)}
                                                    disabled={current_loading}
                                                />
                                                <label>{errors.numero_de_essalud && errors.numero_de_essalud[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <Form.Field error={errors.banco_id && errors.banco_id[0] ? true : false}>
                                                <label htmlFor="">Tip. Banco <b className="text-red">*</b></label>
                                                <SelectBanco
                                                    name="banco_id"
                                                    value={form.banco_id || ""}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                    disabled={current_loading}
                                                />
                                                <label>{errors.banco_id && errors.banco_id[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <Form.Field error={errors.numero_de_cuenta && errors.numero_de_cuenta[0] ? true : false}>
                                                <label htmlFor="">N° Cuenta</label>
                                                <input
                                                    type="text"
                                                    name="numero_de_cuenta"
                                                    value={form.numero_de_cuenta || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                    disabled={current_loading}
                                                />
                                                <label>{errors.numero_de_cuenta && errors.numero_de_cuenta[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <Form.Field error={errors.afp_id && errors.afp_id[0] ? true : false}>
                                                <label htmlFor="">Tip. AFP <b className="text-red">*</b></label>
                                                <SelectAfp
                                                    name="afp_id"
                                                    value={form.afp_id}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                    disabled={current_loading}
                                                />
                                                <label>{errors.afp_id && errors.afp_id[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <Form.Field error={errors.numero_de_cussp && errors.numero_de_cussp[0] ? true : false}>
                                                <label htmlFor="">N° de Cussp</label>
                                                <input type="text"
                                                    name="numero_de_cussp"
                                                    value={form.numero_de_cussp}
                                                    onChange={(e) => handleInput(e.target)}
                                                    disabled={current_loading}
                                                />
                                                <label>{errors.numero_de_cussp && errors.numero_de_cussp[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <Form.Field error={errors.fecha_de_afiliacion && errors.fecha_de_afiliacion[0] ? true : false}>
                                                <label htmlFor="">Fecha de Afiliación</label>
                                                <input type="date" 
                                                    name="fecha_de_afiliacion"
                                                    value={form.fecha_de_afiliacion}
                                                    onChange={(e) => handleInput(e.target)}
                                                    disabled={current_loading}
                                                />
                                                <label>{errors.fecha_de_afiliacion && errors.fecha_de_afiliacion[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <Form.Field error={errors.prima_seguro && errors.prima_seguro[0] ? true : false}>
                                                <label htmlFor="">Prima Seguro</label>
                                                <Checkbox
                                                    toggle
                                                    name="prima_seguro"
                                                    disabled={current_loading}
                                                    checked={form.prima_seguro ? true : false}
                                                    onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                />
                                                <label>{errors.prima_seguro && errors.prima_seguro[0]}</label>
                                            </Form.Field>
                                        </div>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </BoardSimple>

                    <Show condicion={option == 'ASSIGN'}>
                        <AssignPerson
                            getAdd={handleAdd}
                            isClose={(e) => setOption("")}
                        />
                    </Show>

                    <Show condicion={option == 'CREATE'}>
                        <CreatePerson 
                            onSave={handleAdd}
                            onClose={() => setOption('')}
                        />
                    </Show>
                </div>

                {/* panel de control */}
                <ContentControl>
                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="teal"
                            disabled={current_loading}
                            onClick={save}
                            loading={current_loading}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </ContentControl>
        </Fragment>
    )
}

// server
CreateWork.getInititalProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query }
}

// exportar
export default CreateWork;