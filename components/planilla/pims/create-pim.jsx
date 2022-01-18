import React from 'react';
import { useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import FormPim from './form-pim';
import { microPlanilla } from '../../../services/apis';
import Swal from 'sweetalert2';

const CreatePim = ({ onClose = null, onSave = null, year = 2022 }) => {

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: 0,
    year
  })

  const handleInput = ({ name, value }) => { 
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    const payload = Object.assign({}, form);
    payload.year = parseInt(`${payload.year}`);
    await microPlanilla.post(`pims`, payload)
      .then(async (res) => {
        setForm({})
        await Swal.fire({
          icon: 'success',
          text: `Los datos se guardaron correctamente!`
        })
        if (typeof onSave == 'function') onSave(res.data);
      }).catch(() => {
        Swal.fire({
          icon: 'error',
          text: `No se pudo guardar los datos`
        })
      })
    setLoading(false)
  }

  return (
    <Modal show={true}
      isClose={onClose}
      titulo={<span><i className="fas fa-plus"></i> Crear PIM</span>}
    >
      <div className="card-body">
        <FormPim
          disabled={loading}
          form={form}
          onChange={handleInput}
        />

        <div className='text-right'>
          <hr />
          <Button color='teal'
            loading={loading}
            onClick={handleSave}
          >
            <i className="fas fa-save"></i> Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CreatePim;