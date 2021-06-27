import moment from 'moment';
import React, { useMemo } from 'react';
import { Form, Select } from 'semantic-ui-react';

const motivos = [
    {
        key: "FUERA_DE_HORA",
        value: "FUERA_DE_HORA",
        text: "Fuera de Hora"
    },
    {
        key: "MOTIVOS_PARTICULARES",
        value: "MOTIVOS_PARTICULARES",
        text: "Motivos Particulares"
    },
    {
        key: "SALUD",
        value: "SALUD",
        text: "Salud"
    },
    {
        key: "COMISION_DE_SERVICIO",
        value: "COMISION_DE_SERVICIO",
        text: "Comisión de Servicio"
    },
]

const FormPapeleta = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null }) => {

    const handleChange = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    return (
        <Form className={className}>
            <div className="row">
                <div className="col-md-12 mb-3">
                    <label>Horario</label>
                    <input type="date"
                        name="date"
                        readOnly={readOnly.includes('date')}
                        value={form?.date || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                </div>

                <Form.Field className="col-md-6 mb-3" error={errors?.motivo?.[0] ? true : false}>
                    <label htmlFor="">Motivo <b className="text-red">*</b></label>
                    <Select
                        placeholder="Seleccionar motivo"
                        options={motivos}
                        name="motivo"
                        disabled={readOnly.includes('motivo')}
                        value={form?.motivo || ""}
                        onChange={(e, obj) => handleChange(e,  obj)}
                    />
                    <label htmlFor="">{errors?.motivo?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.time_start?.[0] ? true : false}>
                    <label htmlFor="">Hora de Ingreso <b className="text-red">*</b></label>
                    <input type="time" 
                        name="time_start"
                        readOnly={readOnly.includes('tine_over')}
                        value={form?.time_start || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.time_start?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.time_over?.[0] ? true : false}>
                    <label htmlFor="">Hora de Salida <b className="text-red">*</b></label>
                    <input type="time" 
                        name="time_over"
                        readOnly={readOnly.includes('tine_over')}
                        value={form?.time_over || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.time_over?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.time_return?.[0] ? true : false}>
                    <label htmlFor="">Hora de Retorno <b className="text-red">*</b></label>
                    <input type="time" 
                        name="time_return"
                        readOnly={readOnly.includes('tine_over')}
                        value={form?.time_return || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.time_return?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-12 mb-3" error={errors?.delay_over?.[0] ? true : false}>
                    <label htmlFor="">Observación</label>
                    <textarea
                        rows="4"
                        name="observation"
                        readOnly={readOnly.includes('observation')}
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

export default FormPapeleta;