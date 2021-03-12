import React, { useContext, useState } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import Modal from '../modal'
import { SelectRol } from '../select/project_tracking'
import Show from '../show';
import AssignPerson from '../authentication/user/assignPerson'
import storage from '../../services/storage.json';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';

const AddTeam = (props) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);

    // estados
    const [option, setOption] = useState({});
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [person, setPerson] = useState({});
    const isPerson = Object.keys(person).length;

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        setErrors(newErrors);
    }

    // agregar persona
    const addPerson = (obj) => {
        setPerson(obj);
        setOption("");
    }

    // crear equipo
    const createTeam = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en guardar los datos?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = Object.assign({}, form);
            datos.person_id = person.id;
            datos.project_id = project.id;
            await projectTracking.post(`team`, datos)
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    await Swal.fire({ icon: 'success', text: message });
                    setPerson({});
                    setForm({});
                    if (typeof props.onCreate == 'function') props.onCreate();
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { errors, message } = err.response.data;
                        Swal.fire({ icon: 'warning', text: message });
                        setErrors(errors);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: err.message });
                    }
                });
        }
    }

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-plus"></i> Agregar Integrante al equipo de trabajo</span>}
            {...props}
        >  
            <Form className="card-body">
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <Button onClick={(e) => setOption("assign")}>
                            <i className={`fas fa-${isPerson ? 'sync' : 'plus'}`}></i> {isPerson ? 'Cambiar' : 'Asignar'}
                        </Button>
                        <hr/>
                    </div>

                    <Show condicion={isPerson}>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="">Tip. Documento</label>
                            <input type="text" value={person.document_type} readOnly/>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Field>
                                <label htmlFor="">N° Documento</label>
                                <input type="text" value={person.document_number} readOnly/>
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Field>
                                <label htmlFor="">Apellidos y Nombres</label>
                                <input type="text" className="uppercase" value={person.fullname} readOnly/>
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Field>
                                <label htmlFor="">Profesión</label>
                                <input type="text" className="uppercase" value={person.profession} readOnly/>
                            </Form.Field>
                        </div>
                    </Show>

                    <div className="col-md-12 mb-3">
                        <Form.Field error={errors.role_id && errors.role_id[0] || ""}>
                            <label htmlFor="">Rol del integrante</label>
                            <SelectRol
                                name="role_id"
                                value={form.role_id}
                                onChange={(e, obj) => handleInput(obj)}
                            />
                            <label htmlFor="">{errors.role_id && errors.role_id[0] || ""}</label>
                        </Form.Field>
                    </div>

                    <div className="col-md-12 text-right">
                        <hr/>
                        <Button color="teal" 
                            disabled={!isPerson}
                            onClick={createTeam}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </div>
            </Form>

            <Show condicion={option == 'assign'}>
                <AssignPerson
                    local={true}
                    isClose={(e) => setOption(false)}
                    getAdd={addPerson}
                />
            </Show>
        </Modal>
    )
}

export default AddTeam;