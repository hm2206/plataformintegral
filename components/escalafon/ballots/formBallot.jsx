import React from 'react';
import { Form, Select, Checkbox } from 'semantic-ui-react';
import { SelectInfoSchedule } from '../../select/escalafon';
import Show from '../../show'

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
    {
        key: "OTROS",
        value: "OTROS",
        text: "Otros"
    },
]


const modos = [
    { 
        key: "ENTRY",
        value: "ENTRY",
        text: "Entrada"
    },
    { 
        key: "EXIT",
        value: "EXIT",
        text: "Salida"
    }
]

const FormBallot = ({ children, form = {}, year, month, info_id, errors = {}, isEdit = false, className = null, readOnly = [], onChange = null, disabled = false }) => {

    const handleChange = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    return (
        <Form className={className}>
            <div className="row">
                <div className="col-md-12 mb-3">
                    <label>Horario</label>
                    <SelectInfoSchedule
                        disabled={readOnly.includes('schedule_id')}
                        name="schedule_id"
                        year={year}
                        month={month}
                        value={form?.schedule_id}
                        info_id={info_id}
                        onChange={(e, obj) => handleChange(e, obj)}
                    />
                </div>

                <Form.Field className="col-md-6 mb-3" error={errors?.ballot_number?.[0] ? true : false}>
                    <label htmlFor="">N° Papeleta <b className="text-red">*</b></label>
                    <input type="text" 
                        name="ballot_number"
                        readOnly={readOnly.includes('ballot_number') || disabled}
                        value={form?.ballot_number || ""}
                        onChange={(e) => handleChange(e,  e.target)}
                    />
                    <label htmlFor="">{errors?.ballot_number?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.motivo?.[0] ? true : false}>
                    <label htmlFor="">Motivo <b className="text-red">*</b></label>
                    <Select
                        placeholder="Seleccionar motivo"
                        options={motivos}
                        name="motivo"
                        disabled={readOnly.includes('motivo') || disabled}
                        value={form?.motivo || ""}
                        onChange={(e, obj) => handleChange(e,  obj)}
                    />
                    <label htmlFor="">{errors?.motivo?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.modo?.[0] ? true : false}>
                    <label htmlFor="">Modo <b className="text-red">*</b></label>
                    <Select
                        placeholder="Seleccionar Modo"
                        options={modos}
                        name="modo"
                        disabled={readOnly.includes('modo') || disabled}
                        value={form?.modo || ""}
                        onChange={(e, obj) => handleChange(e,  obj)}
                    />
                    <label htmlFor="">{errors?.modo?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6 mb-3" error={errors?.is_applied?.[0] ? true : false}>
                    <label htmlFor="">Aplicar descuento <b className="text-red">*</b></label>
                    <Checkbox
                        toggle
                        name="is_applied"
                        disabled={readOnly.includes('is_applied') || disabled}
                        checked={form?.is_applied ? true : false}
                        onChange={(e, obj) => handleChange(e,  { name: obj.name, value: obj.checked ? 1 : 0 })}
                    />
                    <label htmlFor="">{errors?.is_applied?.[0] || ""}</label>
                </Form.Field>

                <Show condicion={form?.modo == 'ENTRY'}>
                    <Form.Field className="col-md-6 mb-3" error={errors?.time_start?.[0] ? true : false}>
                        <label htmlFor="">Hora de Ingreso <b className="text-red">*</b></label>
                        <input type="time" 
                            name="time_start"
                            readOnly={readOnly.includes('time_start') || disabled}
                            value={form?.time_start || ""}
                            onChange={(e) => handleChange(e,  e.target)}
                        />
                        <label htmlFor="">{errors?.time_start?.[0] || ""}</label>
                    </Form.Field>
                </Show>

                <Show condicion={form?.modo}>
                    <Form.Field className="col-md-6 mb-3" error={errors?.time_over?.[0] ? true : false}>
                        <label htmlFor="">Hora de Salida <b className="text-red">*</b></label>
                        <input type="time" 
                            name="time_over"
                            readOnly={readOnly.includes('time_over') || disabled}
                            value={form?.time_over || ""}
                            onChange={(e) => handleChange(e,  e.target)}
                        />
                        <label htmlFor="">{errors?.time_over?.[0] || ""}</label>
                    </Form.Field>
                </Show>

                <Show condicion={form?.modo == 'EXIT'}>
                    <Form.Field className="col-md-6 mb-3" error={errors?.time_return?.[0] ? true : false}>
                        <label htmlFor="">Hora de Retorno <b className="text-red">*</b></label>
                        <input type="time" 
                            name="time_return"
                            readOnly={readOnly.includes('time_return') || disabled}
                            value={form?.time_return || ""}
                            onChange={(e) => handleChange(e,  e.target)}
                        />
                        <label htmlFor="">{errors?.time_return?.[0] || ""}</label>
                    </Form.Field>
                </Show>

                <Show condicion={isEdit && form?.is_applied}>
                    <Form.Field className="col-md-12 mb-3" error={errors?.total?.[0] ? true : false}>
                        <label htmlFor="">Total <b><small>(Minutos)</small></b></label>
                        <input type="number" 
                                name="total"
                                readOnly={readOnly.includes('total') || disabled}
                                value={form?.total || ""}
                                onChange={(e) => handleChange(e,  e.target)}
                            />
                        <label htmlFor="">{errors?.total?.[0] || ""}</label>
                    </Form.Field>
                </Show>
                
                <Form.Field className="col-md-12 mb-3" error={errors?.justification?.[0] ? true : false}>
                    <label htmlFor="">Justificación</label>
                    <textarea
                        rows="4"
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

export default FormBallot;