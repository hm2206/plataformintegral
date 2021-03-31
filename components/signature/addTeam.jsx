import React, { Fragment, useContext, useEffect, useState } from 'react';
import { handleErrorRequest, signature } from '../../services/apis';
import { Confirm } from '../../services/utils';
import { GroupContext } from '../../contexts/SignatureContext';
import Modal from '../modal';
import { Form, Button } from 'semantic-ui-react';
import { getPositions } from 'node-signature/client';
import Show from '../show'
import ListPfx from '../listPfx'
import ModalRightUser from '../authentication/modalRightUser';
import { AppContext } from '../../contexts';
import Swal from 'sweetalert2';
import AuthGroupProvider from '../../providers/signature/auth/AuthGroupProvider';

// providers
const authGroupProvider = new AuthGroupProvider();

const actions = {
    ADD: 'add',
    CREATE: 'create',
}

const AddTeam = ({ show, onClose, checked = [] }) => {

    // app
    const app_context = useContext(AppContext);

    // group
    const group_context = useContext(GroupContext);
    let { group } = group_context;

    // estados
    const [current_user, setCurrentUser] = useState({});
    const [option, setOption] = useState("");
    const [positions, setPositions] = useState([]);
    const [column_limit, setColumnLimit] = useState(0);
    const [current_position, setCurrentPosition] = useState(undefined);
    const [current_page, setCurrentPage] = useState(1);
    const [current_pfx, setCurrentPfx] = useState(undefined);
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);

    // agregemos al equipo
    const store = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en agregar al equipo?`, 'Estoy seguro');
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        // config
        let options = {
            headers: { 
                EntityId: group_context.group.entity_id,
                DependenciaId: group_context.group.dependencia_id,
                GroupId: group_context.group.id
            }
        };
        // payload
        let payload = {
            group_id: group_context.group.id,
            certificate_id: current_pfx.id,
            page: current_page,
            position: current_position
        };
        // enviar datos
        await signature.post(`auth/team`, payload, options)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setOption("");
            setCurrentPfx(undefined);
        }).catch(err => handleErrorRequest(err, setErrors, app_context.setCurrentLoading(false)));
    }

    // obtener posiciones
    const getPositions = async () => {
        setCurrentLoading(true);
        let options = {
            headers: {
                DependenciaId: group.dependencia_id,
                GroupId: group.id
            }
        };
        // request
        await authGroupProvider.positions(group.id, options)
            .then(res => {
                setPositions(res.positions || []);
                setColumnLimit(res.column);
            }).catch(err => setPositions([]));
        setCurrentLoading(false);
    }

    // generar posiciones
    useEffect(() => {
        if (current_user) getPositions();
    }, [current_user.id]);

    // render
    return (
        <Fragment>
            <ModalRightUser
                show={show}
                title="Agregar Equipo"
                onClose={onClose}
                onCheck={(e, user) => {
                    setCurrentUser(user);
                    setOption(actions.CREATE);
                }}
            >
                <hr/>
            </ModalRightUser>
            {/* modal para crear */}
            <Modal show={option == actions.CREATE}
                isClose={(e) => {
                    setOption("");
                    setCurrentPfx(undefined);
                }}
                titulo="Agregar al equipo"
            >
                <Form className="card-body">
                    <div className="form-group">
                        <label htmlFor="">Apellidos y Nombres</label>
                        <input type="text" 
                            readOnly 
                            value={current_user.person && current_user.person.fullname || ""}
                            className="capitalize"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="">Correo de invitación</label>
                        <input type="text" 
                            readOnly 
                            value={current_user.email}
                        />
                    </div>

                    <div className="form-group">
                        <hr/>
                        <label>Posición de firma</label>
                        <hr/>
                        <div className="row justify-content-around">
                            {positions.map((pos, indexPos) => 
                                <Fragment key={`list-point-position-${indexPos}`}>
                                    <div className={`col-xs mb-3 text-center`}>
                                        <input type="radio"
                                            className="cursor-pointer"
                                            value={pos.value}
                                            disabled={pos.checked ? true : false}
                                            checked={pos.value == current_position || pos.checked}
                                            onChange={({ target }) => setCurrentPosition(target.value)}
                                        />
                                    </div> 

                                    <Show condicion={column_limit == (pos.column + 1)}>
                                        <div className="col-md-12"></div>
                                    </Show>
                                </Fragment>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="">Página {current_page} de {group_context.group.pages}</label>
                        <input type="text"
                            min="1"
                            value={current_page || ""}
                            onChange={({ target }) => {
                                if (target.value > group_context.group.pages) return false;
                                setCurrentPage(target.value);
                            }}
                            max={group_context.group.pages}
                        />
                    </div>

                    <hr/>

                    <div className="form-group">
                        <ListPfx person_id={current_user.person_id}
                            onClick={(e, pfx) => setCurrentPfx(pfx)}
                        />
                    </div>
                
                    <div className="form-group text-right">
                        <Button color="teal" onClick={store}
                            disabled={!current_pfx}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </Form>
            </Modal>
        </Fragment>
    );
}

export default AddTeam;