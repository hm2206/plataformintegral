import React, { useState, useContext } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import { Form, Button, Select } from 'semantic-ui-react'
import { unujobs, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { SelectTypeDescuento } from '../../../components/select/cronograma';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';
import { AppContext } from '../../../contexts/AppContext';


const CreateTypeSindicato = ({ pathname, query }) => {

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
        await unujobs.post('type_sindicato', form)
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
                    title="Tip. Afiliación"
                    info={["Crear Tip. Afiliación"]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <Form className="card-body mt-4">
                        <div className="row justify-content-center">
                            <div className="col-md-8">
                                <div className="row justify-content-end">
                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.nombre && errors.nombre[0] ? true : false}>
                                            <label htmlFor="">Descripción</label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="nombre"
                                                value={form.nombre || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.nombre && errors.nombre[0]}</label>  
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Modo</label>
                                            <Select
                                                placeholder="Select. Modo"
                                                options={[
                                                    { key: "porcentaje", value: true, text: "Porcentaje" },
                                                    { key: "monto", value: false, text: "Monto Estático" },
                                                ]}
                                                value={form.is_porcentaje ? true : false}
                                                name="is_porcentaje"
                                                onChange={(e, obj) => handleInput({ name: obj.name, value: obj.value ? 1 : 0 })}
                                            />
                                        </Form.Field>
                                    </div>

                                    <Show condicion={!form.is_porcentaje}>
                                        <div className="col-md-6 mb-3">
                                            <Form.Field error={errors && errors.monto && errors.monto[0] ? true : false}>
                                                <label htmlFor="">Monto</label>
                                                <input type="number"
                                                    placeholder="Ingrese el monto"
                                                    name="monto"
                                                    value={form.monto || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                <label>{errors && errors.monto && errors.monto[0]}</label> 
                                            </Form.Field>
                                        </div>
                                    </Show>

                                    <Show condicion={form.is_porcentaje}>
                                        <div className="col-md-6 mb-3">
                                            <Form.Field error={errors && errors.porcentaje && errors.porcentaje[0] ? true : false}>
                                                <label htmlFor="">Porcentaje</label>
                                                <input type="number"
                                                    placeholder="Ingrese el porcentaje"
                                                    name="porcentaje"
                                                    value={form.porcentaje || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                <label>{errors && errors.porcentaje && errors.porcentaje[0]}</label> 
                                            </Form.Field>
                                        </div>
                                    </Show>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.type_descuento_id && errors.type_descuento_id[0] ? true : false}>
                                            <label htmlFor="">Descuento</label>
                                            <SelectTypeDescuento
                                                value={form.type_descuento_id || ""}
                                                name="type_descuento_id"
                                                onChange={(e, obj) => handleInput(obj)}
                                            />
                                            <label>{errors && errors.type_descuento_id && errors.type_descuento_id[0]}</label>  
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

// server
CreateTypeSindicato.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let {pathname, query } = ctx;
    // responser
    return { pathname, query };
}

// exportar
export default CreateTypeSindicato;