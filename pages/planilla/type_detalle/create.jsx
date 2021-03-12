import React, { useState, useContext } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import { Form, Button  } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { SelectTypeDescuento } from '../../../components/select/cronograma';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';


const CreateTypeDetalle = ({ pathname, query }) => {

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
        await unujobs.post('type_detalle', form)
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
                    title="Tip. Detalle"
                    info={["Crear Tip. Detalle"]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <Form className="card-body mt-4">
                        <div className="row justify-content-center">
                            <div className="col-md-8">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
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

                                    <div className="col-md-8 mb-3">
                                        <Form.Field error={errors && errors.type_descuento_id && errors.type_descuento_id[0] ? true : false}>
                                            <label htmlFor="">Tipo de Descuento</label>
                                            <SelectTypeDescuento
                                                value={form.type_descuento_id}
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
CreateTypeDetalle.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let {pathname, query } = ctx;
    // responser
    return { pathname, query };
}

// exportar
export default CreateTypeDetalle;