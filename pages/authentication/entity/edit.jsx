import React, { useState, Fragment, useEffect } from 'react';
import { BtnBack, InputFile } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Progress } from 'semantic-ui-react'
import { authentication, handleErrorRequest, onProgress } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';
import atob from 'atob';


const EditEntity = ({ pathname, query, success, entity }) => {

    // estados
    const [form, setForm] = useState({});
    const [files, setFiles] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [percent, setPercent] = useState(0);
    const [edit, setEdit] = useState(false);

    // manejador de form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // manejador de files
    const handleFiles = ({ name, file }) => {
        if (!file) return false;
        let newFiles = Object.assign({}, files);
        newFiles[name] = file;
        setFiles(newFiles); 
        setEdit(true);
    }

    // guardar datos
    const save = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en guardar los datos?')
        if (!answer) return false;
        setCurrentLoading(true);
        let data = new FormData;
        for(let attr in form) data.append(attr, form[attr]);
        data.delete('logo');
        // add files
        for(let attr in files) data.append(attr, files[attr]);
        // optiones
        let options = {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (evt) => onProgress(evt, setPercent)
        }
        // crear sistema
        await authentication.post(`entity/${entity.id}?_method=PUT`, data, options)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
            setFiles({});
            setTimeout(() => {
                setPercent(0);
                setCurrentLoading(false);
                let { push } = Router;
                push(location.href);
            });
        })
        .catch(err => handleErrorRequest(err, (data) => {
            setErrors(data);
            setCurrentLoading(false);
            setPercent(0);
        }));
    }

    // cancelar edicion
    useEffect(() => {
        if (!edit) {
            setForm(JSON.parse(JSON.stringify(entity || {})));
            setFiles({});
        }
    }, [edit]);

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    title={<span>Entidad: <b className="capitalize">{entity.name || ""}</b></span>}
                    info={["Editar entidad"]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <div className="card-body mt-5">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.name && errors.name[0] ? true : false}>
                                            <label htmlFor="">Nombre <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="name"
                                                className="capitalize"
                                                placeholder="Ingrese el nombre de la Entidad"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.name || ""}
                                            />
                                            <label>{errors.name && errors.name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.slug && errors.slug[0] ? true : false}>
                                            <label htmlFor="">Slug <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="slug"
                                                placeholder="Ingrese un slug unico"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.slug || ""}
                                            />
                                            <label>{errors.slug && errors.slug[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.logo && errors.logo[0] ? true : false}>
                                            <label htmlFor="">Logo <b className="text-red">*</b></label>
                                            <Show condicion={!files.logo}>
                                                <img src={entity.logo}
                                                    width="100%"
                                                    style={{ objectFit: 'cover', height: "150px" }}
                                                />
                                            </Show>
                                            <InputFile id="logo" 
                                                name="logo" 
                                                title="Seleccionar Logo"
                                                accept="image/*"
                                                onChange={(obj) => handleFiles(obj)}
                                            />
                                            <label>{errors.logo && errors.logo[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.email && errors.email[0] ? true : false}>
                                            <label htmlFor="">Correo Electrónico <b className="text-red">*</b></label>
                                            <input type="email"
                                                name="email"
                                                placeholder="Ingrese un correo electrónico asociado a la entidad"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.email || ""}
                                            />
                                            <label>{errors.email && errors.email[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.ruc && errors.ruc[0] ? true : false}>
                                            <label htmlFor="">RUC <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="ruc"
                                                placeholder="Ingrese el RUC de la entidad"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.ruc || ""}
                                            />
                                            <label>{errors.ruc && errors.ruc[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors.address && errors.address[0] ? true : false}>
                                            <label htmlFor="">Dirección <b className="text-red">*</b></label>
                                            <textarea type="text"
                                                name="address"
                                                placeholder="Ingrese la dirección de la entidad"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.address || ""}
                                            />
                                            <label>{errors.address && errors.address[0]}</label>
                                        </Form.Field>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </BoardSimple>
            </div>
            {/* panel de control */}
            <Show condicion={edit}>
                <ContentControl>
                    <Show condicion={!current_loading}
                        predeterminado={
                            <div className="col-12">
                                <Progress
                                    progress
                                    active
                                    color="blue"
                                    precision
                                    percent={percent}
                                />
                            </div>
                        }
                    >
                        <div className="col-lg-2 col-6">
                            <Button fluid 
                                color="red"
                                disabled={current_loading}
                                onClick={(e) => setEdit(false)}
                            >
                                <i className="fas fa-times"></i> cancelar
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
                    </Show>
                </ContentControl>
            </Show>
        </Fragment>
    )
}

// server
EditEntity.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let id = atob(query.id) || "_error";
    let { success, entity } = await authentication.get(`entity/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, entity: {} }));
    // response
    return { pathname, query, success, entity };
}

// exportar
export default EditEntity;