import React, { useMemo, useState } from 'react';
import { Form } from 'semantic-ui-react';
import { microPlanilla } from '../../../services/apis';
import { SelectMeta, SelectCargo } from '../../select/micro-planilla';
import { toast, ToastContainer } from 'react-toastify';
import { useEffect } from 'react';

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

  const [currentLoading, setCurrentLoading] = useState(false);
  const [isLogs, setIsLogs] = useState(false);

  const handleIntInput = ({ name, value }) => {
    let newValue = value;
    if (value) newValue = parseInt(`${value}`);
    if (typeof onChange == 'function') {
      onChange({ name, value: newValue });
    }
  }

  const handleFloatInput = ({ name, value }) => {
    let newValue = value;
    if (value) newValue = parseFloat(`${value}`);
    if (typeof onChange == 'function') {
      onChange({ name, value: newValue });
    }
  }

  const findPim = async () => {
    setCurrentLoading(true);
    await microPlanilla.get(`pims/${form?.id}`)
      .then(({ data }) => setIsLogs(data?.isLogs))
    .catch(() => toast.error('No se pudo obtener el pim'))
    setCurrentLoading(false);
  }

  const displayCargo = useMemo(() => {
    return `${form?.cargo?.name} | ${form?.cargo?.extension}`
  }, [form?.cargo]);

  const isEditAmount = useMemo(() => {
    const executedAmount = parseFloat(`${form?.executedAmount}`);
    if (executedAmount > 0) return false;
    return true;
  }, [form]);

  useEffect(() => {
    if (form?.id) findPim();
  }, [form?.id])

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
          isRequired={true}
          name="year"
          value={form?.year}
          disabled={true}
        />

        <Field title="Monto"
          isRequired
          type="number"
          onChange={handleFloatInput}
          name="amount"
          value={form?.amount}
          disabled={loading || !isEditAmount || isLogs}
        />
      </Form> 
      {/* alert */}
      <ToastContainer/>
    </>
  )
}

export default FormPim;