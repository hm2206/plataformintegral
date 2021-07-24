import React, { useContext, useState, useEffect } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import Modal from '../modal'
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import Swal from 'sweetalert2';
import { DropZone } from '../Utils';
import { Confirm, formatBytes } from '../../services/utils';
import { projectTracking } from '../../services/apis';
import Skeleton from 'react-loading-skeleton';
import Visualizador from '../visualizador';

const ItemAnexo = ({ anexo, onView = null, onDelete = null }) => {
    // render
    return (
        <tr>
            <td>{anexo?.name}</td>
            <td>{formatBytes(anexo?.size || 0)}</td>
            <td className="text-center">
                <Button.Group className="btn-group" size="mini">
                    <Button color="blue"
                        basic
                        onClick={() => typeof onView == 'function' ? onView(anexo) : null}
                    >
                        <i className="fas fa-search"></i>
                    </Button>

                    <Button color="red"
                        onClick={() => typeof onDelete == 'function' ? onDelete(anexo) : null}
                    >
                        <i className="fas fa-times"></i>
                    </Button>
                </Button.Group>
            </td> 
        </tr>   
    )
}

const Anexos = ({ isClose, object_id, object_type, afterSave, editable = true }) => {

    // app
    const app_context = useContext(AppContext);
    const [current_loading, setCurrentLoading] = useState(false);
    const [data, setData] = useState([]);
    const [error, setError] = useState(false);
    const [option, setOption] = useState("");
    const [current_anexo, setCurrentAnexo] = useState({});

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

    const handleView = (anexo) => {
        setCurrentAnexo(anexo);
        setOption("VISUALIZADOR");
    }

    // subir anexo
    const handleFile = async ({ files }) => {
        let answer = await Confirm("warning", `¿Estas seguro en subir los archivos como anexo?`, 'Subir');
        if (answer) {
            let datos = new FormData;
            datos.append('object_id', object_id);
            datos.append('object_type', object_type);
            for(let f of files) datos.append('files', f);
            app_context.setCurrentLoading(true);
            // request
            await projectTracking.post(`file`, datos)
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message, files } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setData([...data, ...files]);
                if (typeof afterSave == 'function') await afterSave(files);
            }).catch(err => {
                app_context.setCurrentLoading(false);
                let { message } = err.response.data;
                Swal.fire({ icon: 'error', text: message || err.message });
            })
        }
    }

    // eliminar anexo
    const handleDelete = async (anexo) => {
        let answer = await Confirm("warning", `¿Estas seguro en eliminar el anexo?`, 'Eliminar');
        if (!answer) return;
        app_context.setCurrentLoading(true);
        // request
        await projectTracking.post(`file/${anexo.id}?_method=DELETE`)
        .then(async res => {
            app_context.setCurrentLoading(false);
            await Swal.fire({ icon: 'success', text: "El archivo se eliminó correctamente!" });
            await getObject();
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: "No se pudó eliminar el anexo" });
        })
    }

    // config
    useEffect(() => {
        getObject();
        // desmontar
        return () => setData([]);
    }, []);


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
                                <th className="text-center">Visualizar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show condicion={!current_loading && !data.length}>
                                <tr>
                                    <td className="text-center" colSpan="3">
                                        No hay registros disponibles
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
                                <ItemAnexo anexo={f}
                                    key={`list-anexos-${indexF}`}
                                    onView={handleView}
                                    onDelete={handleDelete}
                                />
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

                {/*  */}
                <Show condicion={option == 'VISUALIZADOR'}>
                    <Visualizador
                        is_observation={false}
                        name={current_anexo?.name}
                        extname={current_anexo?.extname}
                        url={current_anexo?.url}
                        onClose={(e) => setOption("")}
                    />
                </Show>
            </Form>
        </Modal>
    )
}

export default Anexos;