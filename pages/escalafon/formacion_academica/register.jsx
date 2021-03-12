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
import { SelectDependencia, SelectDependenciaPerfilLaboral } from '../../../components/select/authentication';
import AssignTrabajadorEntity from '../../../components/contrato/assingTrabajadorEntity';
import { EntityContext } from '../../../contexts/EntityContext';


const RegisterFormacionAcademica = () => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

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
    }, [entity_context.entity_id])

    // setting
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
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
        let answer = await Confirm("warning", "¿Estas seguro en guardar la formación académica?", "Estoy Seguro");
        if (answer) {
            app_context.setCurrentLoading(true);
            let newForm = new FormData;
            newForm.append('work_id', person.id);
            for(let key in form) {
                newForm.append(key, form[key]);
            }
            // send
            await escalafon.post('grado', newForm)
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setPerson({});
                setForm({});
            }).catch(err => {
                try {
                    app_context.setCurrentLoading(false);
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
                        <span className="ml-3">Regístrar Formación Académica</span>
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
                                        <i className="fas fa-info-circle mr-1"></i> Información de la Formación Académica
                                        <hr/>
                                    </div>    
                                </div>

                                <div className="col-md-10">
                                    <div className="card-body">
                                        <div className="row w-100 justify-content-center">
                                            <div className="col-md-6 mb-2">
                                                <Form.Field error={errors.institution && errors.institution[0] ? true : null}>
                                                    <label htmlFor="">Institución <b className="text-red">*</b></label>
                                                    <input type="text"
                                                        value={`${form.institution || ""}`}
                                                        name="institution"
                                                        onChange={({ target }) => handleInput(target)}
                                                    />
                                                   <label htmlFor="">{errors.institution && errors.institution[0] || null}</label>
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-6 mb-2">
                                                <Form.Field error={errors.numero_de_registro && errors.numero_de_registro[0] || null}>
                                                    <label htmlFor="">N° Registro <b className="text-red">*</b></label>
                                                    <input type="text"
                                                        name="numero_de_registro"
                                                        value={form.numero_de_registro || ""}
                                                        onChange={(e) => handleInput(e.target)}
                                                        disabled={app_context.isLoading}
                                                    />
                                                    <label htmlFor="">{errors.numero_de_registro && errors.numero_de_registro[0] || ""}</label>
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-6 mb-2">
                                                <Form.Field error={errors.grado && errors.grado[0] || null}>
                                                    <label htmlFor="">Estudio/Grado <b className="text-red">*</b></label>
                                                    <Select
                                                        name="grado"
                                                        placeholder="Seleccionar"
                                                        options={[
                                                            { key: "INICIAL", value: "INICIAL", text: "INICIAL" },
                                                            { key: "PRIMARIA", value: "PRIMARIA", text: "PRIMARIA" },
                                                            { key: "SECUNDARIA", value: "SECUNDARIA", text: "SECUNDARIA" },
                                                            { key: "BACHILLER", value: "BACHILLER", text: "BACHILLER" },
                                                            { key: "TITULADO", value: "TITULADO", text: "TITULADO" },
                                                            { key: "MAGISTER", value: "MAGISTER", text: "MAGISTER" },
                                                            { key: "DOCTORADO", value: "DOCTORADO", text: "DOCTORADO" },
                                                            { key: "OTROS", value: "OTROS", text: "OTROS" }
                                                        ]}
                                                        value={`${form.grado || ""}`}
                                                        onChange={(e, obj) => handleInput(obj)}
                                                        disabled={app_context.isLoading}
                                                    />
                                                    <label htmlFor="">{errors.grado && errors.grado[0] || ""}</label>
                                                </Form.Field>
                                            </div>
                                            
                                            <div className="col-md-6 mb-2">
                                                <Form.Field error={errors.fecha_de_titulo && errors.fecha_de_titulo[0] || null}>
                                                    <label htmlFor="">Fecha de titulo</label>
                                                    <input type="date"
                                                        name="fecha_de_titulo"
                                                        value={form.fecha_de_titulo || ""}
                                                        onChange={(e) => handleInput(e.target)}
                                                        disabled={app_context.isLoading}
                                                    />
                                                    <label htmlFor="">{errors.fecha_de_titulo && errors.fecha_de_titulo[0] || ""}</label>
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
                <AssignTrabajadorEntity
                    getAdd={getAdd}
                    local={true}
                    isClose={(e) => setOption("")}
                />
            </Show>
    </Fragment>
    );
}

// server
RegisterFormacionAcademica.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    // response
    return { query, pathname };
}
 
// exportar
export default RegisterFormacionAcademica;