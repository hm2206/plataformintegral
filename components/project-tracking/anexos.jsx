import React, { useContext, useState, useEffect } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import Modal from '../modal'
import { SelectRol } from '../select/project_tracking'
import Show from '../show';
import storage from '../../services/storage.json';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import Swal from 'sweetalert2';
import { DropZone } from '../Utils';
import { Confirm } from '../../services/utils';
import { projectTracking } from '../../services/apis';
import Skeleton from 'react-loading-skeleton';

const Anexos = ({ isClose, object_id, object_type, afterSave, editable = true }) => {

    // app
    const app_context = useContext(AppContext);
    const [current_loading, setCurrentLoading] = useState(false);
    const [data, setData] = useState([]);
    const [error, setError] = useState(false);

    // project
    const { project } = useContext(ProjectContext);

    // obtener objectos
    const getObject = async (add = false) => {
        await setCurrentLoading(true);
        await projectTracking.get(`file/${object_id}/object_type?object_type=${object_type}`)
            .then(res => {
                let { files } = res.data;
                setError(false);
                setData(add ? [...data, ...files.data] : files.data);
            }).catch(err => setError(true));
        await setCurrentLoading(false);
    }

    // config
    useEffect(() => {
        getObject();
        // desmontar
        return () => {
            setData([]);
        }
    }, []);

    // subir anexo
    const handleFile = async ({ files }) => {
        let answer = await Confirm("warning", `¿Estas seguro en subir los archivos como anexo?`, 'Subir');
        if (answer) {
            let datos = new FormData;
            datos.append('object_id', object_id);
            datos.append('object_type', object_type);
            for(let f of files) datos.append('files', f);
            app_context.fireLoading(true);
            // request
            await projectTracking.post(`file`, datos)
                .then(async res => {
                    app_context.fireLoading(false);
                    let { success, message, files } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    setData([...data, ...files]);
                    if (typeof afterSave == 'function') await afterSave(files);
                }).catch(err => {
                    app_context.fireLoading(false);
                    let { message } = err.response.data;
                    Swal.fire({ icon: 'error', text: message || err.message });
                })
        }
    }

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-list-alt"></i> Anexos</span>}
            isClose={isClose}
        >  
            <Form className="card-body">

                <Show condicion={project.state != "OVER" && project.state != 'PREOVER' && editable}>
                    <div className="mb-4">
                        <DropZone
                            id="file-anexos"
                            name="file"
                            multiple={true}
                            title="Subir anexo"
                            onChange={handleFile}
                        />
                    </div>
                </Show>

                <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th colSpan="3" className="text-center">
                                    Lista de Anexos
                                </th>
                            </tr>
                            <tr>
                                <th>Nombre</th>
                                <th>Tamaño</th>
                                <th className="text-center">Descargar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show condicion={!current_loading && !data.length}>
                                <tr>
                                    <td className="text-center" colSpan="3">
                                        No hay medios de verificación
                                        <a href="#" className="ml-2" onClick={(e) => {
                                            e.preventDefault();
                                            getObject();
                                        }}>
                                            <i className="fas fa-sync"></i>
                                        </a>
                                    </td>
                                </tr>
                            </Show>

                            {data.map((f, indexF) =>
                                <tr key={`list-anexos-${indexF}`}>
                                   <td>{f.name}</td>
                                   <td>{f.size}</td>
                                   <td className="text-center">
                                        <a href={f.url} target="_blank" rel="noopener noreferrer">
                                            <i className="fas fa-download"></i>
                                        </a>
                                    </td> 
                                </tr>    
                            )}

                            <Show condicion={current_loading}>
                                <tr>
                                    <td><Skeleton/></td>
                                    <td><Skeleton/></td>
                                    <td><Skeleton/></td>
                                </tr>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </Form>
        </Modal>
    )
}

export default Anexos;