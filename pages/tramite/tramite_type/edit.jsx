import React, { Fragment, useEffect, useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import Router from 'next/router';
import { Form, Button } from 'semantic-ui-react'
import { handleErrorRequest, tramite } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple'
import ContentControl from '../../../components/contentControl';
import { Confirm } from '../../../services/utils';
import atob from 'atob';
import Show from '../../../components/show';


const CreateTramiteType = ({ pathname, query, success, tramite_type }) => {

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [edit, setEdit] = useState(false);

    // cambio de form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // actualizar datos
    const save = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en guardar los datos?', 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        await tramite.post(`tramite_type/${tramite_type.id}?_method=PUT`, form)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            await Router.push(location.href);
            setErrors({});
            setEdit(false);
        }).catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    // cancelar edicion
    useEffect(() => {
        if (!edit) setForm(JSON.parse(JSON.stringify(tramite_type || {})));
    }, [edit]);

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    title="Tipo Documento"
                    info={["Crear tipo de documento"]}
                    prefix={<BtnBack/>}
                    options={[]}
                    bg="light"
                >
                    <Form className="card-body mt-4">
                        <div className="row justify-content-center">
                            <div className="col-md-7">
                                <div className="row justify-center">
                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.short_name && errors.short_name[0] ? true :  false}>
                                            <label htmlFor="">Nombre Corto <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese una nombre corto"
                                                name="short_name"
                                                value={form.short_name || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors.short_name && errors.short_name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.description && errors.description[0] ? true : false}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="description"
                                                value={form.description || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors.description && errors.description[0]}</label>
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
                            disabled={current_loading}
                            onClick={(e) => setEdit(false)}
                        >
                            <i className="fas fa-times"></i> Cancelar
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="blue"
                            disabled={current_loading}
                            onClick={save}
                            loading={current_loading}
                        >
                            <i className="fas fa-sync"></i> Actualizar
                        </Button>
                    </div>
                </ContentControl>
            </Show>
        </Fragment>
    )
}

// server
CreateTramiteType.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let id = atob(query.id || "") || '_error';
    let { success, tramite_type } = await tramite.get(`tramite_type/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, tramite_type: {} }));
    // response
    return { pathname, query, success, tramite_type };
} 

// exportar
export default CreateTramiteType;