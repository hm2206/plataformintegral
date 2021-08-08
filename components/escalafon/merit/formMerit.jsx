import React from 'react';
import { Form, Select } from 'semantic-ui-react';

const FormMerit = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null, disabled = false }) => {

    const handleChange = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    return (
        <Form className={className}>
            <div className="row">
                <Form.Field className="col-md-6 mb-3" error={errors?.resolution?.[0] ? true : false}>
                    <label htmlFor="">Documento que autoriza <b className="text-red">*</b></label>
                    <input type="text" 
                        name="resolution"
                        readOnly={readOnly.includes('resolution') || disabled}
                        value={form?.resolution || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.resolution?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.date_resolution?.[0] ? true : false}>
                    <label htmlFor="">Fecha de Documento que autoriza <b className="text-red">*</b></label>
                    <input type="date" 
                        name="date_resolution"
                        readOnly={readOnly.includes('date_resolution') || disabled}
                        value={form?.date_resolution || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.date_resolution?.[0] || ""}</label>
                </Form.Field>
                
                <Form.Field className="col-md-6 mb-3" error={errors?.date?.[0] ? true : false}>
                    <label htmlFor="">Fecha <b className="text-red">*</b></label>
                    <input type="date" 
                        name="date"
                        readOnly={readOnly.includes('date') || disabled}
                        value={form?.date || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.date?.[0] || ""}</label>
                </Form.Field>
                

                <Form.Field className="col-md-6 mb-3" error={errors?.modo?.[0] ? true : false}>
                    <label htmlFor="">Modo<b className="text-red">*</b></label>
                    <Select
                        name="modo"
                        placeholder="Seleccionar"
                        options={[
                            { key: "MERIT", value: "MERIT", text: "Mérito" },
                            { key: "DEMERIT", value: "DEMERIT", text: "Demérito" },
                        ]}
                        value={`${form.modo || ""}`}
                        onChange={(e, obj) => handleChange(e, obj)}
                        disabled={readOnly.includes('modo') || disabled}
                    />
                    <label htmlFor="">{errors?.modo?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-12 mb-3" error={errors?.title?.[0] ? true : false}>
                    <label htmlFor="">Titulo <b className="text-red">*</b> </label>
                    <input type="text" 
                        name="title"
                        readOnly={readOnly.includes('title') || disabled}
                        value={form?.title || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.title?.[0] || ""}</label>
                </Form.Field>


                <Form.Field className="col-md-12 mb-3" error={errors?.description?.[0] ? true : false}>
                    <label htmlFor="">Descripción <b className="text-red">*</b></label>
                    <textarea rows="3"
                        name="description"
                        readOnly={readOnly.includes('description') || disabled}
                        value={form?.description || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.description?.[0] || ""}</label>
                </Form.Field>

                {children || null}
            </div>
        </Form>
    )
}

export default FormMerit;