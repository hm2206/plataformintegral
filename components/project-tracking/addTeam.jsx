import React, { useContext, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import Modal from '../modal'
import { SelectRol } from '../select/project_tracking'
import Show from '../show';
import AssignUser from '../authentication/user/assignUser';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';
import { SelectEntityDependenciaUser } from '../../components/select/authentication';
import { EntityContext } from '../../contexts/EntityContext';

const AddTeam = ({ isClose = null, onSave = null }) => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // project
    const { project, dispatch } = useContext(ProjectContext);

    // estados
    const [option, setOption] = useState({});
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [user, setUser] = useState({});
    const isUser = Object.keys(user).length;

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        setErrors(newErrors);
    }

    // agregar persona
    const addUser = (obj) => {
        setUser(obj);
        setOption("");
    }

    // crear equipo
    const createTeam = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en guardar los datos?`);
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        let datos = Object.assign({}, form);
        datos.user_id = user.id;
        datos.project_id = project.id;
        await projectTracking.post(`team`, datos)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message, team } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setUser({});
            setForm({});
            let newProject = Object.assign({}, project);
            let newPrincipal = Object.assign({}, team);
            newPrincipal.person = team?.user?.person;
            delete newPrincipal.user
            newProject.principal = newPrincipal;
            dispatch({ type: projectTypes.SET_PROJECT, payload: newProject });
            dispatch({ type: projectTypes.ADD_TEAM, payload: team });
            if (typeof onSave == 'function') onSave();
        }).catch(err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
    }

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-plus"></i> Agregar Integrante al equipo de trabajo</span>}
            isClose={isClose}
        >  
            <Form className="card-body">
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <Button onClick={(e) => setOption("assign")}>
                            <i className={`fas fa-${isUser ? 'sync' : 'plus'}`}></i> {isUser ? 'Cambiar' : 'Asignar'}
                        </Button>
                        <hr/>
                    </div>

                    <Show condicion={isUser}>
                        <div className="col-md-6 mb-3">
                            <Form.Field>
                                <label htmlFor="">Apellidos y Nombres</label>
                                <input type="text" className="uppercase" value={user?.person?.fullname} readOnly/>
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Field>
                                <label htmlFor="">N° Documento</label>
                                <input type="text" value={user?.person?.document_number} readOnly/>
                            </Form.Field>
                        </div>

                        <div className="col-12 mb-3">
                            <Form.Field>
                                <label htmlFor="">Dependencia</label>
                                <SelectEntityDependenciaUser
                                    name="dependencia_id"
                                    value={form.dependencia_id}
                                    entity_id={entity_context.entity_id}
                                    user_id={user.id}
                                    refresh={user.id}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
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
                            disabled={!isUser}
                            onClick={createTeam}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </div>
            </Form>

            <Show condicion={option == 'assign'}>
                <AssignUser
                    local={true}
                    isClose={(e) => setOption(false)}
                    getAdd={addUser}
                />
            </Show>
        </Modal>
    )
}

export default AddTeam;