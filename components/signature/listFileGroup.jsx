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
                    <div className="col-md-3" key={`file-list-uploaded-${indexD}`}>
                        <FileSimple name={d.name || ""}
                            url={d.url || ""}
                            size={d.size || 0}
                            date={d.created_at || ""}
                            extname={d.extname || ""}
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