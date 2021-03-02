import React, { Fragment, useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import Router from 'next/router';
import { Form, Button } from 'semantic-ui-react'
import { handleErrorRequest, tramite } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple'
import ContentControl from '../../../components/contentControl';
import { Confirm } from '../../../services/utils';


const CreateTramiteType = ({ pathname, query }) => {

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    // cambio de form
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
        let answer = await Confirm('warning', '¿Estas seguro en guardar los datos?', 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        await tramite.post('tramite_type', form)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
        }).catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

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
            <ContentControl>
                <div className="col-lg-2 col-6">
                    <Button fluid 
                        color="teal"
                        disabled={current_loading}
                        onClick={save}
                        loading={current_loading}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </ContentControl>
        </Fragment>
    )
}

// server
CreateTramiteType.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query };
} 

// exportar
export default CreateTramiteType;