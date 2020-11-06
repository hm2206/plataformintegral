import React, { useEffect, useContext, useState } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import { AppContext } from '../../../contexts/AppContext';
import { backUrl, Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Button, Form } from 'semantic-ui-react';
import { SelectProject } from '../../../components/select/project_tracking'
import Show from '../../../components/show';
import Swal from 'sweetalert2';

const CreatePlanTrabajo = () => {

    // app
    const app_context = useContext(AppContext);

    // datos
    const [form, setForm] = useState({});

    // primera carga
    useEffect(() => {
        app_context.fireEntity({ render: true });
    }, []);

    // change form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // guardar proyect
    const savePlanTrabajo = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar el proyecto?`);
        if (answer) {
            app_context.fireLoading(true);
            let newForm = Object.assign({}, form);
            await projectTracking.post('plan_trabajo', newForm)
                .then(res => {
                    app_context.fireLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                }).catch(err => {
                    app_context.fireLoading(false);
                    let { message, errors } = err.response.data;
                    Swal.fire({ icon: 'warning', text: message });
                }).catch(err => {
                    Swal.fire({ icon: 'error', text: err.message });
                });
        }
    }

    // render
    return (
        <div className="col-md-12">
            <Body>
                <div className="card-">
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(Router.pathname))}/> Crear nuevo plan de trabajo
                    </div>
                    <div className="card-body">
                        <div className="row justify-content-center">
                            <div className="col-md-9">
                                <Form>
                                    <div className="row">
                                        <div className="col-md-6 mb-4">
                                            <Form.Field>
                                                <label>Proyecto</label>
                                                <SelectProject
                                                    value={form.project_id || ""}
                                                    name="project_id"
                                                    onChange={(e, obj) => handleInput(obj)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-6 mb-4">
                                            <Form.Field>
                                                <label>Duración</label>
                                                <input type="number"
                                                    value={form.duration || ""}
                                                    name="duration"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-12">
                                            <hr/>

                                            <div className="text-right">
                                                <Button color="teal" onClick={savePlanTrabajo}>
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
            </Body>
        </div>
    )
}

// rendering server
CreatePlanTrabajo.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    // response
    return {};
}

export default CreatePlanTrabajo;