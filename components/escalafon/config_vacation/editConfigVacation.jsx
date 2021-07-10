import React, { useEffect, useMemo, useState } from 'react';
import { Button, Progress } from 'semantic-ui-react';
import FormConfigVacation from './formConfigVacation';
import Show from '../../show';
import { Confirm } from '../../../services/utils';
import ConfigVactionProvider from '../../../providers/escalafon/ConfigVacationProvider';
import Swal from 'sweetalert2';

const configVactionProvider = new ConfigVactionProvider();

const EditConfigVacation = ({ config_vacation = {}, onUpdate = null, onDelete = null }) => {

    const [form, setForm] = useState({});
    const [edit, setEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const handleInput = (e, { name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        setEdit(true);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const handleUpdate = async () => {
        let answer = await Confirm('info', `¿Estás seguro en guardar los cambios?`, 'Estoy seguro');
        if (!answer) return;
        setCurrentLoading(true);
        await configVactionProvider.update(config_vacation.id, form)
        .then(async res => {
            let { message, config_vacation } = res.data;
            let newForm = Object.assign({}, form);
            newForm = { ...form, ...config_vacation };
            Swal.fire({ icon: 'success', text: message });
            if (typeof onUpdate == 'function') await onUpdate(newForm);
            setEdit(false)
        }).catch(err => {
            setErrors(err.errors || {})
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
    }

    const handleDelete = async () => {
        let answer = await Confirm('warning', `¿Estás seguro en eliminar?`, 'Estoy seguro');
        if (!answer) return;
        setCurrentLoading(true);
        await configVactionProvider.delete(config_vacation.id)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onDelete == 'function') onDelete(config_vacation);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (!edit) setForm(Object.assign({}, config_vacation))
    }, [edit, config_vacation?.id]);

    return (
        <FormConfigVacation className="card-body"
            form={form}
            errors={errors}
            disabled={current_loading}
            onChange={handleInput}
            readOnly={['year']}
        >
            <Show condicion={true}>
                <div className="col-md-12 text-right">
                    <Show condicion={edit}
                        predeterminado={
                            <Show condicion={!current_loading}
                                predeterminado={
                                    <div>
                                        <Progress active percent={100} color="blue" inverted/>
                                    </div>
                                }
                            >
                                <Button color="red" 
                                    disabled={current_loading} 
                                    onClick={handleDelete}
                                > 
                                    <i className="fas fa-trash"></i> Eliminar
                                </Button>
                            </Show>
                        }
                    >
                            <hr />
                            <Button color="red" 
                                disabled={current_loading} 
                                basic
                                onClick={() => setEdit(false)}
                            >
                                <i className="fas fa-times"></i> Cancelar
                            </Button>

                            <Button color="teal" 
                                disabled={current_loading} 
                                loading={current_loading}
                                onClick={handleUpdate}
                            >
                                <i className="fas fa-sync"></i> Guardar cambios
                            </Button>
                    </Show>
                </div>
            </Show>
        </FormConfigVacation>
    )
}

export default EditConfigVacation;