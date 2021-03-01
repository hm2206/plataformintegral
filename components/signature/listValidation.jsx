import React, { useContext, useEffect, useState, Fragment } from 'react';
import { signature } from '../../services/apis';
import { GroupContext } from '../../contexts/SignatureContext';
import FileSimple from '../fileSimple';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';

const PlaceholderItem = () => {

    return (
        <Fragment>
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
        </Fragment>
    )
}

const ItemValidation = ({ validation = {}, className = null }) => {

    let { file } = validation || {};

    // mostrar archivo
    if (Object.keys(file || {}).length) return (
       <div className={`${className}`} style={{ position: 'relative' }}>
            <Show condicion={validation.verify}>
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
    )

    // sin archivo
    return (
        <div className={className}>
            <div className="card card-body">
                <div className="filemgr-thumb text-primary">
                    <i className="fas fa-upload"></i>
                </div>
                <a href="#"
                    target="__blank" 
                    className="stretched-link card-title card-link text-body font-size-sm d-block font-13 text-ellipsis"
                    title={validation.ruler}
                >
                    {validation.ruler}
                </a>
            </div>
        </div>
    )
}

const ListValidation = () => {

    // group
    const  { group }= useContext(GroupContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);

    // obtener 
    const getValidation = async (add = false) => {
        setCurrentLoading(true);
        // options
        let options = {
            headers: {
                DependenciaId: group.dependencia_id,
                GroupId: group.id
            }
        }
        // request
        await signature.get(`auth/group/${group.id}/validation`, options)
        .then(res => {
            let { validations } = res.data;
            setCurrentLastPage(validations.lastPage || 0);
            setCurrentTotal(validations.total || 0);
            setDatos(add ? [...datos, validations.data] : validations.data);
        }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        getValidation();
    }, []);

    // render
    return (
        <div className="row">
            {datos.map((d, indexD) =>
                <ItemValidation 
                    validation={d}
                    className="col-md-3"
                    key={`item-file-validation-${indexD}`}
                />   
            )}
            {/* no hay registros */}
            <Show condicion={!current_loading && !datos.length}>
                <div className="col-md-12 text-center text-muted">
                    No hay regístros disponibles
                </div>
            </Show>
            {/* preloader */}
            <Show condicion={current_loading}>
                <PlaceholderItem/>
            </Show>
        </div>
    );
}

export default ListValidation;