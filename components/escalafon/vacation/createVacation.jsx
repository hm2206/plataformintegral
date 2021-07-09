import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import FormVacation from './formVacation';
import { Confirm } from '../../../services/utils';
import VacationProvider from '../../../providers/escalafon/VacationProvider';
import Swal from 'sweetalert2';

const vacationProvider = new VacationProvider();

const CreateVacation = ({ config_vacation = {}, onClose = null, onSave = null }) => {

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const readySave = useMemo(() => {
        let required = ['date_start', 'date_over'];
        // validar
        for (let item of required) {
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
        let answer = await Confirm('info', '¿Estas seguro en guardar la vacación?', 'Guardar');
        if (!answer) return;
        setCurrentLoading(true);
        let payload = Object.assign({}, form);
        payload.config_vacation_id = config_vacation.id;
        await vacationProvider.store(payload)
        .then(res => {
            let { message, vacation } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onSave == 'function') onSave(vacation);
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
            titulo={<span><i className="fas fa-file-alt"></i> Crear Vacación <span className="badge badge-dark">{config_vacation?.year}</span></span>}
        >
            <FormVacation className="card-body"
                form={form}
                errors={errors}
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
            </FormVacation>
        </Modal>
    )
}

export default CreateVacation;