import React, { useContext, useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import { Form, Button, Checkbox } from 'semantic-ui-react'
import { handleErrorRequest, unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import ContentControl from '../../../components/contentControl';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';
import { AppContext } from '../../../contexts';


const CreateTypeRemuneracion = () => {    

    // app
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});

    // manejar estados
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
        let answer = await Confirm("warning", "¿Estás seguro en guardar los datos?", "Estoy seguro");
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await unujobs.post('type_remuneracion', form)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if (!success) throw  new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            setErrors({});
            setForm({});
        })
        .catch(async err => handleErrorRequest(err, setErrors, app_context.setCurrentLoading(false)));
    }

    // renderizado
    return (
        <>
            <div className="col-md-12">
                <BoardSimple
                    title="Tip. Remuneración"
                    info={["Crear Tip. Remuneración"]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <div className="card-body mt-4">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.key && errors.key[0] ? true : false}>
                                            <label htmlFor="">ID-MANUAL <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese un identificador único"
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
                                        <Form.Field error={errors && errors.alias && errors.alias[0] ? true : false}>
                                            <label htmlFor="">Alias <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción corta(Alias)"
                                                name="alias"
                                                value={form.alias || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.alias && errors.alias[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Ext Presupuestal <small>(Opcional)</small></label>
                                            <input type="text"
                                                placeholder="Ingrese una extensión presupuestal(Opcional)"
                                                name="ext_pptto"
                                                value={form.ext_pptto || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">¿Aplica a la Base Imponible?</label>
                                            <div>
                                                <Checkbox toggle
                                                    name="base"
                                                    checked={form.base ? false : true}
                                                    onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 0 : 1 })}
                                                />
                                            </div>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">¿Es una Bonificación/Gratificación?</label>
                                            <div>
                                                <Checkbox toggle
                                                    name="bonificacion"
                                                    checked={form.bonificacion ? true : false}
                                                    onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                />
                                            </div>
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
CreateTypeRemuneracion.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query }
}

// exportar
export default CreateTypeRemuneracion;