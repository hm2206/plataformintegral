import React, { useContext, useState } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import Modal from '../modal'
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import Swal from 'sweetalert2';
import { DropZone } from '../Utils';
import { Confirm } from '../../services/utils';
import { projectTracking } from '../../services/apis';

const CierreProject = ({ isClose, afterSave }) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);

    // estados
    const [form, setForm] = useState({});

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // cerrar proyecto
    const handleCierre = async (e) => {
        e.preventDefault();
        let answer = await Confirm("warning", `¿Estas seguro en cerrar el proyecto?`, 'Cerrar');
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = new FormData();
            for (let attr in form) {
                datos.append(attr, form[attr]);
            }
            // request
            await projectTracking.post(`project/${project.id}/cierre`, datos)
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    if (typeof afterSave == 'function') afterSave();
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { message, errors } = err.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message || err.message });
                    }
                })
        }
    }

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-file-alt"></i> Informe de Cierre</span>}
            isClose={isClose}
        >  
            <Form className="card-body">
                <div className="row mt-4">
                    <Form.Field className="col-md-12 mb-3">
                        <label htmlFor="">Resolución de Cierre</label>
                        <input type="text"
                            name="cierre_resolucion"
                            value={form.cierre_resolucion || ""}
                            onChange={({ target }) => handleInput(target)}
                        />
                    </Form.Field>

                    <Form.Field className="col-md-12 mb-3">
                        <label htmlFor="">Motivo del Cierre</label>
                        <Select
                            options={[
                                { key: "CULMINACION", value: "Culminación del Proyecto", text: "Culminación del Proyecto" },
                                { key: "FUERZA", value: "Fuerza Mayor", text: "Fuerza Mayor" },
                                { key: "MALA", value: "Mala Gestión", text: "Mala Gestión" },
                            ]}
                            placeholder="Seleccionar motivo"
                            name="cierre_motivo"
                            value={form.cierre_motivo || ""}
                            onChange={(e, obj) => handleInput(obj)}
                        />
                    </Form.Field>

                    <Form.Field className="col-md-12 mb-3">
                        <label htmlFor="">Archivo de cierre</label>
                        <Show condicion={form.cierre_file}
                            predeterminado={
                                <DropZone
                                    id="file-cierre"
                                    name="cierre_file"
                                    multiple={false}
                                    title="Subir archivo de cierre"
                                    onChange={(obj) => handleInput({ ...obj, value: obj.files[0] })}
                                />
                            }
                        >
                            <div className="card card-body">
                                <div className="row">
                                    <div className="col-md-10">
                                        {form.cierre_file && form.cierre_file.name}
                                    </div>
                                    <div className="col-md-2 text-right">
                                        <button className="btn btn-sm btn-red"
                                            onClick={(e) => handleInput({ name: 'cierre_file', value: null })}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Show>
                    </Form.Field>

                    <div className="col-md-12 text-right">
                        <hr/>
                        <Button
                            color="teal"
                            onClick={handleCierre}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    )
}

export default CierreProject;