import React, { useMemo, useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import FormFamily from './formFamily';
import { Confirm } from '../../../services/utils';
import LicenseProvider from '../../../providers/escalafon/LicenseProvider';
import Swal from 'sweetalert2';

const licenseProvider = new LicenseProvider();

const CreateFamily = ({ info = {}, onClose = null, onSave = null }) => {

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const readySave = useMemo(() => {
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
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const handleSave = async () => {
        let answer = await Confirm('info', '¿Estas seguro en guardar la licencia?', 'Guardar');
        if (!answer) return;
        setCurrentLoading(true);
        let payload = Object.assign({}, form);
        payload.info_id = info.id;
        await licenseProvider.store(payload)
        .then(res => {
            let { message, license } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onSave == 'function') onSave(license);
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
            titulo={<span><i className="fas fa-file-alt"></i> Crear Familiar</span>}
        >
            <FormFamily className="card-body"
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
            </FormFamily>
        </Modal>
    )
}

export default CreateFamily;