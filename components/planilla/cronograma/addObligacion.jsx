import React, { useContext, useState } from 'react';
import Modal from '../../modal';
import { Form, Select, Button } from 'semantic-ui-react';
import storage from '../../../services/storage.json';
import Show from '../../show';
import { AssignPersonV2 } from '../../authentication/user/assign-person-v2';
import { SelectTypeDiscount, SelectBank } from '../../select/micro-planilla';
import { AppContext } from '../../../contexts/AppContext';
import { Confirm } from '../../../services/utils';
import { microPlanilla } from '../../../services/apis';
import Swal from 'sweetalert2';
import { FieldCustom, InputCustom, ToggleCustom } from './field-custom';

const AddObligacion = ({ onClose = null, onSave = null, info = {} }) => {

  // entity
  const app_context = useContext(AppContext);

  // estados
  const [form, setForm] = useState({
    isPercent: false
  });
  const [option, setOption] = useState("");
  const [person, setPerson] = useState({});
  const isPerson = Object.keys(person).length;
  const [errors, setErrors] = useState({});

  // cambiar form
  const handleInput = ({ name, value }) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // setting errors
    setErrors(prev => ({
      ...prev, 
      [name]: []
    }))
  }

  // agregar persona
  const addPerson = (obj) => {
    setOption("");
    setPerson(obj);
  }

  // agregar obligación
  const addObligacion = async () => {
    let answer = await Confirm('warning', `¿Estas seguro en agregar la obligación judicial?`);
    if (!answer) return;  
    app_context.setCurrentLoading(true);
    let payload = Object.assign({}, form);
    payload.personId = parseInt(`${person.id}`);
    payload.infoId = parseInt(`${info?.id}`);
    payload.typeDiscountId = parseInt(`${form?.typeDiscountId}`);
    payload.documentNumber = form?.documentNumber;
    payload.bankId = parseInt(`${form?.bankId}`);
    if (form?.numberOfAccount) {
      payload.numberOfAccount = form?.numberOfAccount;
    }
    // setting
    payload.isPercent = form.isPercent == true;
    payload.isBonification = form?.isBonification == true;
    payload.amount = parseFloat(`${form.amount || 0}`);
    payload.observation = form?.observation || '';
    payload.mode = form?.mode || 'DEFAULT';
    // validar fecha
    if (form?.terminationDate) {
      payload.terminationDate = form?.terminationDate;
    }
    // send
    await microPlanilla.post('typeObligations', payload)
    .then(() => {
      app_context.setCurrentLoading(false);
      setPerson({});
      Swal.fire({
        icon: 'success',
        text: `Los datos se guardarón correctamente!`
      });
      // add
      if (typeof onSave == 'function') onSave();
    }).catch(() => {
      app_context.setCurrentLoading(false);
      Swal.fire({
        icon: 'error',
        text: 'Ocurrio un error al guardar los datos!'
      });
    })
  }

  // render
  return (
    <Modal
      isClose={onClose}
      titulo={<span><i className="fas fa-plus"></i> Agregar Obligación judicial</span>}
      show={true}
      md=" col-md-9 col-lg-5 col-sm-10 col-12"
    >
      <div className="card-body">
        <div className="row mb-4 pl-3 pr-3">
          <div className="col-md-12 mb-3">
            <h5>Datos del Beneficiario</h5>
            <hr/>
          </div>

          <Show condicion={isPerson}>
            <div className="col-md-6 mb-3">
              <Form.Field>
                <label htmlFor="">Tip. Documento</label>
                <input
                  type="text"
                  readOnly
                  value={person?.documentType?.name || ""}
                />
              </Form.Field>
            </div>

            <div className="col-md-6 mb-3">
              <Form.Field>
                <label htmlFor="">N° Documento</label>
                <input
                  type="text"
                  readOnly
                  value={person.documentNumber || ""}
                />
              </Form.Field>
            </div>

            <div className="col-md-12 mb-3">
              <Form.Field>
                <label htmlFor="">Apellidos y Nombres</label>
                <input
                  type="text"
                  readOnly
                  className="uppercase"
                  value={person.fullName || ""}
                />
              </Form.Field>
            </div>
          </Show>

          <div className="col-md-12 mb-3">
            <Button
              onClick={(e) => setOption("assign")}
            >
              {isPerson ? <span><i className="fas fa-sync"></i> Cambiar</span> : <span><i className="fas fa-plus"></i> Agregar</span>} 
            </Button>
          </div>

          <div className="col-md-12 mb-3">
            <hr/>
            <h5>Datos de la Cuenta</h5>
            <hr/>
          </div>

          <div className="col-md-12 mb-3">
            <FieldCustom
              errors={errors}
              name="typeDiscountId"
              title='Tip. Descuento'
              required={true}
            >
              <SelectTypeDiscount
                value={form.typeDiscountId}
                name="typeDiscountId"
                judicial={true}
                onChange={(e, obj) => handleInput(obj)}
              />
            </FieldCustom>
          </div>

          <div className="col-md-6 mb-3">
            <FieldCustom
              errors={errors}
              name="documentTypeId"
              title='Tip. Documento'
              required={true}
            >
              <Select
                placeholder="Seleccionar Tip. Documento"
                options={storage.tipo_documento}
                name="documentTypeId" 
                value={form.documentTypeId || ""}
                onChange={(e, obj) => handleInput(obj)}
              />
            </FieldCustom>
          </div>

          <div className="col-md-6 mb-3">
            <InputCustom title='N° Documento'
              name='documentNumber'
              required={true}
              onChange={handleInput}
              errors={errors}
              value={form?.documentNumber}
            />
          </div>

          <div className="col-md-6 mb-3">
            <FieldCustom
              errors={errors}
              name="typeDiscountId"
              title='Tip. Banco'
              required={true}
            >
              <SelectBank
                value={form.bankId}
                name="bankId"
                onChange={(e, obj) => handleInput(obj)}
              />
            </FieldCustom>
          </div>

          <div className="col-md-6 mb-3">
            <InputCustom
              errors={errors}
              name="numberOfAccount"
              title='N° de Cuenta'
              required={true}
              value={form.numberOfAccount}
              onChange={handleInput}
            />
          </div>

          <div className="col-md-6 mb-3">
            <ToggleCustom title='Por porcentaje'
              name='isPercent'
              errors={errors}
              value={form?.isPercent || false}
              onChange={handleInput}
            />
          </div>

          <Show condicion={form.isPercent}>
            <div className="col-md-6">
              <FieldCustom title='Modo Descuento'
                name='mode'
                errors={errors}
                required={true}
              >
                <Select fluid
                  placeholder="Seleccionar modo"
                  name="mode"
                  value={form.mode || ""}
                  onChange={(e, obj) => handleInput(obj)}
                  options={[
                    {key: "select-bruto", value: 'BRUTO', text: 'Bruto'},
                    {key: "select-neto", value: 'NETO', text: 'Neto'}
                  ]}
                />
              </FieldCustom>
            </div>
          </Show>

          <Show condicion={form.isPercent}>
            <div className='col-md-6 mb-3'>
              <ToggleCustom title='Aplica Bonificaciones'
                name='isBonification'
                value={form.isBonification}
                onChange={handleInput}
              />
            </div>
          </Show>

          <div className="col-md-6 mb-3">
            <InputCustom title={form?.isPercent ? 'Porcentaje %' : 'Monto'}
              name='amount'
              type='number'
              value={form?.amount}
              required={true}
              onChange={handleInput}
              errors={errors}
            />
          </div>

          <div className="col-md-12 mb-3">
            <InputCustom title='Fecha de Termino'
              type='date'
              name='terminationDate'
              value={form?.terminationDate}
              errors={errors}
              onChange={handleInput}
            />
          </div>

          <div className="col-md-12 mb-3">
            <FieldCustom title='Observación'
              errors={errors}
              name='observation'
            >
              <textarea rows={8}
                name="observation"
                value={form.observation || ""}
                onChange={({target}) => handleInput(target)}
              />
            </FieldCustom>
          </div>

          <div className="col-md-12 text-right">
            <hr/>
            <Button color="teal"
              onClick={addObligacion}
              disabled={!isPerson}
            >
              <i className="fas fa-save"></i> Guardar
            </Button>
          </div>
        </div>
      </div>

      <Show condicion={option == 'assign'}>
        <AssignPersonV2
          local={true}
          getAdd={addPerson}
          isClose={(e) => setOption("")}
        />
      </Show>
    </Modal>
  )
}

export default AddObligacion;