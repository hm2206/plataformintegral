import React, { useState, useContext } from 'react';
import { Form, Select, Button } from 'semantic-ui-react';
import Show from '../show';
import { Confirm } from '../../services/utils';
import ConfigDependenciaProvider from '../../providers/tramite/ConfigDependenciaProvider';
import Swal from 'sweetalert2';
import { EntityContext } from '../../contexts/EntityContext';
import { SelectDependencia } from '../../components/select/authentication';

// providers
const configDependenciaProvider = new ConfigDependenciaProvider();

const CreateConfigDependencia = ({ dependencia_id, setIsCreate }) => {
    // entity
    const { entity_id } = useContext(EntityContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [dependencia_destino_id, setDependenciaDestinoId] = useState("");
    const [option, setOption] = useState("");
    const [errors, setErrors] = useState({});

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
            dependencia_destino_id,
            dependencia_id
        };
        // request
        await configDependenciaProvider.store(payload, options)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setDependenciaDestinoId("");
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
                <i className="fas fa-plus"></i> Crear Dependencia Destino
            </div>
            <Form className="card-body">
                <Form.Field>
                    <SelectDependencia
                        disabled={current_loading}
                        name="dependencia_destino_id"
                        value={dependencia_destino_id || ""}
                        onChange={(e, { value }) => setDependenciaDestinoId(value)}
                    />
                </Form.Field>
            </Form>

            <div className="card-footer">
                <div className="card-body text-right">
                    <Button color="teal"
                        disabled={!dependencia_destino_id || current_loading}
                        loading={current_loading}
                        onClick={handleCreate}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CreateConfigDependencia;