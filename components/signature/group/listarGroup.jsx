import React, { useContext, useEffect, useState } from 'react';
import { SignatureContext } from '../../../contexts/SignatureContext';
import DirSimple from '../../dirSimple';
import Show from '../../show';
import { signature } from '../../../services/apis';
import Skeleton from 'react-loading-skeleton';
import Router from 'next/router';
import btoa from 'btoa';


const PlaceholderDir = () => {
    let datos = [1, 2, 3, 4, 5, 6, 7, 8];
    return datos.map(indexD => 
        <div className="col-md-3 mb-2" key={`list-placeholder-dir-${indexD}`}>
            <Skeleton height="50px"/>
        </div>   
    )
}

const ListarGroup = () => {

    // signature
    const signature_context = useContext(SignatureContext);

    // states
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_next, setIsNext] = useState(false);

    // obtener groupo
    const getGroup = async (add = false) => {
        setCurrentLoading(true);
        let query = `page=${signature_context.page || 1}&query_search=${signature_context.query_search || ""}`;
        let options = {
            headers: { DependenciaId: signature_context.dependencia_id }
        }
        // request
        await signature.get(`auth/group?${query}`, options)
        .then(res => {
            let { groups } = res.data;
            signature_context.setLastPage(groups.lastPage);
            signature_context.setTotal(groups.total);
            signature_context.setDatos(add ? [...signature_context.datos, ...groups.data] : groups.data);
        }).catch(err => clearGroup());
        setCurrentLoading(false);
        setIsNext(false);
    }

    // limpiar datos
    const clearGroup = async () => {
        signature_context.setPage(1);
        signature_context.setLastPage(1);
        signature_context.setTotal(0);
        signature_context.setDatos([]);
    }

    // manejar siguiente datos
    const handleNext = () => {
        signature_context.setPage(signature_context.page + 1);
        setIsNext(true);
    }

    // montar
    useEffect(() => {
        if (signature_context.dependencia_id) getGroup();
        else clearGroup();
    }, [signature_context.dependencia_id]);

    // actualizar 
    useEffect(() => {
        if (signature_context.refresh) getGroup();
    }, [signature_context.refresh]);

    // siguiente página
    useEffect(() => {
        if (is_next) getGroup(true);
    }, [is_next]);

    // render
    return (
        <div className="row">
            <Show condicion={signature_context.datos && signature_context.datos.length}>
                {signature_context.datos.map((d, indexD) => 
                    <div className="col-md-3" key={`listar-datos-${indexD}`}>
                        <DirSimple
                            disabled={current_loading}
                            name={d.title}
                            fileCount={d.file_count || 0}
                            size={d.file_size || 0}
                            onClick={(e) => {
                                let { push, pathname } = Router;
                                push({ 
                                    pathname: `${pathname}/${d.slug}`, 
                                    query: { 
                                        href: btoa(`${location.href}`), 
                                        dependencia_id: signature_context.dependencia_id || '' 
                                    } 
                                });
                            }}
                        />
                    </div>
                )}
            </Show>
            {/* obtener más datos */}
            <Show condicion={(signature_context.page + 1) <= signature_context.last_page}>
                <div className="col-md-3">
                    <div className="card card-body text-center cursor-pointer bg-dark text-white"
                        onClick={handleNext}
                    >
                        <i className="fas fa-angle-double-down"></i>
                    </div>
                </div>
            </Show>
            {/* preloader */}
            <Show condicion={current_loading}>
                <div className="col-md-12"></div>
                <PlaceholderDir/>
            </Show>
        </div>
    )
}

// exportar 
export default ListarGroup;