import React, { Fragment, useEffect, useState } from 'react'
import { Form, Image, Select, Button, Progress } from 'semantic-ui-react';
import Router from 'next/router';
import { authentication, handleErrorRequest, onProgress } from '../../../services/apis';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { BtnBack } from '../../../components/Utils';
import BoardSimple from '../../../components/boardSimple';
import { SelectDocumentType, SelectDepartamento, SelectProvincia, SelectDistrito } from '../../../components/select/authentication';
import ContentControl from '../../../components/contentControl'
import Show from '../../../components/show';
import atob from 'atob';

const EditPerson = ({ pathname, query, success, person }) => {

    // estados
    const [form, setForm] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [image_render, setImageRender] = useState(person.image || "/img/base.png");
    const [image, setImage] = useState("");
    const [errors, setErrors] = useState({});
    const [percent, setPercent] = useState(0);
    const [edit, setEdit] = useState(false);

    // obtener y imagen y renderizar
    const handleImage = ({ name, value, files }) => {
        let archivo = files[0];
        let reader = new FileReader();
        if (archivo) {
            setImage(archivo);
            reader.readAsDataURL(archivo);
            reader.onloadend = () => {
                setImageRender(reader.result);
            }
        }
    }

    // manejador de cambio del form
    const handleInput = async ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // cancelar edicion
    useEffect(() => {
        if (!edit) setForm(JSON.parse(JSON.stringify(person || {})))
    }, [edit]);

    // limpiar provincia
    useEffect(() => {
        if (edit) handleInput({ name: 'cod_pro', value: "" });
    }, [form.cod_dep]);

    // limpiar distrito
    useEffect(() => {
        if (edit) handleInput({ name: 'cod_dis', value: "" });
    }, [form.cod_pro]);

    // crear persona
    const save = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar los datos?`, 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        const payload = new FormData;
        for(let key in form) payload.append(key, form[key] || '');
        // add imagen
        payload.append('image', image);
        // opciones
        let options = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (evt) => onProgress(evt, setPercent)
        }
        // request
        await authentication.post(`person/${person.id}?_method=PUT`, payload, options)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            await Router.push(location.href);
            setErrors({});
            setImage("");
            setEdit(false);
        }).catch(err => handleErrorRequest(err, (data) => {
            setErrors(data);
        }));
        // tiempo
        setTimeout(() => {
            setPercent(0);
            setCurrentLoading(false);
        }, 400);
    }

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    prefix={<BtnBack/>}
                    title={<span>Persona <b className="capitalize"></b></span>}
                    info={["Crear persona"]}
                    bg="light"
                    options={[]}
                >
                    <Form className="card-body">
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <div className="row justify-content-center">
                                    <Image circular src={image_render} 
                                        size="small"
                                        style={{ width: "150px", height: "150px", objectFit: "contain" }}
                                    />
                                    <Show condicion={edit}>
                                        <div className="col-md-12 text-center">
                                            <label htmlFor="image" className="text-primary cursor-pointer" 
                                                title="Agregar foto de la persona"
                                            >
                                                <b><i className="fas fa-image"></i> Seleccionar Foto de la Persona</b>
                                                <input type="file" 
                                                    accept="image/png" 
                                                    hidden id="image"
                                                    onChange={(e) => handleImage(e.target)}
                                                />
                                            </label>
                                        </div>
                                    </Show>
                                </div>
                            </div>

                            <div className="col-md-8">
                                <div className="row">
                                    <div className="col-md-4 mb-2">
                                        <Form.Field error={errors.document_type_id && errors.document_type_id[0] ? true : false}>
                                            <label>Tipo Documento <b className="text-red">*</b></label>
                                            <SelectDocumentType
                                                id="code"
                                                name="document_type_id"
                                                value={form.document_type_id}
                                                onChange={(e, obj) => handleInput(obj)}
                                                disabled={!edit}
                                            />
                                            <label htmlFor="">{errors.document_type_id && errors.document_type_id[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Form.Field error={errors.document_number && errors.document_number[0] ? true : false}>
                                            <label htmlFor="">N° Documento <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="document_number"
                                                value={form.document_number || ''}
                                                onChange={(e) => handleInput(e.target)}
                                                readOnly={!edit}
                                            />
                                            <label>{errors.document_number && errors.document_number[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Form.Field error={errors.ape_pat && errors.ape_pat[0] ? true : false}>
                                            <label htmlFor="">Apellido Paterno <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="ape_pat"
                                                className="capitalize"
                                                value={form.ape_pat || ''}
                                                onChange={(e) => handleInput(e.target)}
                                                readOnly={!edit}
                                            />
                                            <label>{errors.ape_pat && errors.ape_pat[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4">
                                        <Form.Field error={errors.ape_mat && errors.ape_mat[0] ? true : false}>
                                            <label htmlFor="">Apellido Materno <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="ape_mat"
                                                className="capitalize"
                                                value={form.ape_mat || ''}
                                                onChange={({ target }) => handleInput(target)}
                                                readOnly={!edit}
                                            />
                                            <label>{errors.ape_mat && errors.ape_mat[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Form.Field error={errors.name && errors.name[0] ? true : false}>
                                            <label htmlFor="">Nombres <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="name"
                                                className="capitalize"
                                                value={form.name || ''}
                                                onChange={({ target }) => handleInput(target)}
                                                readOnly={!edit}
                                            />
                                            <label>{errors.name && errors.name[0]}</label>
                                        </Form.Field>
                                    </div>
                                                
                                    <div className="col-md-4">
                                        <Form.Field error={errors.gender && errors.gender[0] ? true : false}>
                                            <label htmlFor="">Genero <b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Select. Genero"
                                                name="gender"
                                                value={form.gender || ""}
                                                disabled={!edit}
                                                options={[
                                                    { key: "M", value: "M", text: "Masculino" },
                                                    { key: "F", value: "F", text: "Femenino" }
                                                ]}
                                                onChange={(e, obj) => handleInput(obj)}
                                            />
                                            <label>{errors.gender && errors.gender[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4">
                                        <Form.Field error={errors.profession && errors.profession[0] ? true : false}>
                                            <label htmlFor="">Prefijo <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="profession"
                                                value={form.profession || ''}
                                                onChange={(e) => handleInput(e.target)}
                                                readOnly={!edit}
                                            />
                                            <label>{errors.profession && errors.profession[0]}</label>
                                        </Form.Field>
                                    </div>
                    
                                    <div className="col-md-4">
                                        <Form.Field error={errors.marital_status && errors.marital_status[0] ? true : false}>
                                            <label htmlFor="">Estado Cívil <b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Seleccionar estado civil"
                                                name="marital_status"
                                                value={form.marital_status || ''}
                                                onChange={(e, obj) => handleInput(obj)}
                                                disabled={!edit}
                                                options={[
                                                    { key: "S", value: "S", text: "Soltero(a)" },
                                                    { key: "C", value: "C", text: "Casado(a)" },
                                                    { key: "D", value: "D", text: "Divorsiado(a)" },
                                                    { key: "V", value: "V", text: "Viudo(a)" },
                                                    { key: "O", value: "O", text: "Conviviente(a)" }
                                                ]}
                                            />
                                            <label>{errors.marital_status && errors.marital_status[0]}</label>
                                        </Form.Field>
                                    </div>       

                                    <div className="col-md-4 mb-2">
                                        <Form.Field error={errors.date_of_birth && errors.date_of_birth[0] ? true : false}>
                                            <label htmlFor="">Fecha de nacimiento <b className="text-red">*</b></label>
                                            <input type="date"
                                                name="date_of_birth"
                                                value={form.date_of_birth || ''}
                                                onChange={(e) => handleInput(e.target)}
                                                readOnly={!edit}
                                            />
                                            <label>{errors.date_of_birth && errors.date_of_birth[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Form.Field error={errors.cod_dep && errors.cod_dep[0] ? true : false}>
                                            <label htmlFor="">Departamento <b className="text-red">*</b></label>
                                            <SelectDepartamento 
                                                name="cod_dep"
                                                id="cod_dep"
                                                disabled={!edit}
                                                value={form.cod_dep}
                                                onChange={(e, obj) => handleInput(obj)}
                                            />
                                            <label>{errors.cod_dep && errors.cod_dep[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Form.Field error={errors.cod_pro && errors.cod_pro[0] ? true :  false}>
                                            <label htmlFor="">Provincias <b className="text-red">*</b></label>
                                            <SelectProvincia
                                                name="cod_pro"
                                                id="cod_pro"
                                                departamento_id={form.cod_dep}
                                                value={form.cod_pro}
                                                onChange={(e, obj) => handleInput(obj)}
                                                disabled={!form.cod_dep || !edit}
                                                refresh={form.cod_dep}
                                            />
                                            <label>{errors.cod_pro && errors.cod_pro[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Form.Field error={errors.cod_dis && errors.cod_dis[0] ? true : false}>
                                            <label htmlFor="">Distrito <b className="text-red">*</b></label>
                                            <SelectDistrito
                                                name="cod_dis"
                                                id="cod_dis"
                                                departamento_id={form.cod_dep}
                                                provincia_id={form.cod_pro}
                                                value={form.cod_dis}
                                                onChange={(e, obj) => handleInput(obj)}
                                                disabled={!form.cod_pro || !edit}
                                                refresh={form.cod_pro}
                                            />
                                            <label>{errors.cod_dis && errors.cod_dis[0]}</label>
                                        </Form.Field>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <hr/>
                                <h4 className="mt-2 mb-2"><i className="fas fa-location-arrow"></i> Ubicación</h4>
                                <hr/>
                            </div>
    
                            <div className="col-md-4 mb-2">            
                                <Form.Field error={errors.address && errors.address[0] ? true : false}>
                                    <label htmlFor="">Dirección <b className="text-red">*</b></label>
                                    <input type="text"
                                        name="address"
                                        value={form.address || ''}
                                        onChange={(e) => handleInput(e.target)}
                                        readOnly={!edit}
                                    />
                                    <label>{errors.address && errors.address[0]}</label>
                                </Form.Field>
                            </div>

                            <div className="col-md-4 mb-2">
                                <Form.Field error={errors.email_contact && errors.email_contact[0] ? true : false}>
                                    <label htmlFor="">Correo de Contacto</label>
                                    <input type="text"
                                        name="email_contact"
                                        placeholder="Ingrese el correo de contacto"
                                        value={form.email_contact || ''}
                                        onChange={(e) => handleInput(e.target)}
                                        readOnly={!edit}
                                    />
                                    <label htmlFor="">{errors.email_contact && errors.email_contact[0]}</label>
                                </Form.Field>
                            </div>
            
                            <div className="col-md-4 mb-2">
                                <Form.Field error={errors.phone && errors.phone[0] ? true : false}>
                                    <label htmlFor="">Teléfono</label>
                                    <input type="text"
                                        name="phone"
                                        value={form.phone || ''}
                                        onChange={(e) => handleInput(e.target)}
                                        placeholder="Ingrese un número telefónico"
                                        readOnly={!edit}
                                    />
                                    <label htmlFor="">{errors.phone && errors.phone[0]}</label>
                                </Form.Field>
                            </div>
                        </div>
                    </Form>
                </BoardSimple>
            </div>

            {/* panel de control */}
            <ContentControl>
                <Show condicion={!current_loading}
                    predeterminado={
                        <div className="col-12">
                            <Progress
                                progress
                                percent={percent}
                                active
                                precision
                                color="blue"
                            />
                        </div>
                    }
                >
                    <Show condicion={edit}
                        predeterminado={
                            <div className="col-lg-2 col-6">
                                <Button fluid 
                                    color="orange"
                                    onClick={(e) => setEdit(true)}
                                >
                                    <i className="fas fa-pencil-alt"></i> Editar
                                </Button>
                            </div>
                        }
                    >
                        <div className="col-lg-2 col-6">
                            <Button fluid 
                                color="blue"
                                onClick={save}
                            >
                                <i className="fas fa-sync"></i> Actualizar
                            </Button>
                        </div>

                        <div className="col-lg-2 col-6">
                            <Button fluid 
                                color="red"
                                onClick={(e) => setEdit(false)}
                            >
                                <i className="fas fa-times"></i> Cancelar
                            </Button>
                        </div>
                    </Show>
                </Show>
            </ContentControl>
        </Fragment>
    )
}

// server
EditPerson.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let id = atob(query.id) || '__error';
    let { success, person } = await authentication.get(`person/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, person: {} }));
    // response
    return { pathname, query, success, person }
}

// exportar
export default EditPerson;