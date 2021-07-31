import React, { useMemo, useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import FormDesgrees from './formDegrees';
import { Confirm } from '../../../services/utils';
import DegreeProvider from '../../../providers/escalafon/DegreeProvider';
import Swal from 'sweetalert2';

const degreeProvider = new DegreeProvider();

const CreateDegrees = ({ work = {}, onClose = null, onSave = null }) => {

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const readySave = useMemo(() => {
        let required = [
            'type_degree_id', 'institution', 'document_number',
            'date', 'description'
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
        payload.work_id = work.id;
        await degreeProvider.store(payload)
        .then(res => {
            let { message, degree } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onSave == 'function') onSave(degree);
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
            titulo={<span><i className="fas fa-file-alt"></i> Crear Formación Académica</span>}
        >
            <FormDesgrees className="card-body"
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
            </FormDesgrees>
        </Modal>
    )
}

export default CreateDegrees;