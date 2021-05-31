import React, { useContext, useState, useEffect } from 'react';
import { BtnBack } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { Confirm } from '../../../services/utils' 
import { Form, Button } from 'semantic-ui-react'
import { unujobs, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts';
import ContentControl from '../../../components/contentControl';
import atob from 'atob';
import Show from '../../../components/show';
import Router from 'next/router';
import BoardSimple from '../../../components/boardSimple';
import NotFoundData from '../../../components/notFoundData';


const EditTypeCategoria = ({ pathname, query, success, type_categoria }) => {

    // validar datos
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

    // guardar datos
    const save = async () => {
        let answer = await Confirm("warning", "¿Estás seguro en guardar los datos?", "Estoy seguro");
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        let payload = Object.assign({}, form);
        delete payload.cargos;
        payload._method = 'PUT';
        await unujobs.post(`type_categoria/${type_categoria.id}`, payload)
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

    // obtener el object
    useEffect(() => {
        if (!edit) setForm(Object.assign({}, type_categoria));
    }, [edit]);

    // renderizado
    return (
        <>
            <div className="col-md-12">
                <BoardSimple
                    title="Tip. Categoría"
                    info={["Editar Tip. Categoría"]}
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
EditTypeCategoria.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let {pathname, query } = ctx;
    // request 
    let id = atob(query.id) || '__error';
    let { success, type_categoria } = await unujobs.get(`type_categoria/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, type_categoria: {} }));
    return { query, pathname, success, type_categoria }
}

// exportar
export default EditTypeCategoria;