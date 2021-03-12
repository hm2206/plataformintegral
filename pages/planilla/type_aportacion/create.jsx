import React, { useState, useContext } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import { Form, Button } from 'semantic-ui-react'
import { handleErrorRequest, unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';
import { AUTHENTICATE } from '../../../services/auth';

const TypeAportacionConfigMax = ({ pathname, query }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({});

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // guardar datos
    const save = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar los datos?`, 'Guardar');
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = Object.assign({}, form);
            await unujobs.post(`type_aportacion`, datos)
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setErrors({})
                setForm({});
            })
            .catch(async err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
        }
    }

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
                                        <Form.Field  error={errors && errors.key && errors.key[0] ? true : false}>
                                            <label htmlFor="">ID-MANUAL <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese un identificador unico"
                                                name="key"
                                                value={form.key || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.key && errors.key[0]}</label>  
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.descripcion && errors.descripcion[0] ? true : false}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="descripcion"
                                                value={form.descripcion || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.descripcion && errors.descripcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.porcentaje && errors.porcentaje[0] ? true : false}>
                                            <label htmlFor="">Porcentaje <b className="text-red">*</b></label>
                                            <input type="number"
                                                placeholder="Ingrese una cantidad porcentual. Ejm 4 = 4%"
                                                name="porcentaje"
                                                value={form.porcentaje || ""}
                                                onChange={(e) => handleInput(e.target)}
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

TypeAportacionConfigMax.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query };
}

export default TypeAportacionConfigMax;