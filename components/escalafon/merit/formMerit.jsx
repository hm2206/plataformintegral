import React from 'react';
import { Form, Select } from 'semantic-ui-react';

const FormMerit = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null, disabled = false }) => {

    const handleChange = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    return (
        <Form className={className}>
            <div className="row">
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
                

                <Form.Field className="col-md-6 mb-3" error={errors?.accion?.[0] ? true : false}>
                    <label htmlFor="">Acción<b className="text-red">*</b></label>
                    <Select
                        name="accion"
                        placeholder="Seleccionar"
                        options={[
                            { key: "MERITO", value: "MERITO", text: "Mérito" },
                            { key: "DESMERITO", value: "DEMERITO", text: "Demérito" },
                        ]}
                        value={`${form.accion || ""}`}
                        onChange={(e, obj) => handleChange(e, obj)}
                        disabled={readOnly.includes('accion') || disabled}
                    />
                    <label htmlFor="">{errors?.accion?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-12 mb-3" error={errors?.otorgado?.[0] ? true : false}>
                    <label htmlFor="">Otorgado <b className="text-red">*</b> </label>
                    <input type="text" 
                        name="otorgado"
                        readOnly={readOnly.includes('otorgado') || disabled}
                        value={form?.otorgado || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.otorgado?.[0] || ""}</label>
                </Form.Field>


                <Form.Field className="col-md-12 mb-3" error={errors?.detalles?.[0] ? true : false}>
                    <label htmlFor="">Detalles <b className="text-red">*</b></label>
                    <textarea rows="3"
                        name="detalles"
                        readOnly={readOnly.includes('detalles') || disabled}
                        value={form?.detalles || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.detalles?.[0] || ""}</label>
                </Form.Field>

                {children || null}
            </div>
        </Form>
    )
}

export default FormMerit;