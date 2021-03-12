import React, { useContext, useState } from 'react';
import Modal from '../modal';
import { Icon, Form, Button, Checkbox } from 'semantic-ui-react';
import { unujobs, handleErrorRequest } from '../../services/apis';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import { SelectCronogramaTypeDescuento, SelectCronogramaMeta, SelectCronogramaCargo, SelectCronogramaTypeCategoria } from '../select/cronograma';
import { AppContext } from '../../contexts/AppContext';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';

const UpdateDesctMassive = (props) => {

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
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = Object.assign({}, form);
            datos._method = 'PUT';
            await unujobs.post(`cronograma/${cronograma.id}/update_descuento`, datos, { headers: { CronogramaID: cronograma.id } })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setForm({});
                setRefresh(true);
            }).catch(err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
        }
    }

    // render
    return (
        <Modal show={true} {...props}
            titulo={<span><Icon name="cart arrow down"/> Descuento Masivo</span>}
        >
            <div className="card-body">
                <Form>
                    <div className="row">
                        <div className="col-md-12 mb-1">
                            <Form.Field>
                                <SelectCronogramaTypeDescuento
                                    name="type_descuento_id"
                                    cronograma_id={cronograma.id}
                                    value={form.type_descuento_id}
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
                                
                                <div className="col-md-6 mb-2">
                                    <Form.Field>
                                        <label htmlFor="">Meta Presp.</label>
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
                                        <label htmlFor="">Partición Presupuestal</label>
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
                                        <label htmlFor="">Tip Categoría</label>
                                        <SelectCronogramaTypeCategoria
                                            name="type_categoria_id"
                                            cronograma_id={cronograma.id}
                                            value={form.type_categoria_id}
                                            onChange={(e, obj) => handleInput(obj)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-2">
                                    <Form.Field>
                                        <label htmlFor="">Sincronizar</label>
                                        <div>
                                            <Checkbox toggle
                                                name="sync"
                                                value={form.sync ? true : false}
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
                            Al actualizar un descuento masivamente, <br/> se desactivará el calculo automático del descuento!!!
                        </div>

                        <div className="col-md-9 mb-1">
                            <Form.Field>
                                <input type="number" step="any"
                                    placeholder="Ingrese un monto. Ejem. 0.00"
                                    name="monto"
                                    value={form.monto || ""}
                                    onChange={(e) => handleInput(e.target)}
                                    disabled={!form.type_descuento_id}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-1">
                            <Button fluid color="blue"
                                onClick={update}
                                disabled={!form.type_descuento_id}
                            >
                                <i className="fas fa-save"></i> Guardar
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        </Modal>
    )
}

export default UpdateDesctMassive;

