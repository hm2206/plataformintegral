import React from 'react';
import { Form } from 'semantic-ui-react';
import { SelectTypeDegree } from '../../select/escalafon'

const FormDegrees = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null, disabled = false }) => {

    const handleChange = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    return (
        <Form className={className}>
            <div className="row">
                <Form.Field className="col-md-12 mb-3" error={errors?.type_degree_id?.[0] ? true : false}>
                    <label htmlFor="">Tip. Grado <b className="text-red">*</b></label>
                    <SelectTypeDegree
                        name="type_degree_id"
                        readOnly={readOnly.includes('type_degree_id') || disabled}
                        value={form?.type_degree_id || ""}
                        onChange={(e, obj) => handleChange(e,  obj)}
                    />
                    <label htmlFor="">{errors?.type_degree_id?.[0] || ""}</label>
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

                <Form.Field className="col-md-12 mb-3" error={errors?.place?.[0] ? true : false}>
                    <label htmlFor="">Lugar <b className="text-red">*</b> </label>
                    <input type="text" 
                        name="place"
                        readOnly={readOnly.includes('place') || disabled}
                        value={form?.place || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.place?.[0] || ""}</label>
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