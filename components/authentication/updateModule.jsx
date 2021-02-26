import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { List, Form, Button, Message } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import { authentication, handleErrorRequest } from '../../services/apis';
import { Confirm } from '../../services/utils';
import Show from '../show';

const animations = {
    delete: 'animate__animated animate__lightSpeedOutRight',
    render: 'animate__animated animate__fadeInLeft'
}

const UpdateModule = ({ disabled = false, module = {}, onUpdate = null }) => {

    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_message, setCurrentMessage] = useState("");
    const [is_success, setIsSuccess] = useState(false);
    const [is_render, setIsRender] = useState(true);
    const [is_delete, setIsDelete] = useState(false);

    // cambiar formato
    const handleInput = async ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setForm(newForm);
    }

    // actualizar
    const save = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en guardar los cambios?', 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        await authentication.post(`module/${module.id}?_method=PUT`, form)
        .then(async res => {
            let { message } = res.data;
            setIsSuccess(true);
            setCurrentMessage(message);
            if (typeof onUpdate == 'function') onUpdate(form);
        }).catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    // eliminar
    const destroy = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en eliminar los datos?', 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        await authentication.post(`module/${module.id}?_method=DELETE`, form)
        .then(async res => {
            setIsDelete(true);
            setTimeout(() => setIsRender(false), 600)
        }).catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);

    }

    // cerrar mensaje de success
    const handleCloseSuccess = () => {
        setIsSuccess(false);
        setEdit(false);
    }

    // cancelar
    useEffect(() => {
        if (!edit) setForm(JSON.parse(JSON.stringify(module)))
    }, [edit]);

    if (!is_render) return null; 

    // renderizado
    return (
        <div className={`card card-body ${is_render ? animations.render : ''} ${is_delete ? animations.delete : ''}`}>
            <List.Item>
                <List.Content>
                    <div className="row">
                        <Form.Field className="col-md-4 capitalize mb-2">
                            <label>Nombre <b className="text-red">*</b></label>
                            <input type="text"
                                name="name"
                                disabled={edit || disabled || current_loading}
                                value={form.name || ""}
                                placeholder="ingrese el nombre"
                                disabled={!edit}
                                onChange={({ target }) => handleInput(target)}
                            />
                        </Form.Field>

                        <Form.Field className="col-md-4 mb-2">
                            <label>Alias <b className="text-red">*</b></label>
                            <input type="text"
                                name="alias"
                                disabled={disabled}
                                value={form.alias || ""}
                                placeholder="ingrese la alias"
                                disabled={!edit || disabled || current_loading}
                                onChange={({ target }) => handleInput(target)}
                            />
                        </Form.Field>
                        
                        <Form.Field className="col-md-4 mb-2">
                            <label>Descripción <b className="text-red">*</b></label>
                            <input type="text"
                                name="description"
                                disabled={disabled}
                                value={form.description || ""}
                                placeholder="ingrese la descripción"
                                disabled={!edit || disabled || current_loading}
                                onChange={({ target }) => handleInput(target)}
                            />
                        </Form.Field>

                        <div className="col-md-12 text-right mb-2">
                            <Show condicion={!edit}>
                                <div className="btn-group">
                                    <Button 
                                        className="mt-1"
                                        title="Editar"
                                        color='blue'
                                        basic
                                        disabled={edit || disabled || current_loading}
                                        onClick={(e) => setEdit(true)}
                                    >
                                        <i className="fas fa-pencil-alt"></i>
                                    </Button>

                                    <Button 
                                        className="mt-1"
                                        title="Eliminar"
                                        color='red'
                                        basic
                                        disabled={disabled || current_loading}
                                        onClick={destroy}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </div>
                            </Show>

                            <Show condicion={!is_success && edit}>
                                <Button color={'red'}
                                    className="mt-1"
                                    title="Cancelar"
                                    disabled={disabled || current_loading}
                                    onClick={(e) => setEdit(false)}
                                >
                                    <i className={`fas fa-times`}></i>
                                </Button>

                                <Button color={'blue'}
                                    className="mt-1"
                                    title="Actualizar"
                                    disabled={current_loading}
                                    loading={current_loading}
                                    onClick={save}
                                >
                                    <i className={`fas fa-sync`}></i>
                                </Button>                                
                            </Show>
                        </div>
                    </div>
                </List.Content>
            </List.Item>
            {/* mostrar mensaje de success */}
            <Show condicion={is_success}>
                <Message info>
                    <Message.Header>{current_message || ""}
                        <i className="fas fa-times close cursor-pointer" onClick={handleCloseSuccess}></i>
                    </Message.Header>
                </Message>
            </Show>
        </div>
    )
}

export default UpdateModule;