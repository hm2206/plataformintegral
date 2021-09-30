import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import FormSchedule from './formSchedule';
import Show from '../../show';
import { Confirm } from '../../../services/utils';
import ScheduleProvider from '../../../providers/escalafon/ScheduleProvider';
import Swal from 'sweetalert2';

const scheduleProvider = new ScheduleProvider();

const CreateSchedule = ({ info = {}, date,  onClose = null, onSave = null }) => {

    const [form, setForm] = useState({ date });
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const readySave = useMemo(() => {
        if (!form?.modo) return false;
        // validacion por modo
        let validateModo = {
            ALL: ['date', 'time_start', 'time_over'],
            ENTRY: ['date', 'time_start'],
            EXIT: ['date', 'time_over']
        }
        // modo actual
        let currentValidateModo = validateModo[form?.modo] || [];
        // validar
        for (let item of currentValidateModo) {
            let value = form[item];
            if (!value) return false;
        }
        // response
        return true;
    }, [form]);

    const handleInput = (e, { name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const handleSave = async () => {
        let answer = await Confirm('info', '¿Estas seguro en guardar el horario?', 'Guardar');
        if (!answer) return;
        setCurrentLoading(true);
        let payload = Object.assign({}, form);
        payload.info_id = info.id;
        await scheduleProvider.store(payload)
        .then(res => {
            let { message, schedule } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onSave == 'function') onSave(schedule);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
            setErrors(err.errors || {});
        });
        setCurrentLoading(false);
    }

    return (
        <Modal isClose={onClose}
            show={true}
            md="5"
            titulo={<span><i className="fas fa-calendar"></i> Crear Horario</span>}
        >
            <FormSchedule className="card-body"
                form={form}
                errors={errors}
                readOnly={['date']}
                hidden={['status', 'discount']}
                onChange={handleInput}
            >
                <div className="col-md-12 text-right">
                    <hr />

                    <Button color="teal" 
                        disabled={current_loading || !readySave} 
                        loading={current_loading}
                        onClick={handleSave}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </FormSchedule>
        </Modal>
    )
}

export default CreateSchedule;