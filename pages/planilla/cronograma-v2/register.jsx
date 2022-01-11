import React, { useEffect, useState, Fragment, useContext } from 'react';
import { Form, Button, Checkbox } from 'semantic-ui-react';
import Show from '../../../components/show';
import { handleErrorRequest, unujobs, microPlanilla } from '../../../services/apis';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { BtnBack } from '../../../components/Utils';
import { SelectPlanilla } from '../../../components/select/cronograma';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';
import { AppContext } from '../../../contexts';
import { EntityContext } from '../../../contexts/EntityContext';
import SelectCronogramaCreate from '../../../components/cronograma/selectCronogramaCreate';

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

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [is_ready, setIsReady] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [mode, setMode] = useState(undefined);

    // manejador de cambios de form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }


    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

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

    const handleMode = ({ value }) => {
        setMode(value);
    }

    // guardar los datos
    const save = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en crear el cronograma?`, 'Crear')
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        const payload = Object.assign({}, form);
        payload.entityId = entity_context.entity_id;
        payload.remanente = form?.remanente ? true : false;
        await microPlanilla.post('cronogramas', payload)
        .then(async () => {
            app_context.setCurrentLoading(false);
            await Swal.fire({ icon: 'success', text: `El cronograma se creó correctamente!` });
            setForm({ ...schemaDefault })
        }).catch(() => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: 'No se pudo guardar los datos' })
        });
    }

    const clone = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en clonar el cronograma?`, 'Clonar')
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        const payload = Object.assign({}, form);
        payload.entityId = entity_context.entity_id;
        await microPlanilla.post(`cronogramas/${mode}/clone`, payload)
        .then(async () => {
            app_context.setCurrentLoading(false);
            await Swal.fire({ icon: 'success', text: `El cronograma se clonó correctamente!` });
            setForm({ ...schemaDefault })
        }).catch(() => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: 'No se pudo guardar los datos' })
        });
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
                                            <Form.Field className="col-md-6" error={errors.planillaId && errors.planillaId[0] ? true : false}>
                                                <label htmlFor="" className="text-left">Planilla <b className="text-danger">*</b></label>
                                                <SelectPlanilla
                                                    name="planillaId"
                                                    value={form.planillaId}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                />
                                                <label htmlFor="">{errors.planillaId && errors.planillaId[0] || ""}</label>
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
                                                <label htmlFor="">Mes <b className="text-danger">*</b></label>
                                                <input
                                                    className="text-left"
                                                    type="number"
                                                    name="mes"
                                                    min="1"
                                                    max="12"
                                                    value={form.mes || ""}  
                                                    onChange={({ target }) => handleInput(target)}
                                                    placeholder='Ingrese el mes'
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
                                                    disabled={!form.adicional}
                                                />
                                            </Form.Field>

                                        <Show condicion={!form.adicional}>
                                            <Form.Field className="text-left col-md-6">
                                                <label htmlFor="">Modo de creación <b className="text-danger">*</b></label>
                                                <SelectCronogramaCreate
                                                    onChange={handleMode}
                                                />
                                            </Form.Field>
                                            <Show condicion={mode !== 'NEW'}>
                                                <div className="col-md-6 col-12"></div>
                                            </Show>
                                        </Show>

                                        <Show condicion={mode === 'NEW'}>
                                            <Form.Field className="col-md-6">
                                                <label htmlFor="">¿Es una planilla adicional?</label>
                                                <div>
                                                    <Checkbox toggle
                                                        name="adicional"
                                                        checked={form.adicional ? true : false}
                                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                    />
                                                </div>
                                            </Form.Field>
                                        </Show>

                                        <Show condicion={mode === 'NEW' && form.adicional == 1}>
                                            <Form.Field className="col-md-6">
                                                <label htmlFor="">¿Es una planilla remanente?</label>
                                                <div>
                                                    <Checkbox toggle
                                                        name="remanente"
                                                        checked={form.remanente ? true : false}
                                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
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
                        disabled={!mode}
                        onClick={mode == 'NEW' ? save : clone}
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