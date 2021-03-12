import React, { useEffect, useState, Fragment, useContext } from 'react';
import { Form, Select, Button, Icon, Checkbox } from 'semantic-ui-react';
import Show from '../../../components/show';
import { handleErrorRequest, unujobs } from '../../../services/apis';
import { parseOptions, Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import { SelectPlanilla } from '../../../components/select/cronograma';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';
import { AppContext } from '../../../contexts';

const schemaDefault = {
    year: (new Date).getFullYear(), 
    mes: (new Date).getMonth() + 1,
    dias: 30,
    adicional: 0,
    type_id: 0,
}

const RegisterCronograma = () => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [is_ready, setIsReady] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const types = [
        { key: "tipo-0", value: false, text: "Planilla nueva" },
        { key: "tipo-1", value: true, text: "Copiar del mes anterior" }
    ];

    // manejador de cambios de form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // predetenerminados
    useEffect(() => {
        setForm({ ...schemaDefault });
        setIsReady(true);
    }, []);

    // limpiar info
    useEffect(() => {
        if (is_ready) setForm({ ...form, adicional: 0, remanente: 0, copy_detalle: 0 });
    }, [form.type_id]);

    // limpiar adicional
    useEffect(() => {
        if (is_ready) setForm({ ...form, remanente: 0 });
    }, [form.adicional]);

    // guardar los datos
    const save = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en crear el cronograma?`, 'Crear')
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await unujobs.post('cronograma', form)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({ ...schemaDefault })
        }).catch(err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
    }

    // renderizado
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    title="Cronograma"
                    info={["Crear cronograma"]}
                    prefix={<BtnBack/>}
                    options={[]}
                    bg="light"
                >                    
                    <div className="card- mt-3">
                        <div className="card-body">
                            <div className="row justify-content-center">
                                <Form action="#" className="col-md-10" onSubmit={(e) => e.preventDefault()}>
                                    <div className="row justify-content-center">
                                            <Form.Field className="col-md-6" error={errors.planilla_id && errors.planilla_id[0] ? true : false}>
                                                <label htmlFor="" className="text-left">Planilla</label>
                                                <SelectPlanilla
                                                    name="planilla_id"
                                                    value={form.planilla_id}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                    disabled={current_loading}
                                                />
                                                <label htmlFor="">{errors.planilla_id && errors.planilla_id[0] || ""}</label>
                                            </Form.Field>

                                            <Form.Field className="col-md-6" error={errors.year && errors.year[0] ? true : false}>
                                                <label htmlFor="">Año</label>
                                                <input
                                                    className="text-left"
                                                    name="year"
                                                    type="number"
                                                    value={form.year || ""}  
                                                    onChange={({ target }) => handleInput(target)}
                                                    placeholder='Ingrese el año'
                                                    disabled
                                                />
                                                <label htmlFor="">{errors.year && errors.year[0] || ""}</label>
                                            </Form.Field>

                                            <Form.Field className="col-md-6" error={errors.mes && errors.mes[0] ? true : false}>
                                                <label htmlFor="">Mes</label>
                                                <input
                                                    className="text-left"
                                                    type="number"
                                                    name="mes"
                                                    min="1"
                                                    max="12"
                                                    value={form.mes || ""}  
                                                    onChange={({ target }) => handleInput(target)}
                                                    placeholder='Ingrese el mes'
                                                    disabled={current_loading}
                                                />
                                                <label htmlFor="">{errors.mes && errors.mes[0] || ""}</label>
                                            </Form.Field>

                                            <Form.Field className="col-md-6">
                                                <label htmlFor="">Dias</label>
                                                <input
                                                    className="text-left"
                                                    type="number"
                                                    name="dias"
                                                    value={form.dias || ""}  
                                                    onChange={({ target }) => handleInput(target)}
                                                    placeholder='Ingrese los dias'
                                                    disabled={!form.adicional || current_loading}
                                                />
                                            </Form.Field>

                                        <Show condicion={!form.adicional}>
                                            <Form.Field className="text-left col-md-6" error={errors.type_id && errors.type_id[0] ? true : false}>
                                                <label htmlFor="">Modo de creación</label>
                                                <Select
                                                    options={types}
                                                    value={form.type_id ? true : false}
                                                    name="type_id"
                                                    fluid
                                                    disabled={current_loading}
                                                    onChange={(e, obj) => handleInput({ name: obj.name, value: obj.value ? 1 : 0 })}
                                                />
                                                <label htmlFor="">{errors.type_id && errors.type_id[0] || ""}</label>
                                            </Form.Field>
                                        </Show>

                                        <Show condicion={form.adicional == 0 && form.type_id}>
                                            <Form.Field className="text-left col-md-6">
                                                <label htmlFor="">Copiar Detallado</label>
                                                <div>
                                                    <Checkbox toggle
                                                        checked={form.copy_detalle ? true : false}
                                                        name="copy_detalle"
                                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                        disabled={current_loading}
                                                    />
                                                </div>
                                            </Form.Field>
                                            
                                            <div className="col-md-6"></div>
                                        </Show>

                                        <Show condicion={!form.type_id}>
                                            <Form.Field className="col-md-6">
                                                <label htmlFor="">¿Es una planilla adicional?</label>
                                                <div>
                                                    <Checkbox toggle
                                                        name="adicional"
                                                        checked={form.adicional ? true : false}
                                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                        disabled={current_loading}
                                                    />
                                                </div>
                                            </Form.Field>
                                        </Show>

                                        <Show condicion={form.adicional == 1}>
                                            <Form.Field className="col-md-6">
                                                <label htmlFor="">¿Es una planilla remanente?</label>
                                                <div>
                                                    <Checkbox toggle
                                                        name="remanente"
                                                        checked={form.remanente ? true : false}
                                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                        disabled={current_loading}
                                                    />
                                                </div>
                                            </Form.Field>

                                            <div className="col-md-6"></div>
                                        </Show>
                                    
                                        <Form.Field className="col-md-12">
                                            <label htmlFor="" className="text-left">Observación</label>
                                            <textarea name="observacion"
                                                rows="6"
                                                value={form.observacion || ""}
                                                placeholder="Ingrese una observación para el cronograma"
                                                onChange={({ target }) => handleInput(target)}
                                                disabled={current_loading}
                                            />
                                        </Form.Field>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </BoardSimple>
            </div>
            {/* panel de control */}
            <ContentControl>
                <div className="col-lg-2 col-6">
                    <Button fluid 
                        color="teal"
                        disabled={current_loading}
                        onClick={save}
                        loading={current_loading}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </ContentControl>
        </Fragment>
    )
}

// server
RegisterCronograma.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query }
}

// exportar
export default RegisterCronograma;