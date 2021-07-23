import React from 'react';
import { Form, Select } from 'semantic-ui-react';

const FormDegrees = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null, disabled = false }) => {

    const handleChange = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    return (
        <Form className={className}>
            <div className="row">
                <Form.Field className="col-md-12 mb-3" error={errors?.grado?.[0] ? true : false}>
                    <label htmlFor="">Grado <b className="text-red">*</b></label>
                    <input type="text" 
                        name="grado"
                        readOnly={readOnly.includes('grado') || disabled}
                        value={form?.grado || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.grado?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-12 mb-3" error={errors?.institution?.[0] ? true : false}>
                    <label htmlFor="">Institución <b className="text-red">*</b> </label>
                    <input type="text" 
                        name="institution"
                        readOnly={readOnly.includes('institution') || disabled}
                        value={form?.institution || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.institution?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.document_number?.[0] ? true : false}>
                    <label htmlFor="">N° Documento <b className="text-red">*</b></label>
                    <input type="text" 
                        name="document_number"
                        readOnly={readOnly.includes('document_number') || disabled}
                        value={form?.document_number || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.document_number?.[0] || ""}</label>
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

export default FormDegrees;