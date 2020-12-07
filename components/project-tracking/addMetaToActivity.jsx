import React, { useState, useEffect, useContext } from 'react';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { Button } from 'semantic-ui-react';
import { Confirm } from '../../services/utils';
import { AppContext } from '../../contexts/AppContext';
import { projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';

const AddMetaToActivity = ({ objective }) => {

    // app
    const app_context = useContext(AppContext);

    // proyecto
    const { project } = useContext(ProjectContext);

    // estados
    const [description, setDescription] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_meta, setCurrentMeta] = useState([]);

    // add meta
    const addMeta = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar el indicador?`, 'Guardar');
        if (answer) {
            app_context.fireLoading(true);
            let datos = {};
            datos.object_id = objective.id;
            datos.object_type = 'App/Models/Objective';
            datos.description = description;
            await projectTracking.post(`meta`, datos)
                .then(res => {
                    app_context.fireLoading(false);
                    let { success, message, meta } = res.data;
                    if (!success) throw new Error(message);
                    Swal.fire({ icon: 'success', text: message });
                    setDescription("");
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let { message, errors } = res.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message || err.message });
                    }
                });
        }
    }

    // obtener metas
    const getMetas = async (nextPage = 1, up = false) => {
        await projectTracking.get(`objective/${objective.id}/meta?page=${nextPage}`)
            .then(async res => {
                let { metas, success, message } = res.data;
                if (!success) throw new Error(message);
                setCurrentMeta(up ? [...current_meta, ...metas.data] : metas.data);
                if (metas.last_page > nextPage + 1) await getMetas(nextPage + 1, true);
            }).catch(err => console.log(err));
    }

    // primera carga
    useEffect(() => {
        if (objective.id) getMetas();
    }, []);

    // render
    return <div className="table-responsive">
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th colSpan="2" className="text-center">Indicadores del objectivo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <textarea 
                            name="description" 
                            rows="4"
                            onChange={({target}) => setDescription(target.value)}
                            value={description}
                        />
                    </td>
                    <td width="5%">
                        <Button
                            basic
                            color="green"
                            disabled={!description}
                            onClick={addMeta}
                        >
                            <i className="fas fa-plus"></i>
                        </Button>
                    </td>
                </tr>
                {current_meta.map(m =>
                    <tr>
                        <td colSpan="2">
                            <textarea 
                                disabled
                                name="description" 
                                rows="4"
                                value={m.description}
                            />
                        </td>
                    </tr>    
                )}
            </tbody>
        </table>
    </div>
}

export default AddMetaToActivity;