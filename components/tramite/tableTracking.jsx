import React, { useContext, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import ItemTable from '../itemTable';
import Show from '../show';
import { tramite } from '../../services/apis';
import { TramiteContext } from '../../contexts/TramiteContext';
import { status } from './datos.json';

const PlaceholderTable = () => {
    let datos = [1, 2, 3, 4];
    return datos.map(indexD => 
        <tr key={`list-table-placeholder-${indexD}`}>
            <td><Skeleton height="30px"/></td>
            <td><Skeleton height="30px"/></td>
            <td><Skeleton height="30px"/></td>
            <td><Skeleton height="30px"/></td>
            <td><Skeleton height="30px"/></td>
            <td><Skeleton height="30px"/></td>
            <td><Skeleton height="30px"/></td>
            <td><Skeleton height="30px"/></td>
        </tr>    
    )
}

const ItemTracking = ({ tracking }) => {

    // tramite context
    const tramite_context = useContext(TramiteContext);

    // props
    let { tramite, dependencia } = tracking || { };

    // status
    const getStatus = (current_status) => status[current_status] || {};

    // response
    return (
        <ItemTable
            current={tracking.current}
            slug={tramite.slug || ""}
            title={tramite.asunto || ""}
            files={tramite.files || []}
            document_type={tramite.tramite_type && tramite.tramite_type.description || ""}
            document_number={tramite.document_number || ""}
            lugar={dependencia.nombre || ""}
            fecha={tracking.created_at || ""}
            day={tracking.day || 0}
            semaforo={tracking.semaforo || ""}
            noRead={tracking.readed_at ? false : true}
            status={getStatus(tracking.status).title}
            statusClassName={getStatus(tracking.status).className}
            onClickItem={(e) => {
                tramite_context.setTracking(tracking);
                tramite_context.setRender('SHOW')
            }}
            onButton={(e) => {
                tramite_context.setTracking(tracking);
                tramite_context.setRender('SHOW')
            }}
            onClickFile={(e, f) => {
                e.preventDefault();
                tramite_context.setFile(f);
                tramite_context.setOption("VISUALIZADOR")
            }}
            buttons={[
                { key: "go", title: "Ver más", icon: "fas fa-eye", className: "btn-primary" }
            ]}
        />
    )
}

const TableTracking = () => {

    // tramite context
    const tramite_context = useContext(TramiteContext);

    // obtener trackings
    const getTracking = async (add = false) => {
        tramite_context.setLoading(true);
        let current_query = `page=${tramite_context.page}&status=${tramite_context.menu.filtros.join('&status=')}&query_search=${tramite_context.query_search}`;
        await tramite.get(`auth/tracking/${tramite_context.tab}?${current_query}`, { headers: { DependenciaId: tramite_context.dependencia_id } })
        .then(res => {
            let { success, trackings, message } = res.data;
            if (!success) throw new Error(message);
            tramite_context.setTotal(trackings.total || 0);
            tramite_context.setLastPage(trackings.last_page || 0);
            tramite_context.setDatos(add ? [...tramite_context.datos, ...trackings.data] : trackings.data);
        }).catch(err => {});
        tramite_context.setLoading(false);
        tramite_context.setIsMenu(false);
        tramite_context.setIsTab(false);
    }

    // primera carga
    useEffect(() => {
        if (!tramite_context.execute && !tramite_context.is_menu && tramite_context.dependencia_id) {
            getTracking();
        }
    }, [tramite_context.dependencia_id]);

    // refrescar datos
    useEffect(() => {
        if (tramite_context.execute) {
            getTracking();
        }
    }, [tramite_context.execute]);

    // render
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Asunto</th>
                    <th>T. Documento</th>
                    <th>N° Documento</th>
                    <th>Dependencia</th>
                    <th>Fecha</th>
                    <th className="text-center">Estado</th>
                    <th className="text-center">Dias</th>
                    <th className="text-center">Ver</th>
                </tr>
            </thead>
            <tbody>
                {tramite_context.datos.map((d, indexD) => 
                    <ItemTracking
                        key={`tr-index-table-item${indexD}`}
                        tracking={d}
                    />
                )}
                {/* no hay datos */}
                <Show condicion={!tramite_context.loading && !tramite_context.datos.length}>
                    <tr className="table-item">
                        <th colSpan="9" className="text-center">
                            No hay registros disponibles!
                        </th>
                    </tr>
                </Show>
                {/* loading */}
                <Show condicion={tramite_context.loading}>
                    <PlaceholderTable/>
                </Show>
            </tbody>
        </table>
    )
}

export default TableTracking;