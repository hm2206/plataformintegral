import React, { useContext, useEffect, useState } from 'react';
import { signature } from '../../services/apis';
import { GroupContext } from '../../contexts/SignatureContext';
import FileSimple from '../fileSimple';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { Button } from 'semantic-ui-react';
import FileProvider from '../../providers/signature/FileProvider';
import { Confirm } from '../../services/utils';

// provedores
const fileProvider = new FileProvider();

const PlaceholderItem = () => {

    return (
        <>
            <div className="col-md-3">
                <Skeleton height="200px"/>
            </div>
            <div className="col-md-3">
                <Skeleton height="200px"/>
            </div>
            <div className="col-md-3">
                <Skeleton height="200px"/>
            </div>
            <div className="col-md-3">
                <Skeleton height="200px"/>
            </div>
        </>
    )
}

const ItemAction = ({ file, onDelete = null }) => {

    // group
    const  { group }= useContext(GroupContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false);
    const [render, setRender] = useState(true);

    // validarion
    const is_action = ['START'];

    // animations
    const animations = {
        SHOW: "animate__fadeIn",
        DELETE: "animate__fadeOutDown",
    };

    // eliminar
    const handleDelete = async () => {
        let answer = await Confirm(`warning`, `¿Estás seguro en eliminar el archivo?`);
        if (!answer) return false;
        setCurrentLoading(true);
        await fileProvider.delete(file.id)
            .then(res => {
                setIsError(false);
                setRender(false);
            })
            .catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    // executar eliminación del file
    useEffect(() => {
        if (!render) setTimeout((e) => typeof onDelete == "function" ? onDelete() : null, 400);
    }, [render]);

    // desmontar componente
    useEffect(() => {
        setRender(true);
        setIsError(false);
    }, [file]);

    // render
    return (
        <div className={`animate__animated ${render ? animations.SHOW : animations.DELETE}`}>
            <FileSimple name={file.name || ""}
                loading={current_loading}
                url={file.url || ""}
                size={file.size || 0}
                date={file.created_at || ""}
                extname={file.extname || ""}
                onDelete={is_action.includes(group.status) ? () => handleDelete() : null}
            /> 
        </div>
    );
}

const ListFileGroup = () => {

    // group
    const  { group }= useContext(GroupContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [is_refresh, setIsRefresh] = useState(false);

    // obtener 
    const getFiles = async (add = false) => {
        setCurrentLoading(true);
        // options
        let options = {
            headers: {
                DependenciaId: group.dependencia_id,
                GroupId: group.id
            }
        }
        let query_string = `page=${current_page}`;
        // request
        await signature.get(`auth/group/${group.id}/file?${query_string}`, options)
        .then(res => {
            let { files } = res.data;
            setCurrentLastPage(files.lastPage || 0);
            setCurrentTotal(files.total || 0);
            setDatos(add ? [...datos, ...files.data] : files.data);
        }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // eliminar file del files
    const onDelete = async (index) => {
        let newData = [...datos];
        newData.splice(index, 1);
        setDatos(newData);
    }

    // primera carga
    useEffect(() => {
        getFiles();
    }, []);

    // next page
    useEffect(() => {
        if (current_page > 1) getFiles(true);
    }, [current_page])

    // refrescar
    useEffect(() => {
        if (is_refresh) {
            getFiles();
            setIsRefresh(false);
        }
    }, [is_refresh]);

    // render
    return (
        <>
            <div className="row">
                <div className="col-md-10 col-10"><h5><i className="far fa-file-pdf"></i> Lista de Archivos</h5></div>
                <div className="col-md-2 text-right col-2">
                    <button className="btn btn-outline-primary"
                        onClick={(e) => setIsRefresh(true)}
                    >
                        <i className="fas fa-sync"></i>
                    </button>
                </div>
            </div>

            <hr/>
            
            <div className="row">
                {datos.map((d, indexD) =>
                    <div className="col-md-3" key={`file-list-uploaded-${indexD}`}>
                        <ItemAction file={d}
                            onDelete={() => onDelete(indexD)}
                        /> 
                    </div>
                )}
                {/* no hay registros */}
                <Show condicion={!current_loading && !datos.length}>
                    <div className="col-md-12 text-center text-muted mb-3">
                        No hay regístros disponibles
                    </div>
                </Show>
                {/* preloader */}
                <Show condicion={current_loading}>
                    <PlaceholderItem className="mt-3"/>
                </Show>
                {/* next page */}
                <div className="col-md-12 mt-2">
                    <Button fluid
                        disabled={!(current_last_page >= (current_page + 1))}
                        onClick={(e) => setCurrentPage(current_page + 1)}
                    >
                        <i className="fas fa-arrow-down"></i> Obtener más regístros
                    </Button>
                </div>
            </div>
        </>
    );
}

export default ListFileGroup;