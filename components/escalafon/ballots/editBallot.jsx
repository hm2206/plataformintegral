import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../modal';
import { Button, Progress } from 'semantic-ui-react';
import FormBallot from './formBallot';
import Show from '../../show';
import { Confirm } from '../../../services/utils';
import moment from 'moment';
import BallotProvider from '../../../providers/escalafon/BallotProvider';
import Swal from 'sweetalert2';

const ballotProvider = new BallotProvider();

const EditBallot = ({ ballot = {}, info = {}, onClose = null, onUpdate = null, onDelete = null }) => {

    const [form, setForm] = useState({});
    const [edit, setEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const canDelete = useMemo(() => {
        let current_fecha = moment(`${moment().format('YYYY-MM')}-01`);
        let select_fecha = moment(`${moment(ballot?.schedule?.date).format('YYYY-MM')}-01`);
        let diff = select_fecha.diff(current_fecha, 'months').valueOf();
        return diff >= 0;
    }, [ballot]);

    const displayDate = useMemo(() => {
        return moment(form.date);
    }, [form?.date]);

    const handleInput = (e, { name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        setEdit(true);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const handleUpdate = async () => {
        let answer = await Confirm('info', `¿Estás seguro en guardar los cambios?`, 'Estoy seguro');
        if (!answer) return;
        setCurrentLoading(true);
        await ballotProvider.update(ballot.id, form)
        .then(async res => {
            let { message, ballot } = res.data;
            let newForm = Object.assign({}, form);
            newForm = { ...form, ...ballot };
            Swal.fire({ icon: 'success', text: message });
            if (typeof onUpdate == 'function') await onUpdate(newForm);
            setEdit(false)
        }).catch(err => {
            setErrors(err.errors || {})
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
    }

    const handleDelete = async () => {
        let answer = await Confirm('warning', `¿Estás seguro en eliminar?`, 'Estoy seguro');
        if (!answer) return;
        setCurrentLoading(true);
        await ballotProvider.delete(ballot.id)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onDelete == 'function') onDelete(ballot);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (!edit) setForm(Object.assign({}, ballot))
    }, [edit]);

    return (
        <Modal isClose={onClose}
            show={true}
            md="5"
            disabled={current_loading}
            titulo={<span><i className="fas fa-calendar"></i> Editar Papeleta <span className="badge badge-dark">{ballot?.ballot_number}</span></span>}
        >
            <FormBallot className="card-body"
                form={form}
                errors={errors}
                disabled={current_loading || !info?.estado}
                readOnly={['total']}
                onChange={handleInput}
                info_id={info?.id}
                isEdit={true}
                year={displayDate.year()}
                month={displayDate.month() + 1}
            >
                <div className="col-md-12 text-right">
                    <Show condicion={edit}
                        predeterminado={
                            <Show condicion={canDelete}>
                                <Show condicion={!current_loading}
                                    predeterminado={
                                        <div>
                                            <Progress active percent={100} color="blue" inverted/>
                                        </div>
                                    }
                                >
                                    <Button color="red" 
                                        disabled={current_loading} 
                                        onClick={handleDelete}
                                    > 
                                        <i className="fas fa-trash"></i> Eliminar
                                    </Button>
                                </Show>
                            </Show>
                        }
                    >
                            <hr />
                            <Button color="red" 
                                disabled={current_loading} 
                                basic
                                onClick={() => setEdit(false)}
                            >
                                <i className="fas fa-times"></i> Cancelar
                            </Button>

                            <Button color="teal" 
                                disabled={current_loading} 
                                loading={current_loading}
                                onClick={handleUpdate}
                            >
                                <i className="fas fa-sync"></i> Guardar cambios
                            </Button>
                    </Show>
                </div>
            </FormBallot>
        </Modal>
    )
}

export default EditBallot;