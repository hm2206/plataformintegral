import moment from 'moment';
import React, { useMemo } from 'react';
import { Form } from 'semantic-ui-react';

const FormSchedule = ({ children, form = {}, errors = {}, className = null, readOnly = [], onChange = null }) => {

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    const displayDay = useMemo(() => {
        const schemaDays = {
            0: "Domingo",
            1: "Lunes",
            2: "Martes",
            3: "Miercoles",
            4: "Jueves",
            5: "Viernes",
            6: "Sábado"  
        };

        let index = moment(form.date).day();

        return schemaDays[index] || "";
    }, []);

    return (
        <Form className={className}>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label>Fecha</label>
                    <input type="date"
                        name="date"
                        readOnly={readOnly.includes('date')}
                        value={form?.date || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label>Día</label>
                    <input type="text"
                        name="date"
                        readOnly
                        value={displayDay}
                    />
                </div>

                <Form.Field className="col-md-6 mb-3" error={errors?.time_start?.[0] ? true : false}>
                    <label htmlFor="">Hora de Ingreso <b className="text-red">*</b></label>
                    <input type="time" 
                        name="time_start"
                        readOnly={readOnly.includes('time_start')}
                        value={form?.time_start || ""}
                        onChange={handleChange}
                    />
                    <label htmlFor="">{errors?.time_start?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.time_over?.[0] ? true : false}>
                    <label htmlFor="">Hora de Salida <b className="text-red">*</b></label>
                    <input type="time" 
                        name="time_over"
                        readOnly={readOnly.includes('tine_over')}
                        value={form?.time_over || ""}
                        onChange={handleChange}
                    />
                    <label htmlFor="">{errors?.time_over?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.delay_start?.[0] ? true : false}>
                    <label htmlFor="">Tolerancia de Ingreso</label>
                    <input type="number" 
                        step="any"
                        name="delay_start"
                        readOnly={readOnly.includes('delay_start')}
                        value={form?.delay_start || 0}
                        onChange={handleChange}
                    />
                    <label htmlFor="">{errors?.delay_start?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.delay_over?.[0] ? true : false}>
                    <label htmlFor="">Tolerancia de Salida</label>
                    <input type="number"
                        step="any" 
                        name="delay_over"
                        readOnly={readOnly.includes('delay_over')}
                        value={form?.delay_over || 0}
                        onChange={handleChange}
                    />
                    <label htmlFor="">{errors?.delay_over?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-12 mb-3" error={errors?.delay_over?.[0] ? true : false}>
                    <label htmlFor="">Observación</label>
                    <textarea
                        rows="4"
                        name="observation"
                        readOnly={readOnly.includes('observation')}
                        value={form?.observation || ""}
                        onChange={handleChange}
                    />
                    <label htmlFor="">{errors?.observation?.[0] || ""}</label>
                </Form.Field>

                {children || null}
            </div>
        </Form>
    )
}

export default FormSchedule;