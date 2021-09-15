import React, { useContext, useEffect, useMemo, useState } from 'react';
import Modal from '../modal';
import AssistanceProvider from '../../providers/escalafon/AssistanceProvider';
import Show from '../show';
import { Confirm } from '../../services/utils';
import moment from 'moment';
import { Form, Button } from 'semantic-ui-react';
import { EntityContext } from '../../contexts/EntityContext';
import { AssistanceContext } from '../../contexts/escalafon/AssistanceContext'; 
import Swal from 'sweetalert2';
import AssignInfo from './infos/assingInfo'
import { SelectInfoSchedule } from '../select/escalafon'
import { collect } from 'collect.js';
moment.locale('es');

const assistanceProvider = new AssistanceProvider();

const CreateAssistance = ({ onClose = null }) => {

    // entity
    const { entity_id } = useContext(EntityContext);

    // assistance
    const { year, month, day } = useContext(AssistanceContext)

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [info, setInfo] = useState({});
    const [option, setOption] = useState(false);
    const [is_error, setIsError] = useState(false);

    // memos
    const isInfo = useMemo(() => {
        return Object.keys(info || {}).length;
    }, [info])

    // config
    const options = {
        headers: {
            EntityId: entity_id
        }
    }

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const handleDefault = () => {
        setForm({ 
            record_time:  moment().format('HH:mm:ss'),
        });
    }

    const autoSelectSchedule = (datos) => {
        let storage = collect(datos).pluck('obj.date').toArray()
        let currentDate = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD').format('YYYY-MM-DD')
        let index = storage.indexOf(currentDate);
        if (index < 0) return;
        let obj = datos[index]?.obj || {}
        setForm(prev => ({ ...prev, schedule_id: obj?.id })) 
    }

    const handleAdd = (obj) => {
        setInfo(obj);
        setOption(null);
    }

    const handleSave = async () => {
        let answer = await Confirm(`warning`, `¿Estás seguro en guardar los datos?`);
        if (!answer) return false;
        setCurrentLoading(true);
        let payload = Object.assign({}, form);
        await assistanceProvider.store(payload, options)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setIsError(false);
            setErrors({});
            setForm(prev => ({ ...prev, schedule_id: "", description: "" }));
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
            setErrors(err.errors || {});
            setIsError(true);
        });
        setCurrentLoading(false);
    }

    useEffect(() => {
        handleDefault();
    }, []);

    // render
    return (
        <Modal
            titulo={
                <span>
                    <i className="fas fa-clock"></i> Crear Asistencia
                </span>
            }
            show={true}
            isClose={onClose}
        >
            <Form className="card-body">
                <Form.Field className="mb-3" error={errors?.work?.[0] ? true : false}>
                    <Button onClick={() => setOption("ASSING")}>
                        <i className={`fas fa-${isInfo ? 'sync' : 'plus'}`}></i>
                    </Button>
                </Form.Field>

                <Show condicion={isInfo}>
                    <Form.Field className="mb-3">
                        <label>Apellidos y Nombres <b className="text-red">*</b></label>
                        <input type="text"
                            className="capitalize"
                            value={info?.work?.person?.fullname || ""}
                            readOnly
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Horario Programado <b className="text-red">*</b></label>
                        <SelectInfoSchedule
                            info_id={info.id}
                            year={year}
                            month={month}
                            refresh={info?.id}
                            onReady={autoSelectSchedule}
                            disabled
                            value={form?.schedule_id}
                            name="schedule_id"
                        />
                    </Form.Field>
                </Show>

                <Form.Field className="mb-3" error={errors?.record_time?.[0] ? true : false}>
                    <label>Hora <b className="text-red">*</b></label>
                    <input type="time"
                        name="record_time"
                        value={form.record_time || ""}
                        onChange={({ target }) => handleInput(target)}
                    />
                    <label>{errors?.record_time?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="mb-3" error={errors?.description?.[0] ? true : false}>
                    <label>Descripción <b className="text-red">*</b></label>
                    <textarea type="time"
                        rows="4"
                        name="description"
                        value={form.description || ""}
                        onChange={({ target }) => handleInput(target)}
                    />
                    <label>{errors?.description?.[0] || ""}</label>
                </Form.Field>
            </Form>
            <div className="card-footer">
                <div className="card-body text-right">
                    <Button color="teal"
                        onClick={handleSave}
                        disabled={!isInfo || current_loading}
                        loading={current_loading}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </div>
            {/* infos */}
            <Show condicion={option == 'ASSING'}>
                <AssignInfo
                    onClose={() => setOption(null)}
                    onAdd={handleAdd}
                />
            </Show>
        </Modal>
    );
}

export default CreateAssistance;