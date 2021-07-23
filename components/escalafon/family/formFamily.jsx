import React from 'react';
import { Form, Select } from 'semantic-ui-react';

const FormFamily = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null, disabled = false }) => {

    const handleChange = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    return (
        <Form className={className}>
            <div className="row">
                <Form.Field className="col-md-12 mb-3" error={errors?.grado?.[0] ? true : false}>
                    <label htmlFor="">Apellidos y Nombres <b className="text-red">*</b></label>
                    <input type="text" 
                        name="grado"
                        readOnly={readOnly.includes('grado') || disabled}
                        value={form?.grado || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.grado?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-12 mb-3" error={errors?.type?.[0] ? true : false}>
                    <label htmlFor="">Tipo <b className="text-red">*</b></label>
                    <Select placeholder="Seleccionar"
                        options={[
                            { key: "SON", text: "Hijo(a)", value: "S" },
                            { key: "COnYUGE", text: "Conyuge", value: "C" }
                        ]}
                        name="type"
                        readOnly={readOnly.includes('type') || disabled}
                        value={form?.type || ""}
                        onChange={(e, obj) => handleChange(e,  obj)}
                    />
                    <label htmlFor="">{errors?.type?.[0] || ""}</label>
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

export default FormFamily;