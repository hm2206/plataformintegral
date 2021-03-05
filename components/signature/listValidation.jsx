import React, { useContext, useEffect, useState, Fragment } from 'react';
import { signature } from '../../services/apis';
import { GroupContext } from '../../contexts/SignatureContext';
import FileSimple from '../fileSimple';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { Checkbox, Button } from 'semantic-ui-react';

const PlaceholderItem = () => {

    return (
        <Fragment className="mb-3">
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

const ItemValidation = ({ obj = {}, className = null }) => {

    const [file, setFile] = useState(obj.file || {});
    const isFile = Object.keys(file).length;

    // sin archivo
    return (
        <Fragment>
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
        </Fragment>
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
    const [verify, setVerify] = useState(0);
    const [is_verify, setIsVerify] = useState(false);

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
        let query_string = `page=${current_page}&verify=${verify}`;
        // request
        await signature.get(`auth/group/${group.id}/validation?${query_string}`, options)
        .then(res => {
            let { validations } = res.data;
            setCurrentLastPage(validations.lastPage || 0);
            setCurrentTotal(validations.total || 0);
            setDatos(add ? [...datos, ...validations.data] : validations.data);
        }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        getValidation();
    }, []);

    // cambio de validación
    useEffect(() => {
        if (is_verify) {
            getValidation();
            setIsVerify(false);
        }
    }, [verify]);

    // next page
    useEffect(() => {
        if (current_page > 1) getValidation(true);
    }, [current_page])

    // render
    return (
        <Fragment>
            <div className="row">
                <div className="col-md-10"><h5><i className="fas fa-check"></i> Lista de validaciones</h5></div>
                <div className="col-md-2 text-right">
                    <Checkbox toggle
                        onChange={(e, obj) => {
                            setCurrentPage(1);
                            setVerify(obj.checked ? 1 : 0);
                            setIsVerify(true);
                        }}
                        checked={verify ? true : false}
                    />
                </div>
            </div>

            <hr/>
            
            <div className="row">
                {datos.map((d, indexD) =>
                    <ItemValidation 
                        obj={d}
                        className="col-md-3"
                        key={`item-file-validation-${indexD}`}
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
                    <PlaceholderItem/>
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
        </Fragment>
    );
}

export default ListValidation;