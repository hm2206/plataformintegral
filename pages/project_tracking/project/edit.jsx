import React, { useContext, useEffect, useState } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import { AppContext } from '../../../contexts/AppContext';
import { backUrl, Confirm } from '../../../services/utils';
import { Body, BtnBack } from '../../../components/Utils';
import atob from 'atob';
import Router from 'next/router';
import { Form, Button } from 'semantic-ui-react';
import Show from '../../../components/show'
import Swal from 'sweetalert2';

//  componente principal
const EditProject = ({ success, project }) => {

    // app
    const app_context = useContext(AppContext);

    // state
    const [form, setForm] = useState({});
    const [old, setOld] = useState({});
    const [current_keyword, setCurrentKeyword] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [edit, setEdit] = useState(false);

    // primera carga
    useEffect(() => {
        app_context.fireEntity({ render: true, disabled: true });
        // setting 
        if (success) {
            setForm(project);
            setOld(JSON.parse(JSON.stringify(project)));
            setKeywords(project.keywords);
        }
    }, []);

    // change form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        setEdit(true);
    }

    // change current_keyword
    const handleInputKeyword = ({ value }) => {
        setCurrentKeyword(value);
        setEdit(true);
    }

    // agregar palabra clave
    const addKeyword = () => {
        let newKeywords = JSON.parse(JSON.stringify(keywords));
        newKeywords.push(current_keyword);
        setKeywords(newKeywords);
        setCurrentKeyword("");
        setEdit(true);
    }

    // quitar palabra clave
    const leaveKeyword = async (index, name) => {
        let answer = await Confirm('warning', `Estás seguro en eliminar la palabra clave "${name}"`, 'Eliminar');
        if (answer) {
            let newKeywords = JSON.parse(JSON.stringify(keywords));
            newKeywords.splice(index, 1);
            setKeywords(newKeywords);
        }
    }
        
    // guardar proyect
    const saveProject = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar el proyecto?`);
        if (answer) {
            app_context.fireLoading(true);
            let newForm = Object.assign({}, form);
            newForm.keywords = JSON.stringify(keywords);
            await projectTracking.post('project', newForm)
                .then(res => {
                    app_context.fireLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setCurrentKeyword("");
                    setForm({});
                    setKeywords([]);
                }).catch(err => {
                    app_context.fireLoading(false);
                    let { message, errors } = err.response.data;
                    Swal.fire({ icon: 'warning', text: message });
                }).catch(err => {
                    Swal.fire({ icon: 'error', text: err.message });
                });
        }
    }

    // cancelar
    const cancelProject = async () => {
        setEdit(false);
        setForm(JSON.parse(JSON.stringify(old)));
        setKeywords(old.keywords);
    }

    // render
    return (
        <div className="col-md-12">
            <Body>
                <div className="card-">
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push({ pathname: backUrl(Router.pathname) })}/> Editar Proyecto: <b className="capitalize text-primary"><u>"{project && project.title}"</u></b>
                    </div>
                    <div className="card-body">
                        <div className="row justify-content-center">
                        <div className="col-md-9">
                                <Form>
                                    <div className="row">
                                        <div className="col-md-12 mb-4">
                                            <Form.Field>
                                                <label>Titulo de Proyecto</label>
                                                <input type="text"
                                                    placeholder="ingrese el titulo del proyecto"
                                                    value={form.title || ""}
                                                    name="title"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-12 mb-4">
                                            <Form.Field>
                                                <label>Objectivo General</label>
                                                <textarea
                                                    placeholder="ingrese el objectivo general del proyecto"
                                                    value={form.general_object || ""}
                                                    name="general_object"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-4">
                                            <Form.Field>
                                                <label>Fecha de Inicio</label>
                                                <input type="date"
                                                    value={form.date_start || ""}
                                                    name="date_start"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-4">
                                            <Form.Field>
                                                <label>Duración</label>
                                                <input type="number"
                                                    value={form.duration || ""}
                                                    name="duration"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-4">
                                            <Form.Field>
                                                <label>Costo del Proyecto</label>
                                                <input type="number"
                                                    value={form.monto || ""}
                                                    name="monto"
                                                    step="any"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-12 mb-4">
                                            <div className="card">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-10 mb-3">
                                                            <Form.Field>
                                                                <label>Palabra clave</label>
                                                                <input type="text"
                                                                    value={current_keyword}
                                                                    placeholder="ingrese la palabra clave"
                                                                    onChange={(e) => handleInputKeyword(e.target)}
                                                                />
                                                            </Form.Field>
                                                        </div>

                                                        <div className="col-md-2 mb-3">
                                                            <Form.Field>
                                                                <label htmlFor="">Agregar</label>
                                                                <Button fluid 
                                                                    basic 
                                                                    color="green"
                                                                    onClick={addKeyword}
                                                                    disabled={!current_keyword}
                                                                >
                                                                    <i className="fas fa-plus"></i>
                                                                </Button>
                                                            </Form.Field>
                                                        </div>

                                                        <div className="col-md-12">
                                                            <Show condicion={keywords.length}>
                                                                <div>
                                                                    <small><b>Click para eliminar la palabra clave</b></small>
                                                                </div>
                                                            </Show>

                                                            {keywords.map((k, indexK) => 
                                                                <span title="Eliminar" 
                                                                    className="badge badge-dark mr-1 ml-1" 
                                                                    style={{ cursor: 'pointer' }}
                                                                    key={`keyword-${k}`}
                                                                    onClick={(e) => leaveKeyword(indexK, k)}
                                                                >
                                                                    {k}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <hr/>

                                            <div className="text-right">
                                                <Button color="red" disabled={!edit} onClick={cancelProject}>
                                                    <i className="fas fa-times"></i> Cancelar
                                                </Button>

                                                <Button color="teal" disabled={!edit} onClick={saveProject}>
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
        </div>
    )
}

// server rendering
EditProject.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let id = atob(ctx.query.id) || '__error';
    let { success, project } = await projectTracking.get(`project/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => err.response.data)
        .catch(err => ({ success: false }));
    // response
    return { success, project: project || {} };
}

export default EditProject;