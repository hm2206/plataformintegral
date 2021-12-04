import React,  { useContext, useState } from 'react'
import { Button, Form } from 'semantic-ui-react';
import { microPlanilla } from '../../services/apis';
import Modal from '../modal';
import { SelectCronogramaMeta, SelectCronogramaCargo, SelectCargo } from '../select/cronograma';
import { AppContext } from '../../contexts/AppContext';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

const ChangeCargo = ({ cronograma, isClose }) => {

    // app
    const app_context = useContext(AppContext);

    // formulario
    const [form, setForm] = useState({});
    const [reload, setReload] = useState("");

    // cambiar form
    const handleInput = ({ name, value }) =>  {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm)
    }

    // cambiar de meta
    const changeCargo = async () => {
        let answer = await Confirm("warning", `¿Deseas cambiar de cargo?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            await microPlanilla.post(`cronogramas/${cronograma.id}/changeCargo`, form)
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    setForm({});
                    setReload(true);
                    await Swal.fire({ icon: 'success', text: 'Los cambios se guardarón correctamente' });
                    setReload(false);
                })
                .catch(err => {
                    app_context.setCurrentLoading(false);
                    Swal.fire({ icon: 'error', text: err.message });
                });
        }
    } 

    // render
    return (
            <Modal
                show={true}
                titulo={<span><i className="fas fa-exchange-alt"></i> Cambiar Partición Presp. Masivamente</span>}
                md="7"
                isClose={isClose}
            >
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Field>
                                <label htmlFor="">Partición Pre.</label>
                                <SelectCronogramaCargo
                                    cronograma_id={cronograma.id}
                                    name="cargoId"
                                    value={form.cargoId}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Field>
                                <label htmlFor="">Meta Presp.</label>
                                <SelectCronogramaMeta
                                    cronograma_id={reload ? "" : cronograma.id}
                                    name="metaId"
                                    value={form.metaId}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-12 mb-5">
                            <Form.Field>
                                <label htmlFor="">Partición Presp. a Cambiar</label>
                                <SelectCargo
                                    name="targetCargoId"
                                    value={form.targetCargoId}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-12 mb-5 text-right">
                            <hr/>
                            <Button 
                                color="teal"
                                disabled={!form?.targetCargoId}
                                onClick={changeCargo}
                            >
                                <i className="fas fa-exchange-alt"></i> Cabiar Meta
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
    );
}

export default ChangeCargo;