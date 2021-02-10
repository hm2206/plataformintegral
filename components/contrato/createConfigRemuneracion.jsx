import React, { useState } from 'react';
import Modal from '../modal';
import { Form, Checkbox, Button } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Swal from 'sweetalert2';
import { SelectTypeRemuneracion } from '../select/cronograma';
import { Confirm } from '../../services/utils';

const  CreateConfigRemuneracion = ({ isClose = null, info = {}, onCreate = null }) => {

    // estados
    const [form, setForm] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    const handleInput = ({name, value}) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    const create = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en guardar los datos?', 'Estoy seguro');
        if (!answer) return false;
        // enviar
        setCurrentLoading(true);
        let datos = Object.assign({}, form);
        await unujobs.post(`info/${info.id}/add_config`, datos)
        .then(async res => {
            let { success, message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({});
            if (typeof onCreate == 'function') onCreate(message);
        }).catch(err => Swal.fire({ icon: 'error', text: 'Algo salió más!'}));    
        setCurrentLoading(false);
    }

    // render
    return (
        <Modal show={true}
            isClose={isClose}
            titulo={<span><i className="fas fa-coins"></i>Agregar Remuneración</span>}
            disabled={current_loading}
        >
            <div className="card-body">
                <Form>
                    <div className="row">
                        <div className="col-md-12 mb-3">
                            <Form.Field>
                                <label htmlFor="">Tip. Remuneración</label>
                                <SelectTypeRemuneracion
                                    name="type_remuneracion_id"
                                    value={form.type_remuneracion_id}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-12 mb-3">
                            <Form.Field>
                                <label htmlFor="">Base Imponible</label>
                                <div>
                                    <Checkbox
                                        toggle
                                        name="base"
                                        checked={form.base ? false : true}
                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? false : true })}
                                    />
                                </div>
                            </Form.Field>
                        </div>

                        <div className="col-md-9 mb-3">
                            <Form.Field>
                                <input type="number" 
                                    name="monto"
                                    value={form.monto || ""}
                                    onChange={(e) => handleInput(e.target)}
                                    placeholder="Ingresar monto"
                                    step="any"
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-3">
                            <Button color="blue" fluid
                                onClick={create}
                                disabled={current_loading || !form.type_remuneracion_id}
                                loading={current_loading}
                            >
                                <i className="fas fa-save"></i>
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        </Modal>
    )
}


export default CreateConfigRemuneracion;