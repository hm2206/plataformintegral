import React from 'react'
import { Form } from 'semantic-ui-react'

const FormConfigObjective = ({ form = {}, onChange = null, errors = {}, disabled = false, children = null }) => {

    const handleInput = ({ name, value }) => {
        if (typeof onChange == 'function') onChange({ name, value })
    }

    return (
        <Form>
            <div className="row">
                <Form.Field className="col-12" error={errors?.description?.[0] ? true : false}>
                    <label htmlFor="">Descripción <b className="text-red">*</b></label>
                    <textarea name="description"
                        rows="4"
                        value={form?.description}
                        onChange={({ target }) => handleInput(target)}
                        disabled={disabled}
                    />
                    <label htmlFor="">{errors?.description?.[0] || ""}</label>
                </Form.Field>

                {children}
            </div>
        </Form>
    )
}

export default FormConfigObjective;