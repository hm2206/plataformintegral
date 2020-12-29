import React, { useState, Fragment, useContext, useEffect } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, DropZone } from '../../../components/Utils';
import ContentControl from '../../../components/contentControl';
import Show from '../../../components/show';
import { escalafon } from '../../../services/apis';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import AssignContrato from '../../../components/contrato/assingContrato';  
import { AppContext } from '../../../contexts/AppContext';
import { SelectTypeCategoria } from '../../../components/select/cronograma';


const RegisterAscenso = () => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [person, setPerson] = useState({});
    const isPerson = Object.keys(person).length;
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [option, setOption] = useState("");

    // config cambio de entity
    useEffect(() => {
        setForm({});
        setPerson({});
    }, [app_context.entity_id])

    // setting
    useEffect(() => {
        app_context.fireEntity({ render: true });
    }, [])

    // obtener datos del trabajador
    const getAdd = async (obj) => {
        setPerson(obj);
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
        let answer = await Confirm("warning", "¿Estas seguro en guardar el ascenso?", "Estoy Seguro");
        if (answer) {
            app_context.fireLoading(true);
            let newForm = new FormData;
            newForm.append('info_id', person.id);
            for(let key in form) {
                newForm.append(key, form[key]);
            }
            // send
            await escalafon.post('ascenso', newForm)
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setPerson({});
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
                        <span className="ml-3">Regístrar Ascenso de Personal</span>
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
                                        <Show condicion={!isPerson}>
                                            <div className="col-md-4">
                                                <Button
                                                    onClick={(e) => setOption('ASSIGN')}
                                                >
                                                    <i className="fas fa-plus"></i> Asignar Personal
                                                </Button>
                                            </div>
                                        </Show>

                                        <Show condicion={isPerson}>
                                            <div className="col-md-4 mb-2">
                                                <Form.Field>
                                                    <label htmlFor="">Tip. Documento</label>
                                                    <input type="text"
                                                        value={person.person && person.person.document_type  || ""}
                                                        disabled
                                                        readOnly
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-4 mb-2">
                                                <Form.Field>
                                                    <label htmlFor="">N° Documento</label>
                                                    <input type="text"
                                                        value={person.person && person.person.document_number  || ""}
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
                                                        value={person.person && person.person.fullname || ""}
                                                        disabled
                                                        readOnly
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-4 mb-2">
                                                <Form.Field>
                                                    <label htmlFor="">Meta Pres.</label>
                                                    <input type="text"
                                                        value={person.meta && person.meta && person.meta.metaID || ""}
                                                        disabled
                                                        readOnly
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-4 mb-2">
                                                <Form.Field>
                                                    <label htmlFor="">Partición Pres.</label>
                                                    <input type="text"
                                                        value={person.cargo && person.cargo && person.cargo.descripcion || ""}
                                                        disabled
                                                        readOnly
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-4 mb-2">
                                                <Form.Field>
                                                    <label htmlFor="">Tip. Categoría</label>
                                                    <input type="text"
                                                        value={person.type_categoria && person.type_categoria && person.type_categoria.descripcion || ""}
                                                        disabled
                                                        readOnly
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-4 mt-1">
                                                <Button onClick={(e) => setOption("ASSIGN")}>
                                                    <i className="fas fa-sync"></i> Cambiar Personal
                                                </Button>
                                            </div>
                                        </Show>
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <div>
                                        <hr/>
                                        <i className="fas fa-info-circle mr-1"></i> Información del Ascenso de Personal
                                        <hr/>
                                    </div>    
                                </div>

                                <div className="col-md-10">
                                    <div className="card-body">
                                        <div className="row w-100 justify-content-center">
                                            <div className="col-md-6 mb-3">
                                                <Form.Field error={errors.resolucion && errors.resolucion[0] || null}>
                                                    <label htmlFor="">N° Resolución <b className="text-red">*</b></label>
                                                    <input type="text"
                                                        name="resolucion"
                                                        value={form.resolucion || ""}
                                                        onChange={(e) => handleInput(e.target)}
                                                        disabled={app_context.isLoading}
                                                    />
                                                    <label htmlFor="">{errors.resolucion && errors.resolucion[0] || null}</label>
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <Form.Field error={errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] || null}>
                                                    <label htmlFor="">Fecha Resolución <b className="text-red">*</b></label>
                                                    <input type="date"
                                                        name="fecha_de_resolucion"
                                                        value={form.fecha_de_resolucion || ""}
                                                        onChange={(e) => handleInput(e.target)}
                                                        disabled={app_context.isLoading}
                                                    />
                                                    <label htmlFor="">{errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] || null}</label>
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <Form.Field error={errors.type_categoria_id && errors.type_categoria_id[0] || null}>
                                                    <label htmlFor="">Tip. Categoría <b className="text-red">*</b></label>
                                                    <SelectTypeCategoria
                                                        name="type_categoria_id"
                                                        value={`${form.type_categoria_id || ""}`}
                                                        onChange={(e, obj) => handleInput(obj)}
                                                    />
                                                        <label htmlFor="">{errors.type_categoria_id && errors.type_categoria_id[0] || null}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <Form.Field error={errors.fecha_inicio && errors.fecha_inicio[0] || null}>
                                                        <label htmlFor="">Fecha Inicio <b className="text-red">*</b></label>
                                                        <input type="date"
                                                            name="fecha_inicio"
                                                            value={form.fecha_inicio || ""}
                                                            onChange={(e) => handleInput(e.target)}
                                                            disabled={app_context.isLoading}
                                                        />
                                                        <label htmlFor="">{errors.fecha_inicio && errors.fecha_inicio[0] || null}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-12 mb-3">
                                                    <Form.Field error={errors.descripcion && errors.descripcion[0] || null}>
                                                        <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                                        <textarea type="text"
                                                            name="descripcion"
                                                            rows="3"
                                                            value={form.descripcion || ""}
                                                            onChange={(e) => handleInput(e.target)}
                                                            disabled={app_context.isLoading}
                                                        />
                                                        <label htmlFor="">{errors.descripcion && errors.descripcion[0] || null}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-12 mb-3">
                                                    <Form.Field error={errors.file && errors.file[0] || null}>
                                                        <label htmlFor="">Archivo</label>
                                                        <Show condicion={!form.file}
                                                            predeterminado={
                                                                <div className="card card-body">
                                                                    <div className="row">
                                                                        <div className="col-md-10">
                                                                            {form.file && form.file.name}
                                                                        </div>
                                                                        <div className="col-md-2 text-right">
                                                                            <button className="btn btn-sm btn-red"
                                                                                onClick={(e) => handleInput({ name: 'file', value: null })}
                                                                            >
                                                                                <i className="fas fa-trash"></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }
                                                        >
                                                            <DropZone
                                                                title="Seleccionar Archivo"
                                                                accept="application/pdf"
                                                                multiple={false}
                                                                id="file"
                                                                name="file"
                                                                onChange={({ name, files }) => handleInput({ name, value: files[0] })}
                                                            />
                                                        </Show>
                                                        <label htmlFor="">{errors.file && errors.file[0] || null}</label>
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
                    <Button fluid color="teal" 
                        disabled={!isPerson}
                        onClick={create}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </ContentControl>

            <Show condicion={option == 'ASSIGN'}>
                <AssignContrato
                    getAdd={getAdd}
                    local={true}
                    isClose={(e) => setOption("")}
                />
            </Show>
    </Fragment>
    );
}

// server
RegisterAscenso.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    // response
    return { query, pathname };
}
 
// exportar
export default RegisterAscenso;