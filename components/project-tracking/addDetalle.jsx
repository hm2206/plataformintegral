import React, { useContext, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import Modal from '../modal'
import { SelectDocumentType, SelectMedioPago } from '../select/project_tracking'
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';
import currencyFormatter from 'currency-formatter';
import { DropZone } from '../Utils';

const AddDetalle = ({ gasto, onSave }) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);

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
    const createDetalle = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en guardar los datos?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = new FormData();
            for(let attr in form) {
                datos.append(attr, form[attr]);
            }
            // add gasto_id
            datos.append('gasto_id', gasto.id);
            // request
            await projectTracking.post(`detalle`, datos)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                    if (typeof onSave == 'function') onSave();
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { errors, message } = err.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                        setErrors(errors);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                });
        }
    }

    // agregar file
    const handleFile = ({ name, files }) => {
        let isFile = files.length;
        if (isFile) setForm({ ...form, file: files[0] });
    }

    // render
    return (
        <div className="card-body">
            <div className="row">
                <div className="col-md-12 mb-3">
                    <Form.Field>
                        <label htmlFor="">Partida Presupuestal</label>
                        <input type="text" 
                            className="uppercase"
                            readOnly 
                            value={`${gasto && gasto.presupuesto} - ${gasto && gasto.ext_pptto}`}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-12 mb-3">
                    <Form.Field>
                        <label htmlFor="">Descripción de gasto programado</label>
                        <input type="text" 
                            className="uppercase"
                            readOnly 
                            value={`${gasto && gasto.description}`}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field>
                        <label htmlFor="">Medida de gasto programado</label>
                        <input type="text" 
                            className="uppercase"
                            readOnly 
                            value={`${gasto && gasto.medida}`}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field>
                        <label htmlFor="">Saldo disponible</label>
                        <input type="text" 
                            className="uppercase"
                            readOnly 
                            value={`${gasto && currencyFormatter.format(gasto.saldo, { code: 'PEN' })}`}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-12 mt-4 mb-3">
                    <hr/>
                    <h5><i className="fas fa-info-circle"></i> Información detallada</h5>
                    <hr/>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.document_type_id && errors.document_type_id[0] ? true : false}>
                        <label htmlFor="">Tip. Documento <b className="text-red">*</b></label>
                        <SelectDocumentType
                            name="document_type_id"
                            value={form?.document_type_id || ""}
                            onChange={(e, obj) => handleInput(obj)}
                        />
                        <label htmlFor="">{errors.document_type_id && errors.document_type_id[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.document_number && errors.document_number[0] ? true : false}>
                        <label htmlFor="">N° Documento <b className="text-red">*</b></label>
                        <input
                            type="text"
                            name="document_number"
                            value={form?.document_number || ""}
                            onChange={(e) => handleInput(e.target)}
                        />
                        <label htmlFor="">{errors.document_number && errors.document_number[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.ruc && errors.ruc[0] || ""}>
                        <label htmlFor="">RUC <b className="text-red">*</b></label>
                        <input
                            type="text"
                            name="ruc"
                            value={form?.ruc || ""}
                            onChange={(e) => handleInput(e.target)}
                        />
                        <label htmlFor="">{errors.ruc && errors.ruc[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.date && errors.date[0] || ""}>
                        <label htmlFor="">Fecha <b className="text-red">*</b></label>
                        <input
                            type="date"
                            name="date"
                            value={form?.date || ""}
                            onChange={(e) => handleInput(e.target)}
                        />
                        <label htmlFor="">{errors.date && errors.date[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-12 mb-3">
                    <Form.Field error={errors.razon_social && errors.razon_social[0] ? true : false}>
                        <label htmlFor="">Pagado a la orden <b className="text-red">*</b></label>
                        <input
                            type="text"
                            name="razon_social"
                            value={form?.razon_social || ""}
                            onChange={(e) => handleInput(e.target)}
                        />
                        <label htmlFor="">{errors.razon_social && errors.razon_social[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-12 mb-3">
                    <Form.Field error={errors.description && errors.description[0] ? true : false}>
                        <label htmlFor="">Descripción <b className="text-red">*</b></label>
                        <textarea
                            rows="3"
                            name="description"
                            value={form?.description || ""}
                            onChange={(e) => handleInput(e.target)}
                        />
                        <label htmlFor="">{errors.description && errors.description[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.medio_pago_id && errors.medio_pago_id[0] ? true : false}>
                        <label htmlFor="">Medio de Pago <b className="text-red">*</b></label>
                        <SelectMedioPago
                            name="medio_pago_id"
                            value={form?.medio_pago_id || ""}
                            onChange={(e, obj) => handleInput(obj)}
                        />
                        <label htmlFor="">{errors.medio_pago_id && errors.medio_pago_id[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.pago_number && errors.pago_number[0] ? true : false}>
                        <label htmlFor="">Nro</label>
                        <input
                            type="text"
                            name="pago_number"
                            value={form?.pago_number || ""}
                            onChange={(e) => handleInput(e.target)}
                        />
                        <label htmlFor="">{errors.pago_number && errors.pago_number[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.date_pago && errors.date_pago[0] ? true : false}>
                        <label htmlFor="">Fecha de Emisión</label>
                        <input
                            type="date"
                            name="date_pago"
                            value={form?.date_pago || ""}
                            onChange={(e) => handleInput(e.target)}
                        />
                        <label htmlFor="">{errors.date_pago && errors.date_pago[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.monto && errors.monto[0] ? true : false}>
                        <label htmlFor="">Monto detallado <b className="text-red">*</b></label>
                        <input
                            type="number"
                            name="monto"
                            step="any"
                            value={form?.monto || ""}
                            onChange={(e) => handleInput(e.target)}
                        />
                        <label htmlFor="">{errors.monto && errors.monto[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-12">
                    <hr/>
                </div>

                <div className="col-md-12">
                    <Show condicion={form.file}
                        predeterminado={
                            <DropZone
                                id="file-datos"
                                name="file"
                                multiple={false}
                                title="Seleccionar archivo PDF"
                                accept="application/pdf"
                                onChange={handleFile}
                            />
                        }
                    >
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-10">
                                        <b>{form?.file?.name || ""}</b>
                                    </div>
                                    <div className="col-md-2 text-center">
                                        <Button color="red"
                                            onClick={(e) => setForm({ ...form, file: null })}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Show>
                </div>

                <div className="col-md-12 text-right">
                    <hr/>
                    <Button color="teal" 
                        onClick={createDetalle}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddDetalle;