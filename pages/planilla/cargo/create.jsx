import React, { useState, useContext } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import { Form, Button } from 'semantic-ui-react'
import { unujobs, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { SelectPlanilla, SelectTypeCargo } from '../../../components/select/cronograma';
import BoardSimple from '../../../components/boardSimple';
import { AppContext } from '../../../contexts';
import ContentControl from '../../../components/contentControl';


const CreateCargo = ({ pathname, query }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});

    // manejar estado del form
    const handleInput = ({ name, value }, obj = 'form') => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // guardar datos
    const save = async () => {
        let answer = await Confirm("warning", "¿Estás seguro en guardar los datos?", "Estoy seguro");
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await unujobs.post('cargo', form)
        .then(async res => {
            app_context.setCurrentLoading(false)
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
        })
        .catch(async err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
    }

    // renderizar
    return (
        <>
            <div className="col-md-12">
                <BoardSimple
                    title="Partición Presupuestal"
                    info={["Crear Partición Presp."]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <div className="card-body mt-5">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.alias && errors.alias[0] ? true : false}>
                                            <label htmlFor="">Alias <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="alias"
                                                placeholder="Ingrese un alias"
                                                value={form.alias || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.alias && errors.alias[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field  error={errors && errors.descripcion && errors.descripcion[0] ? true : false}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="descripcion"
                                                placeholder="Ingrese una descripción"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.descripcion || ""}
                                            />
                                            <label>{errors && errors.descripcion && errors.descripcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field  error={errors && errors.ext_pptto && errors.ext_pptto[0] ? true : false}>
                                            <label htmlFor="">Exp Presupuestal <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese una extensión presupuestal"
                                                name="ext_pptto"
                                                value={form.ext_pptto || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.ext_pptto && errors.ext_pptto[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.planilla_id && errors.planilla_id[0] ? true : false}>
                                            <label htmlFor="">Planilla <b className="text-red">*</b></label>
                                            <SelectPlanilla
                                                name="planilla_id"
                                                value={form.planilla_id || ""}
                                                onChange={(e, obj) => handleInput(obj)}
                                            />
                                            <label>{errors && errors.planilla_id && errors.planilla_id[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.type_cargo_id && errors.type_cargo_id[0] ? true : false}>
                                            <label htmlFor="">Tip. Cargo <b className="text-red">*</b></label>
                                            <SelectTypeCargo
                                                value={form.type_cargo_id || ""}
                                                name="type_cargo_id"
                                                onChange={(e, obj) => handleInput(obj)}
                                            />
                                            <label>{errors && errors.type_cargo_id && errors.type_cargo_id[0]}</label>
                                        </Form.Field>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </BoardSimple>
            </div>
            {/* panel de control */}
            <ContentControl>
                <div className="col-lg-2 col-6">
                    <Button fluid 
                        color="teal"
                        onClick={save}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </ContentControl>
        </>
    )
}

// server
CreateCargo.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let {pathname, query } = ctx;
    // responser
    return { pathname, query };
}

// exportar
export default CreateCargo;