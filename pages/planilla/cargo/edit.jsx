import React, { useEffect, useState, useContext } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button } from 'semantic-ui-react'
import { unujobs, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { SelectPlanilla, SelectTypeCargo } from '../../../components/select/cronograma';
import BoardSimple from '../../../components/boardSimple';
import { AppContext } from '../../../contexts';
import ContentControl from '../../../components/contentControl';
import atob from 'atob';
import NotFoundData from '../../../components/notFoundData';
import Show from '../../../components/show';


const EditCargo = ({ pathname, query, success, cargo }) => {

    if (!success) return <NotFoundData/>

    // app
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [edit, setEdit] = useState(false);

    // manejar estado del form
    const handleInput = ({ name, value }, obj = 'form') => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // guardar cambios
    const save = async () => {
        let answer = await Confirm("warning", "¿Estás seguro en guardar los cambios?", "Estoy seguro");
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        let payload = Object.assign({}, form);
        payload._method = 'PUT';
        await unujobs.post(`cargo/${cargo.id}`, payload)
        .then(async res => {
            app_context.setCurrentLoading(false)
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            await Router.push(location.href);
            setErrors({});
            setEdit(false);
        })
        .catch(async err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
    }

    // cancel edit
    useEffect(() => {
        if (!edit) {
            setForm(Object.assign({}, cargo));
            setEdit(false);
        }
    }, [edit]);

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
            <Show condicion={edit}>
                <ContentControl>
                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="red"
                            onClick={(e) => setEdit(false)}
                        >
                            <i className="fas fa-times"></i> Cancelar
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="blue"
                            onClick={save}
                        >
                            <i className="fas fa-sync"></i> Actualizar
                        </Button>
                    </div>
                </ContentControl>
            </Show>
        </>
    )
}

// server
EditCargo.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let {pathname, query } = ctx;
    // get id
    let id = atob(query.id || "") || "__error";
    // request
    let { success, cargo } = await unujobs.get(`cargo/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, cargo: {} }));
    // responser
    return { pathname, query, success, cargo };
}

// exportar
export default EditCargo;