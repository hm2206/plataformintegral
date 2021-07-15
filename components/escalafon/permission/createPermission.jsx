import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import FormPermission from './formPermission';
import { Confirm } from '../../../services/utils';
import PermissionProvider from '../../../providers/escalafon/PermissionProvider';
import Swal from 'sweetalert2';

const permissionProvider = new PermissionProvider();

const CreatePermission = ({ info = {}, onClose = null, onSave = null }) => {

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const readySave = useMemo(() => {
        let required = ['date_start', 'date_over', 'option', 'document_number', 'justification', 'type_permission_id'];
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
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const handleSave = async () => {
        let answer = await Confirm('info', '¿Estas seguro en guardar el permiso?', 'Guardar');
        if (!answer) return;
        setCurrentLoading(true);
        let payload = Object.assign({}, form);
        payload.info_id = info.id;
        await permissionProvider.store(payload)
        .then(res => {
            let { message, permission } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onSave == 'function') onSave(permission);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
            setErrors(err.errors || {});
        });
        setCurrentLoading(false);
    }

    return (
        <Modal isClose={onClose}
            show={true}
            md="5"
            titulo={<span><i className="fas fa-file-alt"></i> Crear Permiso</span>}
        >
            <FormPermission className="card-body"
                form={form}
                errors={errors}
                onChange={handleInput}
            >
                <div className="col-md-12 text-right">
                    <hr />

                    <Button color="teal" 
                        disabled={current_loading || !readySave} 
                        loading={current_loading}
                        onClick={handleSave}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </FormPermission>
        </Modal>
    )
}

export default CreatePermission;