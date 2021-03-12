import React, { useState, useContext, useEffect } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import { Form, Button  } from 'semantic-ui-react'
import { unujobs, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { SelectTypeDescuento } from '../../../components/select/cronograma';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';
import atob from 'atob';
import Router from 'next/router';
import NotFoundData from '../../../components/notFoundData';


const EditTypeDetalle = ({ pathname, query, success, type_detalle }) => {

    // verificar
    if (!success) return <NotFoundData/>

    // app
    const app_context = useContext(AppContext);
    
    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [edit, setEdit] = useState(false);

    // manejar estado del form
    const handleInput = ({ name, value }) => {
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
        let answer = await Confirm("warning", "¿Estás seguro en guardar los cambios?", "Estoy seguro");
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        let payload = Object.assign({}, form);
        payload._method = 'PUT';
        await unujobs.post(`type_detalle/${type_detalle.id}`, payload)
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
        if (!edit) setForm(Object.assign({}, type_detalle));
    }, [edit]);

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
EditTypeDetalle.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let {pathname, query } = ctx;
    // get id
    let id = atob(query.id || "") || "_error";
    // request
    let { success, type_detalle } = await unujobs.get(`type_detalle/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, type_detalle: {} }));
    // responser
    return { pathname, query, success, type_detalle };
}

// exportar
export default EditTypeDetalle;