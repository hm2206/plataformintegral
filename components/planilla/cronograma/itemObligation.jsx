import React, { useMemo, useState, useEffect } from 'react';
import { Form, Select, Button } from 'semantic-ui-react';
import storage from '../../../services/storage.json';
import Show from '../../show';
import { SelectBank } from '../../select/micro-planilla'; 
import { format } from 'currency-formatter';
import { InputCustom, ToggleCustom } from './field-custom';
import { Confirm } from '../../../services/utils';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AppContext } from '../../../contexts/AppContext';
import { microPlanilla } from '../../../services/apis';

const ItemObligation = ({ obligation = {}, onUpdate = null, onDelete = null, edit = false }) => {

  const [isShow, setIsShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(obligation);
  const [currentLoading, setCurrentLoading] = useState(false);

  const app_context = useContext(AppContext);

  const displayPerson = useMemo(() => {
    return obligation?.typeObligation?.person || {};
  }, [obligation]);

  const displayTypeObligation = useMemo(() => {
    return obligation?.typeObligation || {}
  }, [obligation]);

  const handleInput = ({ name, value }) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDelete = async () => {
    const answer = await Confirm('warning', '¿Estás seguro e eliminar el regístro?');
    if (!answer) return;
    setCurrentLoading(true);
    await microPlanilla.delete(`obligations/${obligation?.id}`)
    .then(() => {
      toast.success(`El regístro se actualizó correctamente!`)
      if (typeof onDelete == 'function') onDelete(obligation);
    }).catch(() => {
      toast.error(`No se pudó actualizar el regístro!`)
    });
    setCurrentLoading(false);
  }

  const handleUpdate = async () => {
    const answer = await Confirm('warning', '¿Estás seguro guardar los cambios?');
    if (!answer) return;
    app_context.setCurrentLoading(true)
    const payload = {};
    payload.documentTypeId = form?.documentTypeId;
    payload.documentNumber = form?.documentNumber;
    payload.bankId = parseInt(`${form?.bankId}`);
    payload.numberOfAccount = form?.numberOfAccount || '';
    // setting
    payload.isPercent = form.isPercent == true;
    payload.isBonification = form?.isBonification == true;
    payload.amount = parseFloat(`${form.amount || 0}`);
    payload.percent = parseFloat(`${form.percent || 0}`);
    payload.observation = form?.observation || '';
    payload.mode = form?.mode || 'DEFAULT';
    await microPlanilla.put(`obligations/${obligation?.id}`, payload)
    .then(() => {
      app_context.setCurrentLoading(false)
      toast.success(`El regístro se actualizó correctamente!`)
      if (typeof onUpdate == 'function') onUpdate();
    }).catch(() => {
      app_context.setCurrentLoading(false)
      toast.error(`No se pudó actualizar el regístro!`)
    });
  }

  useEffect(() => {
    if (!edit) setForm(obligation);
  }, [edit])

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
                  onClick={handleDelete}
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
                  value={displayPerson?.fullName || ""}
                  readOnly
                  className="uppercase"
                />
              </Form.Field>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="">N° Documento</label>
              <input type='text'
                readOnly
                value={displayPerson?.documentNumber || ''}
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
                <b>{format(obligation?.amount, { code: 'PEN' })}</b>
              </span>
              <hr />
            </h5>

            <Show condicion={isShow}>
              <div className="col-md-6 mb-3">
                <label htmlFor="">Tip. Documento</label>
                <Select fluid
                  className={edit ? 'input-active' : ''}
                  placeholder="Select. Tip. Documento"
                  options={storage.tipo_documento}
                  value={form?.documentTypeId || ''}
                  name="documentTypeId"
                  disabled={!edit || currentLoading}
                  onChange={(e, obj) => handleInput(obj)}
                />
              </div>

              <div className="col-md-6 mb-3">
                <InputCustom title='N° de Documento'
                  name="documentNumber"
                  value={form?.documentNumber || ""}
                  readOnly={!edit || currentLoading}
                  errors={errors}
                  onChange={handleInput}
                />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Field>
                  <label htmlFor="">Banco</label>
                  <SelectBank 
                    active={edit}
                    name="bankId"
                    value={form?.bankId || ""}
                    disabled={!edit || currentLoading} 
                    onChange={(e, obj) => handleInput(obj)}
                  />
                </Form.Field>
              </div>

              <div className="col-md-6 mb-3">
                <InputCustom title='N° Cuenta'
                  name="numberOfAccount"
                  value={form?.numberOfAccount || ""}
                  readOnly={!edit || currentLoading}
                  errors={errors}
                  onChange={handleInput}
                />
              </div>

              <div className="col-md-8 mb-3">
                <Form.Field>
                  <label htmlFor="">Observación</label>
                  <textarea
                    className={edit ? 'input-active' : ''}
                    rows={8}
                    value={form?.observation || ""}
                    name="observation"
                    readOnly={!edit || currentLoading}
                    onChange={({ target }) => handleInput(target)}
                  />
                </Form.Field>
              </div>

              <div className="col-md-4 mb-3">
                <ToggleCustom title='Por porcentaje'
                  name="isPercent"
                  value={form?.isPercent || false}
                  onChange={handleInput}
                  disabled={!edit || currentLoading}
                />

                <Show condicion={form.isPercent}>
                  <Form.Field className="mb-2">
                    <label htmlFor="">Modo de Descuento</label>
                    <Select className={edit ? 'input-active' : ''}
                      name="mode"
                      value={form?.mode}
                      placeholder="Selecionar Modo"
                      disabled={!edit || currentLoading}
                      onChange={(e, obj) => handleInput(obj)}
                      options={[
                        {key: 'monto-bruto', value: 'BRUTO', text: 'Bruto'},
                        {key: 'monto-neto', value: 'NETO', text: 'Neto'}
                      ]}
                    />
                  </Form.Field>
                </Show>

                <Show condicion={form?.isPercent}>
                  <>
                    <ToggleCustom title='Aplica bonificaciones'
                      name="isBonification"
                      value={form?.isBonification || false}
                      onChange={handleInput}
                      disabled={!edit || currentLoading}
                    />

                    <InputCustom title='Procentaje'
                      name="percent"
                      value={form?.percent || 0}
                      readOnly={!edit || currentLoading}
                      errors={errors}
                      onChange={handleInput}
                    />
                  </>
                </Show>

                <InputCustom title='Monto'
                  name="amount"
                  value={form?.amount || 0}
                  readOnly={!edit || form?.isPercent || currentLoading}
                  errors={errors}
                  onChange={handleInput}
                />

                <Button color='blue'
                  onClick={handleUpdate}
                  disabled={currentLoading || !edit}
                  loading={currentLoading}
                  fluid
                >
                  <i className="fas fa-sync"></i> Actualizar
                </Button>
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