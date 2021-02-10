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
        </tr>    
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

    // status
    const getStatus = (current_status) => {
        // response
        return status[current_status] || {};
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
            <tbody>
                {tramite_context.datos.map((d, indexD) => 
                    <ItemTable
                        key={`tr-index-table-item${indexD}`}
                        current={d.current}
                        slug={d.tramite && d.tramite.slug || ""}
                        title={d.tramite && d.tramite.asunto || ""}
                        files={d.tramite && d.tramite.files || []}
                        document_type={d.tramite && d.tramite.tramite_type && d.tramite.tramite_type.description || ""}
                        document_number={d.tramite && d.tramite.document_number || ""}
                        lugar={d.tramite && d.tramite.dependencia_origen && d.tramite.dependencia_origen.nombre || ""}
                        fecha={d.created_at || ""}
                        day={d.day || 0}
                        semaforo={d.semaforo || ""}
                        noRead={d.readed_at ? false : true}
                        status={getStatus(d.status).title}
                        statusClassName={getStatus(d.status).className}
                        onClickItem={(e) => {
                            console.log('obj', d);
                            tramite_context.setTracking(d);
                            tramite_context.setRender('SHOW')
                        }}
                        onClickFile={(e, f) => {
                            e.preventDefault();
                            tramite_context.setFile(f);
                            tramite_context.setOption("VISUALIZADOR")
                        }}
                    />
                )}
                {/* no hay datos */}
                <Show condicion={!tramite_context.loading && !tramite_context.datos.length}>
                    <tr className="table-item">
                        <th colSpan="2" className="text-center">
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