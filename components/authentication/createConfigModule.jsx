import React, { useState, useEffect } from 'react';
import Modal from '../modal';
import { Form, Button } from 'semantic-ui-react'
import { SelectSystem, SelectSystemModule } from '../select/authentication';
import { Confirm } from '../../services/utils';
import { authentication, handleErrorRequest } from '../../services/apis';
import Swal from 'sweetalert2';

const CreateConfigModule = ({ current_app, onClose = null, onSave = null }) => {

    // estados
    const [form, setForm] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // guardar config
    const save = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar los datos?`, 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        let datos = Object.assign({}, form);
        datos.app_id = current_app.id;
        await authentication.post(`config_module`, datos)
        .then(res => {
            let { message, config } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setForm({});
            if (typeof onSave == 'function') onSave(config);
        }).catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    // cambio de system_id
    useEffect(() => {
        handleInput({ name: 'module_id', value: "" });
    }, [form.system_id]);

    // render
    return (
        <Modal titulo={<span><i className="fas fa-plus"></i> Crear configuración de módulo</span>}
            show={true}
            isClose={onClose}
        >
            <Form className="card-body">
                <Form.Field className="form-group">
                    <label htmlFor="">Sistema</label>
                    <SelectSystem
                        onChange={async (e, obj) => handleInput(obj)}
                        value={form.system_id}
                        name="system_id"
                    />
                </Form.Field>

                <Form.Field>
                    <label htmlFor="">Módulo <b className="text-red">*</b></label>
                    <SelectSystemModule
                        disabled={!form.system_id}
                        system_id={form.system_id}
                        onChange={(e, obj) => handleInput(obj)}
                        value={form.module_id}
                        refresh={form.system_id}
                        name="module_id"
                    />
                </Form.Field>

                <Form.Field>
                    <label htmlFor="">Icono <b className="text-red">*</b></label>
                    <input type="text"
                        name="icon"
                        value={form.icon || ""}
                        onChange={({ target }) => handleInput(target)}
                    />
                </Form.Field>

                <Form.Field>
                    <label htmlFor="">Slug <b className="text-red">*</b></label>
                    <input type="text"
                        name="slug"
                        value={form.slug || ""}
                        onChange={({ target }) => handleInput(target)}
                    />
                </Form.Field>

                <hr/>

                <div className="form-group text-right">
                    <Button color="teal" onClick={save}
                        disabled={current_loading}
                        loading={current_loading}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

export default CreateConfigModule;