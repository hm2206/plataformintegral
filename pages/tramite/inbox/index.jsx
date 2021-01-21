import React, { useContext, useEffect, useState } from 'react';
import Router from 'next/router';
import { Body } from '../../../components/Utils';
import Show from '../../../components/show';
import { Button, Message } from 'semantic-ui-react'
import { SelectAuthEntityDependencia } from '../../../components/select/authentication';
import CreateTramite from '../../../components/tramite/createTramite';
import { AppContext } from '../../../contexts/AppContext';
import Skeleton from 'react-loading-skeleton';
import { tramite } from '../../../services/apis';
import { status } from '../../../components/tramite/datos.json';
import moment from 'moment';
import { AUTHENTICATE } from '../../../services/auth';
import ItemTable from '../../../components/itemTable';
import RenderShow from '../../../components/tramite/renderShow';
import dynamic from 'next/dynamic';
const Visualizador = dynamic(() => import('../../../components/visualizador'), { ssr: false })
 

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
        </tr>    
    )
}

// menus
const current_status = [
    { key: "INBOX", icon: 'fas fa-inbox', text: 'Recibidos', index: 0, filtros: ['ENVIADO', 'PENDIENTE'] },
    { key: "DERIVADO", icon: 'fas fa-paper-plane', text: 'Enviados', index: 1, filtros: ['DERIVADO', 'RESPONDIDO'] },
    { key: "REGISTRADO", icon: 'far fa-file', text: 'Regístrados', index: 2, filtros: ['REGISTRADO'] },
    { key: "ACEPTADO", icon: 'fas fa-check', text: 'Aceptados', index: 3, filtros: ['ACEPTADO'] },
    { key: "RECHAZADO", icon: 'fas fa-times', text: 'Rechazados', index: 4, filtros: ['RECHAZADO'] },
    { key: "ANULADO", icon: 'fas fa-trash', text: 'Anulados', index: 5, filtros: ['ANULADO'] },
    { key: "FINALIZADOS", icon: 'fas fa-check-double', text: 'Finalizados', index: 6, filtros: ['FINALIZADO'] }
];

