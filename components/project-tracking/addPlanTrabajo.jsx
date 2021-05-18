import React, { useContext, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import Modal from '../modal'
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';
import currentFormatter from 'currency-formatter';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';
import moment from 'moment';

const AddPlanTrabajo = ({ onSave = null, isClose = null }) => {

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

    // crear plan de trabajo
    const cratePlanTrabajo = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar el proyecto?`);
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        let datos = Object.assign({}, form);
        datos.project_id = project.id;
        await projectTracking.post('plan_trabajo', datos)
        .then(res => {
            app_context.setCurrentLoading(false);
            let { message, plan_trabajo } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setForm({})
            setErrors({})
            dispatch({ type: projectTypes.ADD_PLAN_TRABAJO, payload: plan_trabajo });
            if (typeof onSave == 'function') onSave(plan_trabajo);
        }).catch(err => handleErrorRequest(err, setErrors, app_context.setCurrentLoading(false)));
    }

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-plus"></i> Agregar Plan de Trabajo</span>}
            isClose={isClose}
        >  
            <Form className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Duración del proyecto</label>
                            <input  
                                type="text"
                                value={project.duration || ""}
                                readOnly
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Costo del proyecto</label>
                            <input  
                                type="text"
                                value={currentFormatter.format(project.monto, { code: 'PEN' }) || ""}
                                readOnly
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Inicio</label>
                            <input  
                                type="text"
                                value={moment(project.date_start).format('YYYY') || ""}
                                readOnly
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Final</label>
                            <input  
                                type="text"
                                value={moment(project?.extension?.date_resolucion || project.date_over).format('YYYY') || ""}
                                readOnly
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12">
                        <hr/>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field error={errors.year && errors.year[0] || ""}>
                            <label htmlFor="">Año <b className="text-red">*</b></label>
                            <input  
                                type="number"
                                name="year"
                                value={form.year || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                            <label htmlFor="">{errors.year && errors.year[0] || ""}</label>
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field error={errors.resolucion && errors.resolucion[0] || ""}>
                            <label htmlFor="">N° Resolución <b className="text-red">*</b></label>
                            <input  
                                type="text"
                                name="resolucion"
                                value={form.resolucion || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                            <label htmlFor="">{errors.resolucion && errors.resolucion[0] || ""}</label>
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field error={errors.date_resolucion && errors.date_resolucion[0] || ""}>
                            <label htmlFor="">Fecha de Resolución <b className="text-red">*</b></label>
                            <input  
                                type="date"
                                name="date_resolucion"
                                value={form.date_resolucion || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                            <label htmlFor="">{errors.date_resolucion && errors.date_resolucion[0] || ""}</label>
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field error={errors?.description?.[0] || ""}>
                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                            <textarea  
                                type="text"
                                name="description"
                                value={form.description || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                            <label htmlFor="">{errors?.description?.[0] || ""}</label>
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field error={errors.monto && errors.monto[0] || ""}>
                            <label htmlFor="">Costo <b className="text-red">*</b></label>
                            <input  
                                type="number"
                                step="any"
                                name="monto"
                                value={form.monto || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                            <label htmlFor="">{errors.monto && errors.monto[0] || ""}</label>
                        </Form.Field>
                    </div>

                    <div className="col-md-12 text-right">
                        <hr/>
                        <Button color="teal" 
                            onClick={cratePlanTrabajo}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    )
}

export default AddPlanTrabajo;