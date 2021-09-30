import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../modal';
import { Button, Progress } from 'semantic-ui-react';
import FormSchedule from './formSchedule';
import Show from '../../show';
import { Confirm } from '../../../services/utils';
import moment from 'moment';
import ScheduleProvider from '../../../providers/escalafon/ScheduleProvider';
import Swal from 'sweetalert2';

const scheduleProvider = new ScheduleProvider();

const EditSchedule = ({ schedule = {}, info = {}, onClose = null, onReplicar = null, onUpdate = null, onDelete = null }) => {

    const [form, setForm] = useState({});
    const [edit, setEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const isModify = useMemo(() => {
        let current_fecha = moment(`${moment().format('YYYY-MM')}-01`);
        let select_fecha = moment(`${moment(schedule.date).format('YYYY-MM')}-01`);
        return current_fecha.diff(select_fecha, 'months').valueOf() <= 0;
    }, []);

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
        await scheduleProvider.update(schedule.id, form)
        .then(async res => {
            let { message, schedule } = res.data;
            let newForm = Object.assign({}, form);
            newForm = { ...form, ...schedule };
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
        await scheduleProvider.delete(schedule.id)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onDelete == 'function') onDelete(schedule);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
    }

    const handleReplicar = async () => {
        let answer = await Confirm('info', `¿Estás seguro en replicar el horario?`, 'Estoy seguro');
        if (!answer) return;
        setCurrentLoading(true);
        await scheduleProvider.replicar(schedule.id)
        .then(res => {
            let { message, schedules } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onReplicar == 'function') onReplicar(schedules);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (!edit) setForm(Object.assign({}, schedule))
    }, [edit]);

    return (
        <Modal isClose={onClose}
            show={true}
            md="5"
            disabled={current_loading}
            titulo={<span><i className="fas fa-calendar"></i> Editar Horario <span className="badge badge-dark">{schedule?.date}</span></span>}
        >
            <FormSchedule className="card-body"
                disabled={!info?.estado}
                form={form}
                errors={errors}
                readOnly={['date']}
                hidden={['status', 'discount']}
                onChange={handleInput}
            >
                <Show condicion={isModify && info?.estado}>
                    <div className="col-md-12 text-right">
                        <Show condicion={edit}
                            predeterminado={
                                <Show condicion={!current_loading}
                                    predeterminado={
                                        <div>
                                            <Progress active percent={100} color="blue" inverted/>
                                        </div>
                                    }
                                >
                                    <Button color="black"
                                        basic 
                                        disabled={current_loading} 
                                        onClick={handleReplicar}
                                    > 
                                        <i className="fas fa-arrow-up"></i> Replicar
                                    </Button>

                                    <Button color="red" 
                                        disabled={current_loading} 
                                        onClick={handleDelete}
                                    > 
                                        <i className="fas fa-trash"></i> Eliminar
                                    </Button>
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
                </Show>
            </FormSchedule>
        </Modal>
    )
}

export default EditSchedule;