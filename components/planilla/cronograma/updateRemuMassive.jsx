import React, { useContext, useState } from 'react';
import Modal from '../../modal';
import { Icon, Form, Button, Checkbox } from 'semantic-ui-react';
import { microPlanilla, handleErrorRequest } from '../../../services/apis';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import { SelectTypeRemuneration, SelectCronogramaToPims, SelectTypeCategory } from "../../select/micro-planilla";
import { AppContext } from '../../../contexts/AppContext';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';

const UpdateRemunerationMassive = (props) => {

    // app
    const app_context = useContext(AppContext);

    // cronograma
    const { cronograma, setRefresh } = useContext(CronogramaContext);

    // estados
    const [form, setForm] = useState({});

    // cambiar el form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }
    
    // actualizar
    const update = async () => {
        let answer = await Confirm("warning", "¿Estas seguró en actualizar el descuento masivamente?", "Confirmar")
        if (!answer) return;
        app_context.setCurrentLoading(true);
        const payload = {
            typeRemunerationIds: [parseInt(form.typeRemunerationId)],
            amount: parseFloat(form.amount || 0),
            isSync: form.isSync == true
        };
        // filters
        if (form.pimId) payload.pimIds = [parseInt(form.pimId)];
        if (form.typeCategoryId) payload.typeCategoryIds = [parseInt(form.typeCategoryId)]
        // send request
        await microPlanilla.put(`cronogramas/${cronograma.id}/process/remunerations`, payload, { headers: { CronogramaID: cronograma.id } })
        .then(async res => {
            app_context.setCurrentLoading(false);
            await Swal.fire({ icon: 'success', text: "Los datos se guardarón correctamante!" });
            setForm({});
            setRefresh(true);
        }).catch(err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
    }

    // render
    return (
        <Modal show={true} {...props}
            titulo={<span><Icon name="cart arrow down"/> Remuneración Masiva</span>}
        >
            <div className="card-body">
                <Form>
                    <div className="row">
                        <div className="col-md-12 mb-1">
                            <Form.Field>
                                <SelectTypeRemuneration
                                    name="typeRemunerationId"
                                    value={form.typeRemunerationId}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-12">
                            <div className="row">

                                <div className="col-md-12 mt-2">
                                    <hr/>
                                    <i className="fas fa-filter"></i> Filtros
                                    <hr/>
                                </div>
                                
                                <div className="col-md-12 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">PIM</label>
                                        <SelectCronogramaToPims
                                            name="pimId"
                                            cronogramaId={cronograma.id}
                                            value={form.pimId}
                                            onChange={(e, obj) => handleInput(obj)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Tip Categoría</label>
                                        <SelectTypeCategory
                                            name="typeCategoryId"
                                            value={form.typeCategoryId}
                                            onChange={(e, obj) => handleInput(obj)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Sincronizar</label>
                                        <div>
                                            <Checkbox toggle
                                                name="isSync"
                                                value={form.isSync ? true : false}
                                                onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                            />
                                        </div>
                                    </Form.Field>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-12 mb-1">
                            <hr/>
                        </div>

                        <div className="col-md-12 mb-5 text-center">
                            <b><u>IMPORTANTE.</u></b> <br/>
                            Al actualizar una remuneración masivamente, <br/> se desactivará el calculo automático de la remuneración!!!
                        </div>

                        <div className="col-md-9 mb-1">
                            <Form.Field>
                                <input type="number" step="any"
                                    placeholder="Ingrese un monto. Ejem. 0.00"
                                    name="amount"
                                    value={form.amount || 0}
                                    disabled={!form.typeRemunerationId}
                                    onChange={({ target }) => handleInput({
                                        name: target.name,
                                        value: parseFloat(target.value || 0)
                                    })}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-1">
                            <Button fluid color="blue"
                                onClick={update}
                                disabled={!form.typeRemunerationId}
                            >
                                <i className="fas fa-sync"></i>
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        </Modal>
    )
}

export default UpdateRemunerationMassive;

