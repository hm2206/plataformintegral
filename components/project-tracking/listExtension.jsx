import React, { useContext, useEffect, useState } from 'react';
import Modal from '../modal';
import { projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import Visualizador from '../visualizador';

const Placeholder = () => {
    const datos = [1, 2, 3, 4];
    return datos.map(d => 
        <tr>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>    
    )
}

const ItemExtension = ({ extension }) => {
    const [is_render, setIsRender] = useState(false);
    // render
    return (
        <tr>
            <td className="text-center">{extension?.resolucion}</td>
            <td className="text-center">{extension?.date_resolucion}</td>
            <td>
                <div className="text-center">
                    <span className="text-primary cursor-pointer"
                        onClick={() => setIsRender(true)}
                    >
                        <i className="fas fa-search"></i>
                    </span>
                </div>
                {/* visualizador */}
                <Show condicion={is_render}>
                    <Visualizador onClose={() => setIsRender(false)}
                        name={extension?.file?.name}
                        extname={extension?.file?.extname}
                        size={extension?.file?.size}
                        url={extension?.file?.url}
                        is_observation={false}
                    />
                </Show>
            </td>
        </tr>
    )
}

const ListExtension = ({ onClose = null }) => {

    // project
    const { project } = useContext(ProjectContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false);
    const [page, setPage] = useState(1);
    const [last_page, setLastPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [datos, setDatos] = useState([]);

    const getExtensions = async (add = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`project/${project.id}/extensions?page=${page}`)
        .then(res => {
            let { extensions } = res.data;
            setLastPage(extensions.lastPage);
            setTotal(extensions.total);
            setDatos(add ? [...datos, ...extensions.data] : extensions.data);
            setIsError(false);
        }).catch(err => setIsError(true)); 
        setCurrentLoading(false);
    }

    useEffect(() => {
        getExtensions();
    }, []);

    // render
    return (
        <Modal show={true}
            isClose={onClose}
            titulo={<span><i className="fas fa-server"></i> Lista de Ampliaciones</span>}
        >
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                        <thead className="text-center">
                            <tr>
                                <th>Resolución</th>
                                <th>Fecha de Resolución</th>
                                <th>Archivo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show condicion={!current_loading}
                                predeterminado={<Placeholder/>}
                            >
                                <Show condicion={datos.length}
                                    predeterminado={
                                        <tr>
                                            <td className="text-center" colSpan="3">
                                                No hay regístros
                                            </td>
                                        </tr>
                                    }
                                >
                                    {datos.map((d, indexD) => 
                                        <ItemExtension 
                                            key={`item-extension-${indexD}`}
                                            extension={d}
                                        />
                                    )}
                                </Show>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    )
}

export default ListExtension;