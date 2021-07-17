import React, { useMemo, useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import FormBallot from './formBallot';
import { Confirm } from '../../../services/utils';
import BallotProvider from '../../../providers/escalafon/BallotProvider';
import Swal from 'sweetalert2';
import moment from 'moment';

const ballotProvider = new BallotProvider();

const CreateBallot = ({ info = {}, date, onClose = null, onSave = null }) => {

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const current_date = moment(date);

    const readySave = useMemo(() => {
        let required = ['schedule_id', 'motivo', 'time_over'];
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
        let answer = await Confirm('info', '¿Estas seguro en guardar el papeleta?', 'Guardar');
        if (!answer) return;
        setCurrentLoading(true);
        let payload = Object.assign({}, form);
        payload.info_id = info.id;
        await ballotProvider.store(payload)
        .then(res => {
            let { message, ballot } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onSave == 'function') onSave(ballot);
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
            titulo={<span><i className="fas fa-file-alt"></i> Crear Papeleta</span>}
        >
            <FormBallot className="card-body"
                form={form}
                errors={errors}
                onChange={handleInput}
                info_id={info?.id}
                year={current_date.year()}
                month={current_date.month() + 1}
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
            </FormBallot>
        </Modal>
    )
}

export default CreateBallot;