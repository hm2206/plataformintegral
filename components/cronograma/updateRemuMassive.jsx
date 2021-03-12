import React, { useState, useContext } from 'react';
import Modal from '../modal';
import { Icon, Select, Form, Button } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Router from 'next/router';
import { parseOptions, Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import { SelectCronogramaTypeRemuneracion, SelectCronogramaMeta, SelectCronogramaCargo, SelectCronogramaTypeCategoria } from '../select/cronograma';
import { AppContext } from '../../contexts/AppContext';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';


const UpdateRemuMassive = (props) => {

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

    // actualizar remuneraciones
    const update = async () => {
        let answer = await Confirm("warning", "¿Estas seguró en actualizar la remuneración masivamente?", "Confirmar")
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = Object.assign({}, form);
            datos._method = 'PUT';
            await unujobs.post(`cronograma/${cronograma.id}/update_remuneracion`, datos, { headers: { CronogramaID: cronograma.id } })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setRefresh(true);
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
        }
    }

    // render
    return (
        <Modal show={true} {...props}
                titulo={<span><Icon name="cart arrow up"/> Remuneración Masiva</span>}
            >
                <div className="card-body">
                    <Form>
                        <div className="row">
                            <div className="col-md-12 mb-1">
                                <Form.Field>
                                    <SelectCronogramaTypeRemuneracion
                                        name="type_remuneracion_id"
                                        value={form.type_remuneracion_id}
                                        onChange={(e, obj) => handleInput(obj)}
                                        cronograma_id={cronograma.id}
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
                                    
                                    <div className="col-md-6 mb-2">
                                        <Form.Field>
                                            <SelectCronogramaMeta
                                                name="meta_id"
                                                cronograma_id={cronograma.id}
                                                value={form.meta_id}
                                                onChange={(e, obj) => handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <Form.Field>
                                            <SelectCronogramaCargo
                                                name="cargo_id"
                                                cronograma_id={cronograma.id}
                                                value={form.cargo_id}
                                                onChange={(e, obj) => handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <Form.Field>
                                            <SelectCronogramaTypeCategoria
                                                name="type_categoria_id"
                                                cronograma_id={cronograma.id}
                                                value={form.type_categoria_id}
                                                onChange={(e, obj) => handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12 mb-1">
                                <hr/>
                            </div>

                            <div className="col-md-9 mb-1 mt-5">
                                <Form.Field>
                                    <input type="number" step="any"
                                        placeholder="Ingrese un monto. Ejem. 0.00"
                                        name="monto"
                                        value={form.monto || ""}
                                        onChange={(e) => handleInput(e.target)}
                                        disabled={!form.type_remuneracion_id}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-3 mb-1 mt-5">
                                <Button fluid color="blue"
                                    onClick={update}
                                    disabled={!form.type_remuneracion_id}
                                >
                                    <i className="fas fa-save"></i> Guardar
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
    </Modal>
    );
}

export default UpdateRemuMassive;
