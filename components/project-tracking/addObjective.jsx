import React, { useContext, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import Modal from '../modal'
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';

const AddObjective = (props) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project, dispatch } = useContext(ProjectContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // crear objetivo
    const handleSave = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en guardar los datos?`);
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        let datos = Object.assign({}, form);
        datos.project_id = project.id;
        await projectTracking.post(`objective`, datos)
        .then(res => {
            app_context.setCurrentLoading(false);
            let { message, objective } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
            dispatch({ type: projectTypes.ADD_OBJECTIVE, payload: objective });
        }).catch(err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
    }

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-plus"></i> Agregar Nuevo Componente</span>}
            {...props}
        >  
            <Form className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Fecha Incio del Proyecto</label>
                            <input  
                                type="date"
                                value={project.date_start || ""}
                                readOnly
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Fecha Término del Proyecto</label>
                            <input  
                                type="date"
                                value={project.date_over || ""}
                                readOnly
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-5">
                        <hr/>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field error={errors?.title?.[0] ? true : false}>
                            <label htmlFor="">Titulo del Objectivo Específico</label>
                            <textarea  
                                name="title"
                                value={form.title || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                            <label htmlFor="">{errors?.title?.[0] ? true : false}</label>
                        </Form.Field>
                    </div>

                    <div className="col-md-12 text-right">
                        <hr/>
                        <Button color="teal" 
                            onClick={handleSave}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    )
}

export default AddObjective;