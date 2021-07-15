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

const CreatePerson = () => {

    // estados
    const [form, setForm] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [image_render, setImageRender] = useState("/img/base.png");
    const [image, setImage] = useState("");
    const [errors, setErrors] = useState({});
    const [percent, setPercent] = useState(0);

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

    // limpiar provincia
    useEffect(() => {
        handleInput({ name: 'cod_pro', value: "" });
    }, [form.cod_dep]);

    // limpiar distrito
    useEffect(() => {
        handleInput({ name: 'cod_dis', value: "" });
    }, [form.cod_pro]);

    // crear persona
    const save = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar los datos?`, 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        const payload = new FormData;
        for(let key in form) payload.append(key, form[key]);
        // add imagen
        payload.append('image', image);
        // opciones
        let options = {
            onUploadProgress: (evt) => onProgress(evt, setPercent)
        }
        // request
        await authentication.post(`person`, payload, options)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({})
            setErrors({});
            setImage("");
            setImageRender("/img/base.png");
            setTimeout(() => {
                setPercent(0);
                setCurrentLoading(false);
            }, 400);
        }).catch(err => handleErrorRequest(err, (data) => {
            setErrors(data);
            setCurrentLoading(false);
        }));
    }

    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    prefix={<BtnBack/>}
                    title="Persona"
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
                                            />
                                            <label>{errors.document_number && errors.document_number[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Form.Field error={errors.ape_pat && errors.ape_pat[0] ? true : false}>
                                            <label htmlFor="">Apellido Paterno <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="ape_pat"
                                                value={form.ape_pat || ''}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors.ape_pat && errors.ape_pat[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4">
                                        <Form.Field error={errors.ape_mat && errors.ape_mat[0] ? true : false}>
                                            <label htmlFor="">Apellido Materno <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="ape_mat"
                                                value={form.ape_mat || ''}
                                                onChange={({ target }) => handleInput(target)}
                                            />
                                            <label>{errors.ape_mat && errors.ape_mat[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Form.Field error={errors.name && errors.name[0] ? true : false}>
                                            <label htmlFor="">Nombres <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="name"
                                                value={form.name || ''}
                                                onChange={({ target }) => handleInput(target)}
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
                                                disabled={!form.cod_dep}
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
                                                disabled={!form.cod_pro}
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
                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="teal"
                            disabled={current_loading}
                            onClick={save}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </Show>
            </ContentControl>
        </Fragment>
    )
}

// server
CreatePerson.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query }
}

// exportar
export default CreatePerson;