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
import atob from 'atob';
import { EntityContext } from '../../../contexts/EntityContext';

const EditRole = ({ success, role }) => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // datos
    const [form, setForm] = useState(role);
    const [deshabilitar, setdeshabilitar] = useState(true)

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
        setdeshabilitar(false);
    }


    // guardar area
    const saveRole = async () => {
        // console.log('aea')
        let answer = await Confirm('warning', `¿Estas seguro en guardar el Rol?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            let newForm = Object.assign({}, form);
            await projectTracking.post('role/' + newForm.id, newForm)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    // setForm({});
                    setdeshabilitar(true)
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
                        <BtnBack onClick={(e) => Router.push(backUrl(Router.pathname))} /> Editar Medida
                    </div>
                    <div className="card-body">
                        <div className="row justify-content-center">
                            <div className="col-md-9">
                                <Form>
                                    <div className="row">

                                        <div className="col-md-4 mb-4">
                                            <Form.Field>
                                                <label>Slug</label>
                                                <input type="text"
                                                    placeholder="ingrese su Slug"
                                                    value={form.slug || ""}
                                                    name="slug"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                {/* {JSON.stringify(role)} */}
                                            </Form.Field>

                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <Form.Field>
                                                <label>Descripción</label>
                                                <input type="text"
                                                    placeholder="ingrese su Slug"
                                                    value={form.description || ""}
                                                    name="description"
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                                {/* {JSON.stringify(role)} */}
                                            </Form.Field>

                                        </div>

                                        <div className="col-md-2 mb-4 text-center">
                                            <Form.Field>
                                                <label>Principal</label>
                                                <Checkbox
                                                    toggle
                                                    name="principal"
                                                    checked={form.principal == 1 ? true : false}
                                                    onChange={(e, obj) => { handleInput({ name: obj.name, value: obj.checked ? 1 : 0 }) }}
                                                />
                                                {/* {JSON.stringify(area)} */}
                                            </Form.Field>
                                        </div>
                                        <div className="col-md-2 mb-4 text-center">
                                            <Form.Field>
                                                <label>Estado</label>
                                                <Checkbox
                                                    toggle
                                                    name="state"
                                                    checked={form.state == 1 ? true : false}
                                                    onChange={(e, obj) => { handleInput({ name: obj.name, value: obj.checked ? 1 : 0 }) }}
                                                />
                                                {/* {JSON.stringify(area)} */}
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-12">
                                            <hr />

                                            <div className="text-right">
                                                <Button color="teal"
                                                    onClick={saveRole}
                                                    disabled={deshabilitar}
                                                >
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
EditRole.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    let id = `${atob(query.id || "") || ""}`
    let { success, role } = await projectTracking.get(`role/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => {

            return { success: false, role: {} }
        })

    // response
    return { success, role, query, pathname };
}

export default EditRole;