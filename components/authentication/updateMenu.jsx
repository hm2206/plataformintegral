import React, { useState } from 'react';
import Router from 'next/router';
import { Message, Button } from 'semantic-ui-react'
import { authentication, handleErrorRequest } from '../../services/apis';
import Swal from 'sweetalert2';
import Show from '../show';
import { Confirm } from '../../services/utils';

const UpdateMenu = ({ menu }) => {

    // estados
    const [current_menu, setCurrentMenu] = useState(JSON.parse(JSON.stringify(menu || {})));
    const [edit, setEdit] = useState(false);
    const [is_render, setIsRender] = useState(true);
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_update, setIsUpdate] = useState(false);
    const [current_message, setCurrentMessage] = useState("");
    const [errors, setErrors] = useState({});

    // cambiar edición
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, current_menu);
        newForm[name] = value;
        setCurrentMenu(newForm);
    }

    // obstrucción
    let module = current_menu.module || {};
    let system = module.system || {};

    // cancelar edicion
    const handleCancel = () => {
        setEdit(false);
        setCurrentMenu(JSON.parse(JSON.stringify(menu)));
    }

    // actualizar
    const save = async () => {
        let answer = await Confirm('warning', `¿Deseas actualizar los datos?`, 'actulizar');
        if (!answer) return false;
        setCurrentLoading(true);
        await authentication.post(`config_module/${menu.id}?_method=PUT`, current_menu)
        .then(res => {
            let { message } = res.data;
            setIsUpdate(true);
            setCurrentMessage(message);
        }).catch(async err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    // eliminar
    const destroy = async () => {
        let answer = await Confirm('warning', `¿Estás seguro en eliminar el módulo?`, `Estoy seguro`);
        if (!answer) return false;
        await authentication.post(`config_module/${menu.id}?_method=DELETE`)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setIsRender(false);
        }).catch(err => handleErrorRequest(err, setErrors));
    }

    // cerrar dialogo
    const handleClose = () => {
        setIsUpdate(false);
        setCurrentMessage("");
        setEdit(false);
    }
 
    if (!is_render) return null;

    // renderizado
    if (!edit) return <div className="card card-body">
        <div className="row">
            <div className="col-md-10">
                <span className="badge badge-dark">{system && system.name || ""}</span>
                <i className="fas fa-arrow-right ml-1 mr-1"></i>
                <span className="badge badge-primary">{module && module.name || ""}</span>
                <i className="fas fa-arrow-right ml-1 mr-1"></i>
                <span className="badge badge-warning">{current_menu && current_menu.slug || ""}</span>
            </div>
            <div className="col-md-2 text-right">
                <div className="btn-group">
                    <button className="btn btn-sm btn-outline-info"
                        onClick={(e) => setEdit(true)}
                    >
                        <i className="fas fa-edit"></i>
                    </button>

                    <button className="btn btn-sm btn-outline-danger"
                        onClick={destroy}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    // renderizar
    return (
        <div className="card card-body">
            <div className="row align-items-end">
                <div className="col-md-6 mb-3">
                    <label htmlFor=""><b>Sistema</b></label>
                    <input type="text"
                        readOnly
                        className="capitalize"
                        value={system && system.name || ""}
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label htmlFor=""><b>Módulo</b></label>
                    <input type="text"
                        readOnly
                        className="capitalize"
                        value={module && module.name || ""}
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label htmlFor=""><b>Icono</b></label>
                    <input type="text"
                        value={current_menu.icon || ""}
                        name="icon"
                        disabled={current_loading}
                        onChange={({ target }) => handleInput(target)}
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label htmlFor=""><b>Slug</b></label>
                    <input type="text"
                        value={current_menu.slug || ""}
                        name="slug"
                        disabled={current_loading}
                        onChange={({ target }) => handleInput(target)}
                    />
                </div>

                <div className="col-md-12 text-right mt-4">
                    <Show condicion={!is_update}
                        predeterminado={
                            <Message info className="text-left">
                                <Message.Header>
                                    {current_message}
                                    <i className="fas fa-times cursor-pointer close" onClick={handleClose}></i>
                                </Message.Header>
                            </Message>
                        }
                    >
                        <div className="btn-group">
                            <Button color="blue" 
                                onClick={save}
                                disabled={current_loading}
                                loading={current_loading}
                            >
                                <i className="fas fa-save"></i> Actualizar
                            </Button>

                            <Button color="red" 
                                onClick={handleCancel}
                                disabled={current_loading}
                            >
                                <i className="fas fa-times"></i> Cancelar
                            </Button>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    )
}

export default UpdateMenu;