import React, { useContext, useMemo, useState } from 'react';
import Modal from '../modal';
import { Form, Button } from 'semantic-ui-react';
import { DropZone } from '../Utils';
import Show from '../show';
import { Confirm } from '../../services/utils';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import Swal from 'sweetalert2';

const AddExtension = ({ onClose = null, onSave = null }) => {

    // project
    const { project } = useContext(ProjectContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    // memo
    const isSave = useMemo(() => {
        let newForm = Object.assign({}, form || {});
        let payload = {};
        for (let attr in newForm) {
            let value = newForm[attr];
            if (value) payload[attr] = value;
        }
        // reponse
        return Object.values(payload).length == 3 ? true : false;
    }, [form]);

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const handleUpdate = async () => {
        let answer = await Confirm('info', `¿Estás seguro en guardar los datos?`, 'Estyo seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        let payload = new FormData();
        payload.append('project_id', project.id);
        Object.keys(form).forEach(attr => payload.append(attr, form[attr]));
        await projectTracking.post(`extensions`, payload)
        .then(res => {
            let { message, extension } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setForm({});
            if (typeof onSave == 'function') onSave(extension);
        }).catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);        
    }

    // render
    return (
        <Modal show={true}
            isClose={onClose}
            titulo={<span><i className="fas fa-plus"></i> Agregar Ampliación</span>}
        >
            <Form className="card-body">
                <Form.Field className="mb-3" error={errors?.resolucion?.[0] ? true : false}>
                    <label>Resolución <b className="text-red">*</b></label>
                    <input type="text" 
                        name="resolucion"
                        value={form.resolucion || ""}
                        placeholder="Ingrese el número de resolución"
                        onChange={(e) => handleInput(e.target)}
                    />
                    <label>{errors?.resolucion?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="mb-3" error={errors?.date_resolucion?.[0] ? true : false}>
                    <label>Fecha de Resolución <b className="text-red">*</b></label>
                    <input type="date" 
                        name="date_resolucion"
                        value={form.date_resolucion || ""}
                        onChange={(e) => handleInput(e.target)}
                    />
                    <label>{errors?.date_resolucion?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="mb-3">
                    <label>Archivo <b className="text-red">*</b></label>
                    <Show condicion={!form?.files?.name}
                        predeterminado={
                            <div className="card card-body" style={{ position: 'relative' }}>
                                <span className="text-ellipsis">{form?.files?.name}</span>
                                <span className="close cursor-pointer" 
                                    style={{ position: 'absolute', top: '2px', right: '5px' }}
                                    onClick={() => handleInput({ name: 'files', value: null })}
                                >
                                    <i className="fas fa-times"></i>
                                </span>
                            </div>
                        }
                    >
                        <DropZone id="file__extension"
                            name="files"
                            multiple={false}
                            title="Archivo (*.pdf, *.docx)"
                            onChange={({ name, files }) => handleInput({ name, value: files[0] })}
                        />
                    </Show> 
                </Form.Field>

                <div className="mb-2 text-right">
                    <hr />
                    <Button color="teal" 
                        onClick={handleUpdate}
                        disabled={!isSave}
                    >
                        <i className="fas fa-save"></i> Guardar datos
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

export default AddExtension;