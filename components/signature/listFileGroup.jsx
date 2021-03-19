import React, { useContext, useEffect, useState, Fragment } from 'react';
import { signature } from '../../services/apis';
import { GroupContext } from '../../contexts/SignatureContext';
import FileSimple from '../fileSimple';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { Checkbox, Button } from 'semantic-ui-react';

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

const ItemValidation = ({ obj = {}, className = null }) => {

    const [file, setFile] = useState(obj.file || {});
    const isFile = Object.keys(file).length;

    // sin archivo
    return (
        <>
            <Show condicion={isFile}>
                <div className={`${className}`} style={{ position: 'relative' }}>
                    <Show condicion={obj.verify}>
                        <i className="fas fa-check text-success" 
                            style={{ 
                                position: 'absolute',
                                bottom: '12%',
                                right: '20px',
                                zIndex: 100 
                            }}
                        />
                    </Show>
                    <FileSimple name={file.name || ""}
                        url={file.url || ""}
                        size={file.size || 0}
                        date={file.created_at || ""}
                        extname={file.extname || ""}
                    />
                </div> 
            </Show>

            <Show condicion={!isFile}>
                <div className={className}>
                    <div className="card card-body">
                        <div className="filemgr-thumb text-primary">
                            <i className="fas fa-upload"></i>
                        </div>
                        <a href="#"
                            target="__blank" 
                            className="stretched-link card-title card-link text-body font-size-sm d-block font-13 text-ellipsis"
                            title={obj.ruler}
                        >
                            {obj.ruler}
                        </a>
                    </div>
                </div>
            </Show>
        </>
    )
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

    // primera carga
    useEffect(() => {
        getFiles();
    }, []);

    // next page
    useEffect(() => {
        if (current_page > 1) getFiles(true);
    }, [current_page])

    // render
    return (
        <>
            <div className="row">
                <div className="col-md-10"><h5><i className="far fa-file-pdf"></i> Lista de Archivos</h5></div>
            </div>

            <hr/>
            
            <div className="row">
                {datos.map((d, indexD) =>
                    <ItemValidation 
                        obj={d}
                        className="col-md-3"
                        key={`item-file-validation-${indexD}-${d.id}`}
                    />   
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