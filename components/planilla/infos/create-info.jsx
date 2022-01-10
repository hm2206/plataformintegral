import React, { useMemo, useState } from 'react';
import Modal from '../../modal';
import FormInfo from './form-info';
import { Button } from 'semantic-ui-react';
import { Confirm } from '../../../services/utils';
import { microPlanilla } from '../../../services/apis';
import Swal from 'sweetalert2'

const CreateInfo = ({ contract = {}, onClose = null, onSave = null }) => {

    const [form, setForm] = useState({
        isEmail: true,
        isSync: true,
        isCheck: true
    });
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const isSave = useMemo(() => {
        let required = [
            'planillaId', 'pimId',
            'bankId'
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

    const saveInfo = async () => {
        let answer = await Confirm("warning", "¿Estas seguro en guardar la configuración?", "Estoy Seguro");
        if (!answer) return;
        setCurrentLoading(true);
        let newForm = Object.assign({}, form);
        newForm.contractId = parseInt(`${contract.id}`);
        await microPlanilla.post('infos', newForm)
        .then(async res => {
            await Swal.fire({
                icon: 'success',
                text: "La configuración se guardó correnctamente!"
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
            titulo={<span><i className="fas fa-file-alt"></i> Crear Configuración de Planilla</span>}
        >
            <div className="card-body">
                <FormInfo form={form} 
                    contract={contract}
                    errors={errors}
                    onChange={handleInput}
                >
                    <div className="col-md-12 text-right">
                        <hr />
                        <Button color="teal"
                            onClick={saveInfo}
                            disabled={current_loading || !isSave}
                            loading={current_loading}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </FormInfo>
            </div>
        </Modal>
    )
}

export default CreateInfo;