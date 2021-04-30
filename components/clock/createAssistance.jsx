import React, { useContext, useEffect, useMemo, useState } from 'react';
import Modal from '../modal';
import AssingTrabajador from '../contrato/assingTrabajador';
import AssistanceProvider from '../../providers/clock/AssistanceProvider';
import Show from '../show';
import { Confirm } from '../../services/utils';
import moment from 'moment';
import { Form, Button } from 'semantic-ui-react';
import { EntityContext } from '../../contexts/EntityContext';
import { AssistanceContext } from '../../contexts/clock/AssistanceContext'; 
import Swal from 'sweetalert2';
moment.locale('es');

const assistanceProvider = new AssistanceProvider();

const CreateAssistance = ({ onClose = null }) => {

    // entity
    const { entity_id } = useContext(EntityContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [work, setWork] = useState({});
    const [select_work, setSelectWork] = useState(false);
    const [is_error, setIsError] = useState(false);

    // context
    const { config_assistance_id } = useContext(AssistanceContext);

    // memos
    const isWork = useMemo(() => {
        return Object.keys(work || {}).length;
    }, [work])

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
            date:  moment().format('YYYY-MM-DD'),
            time:  moment().format('HH:mm:ss'),
        });
    }

    const handleAdd = (obj) => {
        setWork(obj);
        setSelectWork(false);
    }

    const handleSave = async () => {
        let answer = await Confirm(`warning`, `¿Estás seguro en guardar los datos?`);
        if (!answer) return false;
        setCurrentLoading(true);
        let current_date = moment().format('YYYY-MM-DD');
        let payload = Object.assign({}, form);
        payload.work_id = work.id;
        payload.config_assistance_id = config_assistance_id;
        payload.record_time = moment(`${current_date} ${form.time}`).format('YYYY-MM-DD HH:mm:ss');
        await assistanceProvider.store(payload, options)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setIsError(false);
            setErrors({});
            setForm({ record_time: payload.record_time });
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
                    <Button onClick={() => setSelectWork(true)}>
                        <i className={`fas fa-${isWork ? 'sync' : 'plus'}`}></i>
                    </Button>
                </Form.Field>

                <Show condicion={isWork}>
                    <Form.Field className="mb-3">
                        <label>Apellidos y Nombres <b className="text-red">*</b></label>
                        <input type="text"
                            className="capitalize"
                            value={work?.person?.fullname || ""}
                            readOnly
                        />
                    </Form.Field>
                </Show>

                <Form.Field className="mb-3" error={errors?.date?.[0] ? true : false}>
                    <label>Fecha <b className="text-red">*</b></label>
                    <input type="date"
                        name="fecha"
                        value={form.date || ""}
                        onChange={({ target }) => handleInput(target)}
                    />
                    <label>{errors?.date?.[0] || ""}</label>
                </Form.Field>

                <Form.Field className="mb-3" error={errors?.time?.[0] ? true : false}>
                    <label>Hora <b className="text-red">*</b></label>
                    <input type="time"
                        name="time"
                        value={form.time || ""}
                        onChange={({ target }) => handleInput(target)}
                    />
                    <label>{errors?.time?.[0] || ""}</label>
                </Form.Field>
            </Form>
            <div className="card-footer">
                <div className="card-body text-right">
                    <Button color="teal"
                        onClick={handleSave}
                        disabled={!isWork || current_loading}
                        loading={current_loading}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </div>
            {/* work */}
            <AssingTrabajador
                show={select_work}
                isClose={() => setSelectWork(false)}
                getAdd={handleAdd}
            />
        </Modal>
    );
}

export default CreateAssistance;