import React, { useContext, useEffect, useState } from 'react';
import Router from 'next/router';
import { Body } from '../../../components/Utils';
import Show from '../../../components/show';
import { Button, Message } from 'semantic-ui-react'
import { SelectAuthEntityDependencia } from '../../../components/select/authentication';
import CreateTramite from '../../../components/tramite/createTramite';
import btoa from 'btoa';
import { AppContext } from '../../../contexts/AppContext';
import Skeleton from 'react-loading-skeleton';
import { tramite } from '../../../services/apis';
import moment from 'moment';
import { AUTHENTICATE } from '../../../services/auth';

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

const InboxIndex = ({ pathname, query, success, role, boss }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [tab, setTab] = useState("YO");
    const [option, setOption] = useState("");
    const [form, setForm] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);

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
    const getStatus = (status) => {
        let datos = {
            REGISTRADO: {
                text: "R",
                className: "badge-success"
            }
        };
        // response
        return datos[status] || {};
    }

    // obtener trackings
    const getTracking = async (add = false) => {
        setCurrentLoading(true);
        await tramite.get(`auth/tracking/${tab}`, { headers: { DependenciaId: query.dependencia_id } })
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
    }

    // más información
    const information = (slug) => {
        let { push } = Router;
        push({ pathname: `${pathname}/${slug}`, query });
        setTab('YO');
    }

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
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
        if (success) getTracking();
    }, [query.dependencia_id, tab]);

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

                    <div className="row mb-4">
                        <div className="col-xs mb-2">
                            <Button color="teal" basic 
                                onClick={(e) => setOption("CREATE")}
                                disabled={!query.dependencia_id}
                            >
                                <i className="fas fa-plus"></i> Trámite nuevo
                            </Button>
                        </div>

                        <div className="col-md-4 mb-2">
                            <SelectAuthEntityDependencia
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
                    </div>

                    <Show condicion={query.dependencia_id}
                        predeterminado={
                            <div>
                                <hr/>
                                <Message color="yellow">
                                    Porfavor seleccione una dependencia!
                                </Message>
                            </div>
                        }
                    >
                        <div className="nav-custom-content">
                            <div className="row">
                                <div className="col-md-3">
                                    <div className={`nav-custom ${tab == 'YO' ? 'active' : ''}`} onClick={(e) => setTab("YO")}>
                                        <i className="fas fa-inbox"></i>  Yo
                                    </div>
                                </div>

                                <Show condicion={success && role && role.level && role.level == 'SECRETARY'}>
                                    <div className="col-md-3">
                                        <div className={`nav-custom ${tab == 'DEPENDENCIA' ? 'active' : ''}`} onClick={(e) => setTab("DEPENDENCIA")}>
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
                                        <tr className="table-select table-item" key={`lista-table-${indexD}`}>
                                            <th width="10%" onClick={(e) => information(d.tramite && d.tramite.slug)}>
                                                <span className="badge badge-dark font-13">
                                                    {d.tramite && d.tramite.slug || ""}
                                                </span>
                                            </th>
                                            <td>
                                                <div className="text-ellipsis cursor-pointer" onClick={(e) => information(d.tramite && d.tramite.slug)}>
                                                    <b>{d.tramite && d.tramite.asunto || ""}</b>
                                                </div>
                                                {d.files.map((f, indexF) => 
                                                    <a href="http://localhost:8000" 
                                                        target="_blank" 
                                                        className="item-attach font-12"
                                                        style={{ display: 'none' }}
                                                        key={`list-file-${indexF}`}
                                                    >
                                                        <i className={`fas fa-file-${f.extname}`}></i> {f.name || ""} 
                                                    </a>
                                                )}
                                            </td>
                                            <th width="20%" onClick={(e) => information(d.tramite && d.tramite.slug)} className="lowercase">
                                                <span className="capitalize">{d.person && d.person.fullname || ""}</span>
                                            </th>
                                            <th width="20%" onClick={(e) => information(d.tramite && d.tramite.slug)} className="lowercase">
                                                <span className="capitalize">
                                                    {d.dependencia_origen && d.dependencia_origen.nombre || ""}
                                                </span>
                                            </th>
                                            <th width="15%" onClick={(e) => information(d.tramite && d.tramite.slug)}>
                                                {moment(d.created_at).format('DD/MM/YYYY hh:ss a')}
                                            </th>
                                            <th width="5%" onClick={(e) => information(d.id)}>
                                                <span className={`badge ${getStatus(d.status).className}`}>{getStatus(d.status).text || ""}</span>
                                            </th>
                                        </tr>
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
                </div>
            </Body>

            {/* crear tramite */}
            <Show condicion={option == 'CREATE'}>
                <CreateTramite 
                    dependencia_id={query.dependencia_id || ""}
                    isClose={(e) => setOption("")}
                    user={tab == 'DEPENDENCIA' ? boss.user || {} : app_context.auth || {}}
                    onSave={(e) => getTracking()}
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