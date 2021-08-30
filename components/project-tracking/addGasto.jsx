import React, { useContext, useState } from 'react';
import { Button, Form, Checkbox } from 'semantic-ui-react';
import Modal from '../modal'
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import { SelectPresupuesto, SelectMedida, SelectRubro } from '../select/project_tracking';
import Swal from 'sweetalert2';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';

const AddGasto = ({ isClose, activity, onSave = null, principal = true }) => {

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

    // crear gasto
    const createGasto = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en guardar los datos?`);
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        let datos = Object.assign({}, form);
        datos.activity_id = activity.id;
        datos.principal = principal ? 1 : 0
        await projectTracking.post(`gasto`, datos)
        .then(res => {
            app_context.setCurrentLoading(false);
            let { message, gasto } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
            dispatch({ type: projectTypes.ADD_GASTO, payload: gasto });
            if (typeof onSave == 'function') onSave(gasto);
        }).catch(err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
    }

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-plus"></i> Agregar Gasto</span>}
            isClose={isClose}
        >  
            <Form className="card-body">
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Actividad</label>
                            <input  
                                type="text"
                                value={activity.title || ""}
                                readOnly
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Presupuesto</label>
                            <SelectPresupuesto
                                execute={true}
                                name="presupuesto_id"
                                value={form?.presupuesto_id}
                                onChange={(e, obj) => handleInput(obj)}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Rubro</label>
                            <SelectRubro
                                execute={true}
                                name="rubro_id"
                                value={form?.rubro_id}
                                onChange={(e, obj) => handleInput(obj)}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Unidad de Medida</label>
                            <SelectMedida
                                execute={true}
                                name="medida_id"
                                value={form?.medida_id}
                                onChange={(e, obj) => handleInput(obj)}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Descripción</label>
                            <textarea 
                                rows="2"
                                name="description"
                                value={form?.description || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Monetario</label>
                            <Checkbox toggle
                                checked={form.is_money ? true : false}
                                name="is_money"
                                onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Cantidad</label>
                            <input type="number" 
                                placeholder="0"
                                step="any"
                                name="cantidad"
                                value={form.cantidad || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Monto Unitario</label>
                            <input type="number"
                                placeholder="0.00"
                                step="any"
                                name="monto"
                                value={form.monto || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 text-right">
                        <hr/>
                        <Button color="teal" 
                            onClick={createGasto}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    )
}

export default AddGasto;