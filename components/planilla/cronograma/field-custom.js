import React from 'react';
import Show from '../../show';
import { Checkbox, FormField } from 'semantic-ui-react';

export const FieldCustom = ({ errors = {}, name = "", title = "", required = false, children = null }) => {
  return (
    <FormField name={name}
      className="mb-3"
      errors={errors?.[name]?.[0] ? true : false}
    >
      <label>{title || ""}
        <Show condicion={required}>
          <b className="text-red">*</b>
        </Show>
      </label>
      {children || null}
      <label>{errors?.[name]?.[0] || null}</label>
    </FormField>
  )
}

export const InputCustom = ({ type = "text",
  errors = {}, name = "", title = "",
  required = false, value = null,
  onChange = null, className = null,
  readOnly = false
}) => {

  const handleInput = ({ target = {} }) => {
    const name = target?.name || '';
    const value = target?.value || null;
    if (typeof onChange == 'function') {
      onChange({ name, value });
    }
  }

  return (
    <FieldCustom name={name}
      errors={errors}
      required={required}
      title={title}
    >
      <input type={type}
        name={name}
        value={value || ''}
        onChange={handleInput}
        className={`${readOnly ? '' : 'input-active'} ${className || ``}`}
        readOnly={readOnly}
      />
    </FieldCustom>
  )
}

export const ToggleCustom = ({
  errors = {}, name = "", title = "",
  required = false, value = false,
  onChange = null, className = null,
  disabled = false
}) => {

  const handleInput = (obj = {}) => {
    const name = obj.name || '';
    const checked = obj.checked || false;
    if (typeof onChange == 'function') {
      onChange({ name, value: checked });
    }
  }

  return (
    <FieldCustom name={name}
      errors={errors}
      required={required}
      title={title}
    >
      <div>
        <Checkbox toggle
          name={name}
          checked={value || false}
          onChange={(e, obj) => handleInput(obj)}
          className={className || ``}
          disabled={disabled}
        />
      </div>
    </FieldCustom>
  )
}