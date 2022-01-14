import React, { useMemo } from 'react';
import { Form } from 'semantic-ui-react';
import { SelectMeta, SelectCargo } from '../../select/micro-planilla';

const Input = ({ type = 'text', name = '', value, onChange = null, disabled = false }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (typeof onChange == 'function') {
      onChange({ name, value });
    }
  }

  if (type == 'textarea') return (
    <textarea
      name={name}
      value={value || ''}
      rows={5}
      onChange={handleChange}
      disabled={disabled}
    />
  )

  return (
    <input type={type}
      name={name}
      value={value || ''}
      onChange={handleChange}
      disabled={disabled}
    />
  )
}

const ComponentRequired = ({ isRequired }) => {
  return isRequired ? (<b className='text-red'>*</b>) : null
}

const Field = ({
  title, value, children = null,
  type = 'text', errors = {}, name,
  onChange = null, isRequired = false,
  disabled = false
}) => {

  return (
    <Form.Field error={errors?.[name]?.[0] ? true : false}
      className='mb-3'
    >
      <label>{title} <ComponentRequired isRequired={isRequired}/></label>
      {children
        ? children
        : <Input type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
          /> 
      }
      <label>{errors?.[name]?.[0]}</label>
    </Form.Field>
  )
}

const FormPim = ({ form = {}, onChange = null, isEdit = false, loading = false }) => {

  const handleIntInput = ({ name, value }) => {
    let newValue = value;
    if (value) newValue = parseInt(`${value}`);
    if (typeof onChange == 'function') {
      onChange({ name, value: newValue });
    }
  }

  const displayCargo = useMemo(() => {
    return `${form?.cargo?.name} | ${form?.cargo?.extension}`
  }, [form?.cargo]);

  return (
    <>
      <Form>
        <Field title="Código"
          isRequired
          onChange={onChange}
          name="code"
          value={form?.code}
          disabled={loading}
        />
        
        <Field title="Meta"
          isRequired={!isEdit}
          name="metaId"
          value={form?.meta?.name}
          disabled={isEdit}
        >
          {!isEdit
            ? (<SelectMeta
                name="metaId"
                value={form?.metaId}
                onChange={(e, obj) => handleIntInput(obj)}
                disabled={loading || isEdit}
              />)
            : null
          }
        </Field>

        <Field title="Partición Presupuestal"
          isRequired={!isEdit}
          disabled={isEdit}
          name="cargoId"
          value={displayCargo}
        >
          {!isEdit
            ? (<SelectCargo
                name="cargoId"
                value={form?.cargoId}
                onChange={(e, obj) => handleIntInput(obj)}
                disabled={loading || isEdit}
              />)
            : null 
          }
        </Field>

        <Field title="Año"
          type="number"
          isRequired={!isEdit}
          onChange={onChange}
          name="year"
          value={form?.year}
          disabled={loading || isEdit}
        />

        <Field title="Monto"
          isRequired
          type="number"
          onChange={onChange}
          name="amount"
          value={form?.amount}
          disabled={loading}
        />
    </Form> 
    </>
  )
}

export default FormPim;