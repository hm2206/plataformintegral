import React, { useState } from 'react';
import CardContract from './card-contract';
import { SelectPlanilla, SelectPim, SelectBank } from '../../select/micro-planilla';
import { Form, Checkbox } from 'semantic-ui-react';
import Show from '../../show';

const FormInfo = ({ isEdit = false, contract = {}, form = {}, errors = {}, disabled = false, onChange = null, children = null }) => {

  const handleInput = (e, { name, value }) => {
    if (typeof onChange == 'function') onChange(e, { name, value });
  }

  const handleIntToInput = (e, { name, value }) => {
    const newValue = parseInt(`${value}`);
    handleInput(e, { name, value: newValue });
  }

  const [year, setYear] = useState(
    form?.pim?.year || new Date().getFullYear()
  );

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
            <Show condicion={!isEdit}
              predeterminado={
                <input type='text'
                  readOnly
                  value={form?.planilla?.name}
                />
              }
            >
              <SelectPlanilla
                name="planillaId"
                value={form?.planillaId || null}
                onChange={handleIntToInput}
                disabled={disabled}
              />
            </Show>
          </Form.Field>
        </div>

        <div className='col-md-6 mb-3'>
          <Form.Field>
          <label>Año PIM</label>
            <input type='number'
              name='year'
              value={year}
              onChange={({ target }) => setYear(target?.value)}
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
              disabled={disabled}
              year={year}
            />
          </Form.Field>
        </div>

        <div className='col-md-6 mb-3'>
          <Form.Field>
          <label>Banco <b className="text-red">*</b></label>
            <SelectBank
              name="bankId"
              value={form?.bankId || null}
              onChange={handleIntToInput}
              disabled={disabled}
            />
          </Form.Field>
        </div>

        <div className='col-md-6 mb-3'>
          <Form.Field>
          <label>N° Cuenta</label>
            <input type='text'
              name="numberOfAccount"
              value={form?.numberOfAccount || null}
              onChange={e => handleInput(e, e.target)}
              disabled={disabled}
            />
          </Form.Field>
        </div>

        <div className='col-md-6 mb-3'>
          <Form.Field>
          <label>Pagar en cheque</label>
            <Checkbox toggle
              name="isCheck"
              checked={form?.isCheck}
              disabled={disabled}
              onChange={(e, obj) => handleInput(e, { ...obj, value: obj.checked })}
            />
          </Form.Field>
        </div>

        <div className='col-md-6 mb-3'>
          <Form.Field>
          <label>Sincronizar a Contrato</label>
            <Checkbox toggle
              name="isSync"
              disabled={isEdit || disabled}
              checked={form?.isSync}
              onChange={(e, obj) => handleInput(e, { ...obj, value: obj.checked })}
            />
          </Form.Field>
        </div>

        <div className='col-md-6 mb-3'>
          <Form.Field>
          <label>Enviar al correo</label>
            <Checkbox toggle
              name="isEmail"
              disabled={disabled}
              checked={form?.isEmail}
              onChange={(e, obj) => handleInput(e, { ...obj, value: obj.checked })}
            />
          </Form.Field>
        </div>

        <Show condicion={isEdit}>
          <div className='col-md-12 text-right mb-3'>
            <Form.Field>
              <label>Estado</label>
              <div className={`badge badge-${form?.state ? 'success' : 'danger'}`}>
                {form?.state ? 'Activo' : 'Terminado'}
              </div>
            </Form.Field>
          </div>
        </Show>

        {children}
      </div>
    </Form>
  )
}

export default FormInfo;