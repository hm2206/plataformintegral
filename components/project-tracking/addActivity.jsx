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

const AddActivity = (props) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);

    // props
    let { objective } = props;  

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

    // crear actividad
    const createActivity = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en guardar los datos?`);
        if (answer) {
            app_context.fireLoading(true);
            let datos = Object.assign({}, form);
            datos.objective_id = objective.id;
            await projectTracking.post(`activity`, datos)
                .then(res => {
                    app_context.fireLoading(false);
                    let { success, message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                    setErrors({});
                    if (typeof props.onCreate == 'function') props.onCreate();
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let { errors, message } = err.response.data;
                        Swal.fire({ icon: 'warning', text: message });
                        setErrors(errors);
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
            titulo={<span><i className="fas fa-plus"></i> Agregar Actividad</span>}
            {...props}
        >  
            <Form className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Fecha Incio del Componente</label>
                            <input  
                                type="date"
                                value={objective.date_start || ""}
                                readOnly
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Fecha Término del Componente</label>
                            <input  
                                type="date"
                                value={objective.date_over || ""}
                                readOnly
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-5">
                        <hr/>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field error={errors.title && errors.title[0] || ""}>
                            <label htmlFor="">Titulo de la Actividad</label>
                            <input  
                                type="text"
                                name="title"
                                value={form.title || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                            <label htmlFor="">{errors.title && errors.title[0] || ""}</label>
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field error={errors.date_start && errors.date_start[0] || ""}>
                            <label htmlFor="">Fecha de Inicio</label>
                            <input  
                                type="date"
                                name="date_start"
                                value={form.date_start || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                            <label htmlFor="">{errors.date_start && errors.date_start[0] || ""}</label>
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field error={errors.date_over && errors.date_over[0] || ""}>
                            <label htmlFor="">Fecha de Término</label>
                            <input  
                                type="date"
                                name="date_over"
                                value={form.date_over || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                            <label htmlFor="">{errors.date_over && errors.date_over[0] || ""}</label>
                        </Form.Field>
                    </div>

                    <div className="col-md-12 text-right">
                        <hr/>
                        <Button color="teal" 
                            onClick={createActivity}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    )
}

export default AddActivity;