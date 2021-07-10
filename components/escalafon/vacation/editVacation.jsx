import React, { useEffect, useState } from 'react';
import Modal from '../../modal';
import { Button, Progress } from 'semantic-ui-react';
import FormVacation from './formVacation';
import Show from '../../show';
import { Confirm } from '../../../services/utils';
import VacationProvider from '../../../providers/escalafon/VacationProvider';
import Swal from 'sweetalert2';

const vacationProvider = new VacationProvider();

const EditVacation = ({ config_vacation, vacation = {}, onClose = null, onUpdate = null, onDelete = null }) => {

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
        await vacationProvider.update(vacation.id, form)
        .then(async res => {
            let { message, vacation } = res.data;
            let newForm = Object.assign({}, form);
            newForm = { ...form, ...vacation };
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
        await vacationProvider.delete(vacation.id)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onDelete == 'function') onDelete(vacation);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (!edit) setForm(Object.assign({}, vacation))
    }, [edit]);

    return (
        <Modal isClose={onClose}
            show={true}
            md="5"
            disabled={current_loading}
            titulo={<span><i className="fas fa-calendar"></i> Editar Vacaciones <span className="badge badge-dark">{config_vacation?.year}</span></span>}
        >
            <FormVacation className="card-body"
                form={form}
                errors={errors}
                disabled={current_loading}
                onChange={handleInput}
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
            </FormVacation>
        </Modal>
    )
}

export default EditVacation;