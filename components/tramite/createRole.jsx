import React, { useState, useContext } from 'react';
import { useMemo } from 'react';
import { Form, Select, Button } from 'semantic-ui-react';
import AssignUser from '../authentication/user/assignUser';
import Show from '../show';
import { Confirm } from '../../services/utils';
import RoleProvider from '../../providers/tramite/RoleProvider';
import Swal from 'sweetalert2';
import { EntityContext } from '../../contexts/EntityContext';

// providers
const roleProvider = new RoleProvider();

const CreateRole = ({ dependencia_id, setIsCreate }) => {
    // entity
    const { entity_id } = useContext(EntityContext);

    // estados
    const [level, setLevel] = useState("")
    const [user, setUser] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [option, setOption] = useState("");
    const [errors, setErrors] = useState({});
    
    // memo
    const isUser = useMemo(() => {
        return Object.keys(user || {}).length;
    }, [user]);

    const isCreate = useMemo(() => {
        return level && isUser ? true : false;
    }, [level, isUser]);

    const handleAdd = (obj) => {
        setUser(obj);
        setOption("");
    }

    const handleCreate = async () => {
        let answer = await Confirm('warning', `¿Deseas continuar?`, 'Continuar');
        if (!answer) return false;
        setCurrentLoading(true);
        // options
        let options = {
            headers: { 
                EntityId: entity_id
            }
        }
        // body
        let payload = {
            user_id: user.id,
            level,
            dependencia_id
        };
        // request
        roleProvider.store(payload, options)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setUser({});
            setLevel("");
            setErrors({});
            setIsCreate(true);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
            setErrors(err.errors || {});
        });
        setCurrentLoading(false);
    }

    // render
    return (
        <div className="card">
            <div className="card-header">
                <i className="fas fa-plus"></i> Crear Role  
            </div>
            <Form className="card-body">
                <Button className="mb-3" onClick={(e) => setOption('CREATE')}>
                    <i className={`fas fa-${isUser ? 'sync' : 'plus'}`}></i>
                </Button>

                <Show condicion={isUser}>
                    <Form.Field className="mb-3">
                        <label>Usuario</label>
                        <input type="text" value={user?.username || ""} readOnly/>
                    </Form.Field>

                    <Form.Field className="mb-3">
                        <label>Persona</label>
                        <input type="text" className="capitalize" value={user?.person?.fullname || ""} readOnly/>
                    </Form.Field>
                </Show>

                <Form.Field className="mb-3">
                    <label>Nivel</label>
                    <Select
                        disabled={!isUser || current_loading}
                        name="level"
                        value={level || ''}
                        placeholder="Seleccionar Nivel"
                        onChange={(e, obj) => setLevel(obj.value)}
                        options={[
                            { key: "---", value: "", text: "Seleccionar Nivel" },
                            { key: "BOSS", value: "BOSS", text: "BOSS" },
                            { key: "SECRETARY", value: "SECRETARY", text: "SECRETARY" },
                        ]}
                    />
                </Form.Field>
            </Form>

            <div className="card-footer">
                <div className="card-body text-right">
                    <Button color="teal"
                        disabled={!isCreate}
                        loading={current_loading}
                        onClick={handleCreate}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </div>
            {/* modal */}
            <AssignUser
                getAdd={handleAdd}
                show={option == 'CREATE'}
                isClose={(e) => setOption("")}
            />
        </div>
    )
}

export default CreateRole;