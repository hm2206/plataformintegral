import React from 'react';
import { useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import FormPim from './form-pim';
import { microPlanilla } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../show';
import { useEffect } from 'react';

const EditPim = ({ onClose = null, onSave = null, pim = {} }) => {

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({});
  const [isEdit, setIsEdit] = useState();

  const handleInput = ({ name, value }) => { 
    setIsEdit(true);
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async () => {
    setLoading(true)
    const payload = Object.assign({}, form);
    payload.code = form?.code;
    payload.amount = parseFloat(`${form?.amount}`);
    payload.state = form.state == true;
    await microPlanilla.put(`pims/${pim?.id}`, payload)
      .then(async (res) => {
        await Swal.fire({
          icon: 'success',
          text: `Los datos se actualizaron correctamente!`
        })
        // fix datos
        if (typeof onSave == 'function') onSave(res.data);
      }).catch(() => {
        Swal.fire({
          icon: 'error',
          text: `No se pudo actualizar los datos`
        })
      })
    setLoading(false)
  }

  useEffect(() => {
    if (!isEdit) setForm(Object.assign({}, pim))
  }, [isEdit])

  return (
    <Modal show={true}
      isClose={onClose}
      titulo={<span><i className="fas fa-pencil-alt"></i> Editar PIM</span>}
    >
      <div className="card-body">
        <FormPim
          disabled={loading}
          form={form}
          onChange={handleInput}
        />

        <Show condicion={isEdit}>
          <div className='text-right'>
            <hr />
            <Button
              basic
              color='red'
              disabled={loading}
              onClick={() => setIsEdit(false)}
            >
              Cancelar
            </Button>

            <Button color='primary'
              disabled={loading}
              loading={loading}
              onClick={handleUpdate}
            >
              <i className="fas fa-sync"></i> Actualizar
            </Button>
          </div>
        </Show>
      </div>
    </Modal>
  )
}

export default EditPim;