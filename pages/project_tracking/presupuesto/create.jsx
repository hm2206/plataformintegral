import React, { useEffect, useContext, useState } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import { AppContext } from '../../../contexts/AppContext';
import { backUrl, Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Button, Form, Checkbox } from 'semantic-ui-react';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import { SelectPresupuesto } from '../../../components/select/project_tracking';
import { EntityContext } from '../../../contexts/EntityContext';
import BoardSimple from '../../../components/boardSimple';

const CreatePresupuesto = () => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // datos
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});

    // primera carga
    useEffect(() => {
        entity_context.fireEntity({ render: false });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // validar presupuesto_id
    useEffect(() => {
        handleInput({ name: 'presupuesto_id', value: "" });
    }, [form.year]);

    // change form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // guardar proyect
    const savePresupuesto = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar el presupuesto?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            let newForm = Object.assign({}, form);
            await projectTracking.post('presupuesto', newForm)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { message, errors } = err.response.data;
                        console.log(err.response.data);
                        if (typeof errors != 'object') throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                        setErrors(errors);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                })
        }
    }

    // render
    return (
        <div className="col-md-12">
            <BoardSimple
                title="Presupuesto"
                info={["Crear Presupuesto"]}
                options={[]}
                prefix={<BtnBack/>}
                bg="light"
            >
                <div className="mt-4">
                    <div className="card-body">
                        <div className="row justify-content-center">
                            <div className="col-md-9">
                                <Form>
                                    <div className="row">
                                        <div className="col-md-6 mb-4">
                                            <Form.Field error={errors.name && errors.name[0] || ""}>
                                                <label>Nombre</label>
                                                <input type="text"
                                                    value={form.name || ""}
                                                    placeholder="ingrese el nombre del presupuesto"
                                                    name="name"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                <label>{errors.name && errors.name[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-4">
                                            <Form.Field error={errors.ext_pptto && errors.ext_pptto[0] || ""}>
                                                <label>Ext. Presupuestal</label>
                                                <input type="text"
                                                    value={form.ext_pptto || ""}
                                                    placeholder="Ingrese la extensión presupuestal"
                                                    name="ext_pptto"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                <label htmlFor="">{errors.ext_pptto && errors.ext_pptto[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-4">
                                            <Form.Field error={errors.principal && errors.principal[0] || ""}>
                                                <label>Principal</label>
                                                <Checkbox
                                                    toggle
                                                    name="principal"
                                                    checked={form.principal ? true : false}
                                                    onClick={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                />
                                                <label htmlFor="">{errors.principal && errors.principal[0] || ""}</label>
                                            </Form.Field>
                                        </div>

                                        <Show condicion={!form.principal}>
                                            <div className="col-md-6 mb-4">
                                                <Form.Field error={errors.presupuesto_id && errors.presupuesto_id[0] || ""}>
                                                    <label>Presupuesto Principal</label>
                                                    <SelectPresupuesto
                                                        name="presupuesto_id"
                                                        value={form.presupuesto_id}
                                                        onChange={(e, obj) => handleInput(obj)}
                                                        principal={1}
                                                    />
                                                    <label htmlFor="">{errors.presupuesto_id && errors.presupuesto_id[0] || ""}</label>
                                                </Form.Field>
                                            </div>
                                        </Show>

                                        <div className="col-md-12">
                                            <hr/>

                                            <div className="text-right">
                                                <Button color="teal" onClick={savePresupuesto}>
                                                    <i className="fas fa-save"></i> Guardar
                                                </Button>
                                            </div>
                                        </div>                                        
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </BoardSimple>
        </div>
    )
}

// rendering server
CreatePresupuesto.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    // response
    return {};
}

export default CreatePresupuesto;