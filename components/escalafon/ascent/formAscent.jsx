import moment from 'moment';
import React, { useMemo } from 'react';
import { Form, Checkbox } from 'semantic-ui-react';
import { SelectTypeCategoria } from '../../select/cronograma';

const FormAscent = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null, disabled = false }) => {

    const handleChange = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    const displayDaysUser = useMemo(() => {
        if (!form?.date_start || !form?.date_over) return 0;
        let date_start = moment(form?.date_start);
        let date_over = moment(form?.date_over);
        let duration = date_over.diff(date_start, 'days').valueOf() + 1;
        return duration
    }, [form]);

    return (
        <Form className={className}>
            <div className="row">
                <Form.Field className="col-md-6 mb-3" error={errors?.resolution?.[0] ? true : false}>
                    <label htmlFor="">Resolución <b className="text-red">*</b></label>
                    <input type="text" 
                        name="resolution"
                        readOnly={readOnly.includes('resolution') || disabled}
                        value={form?.resolution || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.resolution?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.date_resolution?.[0] ? true : false}>
                    <label htmlFor="">Fecha de Resolución <b className="text-red">*</b></label>
                    <input type="date" 
                        name="date_resolution"
                        readOnly={readOnly.includes('date_resolution') || disabled}
                        value={form?.date_resolution || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.date_resolution?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.type_categoria_id?.[0] ? true : false}>
                    <label htmlFor="">Tip Categoría <b className="text-red">*</b></label>
                    <SelectTypeCategoria
                        name="type_categoria_id"
                        disabled={readOnly.includes('type_categoria_id') || disabled}
                        value={form?.type_categoria_id || ""}
                        onChange={(e, obj) => handleChange(e,  obj)}
                    />
                    <label htmlFor="">{errors?.type_categoria_id?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.date_start?.[0] ? true : false}>
                    <label htmlFor="">Fecha Inicio <b className="text-red">*</b></label>
                    <input type="date" 
                        name="date_start"
                        readOnly={readOnly.includes('date_start') || disabled}
                        value={form?.date_start || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                        min="1"
                    />
                    <label htmlFor="">{errors?.date_start?.[0] || ""}</label>
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

export default FormAscent;