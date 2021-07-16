import React, { useEffect, useState, useMemo } from 'react';
import Modal from '../../modal';
import { Button, Progress } from 'semantic-ui-react';
import FormLicense from './formLicense';
import Show from '../../show';
import { Confirm } from '../../../services/utils';
import LicenseProvider from '../../../providers/escalafon/LicenseProvider';
import Swal from 'sweetalert2';

const licenseProvider = new LicenseProvider();

const EditLicense = ({ license = {}, onClose = null, onUpdate = null, onDelete = null }) => {

    const [form, setForm] = useState({});
    const [edit, setEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const canSave = useMemo(() => {
        let required = [
            'situacion_laboral_id', 'resolution', 'date_resolution',
            'date_start', 'date_over', 'description'
        ];
        // validar
        for (let item of required) {
            let value = form[item];
            if (!value) return false;
        }
        // response
        return true;
    }, [form]);

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
        await licenseProvider.update(license.id, form)
        .then(async res => {
            let { message, license } = res.data;
            let newForm = Object.assign({}, form);
            newForm = { ...form, ...license };
            await Swal.fire({ icon: 'success', text: message });
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
        await licenseProvider.delete(license.id)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            if (typeof onDelete == 'function') await onDelete(license);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (!edit) setForm(Object.assign({}, license))
    }, [edit]);

    return (
        <Modal isClose={onClose}
            show={true}
            md="5"
            disabled={current_loading}
            titulo={<span><i className="fas fa-calendar"></i> Editar Licencia Laboral</span>}
        >
            <FormLicense className="card-body"
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
                                    disabled={current_loading || !canSave} 
                                    loading={current_loading}
                                    onClick={handleUpdate}
                                >
                                    <i className="fas fa-sync"></i> Guardar cambios
                                </Button>
                        </Show>
                    </div>
                </Show>
            </FormLicense>
        </Modal>
    )
}

export default EditLicense;