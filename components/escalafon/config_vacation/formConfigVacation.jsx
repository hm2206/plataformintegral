import React from 'react';
import { Form } from 'semantic-ui-react';

const FormConfigVacation = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null, disabled = false }) => {

    const handleChange = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    return (
        <Form className={className}>
            <div className="row">
                <Form.Field className="col-md-6 mb-3" error={errors?.year?.[0] ? true : false}>
                    <label htmlFor="">Año <b className="text-red">*</b></label>
                    <input type="number" 
                        name="year"
                        readOnly={readOnly.includes('year') || disabled}
                        value={form?.year || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                        min="1"
                    />
                    <label htmlFor="">{errors?.year?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.scheduled_days?.[0] ? true : false}>
                    <label htmlFor="">Dias Programados<b className="text-red">*</b></label>
                    <input type="number" 
                        name="scheduled_days"
                        readOnly={readOnly.includes('scheduled_days') || disabled}
                        value={form?.scheduled_days || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.scheduled_days?.[0] || ""}</label>
                </Form.Field>

                {children || null}
            </div>
        </Form>
    )
}

export default FormConfigVacation;