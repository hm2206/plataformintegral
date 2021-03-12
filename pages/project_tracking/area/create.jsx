import React, { useEffect, useContext, useState } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import { AppContext } from '../../../contexts/AppContext';
import { backUrl, Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Button, Form } from 'semantic-ui-react';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import { EntityContext } from '../../../contexts/EntityContext';

const CreateArea = () => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // datos
    const [form, setForm] = useState({});

    // primera carga
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // change form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // guardar area
    const saveArea = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar la línea de investigación?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            let newForm = Object.assign({}, form);
            await projectTracking.post('area', newForm)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                }).catch(err => {
                    app_context.setCurrentLoading(false);
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
                        <BtnBack onClick={(e) => Router.push(backUrl(Router.pathname))}/> Crear Línea de Investigación
                    </div>
                    <div className="card-body">
                        <div className="row justify-content-center">
                            <div className="col-md-9">
                                <Form>
                                    <div className="row">
                                        <div className="col-md-12 mb-4">
                                            <Form.Field>
                                                <label>Descripción</label>
                                                <input type="text"
                                                    placeholder="ingrese una descripción"
                                                    value={form.description || ""}
                                                    name="description"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-12">
                                            <hr/>

                                            <div className="text-right">
                                                <Button color="teal" onClick={saveArea}>
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
CreateArea.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    // response
    return {};
}

export default CreateArea;