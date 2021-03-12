import React, { useContext, useState } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import Modal from '../modal'
import { SelectRol } from '../select/project_tracking'
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';

const AddComponente = (props) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);

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

    // crear equipo
    const createComponente = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en guardar los datos?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = Object.assign({}, form);
            datos.project_id = project.id;
            await projectTracking.post(`objective`, datos)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                    setErrors({});
                    if (typeof props.onCreate == 'function') props.onCreate();
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { errors, message, status } = err.response.data;
                        Swal.fire({ icon: status == 402 ? 'warning' : 'error', text: message });
                        if (status == 402) setErrors(errors);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: err.message });
                    }
                });
        }
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
                        <Form.Field error={errors.title && errors.title[0] || ""}>
                            <label htmlFor="">Titulo del Componente</label>
                            <textarea  
                                name="title"
                                value={form.title || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                            <label htmlFor="">{errors.title && errors.title[0] || ""}</label>
                        </Form.Field>
                    </div>

                    <div className="col-md-12 text-right">
                        <hr/>
                        <Button color="teal" 
                            onClick={createComponente}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    )
}

export default AddComponente;