import React, { useState } from 'react'
import Modal from '../../../modal'
import { projectTracking } from '../../../../services/apis'
import FormConfigObjective from './formConfigObjective'
import { Button } from 'semantic-ui-react'
import Swal from 'sweetalert2'

const CreateConfigObjective = ({ objective = {}, plan_trabajo = {}, onClose = null, status = 'PREVIEW', onSave = null }) => {

    const [current_loading, setCurrentLoading] = useState(false)
    const [form, setForm] = useState({})
    const [errors, setErrors] = useState({})

    const handleInput = ({ name, value }) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: [] }));
    }

    const handleCreate = async () => {
        setCurrentLoading(true);
        let payload = Object.assign({}, form) 
        payload.status = status
        payload.objective_id = objective?.id
        payload.plan_trabajo_id = plan_trabajo?.id 
        await projectTracking.post('config_objectives', payload)
        .then(async () => {
            await Swal.fire({ icon: 'success', text: 'los datos se guardarón correctamente!' })
            if (typeof onSave == 'function') onSave();
        }).catch(() => Swal.fire({ icon: 'error', text: 'No se pudó guardar los cambios' }))
        setCurrentLoading(false);
    }

    return (
        <Modal show={true}
            classHeader="text-left"
            titulo={<span><i className="fas fa-plus"></i> Crear Configuración de Objectivo</span>}
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
                        <Button color="teal" 
                            size="medium"
                            loading={current_loading}
                            onClick={handleCreate}
                            disabled={current_loading || !form?.description}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </FormConfigObjective>
            </div>
        </Modal>
    )
}

export default CreateConfigObjective;