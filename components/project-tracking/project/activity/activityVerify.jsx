import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../../../modal'
import { Form, Button } from 'semantic-ui-react'
import { projectTracking } from '../../../../services/apis'
import Swal from 'sweetalert2';

const ActivityVerify = ({ activity = {}, title, onClose = null, mode = 'PREVIEW_TECNICA', onSave = null }) => {

    const [current_loading, setCurrentLoading] = useState(false)
    const [description, setDescription] = useState("");

    const modes = {
        PREVIEW_TECNICA: {
            url: 'preview_verify_tecnica',
            attribute: 'preview_description_tecnica'
        },
        PREVIEW_FINANCIERA: {
            url: 'preview_verify_financiera',
            attribute: 'preview_description_financiera'
        },
        EXECUTE_TECNICA: {
            url: 'execute_verify_tecnica',
            attribute: 'execute_description_tecnica'
        },
        EXECUTE_FINANCIERA: {
            url: 'execute_verify_financiera',
            attribute: 'execute_description_financiera'
        }
    }

    const currentMode = useMemo(() => {
        return modes[mode] || {};
    }, [mode]);

    const handleVerify = async () => {
        setCurrentLoading(true);
        await projectTracking.post(`activity/${activity.id}/${currentMode.url}?_method=PUT`, { description })
        .then(async () => {
            await Swal.fire({ icon: 'success', text: `La actividad se verificó correctamente!` })
            if (typeof onSave == 'function') onSave();
        }).catch(() => {
            Swal.fire({ icon: 'error', text: `No se pudo verificar la actividad` })
        })
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (currentMode) {
            let value = activity[currentMode.attribute || ''];
            setDescription(value);
            console.log(value);
        }
    }, [currentMode])
    
    return (
        <Modal titulo={<span><i className="fas fa-check"></i> {title}</span>} 
            show={true} 
            disabled={current_loading}
            isClose={onClose}
        >
            <div className="card-body">
                <Form>
                    <Form.Field>
                        <label>Descripción <b className="text-red">*</b></label>
                        <textarea name="description" 
                            onChange={({ target }) => setDescription(target.value)}
                            value={description || null}
                            rows="4"
                        />
                    </Form.Field>

                    <div className="mt-2 text-right">
                        <hr />
                        <Button color="teal"
                            disabled={current_loading || !description}
                            loading={current_loading}
                            onClick={handleVerify}
                        >
                            Verificar
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    )
}

export default ActivityVerify;