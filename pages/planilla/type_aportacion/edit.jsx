import React, { useState, useContext, useEffect } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button } from 'semantic-ui-react'
import { handleErrorRequest, unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import atob from 'atob';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';
import { AUTHENTICATE } from '../../../services/auth';
import NotFoundData from '../../../components/notFoundData';

const TypeAportacionConfigMax = ({ success, type_aportacion, pathname, query }) => {
    
    // validar datos
    if (!success) return <NotFoundData/>

    // app
    const app_context = useContext(AppContext);

    // estados
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({});
    const [edit, setEdit] = useState(false);

    // cambiar form
    const handleInput = ({ name, value }) => {
        setEdit(true);
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // guardar datos
    const save = async () => {
        let answer = await Confirm('warning', `¿Deseas Actualizar los datos?`, 'Actualizar');
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = Object.assign({}, form);
            datos._method = 'PUT';
            await unujobs.post(`type_aportacion/${form.id}`, datos)
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                let { push } = Router;
                setErrors({})
                await push({ pathname, query });
                setEdit(false);
            })
            .catch(async err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
        }
    }

    // montar componente
    useEffect(() => {
        if (success && !edit) setForm(Object.assign({}, type_aportacion));
    }, [edit]);

    // render
    return (
        <>
            <div className="col-md-12">
                <BoardSimple
                    title="Tip. Aportación"
                    info={["Editar Tip. Aportación"]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <Form className="card-body mt-4">
                        <div className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field  error={errors && errors.key && errors.key[0]}>
                                            <label htmlFor="">ID-MANUAL <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese un identificador unico"
                                                name="key"
                                                value={form.key || ""}
                                                onChange={(e) => handleInput(e.target)}
                                                disabled
                                            />
                                            <label>{errors && errors.key && errors.key[0]}</label>  
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.descripcion && errors.descripcion[0]}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="descripcion"
                                                value={form.descripcion || ""}
                                                onChange={(e) => handleInput(e.target)}
                                                disabled={app_context.isLoading}
                                            />
                                            <label>{errors && errors.descripcion && errors.descripcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.porcentaje && errors.porcentaje[0]}>
                                            <label htmlFor="">Porcentaje <b className="text-red">*</b></label>
                                            <input type="number"
                                                placeholder="Ingrese una cantidad porcentual. Ejm 4 = 4%"
                                                name="porcentaje"
                                                value={form.porcentaje || ""}
                                                onChange={(e) => handleInput(e.target)}
                                                disabled={app_context.isLoading}
                                            />
                                            <label>{errors && errors.porcentaje && errors.porcentaje[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Mínimo</label>
                                            <input type="number"
                                                placeholder="Ingrese un monto mínimo"
                                                name="minimo"
                                                value={form.minimo || ""}
                                                onChange={(e) => handleInput(e.target)}
                                                disabled={app_context.isLoading}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Predeterminado</label>
                                            <input type="number"
                                                placeholder="Ingrese un monto predeterminado"
                                                name="default"
                                                value={form.default || ""}
                                                onChange={(e) => handleInput(e.target)}
                                                disabled={app_context.isLoading}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Exp Presupuestal</label>
                                            <input type="text"
                                                placeholder="Ingrese una extensión presupuestal"
                                                name="ext_pptto"
                                                value={form.ext_pptto || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                        </Form.Field>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
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

TypeAportacionConfigMax.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let id = query.id ? atob(query.id) : '__error';
    let { success, type_aportacion } = await unujobs.get(`type_aportacion/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, type_aportacion: {} }))
    // response
    return { pathname, query, type_aportacion, success };
}

export default TypeAportacionConfigMax;