const InboxIndex = ({ pathname, query, success, role, boss }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_refresh, setCurrentRefresh] = useState(false);
    const [tab, setTab] = useState("YO");
    const [option, setOption] = useState("");
    const [form, setForm] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [is_tab, setIsTab] = useState(false);
    const [current_file, setCurrentFile] = useState({});
    const [current_menu, setCurrentMenu] = useState(current_status[0]);
    const [is_menu, setIsMenu] = useState(false);
    const [query_search, setQuerySearch] = useState("");
    const [current_render, setCurrentRender] = useState("LIST");
    const [current_tracking, setCurrentTracking] = useState({});

    // props
    let isRole = Object.keys(role).length;

    // roles
    const getRole = () => {
        const roles = {
            BOSS: {
                text: "Jefe",
                className: "badge-primary"
            },
            SECRETARY: {
                text: "Secretaria",
                className: "badge-warning"
            },
            DEFAULT: {
                text: 'Trabajador',
                className: "badge-dark"
            }
        }
        // response
        let current_role = isRole ? roles[role.level] : roles['DEFAULT'];
        return current_role;
    }

    // status
    const getStatus = (current_status) => {
        // response
        return status[current_status] || {};
    }

    // obtener trackings
    const getTracking = async (add = false) => {
        setCurrentLoading(true);
        let current_query = `status=${current_menu.filtros.join('&status=')}&query_search=${query_search}`;
        await tramite.get(`auth/tracking/${tab}?${current_query}`, { headers: { DependenciaId: query.dependencia_id } })
            .then(res => {
                let { success, trackings, message } = res.data;
                if (!success) throw new Error(message);
                setCurrentPage(trackings.page || 1);
                setCurrentTotal(trackings.total || 0);
                setCurrentLastPage(trackings.last_page || 0);
                setDatos(add ? [...datos, ...trackings.data] : trackings.data);
            })
            .catch(err => {});
        setCurrentLoading(false);
        setIsMenu(false);
        setIsTab(false);
    }

    // más información
    const information = (obj) => {
        setCurrentTracking(obj)
        setCurrentRender('SHOW');
    }

    // seleccionar la primera opción
    const dependenciaDefault = (dependencias = []) => {
        if (!query.dependencia_id) {
            let isAllow = dependencias.length;
            if (isAllow >= 2) {
                let current_dependencia = dependencias[1];
                query.dependencia_id = current_dependencia.value;
                let { push } = Router;
                push({ pathname, query });
            }
        }
    }

    // seleccionar menu
    const handleSelectMenu = (index = 0) => {
        if (!current_loading) {
            let current = current_status[index];
            setCurrentMenu(current);
            setCurrentRender('LIST');
            setIsMenu(true);
            setDatos([]);
            setCurrentPage(1);
            setCurrentTotal(0);
        }
    }

    // manejador de creado
    const handleOnSave = () => {
        setOption("");
        setCurrentRender("LIST");
        if (current_menu.index == 2) getTracking();
        else handleSelectMenu(2);
    }

    // vaciar tab
    useEffect(() => {
        setCurrentPage(1);
        setCurrentLastPage(0);
        setCurrentTotal(0);
        setDatos([]);
    }, [tab]);

    // montar componente
    useEffect(() => {
        app_context.fireEntity({ render: true });
        if (success) {
            setTab("YO")
            setCurrentRender("LIST");
            setCurrentTotal(0);
            setCurrentLastPage(0);
            setCurrentPage(1);
            setDatos([]);
            getTracking();
        }
    }, [query.dependencia_id]);

    // montar componente al cambiar el tab
    useEffect(() => {
        if (is_tab) getTracking();
    }, [tab]);

    // cambio de menu obtener tracking
    useEffect(() => {
        if (is_menu) getTracking();
    }, [is_menu])

    // cambiar de estado
    useEffect(() => {
        if (current_refresh) {
            if (current_render == 'LIST') getTracking();
            setCurrentRefresh(false);
        }
    }, [current_refresh]);

    // render
    return (
        <div className="col-md-12">
            <Body>
                <div className="card-header">
                    Bandeja de Entrada 
                    <Show condicion={query.dependencia_id}>
                        <i className="fas fa-arrow-right ml-3 mr-3"></i> 
                        <span className={`badge ${getRole().className}`}>{getRole().text}</span>
                    </Show>
                </div>

                <div className="card-body">
                    <div className="card">
                        <div className="card-body">
                            <div className="row mb-4">
                                <div className="col-md-4 mb-2">
                                    <SelectAuthEntityDependencia
                                        onReady={dependenciaDefault}
                                        entity_id={app_context.entity_id || ""}
                                        name="dependencia_id"
                                        onChange={(e, obj) => {
                                            let { push } = Router;
                                            query.dependencia_id = obj.value || "";
                                            push({ pathname, query });
                                        }}
                                        value={query.dependencia_id || ""}
                                    />
                                </div>

                                <div className="col-md-2 mb-2">
                                    <Button color="blue" basic onClick={async (e) => setCurrentRefresh(true)}>
                                        <i className="fas fa-sync"></i>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ minHeight: '70vh' }}>
                        <div className="card-body">
                            <Show condicion={query.dependencia_id}
                                predeterminado={
                                    <div>
                                        <Message color="yellow">
                                            Porfavor seleccione una dependencia!
                                        </Message>
                                    </div>
                                }
                            >
                                <div className="row">
                                    <div className="col-xl-2 col-md-3">
                                        <div className="mb-3">
                                            <button className="btn waves-effect waves-light btn-rounded btn-outline-primary"
                                                disabled={!query.dependencia_id}
                                                onClick={(e) => setOption("CREATE")}
                                            >
                                                + Trámite nuevo
                                            </button>
                                        </div>

                                        <ul className="mb-2 nav nav-tab flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                                            <li className="nav-item mail-section">
                                                {current_status.map((s, indexS) => 
                                                    <a className={`nav-link text-left cursor-pointer ${indexS === current_menu.index ? 'active' : ''}`}
                                                        key={`item-menu-mail-${indexS}-${s.key}`}
                                                        onClick={(e) => handleSelectMenu(indexS)}
                                                    >
                                                        <span><i className={s.icon}></i> {s.text}</span>
                                                        <span className="float-right">{s.revisado ? s.revisado : ''}</span>
                                                    </a>
                                                )}
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="col-xl-10 col-md-9">
                                        <div className="row">
                                            <div className="col-md-8 mb-2 col-9">
                                                <input type="text" 
                                                    className="form-control"
                                                    placeholder="Buscar trámite por código, numero de documento y nombre de archivo"
                                                    value={query_search || ""}
                                                    onChange={({ target }) => setQuerySearch(target.value)}
                                                    disabled={current_loading}
                                                />
                                            </div>

                                            <div className="col-xl-2 col-md-2 col-2 mb-2">
                                                <button className="btn btn-primary"
                                                    disabled={current_loading}
                                                    onClick={(e) => {
                                                        setCurrentRender('LIST');
                                                        setDatos([]);
                                                        setCurrentPage(1);
                                                        setCurrentLastPage(0);
                                                        setCurrentTotal(0);
                                                        getTracking();
                                                    }}
                                                >
                                                    <i className="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>

                                        {/* render list */}
                                        <Show condicion={current_render == 'LIST'}>
                                            <div className="nav-custom-content">
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className={`nav-custom ${tab == 'YO' ? 'active' : ''}`} onClick={(e) => {
                                                            setTab("YO")
                                                            setIsTab(true)
                                                        }}>
                                                            <i className="fas fa-inbox"></i>  Yo
                                                        </div>
                                                    </div>

                                                    <Show condicion={success && role && role.level && role.level == 'SECRETARY'}>
                                                        <div className="col-md-3">
                                                            <div className={`nav-custom ${tab == 'DEPENDENCIA' ? 'active' : ''}`} onClick={(e) => {
                                                                setTab("DEPENDENCIA")
                                                                setIsTab(true)
                                                            }}>
                                                                <i className="fas fa-building"></i>  Mi Dependencia
                                                            </div>
                                                        </div>
                                                    </Show>
                                                </div>
                                            </div>

                                            <div className="table-responsive font-13">
                                                <table className="table">
                                                    <tbody>
                                                        {datos.map((d, indexD) => 
                                                            <ItemTable
                                                                key={`tr-index-table-item${indexD}`}
                                                                current={d.current}
                                                                slug={d.tramite && d.tramite.slug || ""}
                                                                title={d.tramite && d.tramite.asunto || ""}
                                                                files={d.tramite && d.tramite.files || []}
                                                                remitente={d.tramite && d.tramite.person && d.tramite.person.fullname || ""}
                                                                lugar={d.tramite && d.tramite.dependencia_origen && d.tramite.dependencia_origen.nombre || ""}
                                                                status={getStatus(d.status).title}
                                                                statusClassName={getStatus(d.status).className}
                                                                onClickItem={(e) => information(d)}
                                                                onClickFile={(e, f) => {
                                                                    e.preventDefault();
                                                                    setOption("VISUALIZADOR")
                                                                    setCurrentFile(f);
                                                                }}
                                                            />
                                                        )}
                                                        {/* no hay datos */}
                                                        <Show condicion={!current_loading && !datos.length}>
                                                            <tr className="table-item">
                                                                <th colSpan="6" className="text-center">
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
                                        </Show>

                                        {/* render show */}
                                        <Show condicion={current_render == 'SHOW'}>
                                            <RenderShow
                                                tracking={current_tracking}
                                                role={role}
                                                boss={boss}
                                                refresh={current_refresh}
                                                onFile={(f) => {
                                                    setOption("VISUALIZADOR")
                                                    setCurrentFile(f);
                                                }}
                                            />
                                        </Show>
                                    </div>
                                </div>
                            </Show>
                        </div>
                    </div>
                </div>
            </Body>

            {/* crear tramite */}
            <Show condicion={option == 'CREATE'}>
                <CreateTramite 
                    dependencia_id={query.dependencia_id || ""}
                    isClose={(e) => setOption("")}
                    user={tab == 'DEPENDENCIA' ? boss.user || {} : app_context.auth || {}}
                    onSave={handleOnSave}
                />
            </Show>

            {/* visualizador de archivo */}
            <Show condicion={option == 'VISUALIZADOR'}>
                <Visualizador
                    id={current_file.id || '_error'}
                    observation={current_file.observation || ""}
                    name={current_file.name || ""}
                    extname={current_file.extname || ""}
                    url={current_file.url || ""}
                    onClose={(e) => setOption("")}
                    onUpdate={(e) => {
                        if (current_render == 'LIST') getTracking()
                        else setCurrentRefresh(true);
                    }}
                />
            </Show>
        </div>
    )
}

// server
InboxIndex.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    query.dependencia_id = typeof query.dependencia_id != 'undefined' ? query.dependencia_id : "";
    // request
    let { success, role, boss } = await tramite.get(`auth/role`, { headers: { DependenciaId: query.dependencia_id } }, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, status: 501, role: {}, boss: {} }));
    // response
    return { pathname, query, success, role, boss };
}

// exportar
export default InboxIndex;