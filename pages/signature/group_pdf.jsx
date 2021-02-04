import React, { useContext, useEffect, useState } from 'react';
import Router from 'next/router';
import { Body } from '../../components/Utils';
import Show from '../../components/show';
import { Button, Message } from 'semantic-ui-react'
import { SelectAuthEntityDependencia } from '../../components/select/authentication';
import CreateTramite from '../../components/tramite/createTramite';
import { AppContext } from '../../contexts/AppContext';
import Skeleton from 'react-loading-skeleton';
import { tramite } from '../../services/apis';
import { AUTHENTICATE } from '../../services/auth';
import FileSimple from '../../components/fileSimple';
import DirSimple from '../../components/dirSimple';
 

const PlaceholderTable = () => {
    let datos = [1, 2, 3, 4];
    return datos.map(indexD => 
        <tr key={`list-table-placeholder-${indexD}`}>
            <td><Skeleton height="30px"/></td>
            <td><Skeleton height="30px"/></td>
        </tr>    
    )
}

// menus
const current_status_default = [
    { key: "INBOX", icon: 'fas fa-inbox', text: 'Recibidos', index: 0, filtros: ['RECIBIDO'], count: 0 },
    { key: "DERIVADO", icon: 'fas fa-paper-plane', text: 'Enviados', index: 1, filtros: ['DERIVADO', 'RESPONDIDO'], count: 0 },
    { key: "PENDIENTE", icon: 'fas fa-thumbtack', text: 'Pendientes', index: 2, filtros: ['PENDIENTE'], count: 0 },
    { key: "REGISTRADO", icon: 'far fa-file', text: 'Regístrados', index: 3, filtros: ['REGISTRADO'], count: 0 },
    { key: "ACEPTADO", icon: 'fas fa-check', text: 'Aceptados', index: 4, filtros: ['ACEPTADO'], count: 0 },
    { key: "RECHAZADO", icon: 'fas fa-times', text: 'Rechazados', index: 5, filtros: ['RECHAZADO'], count: 0 },
    { key: "ANULADO", icon: 'fas fa-trash', text: 'Anulados', index: 6, filtros: ['ANULADO'], count: 0 },
    { key: "FINALIZADOS", icon: 'fas fa-check-double', text: 'Finalizados', index: 7, filtros: ['FINALIZADO'], count: 0 }
];

const GroupPdf = ({ pathname, query, success, role, boss }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_status, setCurrentStatus] = useState(current_status_default);
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
    const [current_tramite, setCurrentTramite] = useState({});

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

    // manejador de creado
    const handleOnSave = () => {
        setOption("");
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
    }, [query.dependencia_id]);

    // cambio de menu obtener tracking
    useEffect(() => {
    
    }, [is_menu])

    // cambiar de estado
    useEffect(() => {
        if (current_refresh) setCurrentRefresh(false);
    }, [current_refresh]);

    // render
    return (
        <div className="col-md-12">
            <Body>
                <div className="card-header">
                    Firma masiva de PDF
                </div>

                <div className="card-body">
                    <div className="card">
                        <div className="card-body">
                            <div className="row mb-4">
                                <div className="col-xs ml-2">
                                    <Button color="green" basic>
                                        <i className="fas fa-plus"></i> Nuevo grupo
                                    </Button>
                                </div>

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
                                    <div className="col-md-3">
                                        <DirSimple name="Unidad de Tecnología de la Información - CARQSXR7D8"/>
                                    </div>
                                    {/* files */}
                                    <div className="col-md-3">
                                        <FileSimple extname="docx" name="https://fontawesome.com/icons?d=listing&q=image.png" size={100}/>
                                    </div>

                                    <div className="col-md-3">
                                        <FileSimple extname="txt"/>
                                    </div>

                                    <div className="col-md-3">
                                        <FileSimple extname="pdf"/>
                                    </div>

                                    <div className="col-md-3">
                                        <FileSimple extname="jpeg"/>
                                    </div>

                                    <div className="col-md-3">
                                        <FileSimple extname="mp3"/>
                                    </div>

                                    <div className="col-md-3">
                                        <FileSimple extname="mp4"/>
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
                    current_tramite={current_tramite}
                    dependencia_id={query.dependencia_id || ""}
                    isClose={(e) => {
                        setOption("")
                        setCurrentTramite({})
                    }}
                    user={tab == 'DEPENDENCIA' ? boss.user || {} : app_context.auth || {}}
                    onSave={handleOnSave}
                />
            </Show>
        </div>
    )
}

// server
GroupPdf.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    query.dependencia_id = typeof query.dependencia_id != 'undefined' ? query.dependencia_id : "";
    // request tracking
    let { success, role, boss } = await tramite.get(`auth/role`, { headers: { DependenciaId: query.dependencia_id } }, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, status: 501, role: {}, boss: {} }));
    // response
    return { pathname, query, success, role, boss };
}

// exportar
export default GroupPdf;