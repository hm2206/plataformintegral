import React, { useEffect } from 'react';
import { Form, Image, Select } from 'semantic-ui-react';
import { SelectDocumentType, SelectDepartamento, SelectProvincia, SelectDistrito } from '../../select/authentication';

const FormPerson = ({ form = {}, unlock = false, image = null, errors = {}, onChange = null, onChangeImage = null, readOnly = [], disabled = false, children = null }) => {

    const handleImage = (e, { name, files }) => {
        let reader = new FileReader();
        let file = files[0];
        if (!file) return;
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            let base64 = reader.result;
            if (typeof onChangeImage == 'function') onChangeImage(e, { name, file, base64 });
        }
        // limpiar input
        e.target.value = null;
    }


    const handleInput = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    // limpiar provincia
    useEffect(() => {
        if (!unlock) handleInput({}, { name: 'cod_pro', value: "" });
    }, [form.cod_dep]);

    // limpiar distrito
    useEffect(() => {
        if (!unlock) handleInput({}, { name: 'cod_dis', value: "" });
    }, [form.cod_pro]);

    return (
        <Form>
            <div className="row">
                <div className="col-md-3 mb-3">
                    <div className="row justify-content-center">
                        <Image circular src={image || '/img/perfil.jpg'} 
                            size="small"
                            className="imagen-circle mb-1"
                        />
                        <div className="col-md-12 text-center">
                            <label htmlFor="image" className="text-primary cursor-pointer" 
                                title="Agregar foto de la persona"
                            >
                                <b><i className="fas fa-image"></i> Seleccionar Foto de la Persona</b>
                                <input type="file" 
                                    accept="image/png" 
                                    hidden id="image"
                                    readOnly={readOnly.includes('image') || disabled}
                                    onChange={(e) => handleImage(e, e.target)}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <Form.Field error={errors.document_type_id && errors.document_type_id[0] ? true : false}>
                                <label>Tipo Documento <b className="text-red">*</b></label>
                                <SelectDocumentType
                                    id="code"
                                    name="document_type_id"
                                    value={form.document_type_id}
                                    onChange={(e, obj) => handleInput(e, obj)}
                                    disabled={readOnly.includes('document_type_id') || disabled}
                                />
                                <label htmlFor="">{errors.document_type_id && errors.document_type_id[0]}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-4 mb-3">
                            <Form.Field error={errors.document_number && errors.document_number[0] ? true : false}>
                                <label htmlFor="">N° Documento <b className="text-red">*</b></label>
                                <input type="text"
                                    name="document_number"
                                    value={form.document_number || ''}
                                    onChange={(e) => handleInput(e, e.target)}
                                    readOnly={readOnly.includes('document_number') || disabled}
                                />
                                <label>{errors.document_number && errors.document_number[0]}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-4 mb-3">
                            <Form.Field error={errors.ape_pat && errors.ape_pat[0] ? true : false}>
                                <label htmlFor="">Apellido Paterno <b className="text-red">*</b></label>
                                <input type="text"
                                    name="ape_pat"
                                    className="capitalize"
                                    value={form.ape_pat || ''}
                                    onChange={(e) => handleInput(e, e.target)}
                                    readOnly={readOnly.includes('ape_pat') || disabled}
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
                                    onChange={(e) => handleInput(e, e.target)}
                                    readOnly={readOnly.includes('ape_mat') || disabled}
                                />
                                <label>{errors.ape_mat && errors.ape_mat[0]}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-4 mb-3">
                            <Form.Field error={errors.name && errors.name[0] ? true : false}>
                                <label htmlFor="">Nombres <b className="text-red">*</b></label>
                                <input type="text"
                                    name="name"
                                    className="capitalize"
                                    value={form.name || ''}
                                    onChange={(e) => handleInput(e, e.target)}
                                    readOnly={readOnly.includes('name') || disabled}
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
                                    onChange={(e, obj) => handleInput(e, obj)}
                                    disabled={readOnly.includes('gender') || disabled}
                                />
                                <label>{errors.gender && errors.gender[0]}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-4">
                            <Form.Field error={errors.profession && errors.profession[0] ? true : false}>
                                <label htmlFor="">Prefijo <b className="text-red">*</b></label>
                                <input type="text"
                                    className="capitalize"
                                    name="profession"
                                    value={form.profession || ''}
                                    onChange={(e) => handleInput(e, e.target)}
                                    readOnly={readOnly.includes('profession') || disabled}
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
                                    onChange={(e, obj) => handleInput(e, obj)}
                                    disabled={readOnly.includes('marital_status') || disabled}
                                    options={[
                                        { key: "S", value: "S", text: "Soltero(a)" },
                                        { key: "C", value: "C", text: "Casado(a)" },
                                        { key: "D", value: "D", text: "Divorciado(a)" },
                                        { key: "V", value: "V", text: "Viudo(a)" },
                                        { key: "O", value: "O", text: "Conviviente(a)" }
                                    ]}
                                />
                                <label>{errors.marital_status && errors.marital_status[0]}</label>
                            </Form.Field>
                        </div>       

                        <div className="col-md-4 mb-3">
                            <Form.Field error={errors.date_of_birth && errors.date_of_birth[0] ? true : false}>
                                <label htmlFor="">Fecha de nacimiento <b className="text-red">*</b></label>
                                <input type="date"
                                    name="date_of_birth"
                                    readOnly={readOnly.includes('date_of_birth') || disabled}
                                    value={form.date_of_birth || ''}
                                    onChange={(e) => handleInput(e, e.target)}
                                />
                                <label>{errors.date_of_birth && errors.date_of_birth[0]}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-4 mb-3">
                            <Form.Field error={errors.cod_dep && errors.cod_dep[0] ? true : false}>
                                <label htmlFor="">Departamento <b className="text-red">*</b></label>
                                <SelectDepartamento 
                                    name="cod_dep"
                                    id="cod_dep"
                                    value={form.cod_dep}
                                    disabled={readOnly.includes('cod_dep') || disabled}
                                    onChange={(e, obj) => handleInput(e, obj)}
                                />
                                <label>{errors.cod_dep && errors.cod_dep[0]}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-4 mb-3">
                            <Form.Field error={errors.cod_pro && errors.cod_pro[0] ? true :  false}>
                                <label htmlFor="">Provincias <b className="text-red">*</b></label>
                                <SelectProvincia
                                    name="cod_pro"
                                    id="cod_pro"
                                    departamento_id={form.cod_dep}
                                    value={form.cod_pro}
                                    onChange={(e, obj) => handleInput(e, obj)}
                                    disabled={!form.cod_dep}
                                    refresh={form.cod_dep}
                                    disabled={readOnly.includes('cod_dep') || disabled}
                                />
                                <label>{errors.cod_pro && errors.cod_pro[0]}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-4 mb-3">
                            <Form.Field error={errors.cod_dis && errors.cod_dis[0] ? true : false}>
                                <label htmlFor="">Distrito <b className="text-red">*</b></label>
                                <SelectDistrito
                                    name="cod_dis"
                                    id="cod_dis"
                                    departamento_id={form.cod_dep}
                                    provincia_id={form.cod_pro}
                                    value={form.cod_dis}
                                    onChange={(e, obj) => handleInput(e, obj)}
                                    disabled={!form.cod_pro}
                                    refresh={form.cod_pro}
                                    disabled={readOnly.includes('cod_pro') || disabled}
                                />
                                <label>{errors.cod_dis && errors.cod_dis[0]}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-12">
                            <hr/>
                            <h4 className="mt-2 mb-3"><i className="fas fa-location-arrow"></i> Ubicación</h4>
                            <hr/>
                        </div>

                        <div className="col-md-12 mb-3">            
                            <Form.Field error={errors.address && errors.address[0] ? true : false}>
                                <label htmlFor="">Dirección <b className="text-red">*</b></label>
                                <input type="text"
                                    name="address"
                                    value={form.address || ''}
                                    onChange={(e) => handleInput(e, e.target)}
                                    readOnly={readOnly.includes('address') || disabled}
                                />
                                <label>{errors.address && errors.address[0]}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Field error={errors.email_contact && errors.email_contact[0] ? true : false}>
                                <label htmlFor="">Correo de Contacto <b className="text-red">*</b></label>
                                <input type="text"
                                    name="email_contact"
                                    placeholder="Ingrese el correo de contacto"
                                    value={form.email_contact || ''}
                                    onChange={(e) => handleInput(e, e.target)}
                                    readOnly={readOnly.includes('email_contact') || disabled}
                                />
                                <label htmlFor="">{errors.email_contact && errors.email_contact[0]}</label>
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Field error={errors.phone && errors.phone[0] ? true : false}>
                                <label htmlFor="">Teléfono <b className="text-red">*</b></label>
                                <input type="text"
                                    name="phone"
                                    value={form.phone || ''}
                                    onChange={(e) => handleInput(e, e.target)}
                                    placeholder="Ingrese un número telefónico"
                                    readOnly={readOnly.includes('phone') || disabled}
                                />
                                <label htmlFor="">{errors.phone && errors.phone[0]}</label>
                            </Form.Field>
                        </div>
                    </div>
                </div>

                {children || null}
            </div>
        </Form>
    )
}

export default FormPerson;
