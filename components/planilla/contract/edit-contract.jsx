import React, { useMemo, useState } from 'react';
import Modal from '../../modal';
import FormInfo from './form-contract';
import { Button } from 'semantic-ui-react';
import { Confirm } from '../../../services/utils';
import { microPlanilla } from '../../../services/apis';
import Swal from 'sweetalert2'

const EditContract = ({ work = {}, infoDefault = {}, onClose = null, onSave = null }) => {

    const [form, setForm] = useState({ state: true, ...infoDefault });
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const isSave = useMemo(() => {
        let required = [
            'dependencyId', 'condition', 
            'profileId', 'resolution', 'dateOfResolution',
            'dateOfAdmission', 'hourhandId'
        ];
        // validar
        for (let attr of required) {
            let value = form[attr];
            if (!value) return false;
        }
        // ready
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

    const updateInfo = async () => {
        let answer = await Confirm("warning", "¿Estas seguro en guardar el contrato?", "Estoy Seguro");
        if (!answer) return;
        setCurrentLoading(true);
        let newForm = Object.assign({}, form);
        await microPlanilla.put(`contracts/${infoDefault.id}`, newForm)
        .then(async res => {
            await Swal.fire({
                icon: 'success',
                text: "El contrato se guardó correnctamente!"
            });
            if (typeof onSave == 'function') onSave(res.data);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message })
            setErrors(err.errors || {});
        });
        setCurrentLoading(false);
    }

    return (
        <Modal show={true}
            isClose={onClose}
            md=" col-lg-7 col-md-10"
            disabled={current_loading}
            titulo={<span><i className="fas fa-file-alt"></i> Editar Contrato</span>}
        >
            <div className="card-body">
                <FormInfo form={form} 
                    errors={errors}
                    onChange={handleInput}
                >
                    <div className="col-md-12 text-right">
                        <hr />
                        <Button color="blue"
                            onClick={updateInfo}
                            disabled={current_loading || !isSave}
                            loading={current_loading}
                        >
                            <i className="fas fa-sync"></i> Actualizar
                        </Button>
                    </div>
                </FormInfo>
            </div>
        </Modal>
    )
}

export default EditContract;