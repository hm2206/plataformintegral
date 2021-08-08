import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import FormConfigVacation from './formConfigVacation';
import { Confirm } from '../../../services/utils';
import ConfigVacationProvider from '../../../providers/escalafon/ConfigVacationProvider';
import Swal from 'sweetalert2';
import moment from 'moment';

const configVacationProvider = new ConfigVacationProvider();

const CreateConfigVacation = ({ work = {}, onClose = null, onSave = null }) => {

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const readySave = useMemo(() => {
        let required = ['year', 'scheduled_days', 'date_start', 'date_over'];
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
        let answer = await Confirm('info', '¿Estas seguro en guardar la configuración de vacaciones?', 'Guardar');
        if (!answer) return;
        setCurrentLoading(true);
        let payload = Object.assign({}, form);
        payload.work_id = work.id;
        payload.year = `${form.year}`;
        await configVacationProvider.store(payload)
        .then(res => {
            let { message, config_vacation } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onSave == 'function') onSave(config_vacation);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
            setErrors(err.errors || {});
        });
        setCurrentLoading(false);
    }

    useEffect(() => {
        let date = moment();
        setForm({ year: date.year(), scheduled_days: 30 });
    }, []);

    return (
        <Modal isClose={onClose}
            show={true}
            md="5"
            titulo={<span><i className="fas fa-file-alt"></i> Crear Configuración de Vacaciones</span>}
        >
            <FormConfigVacation className="card-body"
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
            </FormConfigVacation>
        </Modal>
    )
}

export default CreateConfigVacation;