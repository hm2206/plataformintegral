import React, { useContext, useEffect, useMemo, useState } from 'react';
import Modal from '../modal';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import { Form, Button } from 'semantic-ui-react';
import { SelectTramiteType } from '../select/tramite';
import Show from '../show';
import TramiteProvider from '../../providers/tramite/TramiteProvider';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';

const tramiteProvider = new TramiteProvider();

const EditTramite = ({ show, onClose, onSave = null }) => {

    const { current_tracking, dispatch } = useContext(TramiteContext);
    
    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [edit, setEdit] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);

    const handleInput = ({ name, value }) => {
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
        await tramiteProvider.update(current_tracking.tramite_id, form)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            let newTracking = Object.assign({}, current_tracking);
            newTracking.tramite = form;
            await dispatch({ type: tramiteTypes.CHANGE_TRACKING, payload: newTracking });
            setEdit(false);
            if (typeof onSave == 'function') onSave(newTracking);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
    }

    const formReady = useMemo(() => {
        let required = ['asunto', 'tramite_type_id', 'folio_count'];
        for (let attr of required) {
            let value = form[attr] || null;
            if (!value) return false;
        }
        return true;
    }, [form]);

    useEffect(() => {
        if (!edit) setForm(Object.assign({}, current_tracking?.tramite || {}));
    }, [edit]);

    return (
        <Modal show={show}
            isClose={onClose}
            disabled={edit}
            height="50%"
            titulo={<span><i className="fas fa-edit"></i> Editar Trámite</span>}
        >
            <Form className="card-body">
                <div className="row">
                    <Form.Field className="col-md-12">
                        <label htmlFor="">Asunto <b className="text-red">*</b></label>
                        <textarea name="asunto" 
                            rows="3"
                            value={form?.asunto || ""}
                            onChange={(e) => handleInput(e.target)}
                        />
                    </Form.Field>

                    <Form.Field className="col-md-6">
                        <label htmlFor="">Tipo Documento <b className="text-red">*</b></label>
                        <SelectTramiteType 
                            name="tramite_type_id" 
                            value={form?.tramite_type_id}
                            onChange={(e, obj) => handleInput(obj)}
                        />
                    </Form.Field>

                    <Form.Field className="col-md-6">
                        <label htmlFor="">Folio <b className="text-red">*</b></label>
                        <input type="number"
                            name="folio_count" 
                            value={form?.folio_count || ""}
                            onChange={(e) => handleInput(e.target)}
                        />
                    </Form.Field>

                    <Form.Field className="col-md-12">
                        <label htmlFor="">Observación</label>
                        <textarea name="observation" 
                            rows="3"
                            value={form?.observation || ""}
                            onChange={(e) => handleInput(e.target)}
                        />
                    </Form.Field>

                    <Show condicion={edit}>
                        <div className="col-12 text-right">
                            <hr />
                            <Button color="red" 
                                basic
                                disabled={current_loading}
                                onClick={() => setEdit(false)}
                            >
                                <i className="fas fa-times"></i> Cancelar
                            </Button>

                            <Button color="teal"
                                loading={current_loading}
                                disabled={!formReady || current_loading}
                                onClick={handleUpdate}
                            >
                                <i className="fas fa-save"></i> Guardar Cambios
                            </Button>
                        </div>
                    </Show>
                </div>
            </Form>
        </Modal>
    )
}

export default EditTramite;