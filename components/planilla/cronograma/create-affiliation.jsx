import React, { useState } from 'react';
import Modal from '../../modal';
import { Form, Button } from 'semantic-ui-react';
import { FieldCustom, ToggleCustom, InputCustom } from './field-custom';
import { Confirm } from '../../../services/utils';
import { microPlanilla } from '../../../services/apis';
import Swal from 'sweetalert2';
import { SelectTypeAffiliation } from '../../select/micro-planilla';

const CreateAffiliation = ({ info = {}, onClose = null, onSave = null }) => {

  const [form, setForm] = useState({});
  const [currentLoading, setCurrentLoading] = useState(false);
  const [currentType, setCurrentType] = useState({});

  const handleInput = ({ name, value }) => {
    setForm(prev => ({ 
      ...prev,
      [name]: value
    }))
  }

  const handleAdd = async () => {
    const answer = await Confirm('warning', '¿Estás seguro en guardar los datos?');
    if (!answer) return;
    const payload = {};
    payload.infoId = info?.id;
    payload.typeAffiliationId = parseInt(`${currentType.id}`);
    payload.isPercent = form?.isPercent == true;
    payload.amount = parseFloat(`${form?.amount || 0}`);
    if (form.terminationDate) {
      payload.terminationDate = form?.terminationDate;
    }
    // enviar
    setCurrentLoading(true)
    await microPlanilla.post(`infoTypeAffiliations`, payload)
    .then(async ({ data }) => {
      await Swal.fire({
        icon: 'success',
        text: `Los datos se guardarón correctamente!`
      })
      // enviar
      if (typeof onSave == 'function') onSave(data);
    }).catch(() => { 
      Swal.fire({
        icon: 'error',
        text: `No se pudo guardar los datos!`
      })
    })
    setCurrentLoading(false);
  }

  const handleType = ({ options = [], value }) => {
    const option = options.find(opt => opt.value == value);
    if (!option) return setCurrentType({});
    const obj = option.obj || {}
    setCurrentType(obj);
    setForm(prev => ({
      ...prev,
      isPercent: obj.isPercent,
      amount: obj.isPercent ? obj.percent : obj.amount
    }));
  }

  return (
    <Modal show={true}
      md="7 col-sm-9 col-11"
      isClose={onClose}
      titulo={<span><i className="fas fa-plus"></i> Agregar Afiliación</span>}
    >
      <div className="card-body">
        <Form>
          <FieldCustom title='Tipo de Afiliación'
            name="typeAffiliationId"
            required={true}
          >
            <SelectTypeAffiliation
              name="typeAffiliationId"
              value={currentType?.id}
              onChange={(e, obj) => handleType(obj)}
            />
          </FieldCustom>

          <InputCustom title='Fecha de Cese'
            name="terminationDate"
            type='date'
            value={form?.terminationDate}
            onChange={handleInput}
          />

          <ToggleCustom title='Descontar por Porcentaje'
            name='isPercent'
            value={form?.isPercent}
            onChange={handleInput}
          />

          <InputCustom title={form?.isPercent ? 'Porcentaje' : 'Monto'}
            required={true}
            name="amount"
            type='number'
            value={form?.amount}
            onChange={handleInput}
          />

          <div className='text-right'>
            <hr />
            <Button color='teal'
              onClick={handleAdd}
              disabled={currentLoading}
              loading={currentLoading}
            >
              <i className="fas fa-save"></i> Guardar
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  )
}

export default CreateAffiliation;