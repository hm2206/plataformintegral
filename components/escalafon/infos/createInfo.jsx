import React, { useMemo, useState } from 'react';
import Modal from '../../modal';
import FormInfo from './formInfo';
import { Button } from 'semantic-ui-react';
import { Confirm } from '../../../services/utils';
import InfoProvider from '../../../providers/escalafon/InfoProvider';
import Swal from 'sweetalert2'

const infoProvider = new InfoProvider();

const CreateInfo = ({ work = {}, infoDefault = {}, onClose = null, onSave = null }) => {

    const [form, setForm] = useState(infoDefault);
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const isSave = useMemo(() => {
        let required = [
            'planilla_id', 'dependencia_id', 'meta_id', 'cargo_id', 'type_categoria_id', 'pap', 
            'perfil_laboral_id', 'resolucion', 'fecha_de_resolucion', 'fecha_de_ingreso', 
            'situacion_laboral_id'
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
        let answer = await Confirm("warning", "¿Estas seguro en guardar el contrato?", "Estoy Seguro");
        if (!answer) return;
        setCurrentLoading(true);
        let newForm = Object.assign({}, form);
        newForm.work_id = work.id;
        await infoProvider.store(newForm)
        .then(async res => {
            let { message, info } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            if (typeof onSave == 'function') onSave(info);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message })
            setErrors(err.errors || {});
        });
        setCurrentLoading(false);
    }

    return (
        <Modal show={true}
            isClose={onClose}
            md="7"
            disabled={current_loading}
            titulo={<span><i className="fas fa-file-alt"></i> Crear Contrato</span>}
        >
            <div className="card-body">
                <FormInfo form={form} 
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