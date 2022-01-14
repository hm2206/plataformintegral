import React from 'react';
import { useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import FormPim from './form-pim';
import { microPlanilla } from '../../../services/apis';
import Swal from 'sweetalert2';

const EditPim = ({ onClose = null, onSave = null, pim = {} }) => {

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(pim);

  const handleInput = ({ name, value }) => { 
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async () => {
    setLoading(true)
    const payload = Object.assign({}, {});
    payload.code = form?.code;
    payload.amount = parseFloat(`${form?.amount}`);
    payload.state = form.state == true;
    await microPlanilla.put(`pims/${pim?.id}`, payload)
      .then((res) => {
        setForm({})
        if (typeof onSave == 'function') onSave(res.data);
        Swal.fire({
          icon: 'success',
          text: `Los datos se actualizaron correctamente!`
        })
      }).catch(() => {
        Swal.fire({
          icon: 'error',
          text: `No se pudo actualizar los datos`
        })
      })
    setLoading(false)
  }

  return (
    <Modal show={true}
      isClose={onClose}
      titulo={<span><i className="fas fa-pencil-alt"></i> Editar PIM</span>}
    >
      <div className="card-body">
        <FormPim isEdit={true}
          disabled={loading}
          form={form}
          onChange={handleInput}
        />

        <div className='text-right'>
          <hr />
          <Button color='primary'
            loading={loading}
            onClick={handleUpdate}
          >
            <i className="fas fa-sync"></i> Actualizar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default EditPim;