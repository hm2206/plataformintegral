import React from 'react';
import CardContract from './card-contract';
import { SelectPlanilla, SelectPim } from '../../select/micro-planilla';
import { Form, Checkbox } from 'semantic-ui-react';

const FormInfo = ({ contract = {}, form = {}, errors = {}, disabled = false, onChange = null, children = null }) => {

  const handleInput = (e, { name, value }) => {
    if (typeof onChange == 'function') onChange(e, { name, value });
  }

  const handleIntToInput = (e, { name, value }) => {
    const newValue = parseInt(`${value}`);
    handleInput(e, { name, value: newValue });
  }

  return (
    <Form>
      <div className="row w-100">
        <CardContract contract={contract} />
        <div className='col-12 mt-2 mb-2'>
          <hr />
          <i className="fas fa-cogs"></i> Configuración de Pago
          <hr />
        </div>

        <div className='col-md-6 mb-3'>
          <Form.Field>
          <label>Planilla <b className="text-red">*</b></label>
            <SelectPlanilla
              name="planillaId"
              value={form?.planillaId || null}
              onChange={handleIntToInput}
            />
          </Form.Field>
        </div>

        <div className='col-md-6 mb-3'>
          <Form.Field>
          <label>PIM <b className="text-red">*</b></label>
            <SelectPim
              name="pimId"
              value={form?.pimId || null}
              onChange={handleIntToInput}
            />
          </Form.Field>
        </div>

        <div className='col-md-6 mb-3'>
          <Form.Field>
          <label>Sincronizar a Contrato</label>
            <Checkbox toggle
              name="isSync"
              value={form?.isSync}
              onChange={handleInput}
            />
          </Form.Field>
        </div>

        <div className='col-md-6 mb-3'>
          <Form.Field>
          <label>Enviar al correo</label>
            <Checkbox toggle
              name="isEmail"
              value={form?.isEmail}
              onChange={handleInput}
            />
          </Form.Field>
        </div>

        {children}
      </div>
    </Form>
  )
}

export default FormInfo;