import React, { useEffect, useState } from 'react'
import Modal from '../../../modal'
import { projectTracking } from '../../../../services/apis'
import FormConfigObjective from './formConfigObjective'
import { Button } from 'semantic-ui-react'
import Swal from 'sweetalert2'

const EditConfigObjective = ({ config, onClose = null, onSave = null }) => {

    const [current_loading, setCurrentLoading] = useState(false)
    const [form, setForm] = useState({})
    const [errors, setErrors] = useState({})
    const [is_edit, setIsEdit] = useState(false)

    const handleInput = ({ name, value }) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: [] }));
    }

    const handleUpdate = async () => {
        setCurrentLoading(true);
        await projectTracking.post(`config_objectives/${config.id}`, form)
        .then(async () => {
            await Swal.fire({ icon: 'success', text: 'los cambios se guardarón correctamente!' })
            if (typeof onSave == 'function') onSave();
        }).catch(() => Swal.fire({ icon: 'error', text: 'No se pudó guardar los cambios' }))
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (!is_edit) setForm(Object.assign({}, config))
    }, [is_edit])

    return (
        <Modal show={true}
            classHeader="text-left"
            titulo={<span><i className="fas fa-pencil-alt"></i> Editar Configuración de Objectivo</span>}
            isClose={onClose}
            disabled={current_loading}
        >
            <div className="card-body text-left">
                <FormConfigObjective disabled={current_loading}
                    form={form}
                    errors={errors}
                    onChange={handleInput}
                >
                    <div className="col-12 text-right">
                        <hr />
                        <Button color="blue" 
                            size="medium"
                            loading={current_loading}
                            onClick={handleUpdate}
                            disabled={current_loading || !form?.description}
                        >
                            <i className="fas fa-sync"></i> Actualizar
                        </Button>
                    </div>
                </FormConfigObjective>
            </div>
        </Modal>
    )
}

export default EditConfigObjective;