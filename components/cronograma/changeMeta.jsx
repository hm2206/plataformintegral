import React,  { useContext, useState } from 'react'
import { Button, Form } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Modal from '../modal';
import { SelectCronogramaMeta, SelectCronogramaCargo, SelectMeta } from '../select/cronograma';
import { AppContext } from '../../contexts/AppContext';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

const ChangeMeta = ({ cronograma, isClose }) => {

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
    const changeMeta = async () => {
        let answer = await Confirm("warning", `¿Deseas cambiar de meta?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/change_meta`, form, { headers: { CronogramaID: cronograma.id }})
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    setForm({});
                    setReload(true);
                    await Swal.fire({ icon: 'success', text: message });
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
                titulo={<span><i className="fas fa-exchange-alt"></i> Cambiar Metas Pres. Masivamente</span>}
                md="7"
                isClose={isClose}
            >
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Field>
                                <label htmlFor="">Meta Actual</label>
                                <SelectCronogramaMeta
                                    cronograma_id={reload ? "" : cronograma.id}
                                    name="meta_id"
                                    value={form.meta_id}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Field>
                                <label htmlFor="">Partición Pre.</label>
                                <SelectCronogramaCargo
                                    cronograma_id={cronograma.id}
                                    name="cargo_id"
                                    value={form.cargo_id}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-12 mb-5">
                            <Form.Field>
                                <label htmlFor="">Meta a Cambiar</label>
                                <SelectMeta
                                    year={cronograma.year}
                                    name="change_meta_id"
                                    value={form.change_meta_id}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-12 mb-5 text-right">
                            <hr/>
                            <Button 
                                color="teal"
                                disabled={!form.meta_id || !form.change_meta_id}
                                onClick={changeMeta}
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