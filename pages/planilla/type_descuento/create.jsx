import React, { useState, useContext } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import { Form, Button, Checkbox } from 'semantic-ui-react'
import { unujobs, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import ContentControl from '../../../components/contentControl';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';
import { AppContext } from '../../../contexts';


const CreateTypeDescuento = ({ pathname, query }) => {

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
        await unujobs.post('type_descuento', form)
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

    // renderizar
    return (
        <>
            <div className="col-md-12">
                <BoardSimple
                    title="Tip. Descuento"
                    info={["Crear Tip. Descuento"]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <Form className="card-body mt-4">
                        <div className="row justify-content-center">
                            <div className="col-md-8">
                                <div className="row justify-content-end">
                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.key && errors.key[0] ? true : false}>
                                            <label htmlFor="">ID-MANUAL</label>
                                            <input type="text"
                                                placeholder="Ingrese un identificador unico"
                                                name="key"
                                                value={form.key || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.key && errors.key[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.descripcion && errors.descripcion[0] ? true : false}>
                                            <label htmlFor="">Descripción</label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="descripcion"
                                                value={form.descripcion || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.descripcion && errors.descripcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">¿Mostrar en el Reporte Plame?</label>
                                            <div>
                                                <Checkbox toggle
                                                    name="plame"
                                                    checked={form.plame ? true : false}
                                                    onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                />
                                            </div>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Edición</label>
                                            <div>
                                                <Checkbox toggle
                                                    name="edit"
                                                    checked={form.edit ? true : false}
                                                    onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                />
                                            </div>
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

// server rendering
CreateTypeDescuento.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query }
}

export default CreateTypeDescuento;