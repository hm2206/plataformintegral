import React, { useEffect, useState } from 'react';
import Modal from '../../modal';
import FormPerson from './formPerson';
import { Button } from 'semantic-ui-react';
import Show from '../../show';
import { Confirm } from '../../../services/utils';
import { authentication, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';

const EditPerson = ({ person = {}, onClose = null, onSave = null }) => {

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [render_image, setRenderImage] = useState();
    const [edit, setEdit] = useState(false);
    const [image, setImage] = useState(null);

    const handleInput = (e, { name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    const handleImagen = (e, { file, base64 }) => {
        setImage(file);
        setRenderImage(base64);
        setEdit(true);
        setErrors(prev => ({ ...prev, image: [] }));
    }

    const save = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar los datos?`, 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        const payload = new FormData;
        for(let key in form) payload.append(key, form[key] || '');
        payload.delete('image');
        // add imagen
        payload.append('image', image);
        // request
        await authentication.post(`person/${person.id}?_method=PUT`, payload)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            if (typeof onSave == 'function') await onSave(form);
            setErrors({});
            setEdit(false);
        }).catch(err => handleErrorRequest(err, (data) => {
            setErrors(data);
        }));
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (!edit) {
            setForm(Object.assign({}, person));
            setRenderImage(person?.image_images?.image_200x200);
        }
    }, [edit]);

    return (
        <Modal show={true} 
            md="10"
            isClose={onClose}
            titulo={<span><i className="fas fa-user"></i> Crear Persona</span>}
            disabled={current_loading}
        >
            <div className="card-body">
                <FormPerson form={form}
                    disabled={current_loading}
                    image={render_image}
                    onChange={handleInput}
                    onChangeImage={handleImagen}
                    unlock={!edit}
                >
                    <Show condicion={edit}>
                        <div className="col-12">
                            <div className="text-right">
                                <Button color="red" basic 
                                    onClick={() => setEdit(false)}
                                    disabled={current_loading}
                                >
                                    <i className="fas fa-times"></i> Cancelar
                                </Button>

                                <Button color="teal"
                                    disabled={current_loading}
                                    onClick={save}
                                    loading={current_loading}
                                >
                                    <i className="fas fa-save"></i> Guardar cambios
                                </Button>
                            </div>
                        </div>
                    </Show>
                </FormPerson>
            </div>
        </Modal>
    )
}

export default EditPerson;