import React, { Component, Fragment, useState, useEffect, useContext } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import ContentControl from '../../../components/contentControl';
import Show from '../../../components/show';
import { escalafon } from '../../../services/apis';
import { parseUrl, Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import AssignPerson from '../../../components/authentication/user/assignPerson'
import AssignTrabajador from '../../../components/contrato/assingTrabajador';
import { AppContext } from '../../../contexts/AppContext';


const RegisterFamiliar = () => {
    
    // app
    const app_context = useContext(AppContext);

    // estados
    const [work, setWork] = useState({});
    const isWork = Object.keys(work).length;
    const [familiar, setFamiliar] = useState({});
    const isFamiliar = Object.keys(familiar).length;
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [option, setOption] = useState("");

    // config cambio de entity
    useEffect(() => {
        setForm({});
        setWork({});
        setFamiliar({});
    }, [app_context.entity_id])

    // setting
    useEffect(() => {
        app_context.fireEntity({ render: true });
    }, [])

    // obtener datos del trabajador
    const getAdd = async (obj) => {
        setWork(obj);
        setOption("");
    }

    // obtener datos de la persona
    const getPersonAdd = async (obj) => {
        setFamiliar(obj);
        setOption("");
    }

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // crear ascenso
    const create = async () => {
        let answer = await Confirm("warning", "¿Estas seguro en guardar el familiar?", "Estoy Seguro");
        if (answer) {
            app_context.fireLoading(true);
            let newForm = new FormData;
            newForm.append('work_id', work.id);
            newForm.append('person_id', familiar.id);
            for(let key in form) {
                newForm.append(key, form[key]);
            }
            // send
            await escalafon.post('familiar', newForm)
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setWork({});
                setFamiliar({});
                setForm({});
            }).catch(err => {
                try {
                    app_context.fireLoading(false);
                    let { message, errors } = err.response.data;
                    if (!errors) throw new Error(message || err.message);
                    Swal.fire({ icon: 'warning', text: message });
                    setErrors(errors);
                } catch (error) {
                    Swal.fire({ icon: 'error', text: error.message });
                }
            });
        }
    }

    // render
    return (
        <Fragment>
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <span className="ml-3">Regístrar Familiar del Trabajador</span>
                    </div>
                </Body>
            </div>

            <div className="col-md-12 mt-2">
                <Body>
                    <div className="card-body">
                        <Form onSubmit={(e) => e.preventDefault()}>

                            <div className="row justify-content-center">
                                <div className="col-md-12 mb-4">
                                    <div className="row">
                                        <Show condicion={!isWork}>
                                            <div className="col-md-4">
                                                <Button
                                                    disabled={app_context.isLoading}
                                                    onClick={(e) => setOption('ASSIGN')}
                                                >
                                                    <i className="fas fa-plus"></i> Asignar Personal
                                                </Button>
                                            </div>
                                        </Show>

                                        <Show condicion={isWork}>
                                            <div className="col-md-4 mb-2">
                                                <Form.Field>
                                                    <label htmlFor="">Tip. Documento</label>
                                                    <input type="text"
                                                        value={work.person && work.person.document_type  || ""}
                                                        disabled
                                                        readOnly
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-4 mb-2">
                                                <Form.Field>
                                                    <label htmlFor="">N° Documento</label>
                                                    <input type="text"
                                                        value={work.person && work.person.document_number  || ""}
                                                        disabled
                                                        readOnly
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-4 mb-2">
                                                <Form.Field>
                                                    <label htmlFor="">Apellidos y Nombres</label>
                                                    <input type="text"
                                                        className="uppercase"
                                                        value={work.person && work.person.fullname || ""}
                                                        disabled
                                                        readOnly
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-4 mt-1">
                                                <Button
                                                    onClick={(e) => setOption('ASSIGN')}
                                                    disabled={app_context.isLoading}
                                                >
                                                    <i className="fas fa-sync"></i> Cambiar Personal
                                                </Button>
                                            </div>
                                        </Show>
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <div>
                                        <hr/>
                                        <i className="fas fa-info-circle mr-1"></i> Información del Familiar
                                        <hr/>
                                    </div>
                                </div>

                                <div className="col-md-10">
                                    <div className="card-body">
                                        <div className="row w-100">
                                            <div className={`col-md-${isFamiliar ? '4' : '12'} mb-3`}>
                                                <Form.Field>
                                                    <label htmlFor="">Persona</label>
                                                    <Show condicion={isFamiliar}>
                                                        <input type="text" disabled className="uppercase" readOnly value={familiar && familiar.fullname || ""}/>
                                                    </Show>
                                                    <Show condicion={!isFamiliar}>
                                                        <Button onClick={(e) => setOption('FAMILIAR')}>
                                                            <i className="fas fa-plus"></i> Agregar Persona
                                                        </Button>
                                                    </Show>
                                                </Form.Field>
                                            </div>

                                            <Show condicion={isFamiliar}>
                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">N° Documento</label>
                                                        <input type="text" disabled readOnly className="uppercase" value={familiar && familiar.document_number || ""}/>
                                                    </Form.Field>
                                                </div>
                                            </Show>

                                            <Show condicion={isFamiliar}>
                                                <div className="col-md-1">
                                                    <Button className="mt-4" onClick={(e) => setOption('FAMILIAR')}>
                                                        <i className="fas fa-sync"></i>
                                                    </Button>
                                                </div>
                                            </Show>

                                            <div className="col-md-6 mb-2">
                                                <Form.Field>
                                                    <label htmlFor="">Tipo de Familiar</label>
                                                    <Select
                                                        name="type"
                                                        value={form.type || ""}
                                                        onChange={(e, data) => handleInput(data)}
                                                        placeholder="Seleccionar Tip. Familiar"
                                                        options={[
                                                            { key: "SON", value: 'CHILD', text: 'HIJO(A)' },
                                                            { key: "PARENT", value: 'PARENT', text: 'CONYUGUE' }
                                                        ]}
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-6 mb-2">
                                                <Form.Field>
                                                    <label htmlFor="">Descripción</label>
                                                    <input type="text"
                                                        name="descripcion"
                                                        value={form.descripcion || ""}
                                                        onChange={({ target }) => handleInput(target)}
                                                    />
                                                </Form.Field>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </Body>
            </div>

            <ContentControl>
                <div className="col-lg-2 col-6">
                    <Button fluid color="blue" 
                        disabled={app_context.isLoading || !isWork}
                        onClick={create}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </ContentControl>

            <Show condicion={option == 'ASSIGN'}>
                <AssignTrabajador
                    getAdd={getAdd}
                    local={true}
                    isClose={(e) => setOption("")}
                />
            </Show>

            <Show condicion={option == 'FAMILIAR'}>
                <AssignPerson
                    local={true}
                    getAdd={getPersonAdd}
                    isClose={(e) => setOption("")}
                />
            </Show>
        </Fragment>
    )
}

// server 
RegisterFamiliar.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    // response
    return { query, pathname }
}

// export 
export default RegisterFamiliar;
