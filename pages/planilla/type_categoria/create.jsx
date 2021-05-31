import React, { useContext, useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { Confirm } from '../../../services/utils' 
import { Form, Button } from 'semantic-ui-react'
import { unujobs, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts';
import ContentControl from '../../../components/contentControl';
import BoardSimple from '../../../components/boardSimple';


const CreateTypeCategoria = ({ pathname, query }) => {

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
        await unujobs.post('type_categoria', form)
        .then(async res => {
            app_context.setCurrentLoading(false)
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
        })
        .catch(async err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
    }

    // renderizado
    return (
        <>
            <div className="col-md-12">
                <BoardSimple
                    title="Tip. Categoría"
                    info={["Crear Tip. Categoría"]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <Form className="card-body mt-4">
                        <div className="row justify-content-center">
                            <div className="col-md-8">
                                <div className="row justify-content-end">
                                    <div className="col-md-12 mb-3">
                                        <Form.Field  error={errors.information && errors.information[0] ? true : false}>
                                            <label htmlFor="">Información Detallada</label>
                                            <textarea
                                                rows="4"
                                                placeholder="Ingrese la información detallada"
                                                name="information"
                                                value={form.information || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors.information && errors.information[0]}</label>  
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors.descripcion && errors.descripcion[0] ? true : false}>
                                            <label htmlFor="">Descripción</label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="descripcion"
                                                value={form.descripcion || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors.descripcion && errors.descripcion[0]}</label>  
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.dedicacion && errors.dedicacion[0] ? true : false}>
                                            <label htmlFor="">Dedicación</label>
                                            <input type="text"
                                                placeholder="Ingrese la dedicación"
                                                name="dedicacion"
                                                value={form.dedicacion || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors.dedicacion && errors.dedicacion[0]}</label>  
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.export_key && errors.export_key[0] ? true : false}>
                                            <label htmlFor="">Export Key Plame</label>
                                            <input type="text"
                                                placeholder="Ingrese la clave para exportar el txt PLAME. Ejm 07"
                                                name="export_key"
                                                value={form.export_key || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors.export_key && errors.export_key[0]}</label> 
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.export_value && errors.export_value[0] ? true : false}>
                                            <label htmlFor="">Export Value Plame</label>
                                            <input type="text"
                                                placeholder="Ingrese el valor de exportación del txt PLAME. Ejm 0002"
                                                name="export_value"
                                                value={form.export_value || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors.export_value && errors.export_value[0]}</label>
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
CreateTypeCategoria.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let {pathname, query } = ctx;
    // responser
    return { pathname, query };
}

// exportar
export default CreateTypeCategoria;