import moment from 'moment';
import React, { useMemo } from 'react';
import Show from '../../show';
import { Form, Select } from 'semantic-ui-react';

const FormSchedule = ({ children, form = {}, errors = {}, className = null, readOnly = [], hidden = [], onChange = null, disabled = false }) => {

    const handleChange = (e, { name, value }) => {
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

    const allowModo = useMemo(() => {
        let allowers = {
            ALL: ['time_start', 'time_over', 'delay_start'],
            ENTRY: ['time_start', 'delay_start'],
            EXIT: ['time_over']
        }
        // response
        return allowers[form?.modo] || [];
    }, [form?.modo]);

    return (
        <Form className={className}>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label>Fecha</label>
                    <input type="date"
                        name="date"
                        readOnly={readOnly.includes('date') || disabled}
                        value={form?.date || ""}
                        onChange={(e) => handleChange(e, e.target)}
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

                <Form.Field className="col-md-6 mb-3" error={errors?.modo?.[0] ? true : false}>
                    <label htmlFor="">Modo <b className="text-red">*</b></label>
                    <Select placeholder="Selecionar Modo"
                        options={[
                            { key: "ALL", value: "ALL", text: "Entrada y Salida" },
                            { key: "ENTRY", value: "ENTRY", text: "Solo Entrada" },
                            { key: "EXIT", value: "EXIT", text: "Solo Salida" },
                        ]}
                        disabled={readOnly.includes('modo') || disabled}
                        name="modo"
                        onChange={(e, obj) => handleChange(e, obj)}
                        value={form?.modo || ""}
                    />
                    <label htmlFor="">{errors?.modo?.[0] || ""}</label>
                </Form.Field>

                <Show condicion={allowModo.includes('time_start')}>
                    <Form.Field className="col-md-6 mb-3" error={errors?.time_start?.[0] ? true : false}>
                        <label htmlFor="">Hora de Ingreso <b className="text-red">*</b></label>
                        <input type="time" 
                            name="time_start"
                            readOnly={readOnly.includes('time_start') || disabled}
                            value={form?.time_start || ""}
                            onChange={(e) => handleChange(e, e.target)}
                        />
                        <label htmlFor="">{errors?.time_start?.[0] || ""}</label>
                    </Form.Field>
                </Show>
                    
                <Show condicion={allowModo.includes('time_over')}>
                    <Form.Field className="col-md-6 mb-3" error={errors?.time_over?.[0] ? true : false}>
                        <label htmlFor="">Hora de Salida <b className="text-red">*</b></label>
                        <input type="time" 
                            name="time_over"
                            readOnly={readOnly.includes('tine_over') || disabled}
                            value={form?.time_over || ""}
                            onChange={(e) => handleChange(e, e.target)}
                        />
                        <label htmlFor="">{errors?.time_over?.[0] || ""}</label>
                    </Form.Field>
                </Show>
                    
                <Show condicion={allowModo.includes('delay_start') || disabled}>
                    <Form.Field className="col-md-6 mb-3" error={errors?.delay_start?.[0] ? true : false}>
                        <label htmlFor="">Tolerancia de Ingreso</label>
                        <input type="number" 
                            step="any"
                            name="delay_start"
                            readOnly={readOnly.includes('delay_start') || disabled}
                            value={form?.delay_start || 0}
                            onChange={(e) => handleChange(e, e.target)}
                        />
                        <label htmlFor="">{errors?.delay_start?.[0] || ""}</label>
                    </Form.Field>
                </Show>

                <Show condicion={form?.status != 'D'}>
                    <Show condicion={!hidden.includes('status')}>
                        <Form.Field className="col-md-6 mb-3" error={errors?.status?.[0] ? true : false}>
                            <label htmlFor="">Estado <b className="text-red">*</b></label>
                            <Select placeholder="Selecionar Estado"
                                options={[
                                    { key: "A", value: "A", text: "Asistencia" },
                                    { key: "F", value: "F", text: "Falta" },
                                ]}
                                disabled={readOnly.includes('status') || disabled}
                                name="status"
                                onChange={(e, obj) => handleChange(e, obj)}
                                value={form?.status || ""}
                            />
                            <label htmlFor="">{errors?.status?.[0] || ""}</label>
                        </Form.Field>
                    </Show>

                    <Show condicion={!hidden.includes('discount')}>
                        <Show condicion={form?.status == 'A'}>
                            <Form.Field className="col-md-6 mb-3" error={errors?.discount?.[0] ? true : false}>
                                <label htmlFor="">Descuento</label>
                                <input type="number" 
                                    step="any"
                                    name="discount"
                                    readOnly={readOnly.includes('discount') || disabled}
                                    value={form?.discount || 0}
                                    onChange={(e) => handleChange(e, e.target)}
                                />
                                <label htmlFor="">{errors?.discount?.[0] || ""}</label>
                            </Form.Field>
                        </Show>
                    </Show>
                </Show>

                <Form.Field className="col-md-12 mb-3" error={errors?.delay_over?.[0] ? true : false}>
                    <label htmlFor="">Observación</label>
                    <textarea
                        rows="4"
                        name="observation"
                        readOnly={readOnly.includes('observation') || disabled}
                        value={form?.observation || ""}
                        onChange={(e) => handleChange(e, e.target)}
                    />
                    <label htmlFor="">{errors?.observation?.[0] || ""}</label>
                </Form.Field>

                {children || null}
            </div>
        </Form>
    )
}

export default FormSchedule;