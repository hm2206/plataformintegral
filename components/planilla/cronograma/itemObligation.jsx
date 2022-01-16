import React, { useMemo, useState } from 'react';
import { Form, Select, Checkbox, Button } from 'semantic-ui-react';
import storage from '../../../services/storage.json';
import Show from '../../show';
import { SelectBank } from '../../select/micro-planilla'; 
import { format } from 'currency-formatter';

const ItemObligation = ({ obligation = {}, edit = false }) => {

  const [isShow, setIsShow] = useState(false);
  const [form, setForm] = useState({
    documentTypeId: obligation?.documentTypeId,
    documentNumber: obligation?.documentNumber,
    bankId: obligation?.bankId,
    numberOfAccount: obligation?.numberOfAccount,
    isCheck: obligation?.isCheck || false,
    isPercent: obligation?.isPercent || false,
    percent: obligation?.percent || 0,
    amount: obligation?.amount || 0,
    observation: obligation?.observation,
    mode: obligation?.mode || 'DEFAULT',
    isBonification: obligation?.isBonification || false
  });

  const displayPerson = useMemo(() => {
    return obligation?.typeObligation?.person || {};
  }, [obligation]);

  const displayTypeObligation = useMemo(() => {
    return obligation?.typeObligation || {}
  }, [obligation]);

  return (
    <div className="col-md-12 col-lg-6 mb-3">
      <div className="card">
        <div className="card-header">
          <div className="row">
            <h5 className='col-12'>
              <i className="fas fa-info-circle mr-2"></i>
              Información del Beneficiario
              <Show condicion={edit}>
                <span className="close text-danger cursor-pointer"
                  style={{ opacity: 1, fontSize: "1.5em" }}
                >
                  <i className="fas fa-trash"></i>
                </span>
              </Show>
              <hr />
            </h5>
            
            <div className="col-md-8 mb-3">
              <Form.Field>
                <label htmlFor="">Apellidos y Nombres</label>
                <input type="text" 
                  value={displayPerson?.fullname || ""}
                  readOnly
                  className="uppercase"
                />
              </Form.Field>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="">N° Documento</label>
              <input type='text'
                readOnly
                value={displayPerson?.document_number || ''}
              />
            </div>

            <Show condicion={displayTypeObligation?.isOver}>
              <div className="col-12 mb-3">
                <label htmlFor="">Fecha de termino</label>
                <input type="date"
                  readOnly
                  value={displayTypeObligation?.terminationDate}
                />
              </div>
            </Show>
          </div>
        </div>

        <div className="card-body">
          <div className="row">
            <h5 className="col-12">
              <i className="fas fa-coins mr-2"></i>
              Información de Pago
              <span className='close text-primary'
                style={{ opacity: 1, fontSize: '18px' }}
              >
                <b>{format(form?.amount, { code: 'PEN' })}</b>
              </span>
              <hr />
            </h5>

            <Show condicion={isShow}>
              <div className="col-md-6 mb-3">
                <label htmlFor="">Tip. Documento</label>
                <Select
                  fluid
                  placeholder="Select. Tip. Documento"
                  options={storage.tipo_documento}
                  value={form?.documentTypeId || ''}
                  name="documentTypeId"
                  disabled={!edit}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="">N° de Documento</label>
                <Form.Field>
                  <input type="text" 
                    name="documentNumber"
                    value={form?.documentNumber || ""}
                    readOnly={!edit}
                  />
                </Form.Field>
              </div>

              <div className="col-md-4 mb-3">
                <Form.Field>
                  <label htmlFor="">Banco</label>
                  <SelectBank 
                    name="bankId"
                    value={form?.bankId || ""}
                    disabled={!edit}
                  />
                </Form.Field>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Field>
                  <label htmlFor="">N° de Cuenta</label>
                  <input type="text" 
                    name="numberOfAccount"
                    value={form?.numberOfAccount || ""}
                    readOnly={!edit}
                  />
                </Form.Field>
              </div>

              <div className="col-md-2 mb-3">
                <Form.Field>
                  <label htmlFor="">Cheque</label>
                  <Checkbox toggle
                    name="isCheck"
                    checked={form?.isCheck}
                    disabled={!edit}
                  />
                </Form.Field>
              </div>

              <div className="col-md-8 mb-3">
                <Form.Field>
                  <label htmlFor="">Observación</label>
                  <textarea
                    rows={8}
                    value={form?.observation || ""}
                    name="observation"
                    readOnly={!edit}
                  />
                </Form.Field>
              </div>

              <div className="col-md-4 mb-3">
                <Form.Field>
                  <label htmlFor="">Modo Descuento</label>
                  <Select
                    fluid
                    placeholder="Select. Porcentaje"
                    options={[
                      { key: "por", value: true, text: "Desct. Porcentaje" },
                      { key: "mon", value: false, text: "Desct. Monto" }
                    ]}
                    name="isPercent"
                    value={form?.isPercent}
                    disabled={!edit}
                  />
                </Form.Field>

                <Show condicion={form.isPercent}>
                  <Form.Field className="mb-2">
                    <label htmlFor="">Modo de Descuento</label>
                    <Select
                      name="mode"
                      value={form?.mode}
                      placeholder="Selecionar Modo"
                      disabled={!edit}
                      options={[
                        {key: 'monto-bruto', value: 'BRUTO', text: 'Bruto'},
                        {key: 'monto-neto', value: 'NETO', text: 'Neto'}
                      ]}
                    />
                  </Form.Field>
                </Show>

                <Show condicion={form?.isPercent}>
                  <>
                    <Form.Field>
                      <label htmlFor="">Aplica Bonificaciones</label>
                      <Checkbox 
                        toggle
                        checked={form?.isBonification}
                        disabled={!edit}
                        step="any"
                        name="isBonification"
                      />
                    </Form.Field>

                    <Form.Field>
                      <label htmlFor="">Porcentaje</label>
                      <input type="number" 
                        value={form?.percent || ""}
                        readOnly={!edit}
                        step="any"
                        name="percent"
                      />
                    </Form.Field>
                  </>
                </Show>

                <Form.Field>
                  <label htmlFor="">Monto</label>
                  <input type="number" 
                    name="amount"
                    value={form?.amount || ""}
                    readOnly={form?.isPercent || !edit}
                  />
                </Form.Field>
              </div>
            </Show>

            {/* footer */}
            <div className='text-center col-12'>
              <Button fluid
                onClick={() => setIsShow(prev => !prev)}
              >
                <i className={`ml-2 fas fa-arrow-${isShow ? 'up' : 'down'}`}></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>    
  )
}

export default ItemObligation;