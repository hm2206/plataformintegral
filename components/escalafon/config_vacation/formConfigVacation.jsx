import moment from 'moment';
import React from 'react';
import { useMemo } from 'react';
import { Form } from 'semantic-ui-react';

const FormConfigVacation = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null, disabled = false }) => {

    const handleChange = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    const displayDays = useMemo(() => {
        const start = moment(form.date_start, 'YYYY-MM-DD');
        const over = moment(form.date_over, 'YYYY-MM-DD');
        const diff = over.diff(start, 'days').valueOf();
        return diff >= 0 ? diff + 1 : 0;
    }, [form]);

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
                        readOnly={true}
                        value={displayDays}
                    />
                    <label htmlFor="">{errors?.scheduled_days?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.date_start?.[0] ? true : false}>
                    <label htmlFor="">Fecha de Inicio<b className="text-red">*</b></label>
                    <input type="date" 
                        name="date_start"
                        readOnly={readOnly.includes('date_start') || disabled}
                        value={form?.date_start || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.date_start?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.date_over?.[0] ? true : false}>
                    <label htmlFor="">Fecha de Termino<b className="text-red">*</b></label>
                    <input type="date" 
                        name="date_over"
                        readOnly={readOnly.includes('date_over') || disabled}
                        value={form?.date_over || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.date_over?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-12 mb-3" error={errors?.observation?.[0] ? true : false}>
                    <label htmlFor="">Observación</label>
                    <textarea rows={5}
                        name="observation"
                        readOnly={readOnly.includes('observation') || disabled}
                        value={form?.observation || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.observation?.[0] || ""}</label>
                </Form.Field>

                {children || null}
            </div>
        </Form>
    )
}

export default FormConfigVacation;