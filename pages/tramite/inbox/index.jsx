import React, { useContext, useEffect, useState } from 'react';
import Router from 'next/router';
import { BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import { Button, Message, Form } from 'semantic-ui-react'
import { SelectAuthEntityDependencia } from '../../../components/select/authentication';
import CreateTramite from '../../../components/tramite/createTramite';
import { AppContext } from '../../../contexts/AppContext';
import { tramite } from '../../../services/apis';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { system_store } from '../../../services/verify.json';
import TableTracking from '../../../components/tramite/tableTracking';
import RenderShow from '../../../components/tramite/renderShow';
import BoardSimple from '../../../components/boardSimple';
import { TramiteProvider } from '../../../contexts/TramiteContext';
import dynamic from 'next/dynamic';
const Visualizador = dynamic(() => import('../../../components/visualizador'), { ssr: false });


// menus
const current_status_default = [
    { key: "INBOX", icon: 'fas fa-inbox', text: 'Recibidos', index: 0, filtros: ['RECIBIDO', 'COPIA'], count: 0 },
    { key: "DERIVADO", icon: 'fas fa-paper-plane', text: 'Enviados', index: 1, filtros: ['DERIVADO', 'RESPONDIDO'], count: 0 },
    { key: "PENDIENTE", icon: 'fas fa-thumbtack', text: 'Pendientes', index: 2, filtros: ['PENDIENTE'], count: 0 },
    { key: "REGISTRADO", icon: 'far fa-file', text: 'Regístrados', index: 3, filtros: ['REGISTRADO'], count: 0 },
    { key: "ACEPTADO", icon: 'fas fa-check', text: 'Aceptados', index: 4, filtros: ['ACEPTADO'], count: 0 },
    { key: "RECHAZADO", icon: 'fas fa-times', text: 'Rechazados', index: 5, filtros: ['RECHAZADO'], count: 0 },
    { key: "ANULADO", icon: 'fas fa-trash', text: 'Anulados', index: 6, filtros: ['ANULADO'], count: 0 },
    { key: "FINALIZADOS", icon: 'fas fa-check-double', text: 'Finalizados', index: 7, filtros: ['FINALIZADO'], count: 0 }
];

const InboxIndex = ({ pathname, query, success, role, boss }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_status, setCurrentStatus] = useState(current_status_default);
    const [current_refresh, setCurrentRefresh] = useState(false);
    const [current_execute, setCurrentExecute] = useState(false);
    const [tab, setTab] = useState("YO");
    const [option, setOption] = useState("");
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
    const [current_tramite, setCurrentTramite] = useState({});
    const [current_tracking, setCurrentTracking] = useState({});
    const [current_next, setCurrentNext] = useState("");

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

    // obtener tacking_status
    const getTrackingStatus = async () => {
        await tramite.get(`auth/status?modo=${tab}`, { headers: { DependenciaId: query.dependencia_id } })
        .then(async res => {
            let { success, message, tracking_status } = res.data;
            if (!success) throw new Error(message);
            // setting datos
            let payload = JSON.parse(JSON.stringify(current_status));
            await payload.map(async (s, indexS) => {
                let count = 0;
                await s.filtros.map(async f => {
                    count += typeof tracking_status[f] != 'undefined' ? parseInt(tracking_status[f]) : 0;
                });
                // add count
                s.count = count;
            });
            // setting datos
            setCurrentStatus(payload);
        }).catch(err => console.log(err))
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
            setIsMenu(true);
            setCurrentMenu(current);
            setCurrentRender('LIST');
            setDatos([]);
            setCurrentPage(1);
            setCurrentTotal(0);
        }
    }

    // manejador de creado
    const handleOnSave = () => {
        setOption("");
        setCurrentTramite({});
        setCurrentRender("LIST");
        if (current_menu.index == 3) {
            setCurrentRefresh(true);
            setCurrentExecute(true);
        }
        else handleSelectMenu(3);
    }

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
            getTrackingStatus();
        }
    }, [query.dependencia_id]);

    // cambio de menu obtener tracking
    useEffect(() => {
        if (is_menu) {
            setCurrentExecute(true);
            setCurrentRefresh(true);
        }
    }, [is_menu])

    // cambio de tab
    useEffect(() => {
        if (is_tab) {
            setCurrentRefresh(true);
            setCurrentExecute(true);
        }
    }, [is_tab]);

    // cambiar de estado
    useEffect(() => {
        if (current_refresh) {
            getTrackingStatus(); 
            setCurrentRefresh(false);
        } 
    }, [current_refresh]);
    
    // cambiar de estado el execute
    useEffect(() => {
        if (current_execute) setCurrentExecute(false);
    }, [current_execute])

    // render
    return (
        <div className="col-md-12">
            <BoardSimple 
                bg="primary"
                prefix="TD"
                options={[]}
                title={
                    <span>Bandeja de Entrada 
                        <i className="fas fa-arrow-right ml-2 mr-2"></i> 
                        <span className={`badge ${getRole().className}`}>{getRole().text}</span>
                    </span>
                }
                info={['Bandeja de entrada del trámite documentario']}
            >
                <TramiteProvider value={{ 
                    dependencia_id: query.dependencia_id,
                    refresh: current_refresh,
                    setRefresh: setCurrentRefresh,
                    execute: current_execute,
                    setExecute: setCurrentExecute,
                    query_search: query_search,
                    setQuerySearch: setQuerySearch,
                    menu: current_menu,
                    setMenu: setCurrentMenu,
                    is_menu: is_menu,
                    setIsMenu: setIsMenu,
                    tab: tab,
                    setTab: setTab,
                    is_tab: is_tab,
                    setIsTab: setIsTab,
                    loading: current_loading,
                    setLoading: setCurrentLoading,
                    page: current_page,
                    setPage: setCurrentPage,
                    total: current_total,
                    setTotal: setCurrentTotal,
                    last_page: current_last_page,
                    setLastPage: setCurrentLastPage,
                    datos: datos,
                    setDatos: setDatos,
                    tramite: current_tramite, 
                    setTramite: setCurrentTramite,
                    tracking: current_tracking,
                    setTracking: setCurrentTracking,
                    file: current_file,
                    setFile: setCurrentFile,
                    option: option,
                    setOption: setOption,
                    render: current_render,
                    setRender: setCurrentRender,
                    role: role,
                    boss: boss,
                    setNext: setCurrentNext,
                    next: current_next,
                 }}>
                    <div className="card-body">
                        <Form>
                            <div className="row mb-1">
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

                                <div className="col-md-6 mb-2">
                                    <input type="text"
                                        placeholder="Buscar trámite por código, numero de documento y nombre de archivo"
                                        value={query_search || ""}
                                        onChange={({ target }) => setQuerySearch(target.value)}
                                        disabled={current_loading}
                                    />
                                </div>

                                <div className="col-md-2 mb-2">
                                    <Button color="blue" basic
                                        onClick={(e) => {
                                            setCurrentExecute(true);
                                            if (current_render == 'LIST') setCurrentRefresh(true);
                                        }}
                                    >
                                        <i className="fas fa-sync"></i>
                                    </Button>
                                </div>

                                <div className="col-md-12">
                                    <hr/>
                                </div>
                            </div>
                        </Form>

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
                                        <ul className="mb-2 nav nav-tab flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                                            <li className="nav-item mail-section">
                                                {current_status.map((s, indexS) => 
                                                    <a className={`nav-link text-left cursor-pointer ${indexS === current_menu.index ? 'active' : ''}`}
                                                        key={`item-menu-mail-${indexS}-${s.key}`}
                                                        onClick={(e) => handleSelectMenu(indexS)}
                                                    >
                                                        <span><i className={s.icon}></i> {s.text}</span>
                                                        <span className="badge badge-warning float-right">{s.count ? s.count : ''}</span>
                                                    </a>
                                                )}
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="col-xl-10 col-md-9">
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
                                                <TableTracking/>
                                            </div>
                                        </Show>

                                        {/* render show */}
                                        <Show condicion={current_render == 'SHOW'}>
                                            <RenderShow/>
                                        </Show>
                                    </div>
                                </div>
                        </Show>
                    </div>

                    {/* btn crear */}
                    <Show condicion={current_render == 'LIST'}>
                        <BtnFloat onClick={(e) => {
                            setCurrentNext('');
                            setOption('CREATE')
                        }}>
                            <i className="fas fa-plus"></i>
                        </BtnFloat>
                    </Show>

                    {/* crear tramite */}
                    <CreateTramite 
                        show={option == 'CREATE' ? true : false}
                        isClose={(e) => {
                            setOption("")
                            setCurrentTramite({})
                            setCurrentNext("");
                        }}
                        user={tab == 'DEPENDENCIA' ? boss.user : app_context.auth || {}}
                        onSave={handleOnSave}
                    />

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
                                setCurrentRefresh(true);
                                setCurrentExecute(true);
                            }}
                        />
                    </Show>
                </TramiteProvider>
            </BoardSimple>
        </div>
    )
}

// server
InboxIndex.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    VERIFY(ctx, system_store.TRAMITE_DOCUMENTARIO, pathname);
    query.dependencia_id = typeof query.dependencia_id != 'undefined' ? query.dependencia_id : "";
    // request tracking
    let { success, role, boss } = await tramite.get(`auth/role`, { headers: { DependenciaId: query.dependencia_id } }, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, status: 501, role: {}, boss: {} }));
    // response
    return { pathname, query, success, role, boss };
}

// exportar
export default InboxIndex;