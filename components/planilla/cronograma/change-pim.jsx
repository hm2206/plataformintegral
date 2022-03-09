import React,  { useContext, useState } from 'react'
import { Button, Form } from 'semantic-ui-react';
import { microPlanilla } from '../../../services/apis';
import Modal from '../../modal';
import { SelectPim, SelectCronogramaToPims } from "../../select/micro-planilla";
import { AppContext } from '../../../contexts/AppContext';
import { CronogramaContext } from "../../../contexts/cronograma/CronogramaContext";
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';

const ChangeMeta = ({ cronograma, isClose }) => {

    // app
    const app_context = useContext(AppContext);
    const { setRefresh } = useContext(CronogramaContext);

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
    const changePim = async () => {
        let answer = await Confirm("warning", `¿Deseas cambiar de meta?`);
        if (!answer) return;
        const payload = {
            pimIds: [parseInt(`${form.pimId}`)],
            nextPimId: parseInt(`${form.nextPimId}`)
        }
        // send
        app_context.setCurrentLoading(true);
        await microPlanilla.put(`cronogramas/${cronograma.id}/process/pims`, payload, { headers: { CronogramaID: cronograma.id }})
        .then(async () => {
            app_context.setCurrentLoading(false);
            setForm({});
            setReload(true);
            await Swal.fire({ icon: 'success', text: "Los cambios se guardarón correctamente!" });
            setReload(false);
            setRefresh(true);
        })
        .catch(() => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: "No se pudo guardar los cambios correctamente!" });
        }); 
    } 

    // render
    return (
            <Modal
                show={true}
                titulo={<span><i className="fas fa-exchange-alt"></i> Cambiar PIM Masivamente</span>}
                md="7"
                isClose={isClose}
            >
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-12 mb-3">
                            <Form.Field>
                                <label htmlFor="">PIM Actual</label>
                                <SelectCronogramaToPims
                                    cronogramaId={reload ? "" : cronograma.id}
                                    name="pimId"
                                    value={form.pimId}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-12 mb-5">
                            <Form.Field>
                                <label htmlFor="">PIM a Cambiar</label>
                                <SelectPim
                                    year={cronograma.year}
                                    name="nextPimId"
                                    value={form.nextPimId}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-12 mb-5 text-right">
                            <hr/>
                            <Button 
                                color="teal"
                                disabled={!form.nextPimId || !form.pimId}
                                onClick={changePim}
                            >
                                <i className="fas fa-exchange-alt"></i> Cabiar Meta
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
    );
}

export default ChangeMeta;