import React from 'react';
import { useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import FormPim from './form-pim';
import { microPlanilla } from '../../../services/apis';
import Swal from 'sweetalert2';

const CreatePim = ({ onClose = null, onSave = null }) => {

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: 0
  })

  const handleInput = ({ name, value }) => { 
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    await microPlanilla.post(`pims`, form)
      .then((res) => {
        setForm({})
        if (typeof onSave == 'function') onSave(res.data);
        Swal.fire({
          icon: 'success',
          text: `Los datos se guardaron correctamente!`
        })
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