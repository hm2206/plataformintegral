import React, { useContext, useState } from 'react';
import Modal from '../modal';
import { Form, Select, Checkbox, Button } from 'semantic-ui-react';
import storage from '../../services/storage.json';
import Show from '../show';
import AssignPerson from '../authentication/user/assignPerson';
import { SelectTypeDescuento, SelectBanco } from '../select/cronograma';
import { AppContext } from '../../contexts/AppContext';
import { Confirm } from '../../services/utils';
import { unujobs } from '../../services/apis';
import Swal from 'sweetalert2';
import moment from 'moment';

const AddObligacion = (props) => {

    // entity
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState({
        fecha_de_inicio: moment().format('YYYY-MM-DD')
    });
    const [option, setOption] = useState("");
    const [person, setPerson] = useState({});
    const isPerson = Object.keys(person).length;
    const [errors, setErrors] = useState({});

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        // setting errors
        let newErrors = Object.assign({}, errors);
        newErrors[name] = null;
        setErrors(newErrors);
    }

    // agregar persona
    const addPerson = (obj) => {
        setOption("");
        setPerson(obj);
    }

    // agregar obligación
    const addObligacion = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en agregar la obligación judicial?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = Object.assign({}, form);
            datos.person_id = person.id;
            datos.info_id = props.info_id;
            await unujobs.post('type_obligacion', datos)
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message, type_obligacion } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    setForm({ fecha_de_inicio: moment().format('YYYY-MM-DD') });
                    setPerson({});
                    await addCurrentObligacion(type_obligacion);
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { message, errors } = err.response.data;
                        Swal.fire({ icon: 'warning', text: message });
                        setErrors(errors);
                    } catch (error)  { throw new Error(err.message) }
                }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
        }
    }

    // agregar obligacion al cronograma
    const addCurrentObligacion = async (type_obligacion) => {
        app_context.setCurrentLoading(true);
        // obtener datos de las props
        let { onSave, historial_id } = props;
        let paylaod = {
            historial_id,
            type_obligacion_id: type_obligacion.id
        };
        // request  
        await unujobs.post('obligacion', paylaod)
            .then(res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                if (typeof onSave == 'function') onSave(type_obligacion);
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message });
            })
    }

    // render
    return <Modal {...props}
        titulo={<span><i className="fas fa-plus"></i> Agregar Obligación judicial</span>}
        show={true}
    >
        <div className="card-body">
            <div className="row mb-4 pl-3 pr-3">
                <div className="col-md-12 mb-3">
                    <h5>Datos del Beneficiario</h5>
                    <hr/>
                </div>

                <Show condicion={isPerson}>
                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Tip. Documento</label>
                            <Select
                                placeholder="Seleccionar Tip. Documento"
                                options={storage.tipo_documento}
                                name="tipo_documento" 
                                value={person.document_type || ""}
                                disabled
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">N° Documento</label>
                            <input
                                type="text"
                                readOnly
                                value={person.document_number || ""}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Apellidos y Nombres</label>
                            <input
                                type="text"
                                readOnly
                                className="uppercase"
                                value={person.fullname || ""}
                            />
                        </Form.Field>
                    </div>
                </Show>

                <div className="col-md-12 mb-3">
                    <Button
                        onClick={(e) => setOption("assign")}
                    >
                        {isPerson ? <span><i className="fas fa-sync"></i> Cambiar</span> : <span><i className="fas fa-plus"></i> Agregar</span>} 
                    </Button>
                </div>

                <div className="col-md-12 mb-3">
                    <hr/>
                    <h5>Datos de la Cuenta</h5>
                    <hr/>
                </div>

                <div className="col-md-12 mb-3">
                    <Form.Field error={errors.type_descuento_id && errors.type_descuento_id[0] || ""}>
                        <label htmlFor="">Tip. Descuento <b className="text-red">*</b></label>
                        <SelectTypeDescuento
                            judicial={1}
                            value={form.type_descuento_id}
                            name="type_descuento_id"
                            onChange={(e, obj) => handleInput(obj)}
                        />
                        <label htmlFor="">{errors.type_descuento_id && errors.type_descuento_id[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.tipo_documento && errors.tipo_documento[0] || ""}>
                        <label htmlFor="">Tip. Documento <b className="text-red">*</b></label>
                        <Select
                            placeholder="Seleccionar Tip. Documento"
                            options={storage.tipo_documento}
                            name="tipo_documento" 
                            value={form.tipo_documento || ""}
                            onChange={(e, obj) => handleInput(obj)}
                        />
                        <label htmlFor="">{errors.tipo_documento && errors.tipo_documento[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.numero_de_documento && errors.numero_de_documento[0] || ""}>
                        <label htmlFor="">N° Documento <b className="text-red">*</b></label>
                        <input
                            type="text"
                            name="numero_de_documento" 
                            value={form.numero_de_documento || ""}
                            onChange={({target}) => handleInput(target)}
                        />
                        <label htmlFor="">{errors.numero_de_documento && errors.numero_de_documento[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.banco_id && errors.banco_id[0] || ""}>
                        <label htmlFor="">Banco <b className="text-red">*</b></label>
                        <SelectBanco
                            name="banco_id" 
                            value={form.banco_id || ""}
                            onChange={(e, obj) => handleInput(obj)}
                        />
                        <label htmlFor="">{errors.banco_id && errors.banco_id[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.numero_de_cuenta && errors.numero_de_cuenta[0] || ""}>
                        <label htmlFor="">N° Cuenta</label>
                        <input
                            type="text"
                            name="numero_de_cuenta" 
                            value={form.numero_de_cuenta || ""}
                            onChange={({target}) => handleInput(target)}
                        />
                        <label htmlFor="">{errors.numero_de_cuenta && errors.numero_de_cuenta[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field>
                        <label htmlFor="">Por Porcentaje</label>
                        <Checkbox toggle 
                            name="is_porcentaje"
                            value={form.is_porcentaje ? true : false}   
                            onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                        />
                    </Form.Field>
                </div>

                <Show condicion={form.is_porcentaje}>
                    <Form.Field error={errors.modo && errors.modo[0] || ""} className="col-md-6 mb-3">
                        <label htmlFor="">Modo de Descuento</label>
                        <Select
                            fluid
                            placeholder="Seleccionar modo"
                            name="modo"
                            value={form.modo || ""}
                            onChange={(e, obj) => handleInput(obj)}
                            options={[
                                {key: "select-bruto", value: 'BRUTO', text: 'Bruto'},
                                {key: "select-neto", value: 'NETO', text: 'Neto'}
                            ]}
                        />
                        <label htmlFor="">{errors.modo && errors.modo[0] || ""}</label>
                    </Form.Field>
                </Show>

                <Show condicion={form.is_porcentaje}>
                    <Form.Field error={errors.modo && errors.modo[0] || ""} className="col-md-6 mb-3">
                        <label htmlFor="">Aplica Bonificaciones</label>
                        <Checkbox toggle 
                            name="bonificacion"
                            value={form.bonificacion ? true : false}   
                            onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                        />
                    </Form.Field>
                </Show>

                <div className="col-md-6 mb-3">
                    <Form.Field>
                        <label htmlFor="">{form.is_porcentaje ? 'Porcentaje %' : 'Monto'}</label>
                        <Show condicion={form.is_porcentaje}
                            predeterminado={<input type="number" 
                                step="any"
                                name="monto"
                                value={form.monto || ""}
                                onChange={({target}) => handleInput(target)}
                            />}
                        >
                            <input
                                step="any"
                                type="number"
                                name="porcentaje" 
                                value={form.porcentaje || ""}
                                onChange={({target}) => handleInput(target)}
                            />
                        </Show>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.fecha_de_inicio && errors.fecha_de_inicio[0] || ""}>
                        <label htmlFor="">Fecha Inicio <b className="text-red">*</b></label>
                        <input
                            type="date"
                            readOnly
                            disabled
                            name="fecha_de_inicio"
                            value={form.fecha_de_inicio || ""}
                            onChange={({target}) => handleInput(target)}
                        />
                        <label htmlFor="">{errors.fecha_de_inicio && errors.fecha_de_inicio[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors.fecha_de_termino && errors.fecha_de_termino[0] || ""}>
                        <label htmlFor="">Fecha Término</label>
                        <input
                            type="date"
                            name="fecha_de_termino"
                            value={form.fecha_de_termino || ""}
                            onChange={({target}) => handleInput(target)}
                        />
                        <label htmlFor="">{errors.fecha_de_termino && errors.fecha_de_termino[0] || ""}</label>
                    </Form.Field>
                </div>

                <div className="col-md-12 mb-3">
                    <Form.Field>
                        <label htmlFor="">Observación</label>
                        <textarea
                            name="observacion"
                            value={form.observacion || ""}
                            onChange={({target}) => handleInput(target)}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-12 text-right">
                    <hr/>
                    <Button color="teal"
                        onClick={addObligacion}
                        disabled={!isPerson}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </div>
        </div>

        <Show condicion={option == 'assign'}>
            <AssignPerson
                local={true}
                getAdd={addPerson}
                isClose={(e) => setOption("")}
            />
        </Show>
    </Modal>
}

export default AddObligacion;