import React, { useState } from 'react';
import Modal from '../modal';
import { Form, Button } from 'semantic-ui-react';
import { SelectPlanilla, SelectCargo, SelectCargoTypeCategoria, SelectMeta, SelectTypeRemuneracion } from '../select/cronograma'; 
import { Confirm } from '../../services/utils';  
import { microPlanilla } from '../../services/apis';
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
        let answer = await Confirm('warning', '¿Estas seguro en sincronizar los datos?', 'Estoy seguro');
        if (answer) {
            setCurrentLoading(true);
            let datos = Object.assign({}, form);
            microPlanilla.post(`typeRemuneracions/${form.typeRemuneracionId}/syncToInfos`, datos)
            .then(() => {
                Swal.fire({ icon: 'success', text: 'Los datos se sincronizarón correctamente!' });
            }).catch(err => {
                try {
                    let { data } = err.response;
                    if (typeof data != 'object') throw new Error(err.message);
                    if (typeof data.errors != 'object') throw new Error(data.message);
                    Swal.fire({ icon: 'warning', text: 'No se pudo sincronizar las remuneraciones' });
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
            titulo={<span><i className="fas fa-coins"></i> Sincronización de Remuneración masiva</span>}
        >
            <Form className="card-body">
                <div className="mb-3">
                    <label htmlFor="">Tipo de remuneración <b className="text-red">*</b></label>
                    <SelectTypeRemuneracion
                        name="typeRemuneracionId"
                        value={form.typeRemuneracionId}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Planilla</label>
                    <SelectPlanilla
                        name="planillaId"
                        value={form.planillaId}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Partición Presupuestal</label>
                    <SelectCargo
                        name="cargoId"
                        value={form.cargoId}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Tipo de Categoría</label>
                    <SelectCargoTypeCategoria
                        cargo_id={form.cargoId}
                        execute={false}
                        refresh={form.cargoId}
                        name="typeCategoriaId"
                        value={form.typeCategoriaId}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Meta</label>
                    <SelectMeta
                        year={new Date().getFullYear()}
                        name="metaId"
                        value={form.metaId}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>

                <div className="mb-3">
                    <hr/>
                </div>

                <div className="text-right">
                    <Button color="teal"
                        disabled={!form.typeRemuneracionId || current_loading}
                        onClick={update}
                        loading={current_loading}
                    >
                        <i className="fas fa-sync"></i> Sincronizar
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}

export default UpdateRemuneracionMassive;