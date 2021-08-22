import React from 'react'
import { Form, Select } from 'semantic-ui-react'

const FormConfigDiscount = ({ form = {}, errors = {}, disabled = false, readOnly = [], onChange = null, children = null }) => {

    const handleOnChandge = ({ name, value }) => {
        if (typeof onChange == 'function') onChange({ name, value });
    }

    const arrayMonths = [
        { key: "Ene", value: 1, text: "Enero" },
        { key: "Feb", value: 2, text: "Febrero" },
        { key: "Mar", value: 3, text: "Marzo" },
        { key: "Abr", value: 4, text: "Abril" },
        { key: "May", value: 5, text: "Mayo" },
        { key: "Jun", value: 6, text: "Junio" },
        { key: "Jul", value: 7, text: "Julio" },
        { key: "Ago", value: 8, text: "Agosto" },
        { key: "Sep", value: 9, text: "Septiembre" },
        { key: "Oct", value: 10, text: "Octubre" },
        { key: "Nov", value: 11, text: "Noviembre" },
        { key: "Dic", value: 12, text: "Diciembre" }
    ]

    return (
        <Form>
            <div className="row">
                <Form.Field className="col-md-6" error={errors?.year?.[0] ? true : false}>
                    <label>Año</label>
                    <input type="number" 
                        placeholder="Ingresar año"
                        name="year"
                        value={form?.year}
                        onChange={({ target }) => handleOnChandge(target)}
                        disabled={disabled}
                        readOnly={readOnly.includes('year')}
                    />
                    <label>{errors?.year?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-6" error={errors?.month?.[0] ? true : false}>
                    <label>Mes</label>
                    <Select
                        options={arrayMonths}
                        placeholder="Ingresar Mes"
                        name="month"
                        value={form?.month}
                        onChange={(e, obj) => handleOnChandge(obj)}
                        disabled={disabled || readOnly.includes('month')}
                    />
                    <label>{errors?.month?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="col-md-12" error={errors?.observation?.[0] ? true : false}>
                    <label>Observación</label>
                    <textarea rows="4" 
                        placeholder="Ingresar una observación"
                        name="observation"
                        value={form?.observation}
                        onChange={({ target }) => handleOnChandge(target)}
                        disabled={disabled}
                        readOnly={readOnly.includes('observation')}
                    />
                    <label>{errors?.observation?.[0] || ""}</label>
                </Form.Field>

                {children}
            </div>
        </Form>
    )
}

export default FormConfigDiscount;