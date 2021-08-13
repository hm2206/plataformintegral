import React, { useMemo, useState } from 'react';
import Modal from '../../modal';
import FormPerson from './formPerson';
import { authentication, handleErrorRequest, onProgress } from '../../../services/apis';
import { Confirm } from '../../../services/utils'
import { Button } from 'semantic-ui-react'
import Swal from 'sweetalert2'

const CreatePerson = ({ onClose = null, show = true, onSave = null }) => {

    const [form, setForm] = useState({})
    const [errors, setErrors] = useState({})
    const [current_loading, setCurrentLoading] = useState(false)
    const [render_image, setRenderImage] = useState(null)
    const [percent, setPercent] = useState(0);

    const handleInput = (e,  { name, value }) => { 
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm)
        let newErrors = Object.assign({}, errors)
        newErrors[name] = []
        setErrors(newErrors)
    }

    const handleImagen = (e, { file, base64 }) => {
        setForm(prev => ({ ...prev, imagen: file }))
        setRenderImage(base64)
        setErrors(prev => ({ ...prev, imagen: [] }))
    }

    const canSave = useMemo(() => {
        let allowers = [
            'document_type_id', 'document_number', 'ape_pat', 'ape_mat',
            'name', 'gender', 'profession', 'marital_status', 'date_of_birth',
            'cod_dep', 'cod_pro', 'cod_dis', 'address', 'email_contact', 'phone'
        ]

        for(let attr of allowers) {
            let value = form[attr];
            if (!value) return false;
        }

        return true
    }, [form])

    const save = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar los datos?`, 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        const payload = new FormData;
        for(let key in form) payload.append(key, form[key]);
        // add imagen
        payload.append('image', image);
        // opciones
        let options = {
            onUploadProgress: (evt) => onProgress(evt, setPercent)
        }
        // request
        await authentication.post(`person`, payload, options)
        .then(async res => {
            let { message, person } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({})
            setErrors({});
            setRenderImage("/img/base.png");
            if (typeof onSave == 'function') onSave(person)
        }).catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    return (
        <Modal titulo={<span><i className="fas fa-user"></i> Crear Persona</span>}
            isClose={onClose}
            show={show}
            md="10"
            disabled={current_loading}
        >
            <div className="card-body">
                <FormPerson onChange={handleInput}
                    image={render_image}
                    onChangeImage={handleImagen}
                    form={form}
                    errors={errors}
                    disabled={current_loading}
                >
                    <div className="col-12 text-right">
                        <hr />
                        <Button disabled={current_loading || !canSave}
                            loading={current_loading}
                            color="teal"
                            onClick={save}
                        >
                            <i className="fas fa-save"></i> Guardar Datos
                        </Button>
                    </div>
                </FormPerson>
            </div>
        </Modal>
    )
}

export default CreatePerson;