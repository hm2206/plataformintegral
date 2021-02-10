import React, { useState } from 'react';
import Modal from '../modal';
import { Form, Button } from 'semantic-ui-react';
import { SelectPlanilla, SelectCargo, SelectCargoTypeCategoria, SelectMeta, SelectTypeRemuneracion } from '../select/cronograma'; 
import { Confirm } from '../../services/utils';  
import { unujobs } from '../../services/apis';
import Swal from 'sweetalert2';

const UpdateRemuneracionMassive = ({ isClose = null }) => {

    // estado
    const [form, setForm] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // actualizar
    const update = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en actualizar los datos?', 'Estoy seguro');
        if (answer) {
            setCurrentLoading(true);
            let datos = Object.assign({}, form);
            datos._method = 'PUT';
            unujobs.post(`type_remuneracion/${form.type_remuneracion_id}/massive`, datos)
            .then(res => {
                let { message } = res.data;
                Swal.fire({ icon: 'success', text: message });
            }).catch(err => {
                try {
                    let { data } = err.response;
                    if (typeof data != 'object') throw new Error(err.message);
                    if (typeof data.errors != 'object') throw new Error(data.message);
                    Swal.fire({ icon: 'warning', text: data.message });
                } catch (error) {
                    Swal.fire({ icon: 'error', text: error.message });
                }
            });
            setCurrentLoading(false);
        }
    }

    // render
    return (
        <Modal show={true}
            isClose={isClose}
            disabled={current_loading}
            titulo={<span><i className="fas fa-coins"></i> Actualización de remuneración masiva</span>}
        >
            <Form className="card-body">
                <div className="mb-3">
                    <label htmlFor="">Tipo de remuneración <b className="text-red">*</b></label>
                    <SelectTypeRemuneracion
                        name="type_remuneracion_id"
                        value={form.type_remuneracion_id}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Planilla</label>
                    <SelectPlanilla
                        name="planilla_id"
                        value={form.planilla_id}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Partición Presupuestal</label>
                    <SelectCargo
                        name="cargo_id"
                        value={form.cargo_id}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Tipo de Categoría</label>
                    <SelectCargoTypeCategoria
                        cargo_id={form.cargo_id}
                        execute={false}
                        refresh={form.cargo_id}
                        name="type_categoria_id"
                        value={form.type_categoria_id}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Meta</label>
                    <SelectMeta
                        name="meta_id"
                        value={form.meta_id}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Monto</label>
                    <input type="number"
                        name="monto"
                        value={form.monto || ""}
                        step="any"
                        onChange={({ target }) => handleInput(target)}
                    />
                </div>

                <div className="mb-3">
                    <hr/>
                </div>

                <div className="text-right">
                    <Button color="teal"
                        disabled={!form.type_remuneracion_id || current_loading}
                        onClick={update}
                        loading={current_loading}
                    >
                        <i className="fas fa-sync"></i> Actualizar
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}

export default UpdateRemuneracionMassive;