import moment from 'moment';
import React, { useMemo } from 'react';
import { Form, Select } from 'semantic-ui-react';
import { SelectTypePermission } from '../../select/escalafon';

const FormPermission = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null, disabled = false }) => {

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

    const options = [
        { key: 'CITT', value: 'CITT', text: 'CITT' }
    ]

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

                <Form.Field className="col-md-12 mb-3" error={errors?.days_used?.[0] ? true : false}>
                    <label htmlFor="">Dias Usados</label>
                    <input type="text" 
                        readOnly
                        value={displayDaysUser}
                    />
                    <label htmlFor="">{errors?.days_used?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-12 mb-3" error={errors?.type_permission_id?.[0] ? true : false}>
                    <label htmlFor="">Tipo. Permiso <b className="text-red">*</b></label>
                    <SelectTypePermission
                        name="type_permission_id"
                        readOnly={readOnly.includes('type_permission_id') || disabled}
                        value={form?.type_permission_id || ""}
                        onChange={(e, obj) => handleChange(e, obj)}
                    />
                    <label htmlFor="">{errors?.type_permission_id?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.option?.[0] ? true : false}>
                    <label htmlFor="">Opción <b className="text-red">*</b></label>
                    <Select
                        placeholder="Seleccionar..."
                        name="option"
                        readOnly={readOnly.includes('option') || disabled}
                        value={form?.option || ""}
                        onChange={(e, obj) => handleChange(e, obj)}
                        options={options}
                    />
                    <label htmlFor="">{errors?.option?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.document_number?.[0] ? true : false}>
                    <label htmlFor="">N° Documento <b className="text-red">*</b></label>
                    <input type="text" 
                        name="document_number"
                        readOnly={readOnly.includes('document_number') || disabled}
                        value={form?.document_number || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                        min="1"
                    />
                    <label htmlFor="">{errors?.document_number?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-12 mb-3" error={errors?.justification?.[0] ? true : false}>
                    <label htmlFor="">Justificación <b className="text-red">*</b></label>
                    <textarea rows="3"
                        name="justification"
                        readOnly={readOnly.includes('justification') || disabled}
                        value={form?.justification || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.justification?.[0] || ""}</label>
                </Form.Field>

                {children || null}
            </div>
        </Form>
    )
}

export default FormPermission;