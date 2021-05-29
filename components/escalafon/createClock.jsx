import React, { useContext, useMemo } from 'react';
import { useState } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { Confirm } from '../../services/utils';
import { EntityContext } from '../../contexts/EntityContext';
import ClockProvider from '../../providers/escalafon/ClockProvider';
import Swal from 'sweetalert2';

// providers
const clockProvider = new ClockProvider();

const CreateClock = ({ handleAdd }) => {

    // entity
    const { entity_id } = useContext(EntityContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    // memo
    const isForm = useMemo(() => {
        return form.name && form.host && form.port;
    }, [form]);

    // config
    const options = {
        headers: {
            EntityId: entity_id
        }
    }

    // handle estados
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // handle save
    const handleSave = async () => {
        let answer = await Confirm('warning', `¿Estás seguro en guardar los datos?`, 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        await clockProvider.store(form, options)
        .then(res => {
            let { clock, message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setErrors({});
            setForm({});
            handleAdd(clock);
        }).catch(err => {
            setErrors(err.errors || {});
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
    }

    // render
    return (
        <div className="card">
            <div className="card-header">
                <i className="fas fa-plus"></i> Crear Reloj Biométrico
            </div>
            <Form className="card-body">
                <Form.Field error={errors.name && errors.name[0] ? true : false}>
                    <label>Nombre <b className="text-red">*</b></label>
                    <input type="text"
                        name="name"
                        value={form.name || ""}
                        onChange={({ target }) => handleInput(target)}
                        readOnly={current_loading}
                    />
                    <label>{errors.name && errors.name[0] || ""}</label>
                </Form.Field>

                <Form.Field error={errors.host && errors.host[0] ? true : false}>
                    <label>Host<b className="text-red">*</b></label>
                    <input type="text"
                        name="host"
                        value={form.host || ""}
                        onChange={({ target }) => handleInput(target)}
                        readOnly={current_loading}
                    />
                    <label>{errors.host && errors.host[0] || ""}</label>
                </Form.Field>

                <Form.Field error={errors.port && errors.port[0] ? true : false}>
                    <label>Puerto<b className="text-red">*</b></label>
                    <input type="text"
                        name="port"
                        value={form.port || ""}
                        onChange={({ target }) => handleInput(target)}
                        readOnly={current_loading}
                    />
                    <label>{errors.port && errors.port[0] || ""}</label>
                </Form.Field>
            </Form>
            <div className="card-footer">
                <div className="card-body text-right">
                    <Button color="teal"
                        disabled={current_loading || !isForm}
                        onClick={handleSave}
                        loading={current_loading}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CreateClock;