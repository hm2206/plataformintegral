import moment from 'moment';
import React, { useMemo } from 'react';
import { Form } from 'semantic-ui-react';

const FormVacation = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null, disabled = false }) => {

    const handleChange = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    const displayDaysUser = useMemo(() => {
        if (!form?.date_start || !form?.date_over) return 0;
        let date_start = moment(form?.date_start);
        let date_over = moment(form?.date_over);
        let duration = date_over.diff(date_start, 'days').valueOf() + 1;
        return duration;
    }, [form]);

    return (
        <Form className={className}>
            <div className="row">
                <Form.Field className="col-md-6 mb-3" error={errors?.date_start?.[0] ? true : false}>
                    <label htmlFor="">Fecha de Inicio <b className="text-red">*</b></label>
                    <input type="date" 
                        name="date_start"
                        readOnly={readOnly.includes('date_start') || disabled}
                        value={form?.date_start || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                        min="1"
                    />
                    <label htmlFor="">{errors?.date_start?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.date_over?.[0] ? true : false}>
                    <label htmlFor="">Fecha de Fin <b className="text-red">*</b></label>
                    <input type="date" 
                        name="date_over"
                        readOnly={readOnly.includes('date_over') || disabled}
                        value={form?.date_over || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                        min="1"
                    />
                    <label htmlFor="">{errors?.date_over?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-8 mb-3" error={errors?.resolucion?.[0] ? true : false}>
                    <label htmlFor="">N° Documento <b className="text-red">*</b></label>
                    <input type="text" 
                        name="resolucion"
                        readOnly={readOnly.includes('resolucion') || disabled}
                        value={form?.resolucion || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                        min="1"
                    />
                    <label htmlFor="">{errors?.resolucion?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-4 mb-3" error={errors?.days_used?.[0] ? true : false}>
                    <label htmlFor="">Dias Usados <b className="text-red">*</b></label>
                    <input type="text" 
                        readOnly
                        value={displayDaysUser}
                    />
                    <label htmlFor="">{errors?.days_used?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-12 mb-3" error={errors?.observation?.[0] ? true : false}>
                    <label htmlFor="">Observaciones</label>
                    <textarea rows="3"
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

export default FormVacation;