import React, { useContext, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import ItemTable from '../itemTable';
import { Pagination } from 'semantic-ui-react';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';
import Show from '../show';
import { status } from './datos.json';
import AuthTrackingProvider from '../../providers/tramite/auth/AuthTrackingProvider';

// providers
const authTrackingProvider = new AuthTrackingProvider();

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
            <td><Skeleton height="30px"/></td>
        </tr>    
    )
}

const ItemTracking = ({ tracking }) => {

    // tramite context
    const { dispatch, setOption, setFile } = useContext(TramiteContext);

    // props
    let { tramite, dependencia } = tracking || { };

    // status
    const getStatus = (current_status) => status[current_status] || {};

    // status actual
    const current_status = getStatus(tracking.status);

    // response
    return (
        <ItemTable
            current={tracking.current}
            slug={tramite.slug || ""}
            title={tramite.asunto || ""}
            files={tramite.files || []}
            document_type={tramite.tramite_type && tramite.tramite_type.description || ""}
            document_number={tramite.document_number || ""}
            lugar={dependencia.nombre || "Exterior"}
            fecha={tracking.created_at || ""}
            day={tracking.day || 0}
            semaforo={tracking.semaforo || ""}
            noRead={tracking.readed_at ? false : true}
            status={current_status.title}
            statusClassName={current_status.className}
            onClickItem={(e) => {
                dispatch({ type: tramiteTypes.CHANGE_TRACKING, payload: tracking });
                dispatch({ type: tramiteTypes.CHANGE_RENDER, payload: "SHOW" });
            }}
            onButton={(e) => {
                dispatch({ type: tramiteTypes.CHANGE_TRACKING, payload: tracking });
                dispatch({ type: tramiteTypes.CHANGE_RENDER, payload: "SHOW" });
            }}
            onClickFile={(e, f) => {
                e.preventDefault();
                setFile(f);
                setOption(["VISUALIZADOR"])
            }}
            buttons={[
                { key: "go", title: "Ver más", icon: "fas fa-eye", className: "btn-primary" }
            ]}
        />
    )
}

const InboxTab = () => {

    // tramite
    const tramite_context = useContext(TramiteContext);
    const { setTab, tab, isRole, role, dispatch, current_loading, trackings, socket, is_created, current_tracking, menu, page, last_page, setPage, total } = tramite_context;

    // manejador de tab
    const handleTab = (value) => {
        if (current_loading) return false;
        setPage(1);
        setTab(value);
    }

    // escuchar nuevo trámite 
    const socketCreateTramite = async (tracking) => {
        if (!is_created) return dispatch({ type: tramiteTypes.IS_CREATED, payload: tracking });
        // query
        let query_string = { page: 1, status: [tracking.status], tracking_id: [tracking.id] };
        // config
        let options = {
            headers: { DependenciaId: tramite_context.dependencia_id }
        }
        // actualizar datos
        await authTrackingProvider.index(tab, query_string, options)
        .then(res => {
            let { trackings } = res.data;
            dispatch({ type: tramiteTypes.ADD, payload: trackings.data });
            dispatch({ type: tramiteTypes.INCREMENT_FILTRO, payload: "SENT" });
        }).catch(err => {
            dispatch({ type: tramiteTypes.CHANGE_IS_CREATED, payload: false });
        });
    }

    // actualizar  datos
    useEffect(() => {
        if (is_created) socketCreateTramite(current_tracking);
    }, [is_created]);

    // escuchar sockets
    useEffect(() => {
        if (menu == 'SENT') socket?.on('Tramite/TramiteListener.store', (data) => socketCreateTramite(data.tracking));
    }, [socket, menu]);

    // render
    return (
        <div className="col-xl-10 col-md-9">
            <Show condicion={total}>
                <div className="text-right">
                    <Pagination activePage={page || 1}
                        pointing
                        disabled={current_loading}
                        secondary 
                        totalPages={last_page}
                        onPageChange={(e, { activePage }) => setPage(activePage)}
                    />
                </div>
            </Show>

            <div className="nav-custom-content">
                <div className="row">
                    <Show condicion={isRole && role.level == 'SECRETARY'}>
                        <div className="col-md-3">
                            <div className={`nav-custom ${tab == 'DEPENDENCIA' ? 'active' : ''}`}
                                onClick={() => handleTab('DEPENDENCIA')}
                            >   
                                <i className="fas fa-building"></i>  Mi Dependencia
                            </div>
                        </div>
                    </Show>

                    <div className="col-md-3">
                        <div className={`nav-custom ${tab == 'YO' ? 'active' : ''}`}
                            onClick={() => handleTab('YO')}
                        >
                            <i className="fas fa-inbox"></i>  Yo
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-responsive font-13">
                <table className="table">
                    <thead>
                        <tr>
                            <th width="30px">Código</th>
                            <th width="250px">Asunto</th>
                            <th>Tipo</th>
                            <th>Documento</th>
                            <th>Dependencia</th>
                            <th>Fecha</th>
                            <th className="text-center">Estado</th>
                            <th className="text-center">Dias</th>
                            <th className="text-center">Ver</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trackings.map((d, indexD) => 
                            <ItemTracking
                                key={`tr-index-table-item${indexD}`}
                                tracking={d}
                            />
                        )}
                        {/* no hay datos */}
                        <Show condicion={!current_loading && !trackings.length}>
                            <tr className="table-item">
                                <th colSpan="9" className="text-center">
                                    No hay registros disponibles!
                                </th>
                            </tr>
                        </Show>
                        {/* loading */}
                        <Show condicion={current_loading}>
                            <PlaceholderTable/>
                        </Show>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default InboxTab;