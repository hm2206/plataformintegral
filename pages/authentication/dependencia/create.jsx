import React, { useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple'
import atob from 'atob';
import ContentControl from '../../../components/contentControl';
import { Fragment } from 'react';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';


const EditDependencia = ({ pathname, query }) => {

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    // cambiar dependencia
    const handleInput = ({ name, value }, obj = 'form') => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // actualizar dependencia
    const save = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar los datos?`, 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        await authentication.post(`dependencia`, form)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setErrors({});
            setForm({});
        }).catch(async err => {
            try {
                let { data } = err.response;
                if (typeof data != 'object') throw new Error(err.message);
                if (typeof data.errors != 'object') throw new Error(data.message || err.message);
                setErrors(data.errors || {});
                Swal.fire({ icon: 'warning', text: data.message });
            } catch (error) {
                await Swal.fire({ icon: 'error', text: error.message });
            }
        }); 
        setCurrentLoading(false);
    }

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    title={<span className="capitalize">Nueva Dependencia</span>}
                    info={[`Crear dependencia`]}
                    bg="light"
                    prefix={<BtnBack/>}
                    options={[]}
                >
                    <div className="card-body mt-5">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.nombre && errors.nombre[0] ? true : false}>
                                            <label htmlFor="">Nombre <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="nombre"
                                                placeholder="Ingrese un nombre"
                                                value={form.nombre || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.nombre && errors.nombre[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.descripcion && errors.descripcion[0] ? true : false}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="descripcion"
                                                value={form.descripcion || ""}
                                                placeholder="Ingrese una descripción de la dependencia"
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.descripcion && errors.descripcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.ubicacion && errors.ubicacion[0] ? true : false}>
                                            <label htmlFor="">Ubicación <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la ubicación"
                                                name="ubicacion"
                                                value={form.ubicacion || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.ubicacion && errors.ubicacion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.type && errors.type[0] ? true : false}>
                                            <label htmlFor="">Tipo <b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Selec. Tipo de Dependencia"
                                                name="type"
                                                value={form.type || ""}
                                                options={[
                                                    { key: 'OTRO', value: 'OTRO', text: 'Otro' },
                                                    { key: 'ESCUELA', value: 'ESCUELA', text: 'Escuela' },
                                                    { key: 'FACULTAD', value: 'FACULTAD', text: 'Facultad' },
                                                    { key: 'OFICINA', value: 'OFICINA', text: 'Oficina' }
                                                ]}
                                                onChange={(e, obj) => handleInput(obj)}
                                            />
                                            <label>{errors && errors.type && errors.type[0]}</label>
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
                        disabled={current_loading}
                        onClick={save}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </ContentControl>
        </Fragment>
    )
}

// server
EditDependencia.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query }
}

// export 
export default EditDependencia;