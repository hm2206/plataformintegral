import React, { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import TeamProvider from '../../providers/signature/notification/TeamProvider';
import { AppContext } from '../../contexts/AppContext';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { Button } from 'semantic-ui-react';
import FileSimple from '../fileSimple';
import Swal from 'sweetalert2';

const configStatus = {
    START: {
        text: "En curso",
        className: "badge badge-light"
    },
    VERIFIED: {
        text: "Verificado",
        className: "badge badge-primary"
    },
    SIGNED: {
        text: "Firmando",
        className: "badge badge-success"
    },
    OVER: {
        text: "Terminado",
        className: "badge badge-dark"
    }
}

// providers
const teamProvider = new TeamProvider();

const ListFiles = ({ notification, group }) => {
    
    // estados
    const [is_error, setIsError] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [last_page, setLastPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [datos, setDatos] = useState([]);

    // options
    const options = {
        headers: { NotificationId: notification.id }
    }

    // memos
    const isGroup = useMemo(() => {
        return Object.keys(group || {}).length;
    }, [group]);

    const getFiles = async (add = false) => {
        setCurrentLoading(true);
        await teamProvider.files(notification.object_id, { page }, options)
        .then(res => {
            let { files } = res.data;
            setTotal(files.total);
            setLastPage(files.lastPage);
            setDatos(add ? [...datos, ...files.data] : files.data);
            setIsError(false);
        }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (isGroup) getFiles();
    }, [isGroup]);

    useEffect(() => {
        if (page > 1) getFiles(true);
    }, [page]);

    return (
        <div className="row">
            {datos.map((f, indexF) => 
                <div className="col-md-4"
                    key={`list-item-file-${indexF}`}
                >
                    <FileSimple name={f?.name}
                        url={f?.url}
                        size={f?.size}
                        extname={f?.extname}
                        date={f?.created_at}
                    />
                </div>
            )}
            {/* next page */}
            <div className="col-12">
                <Button fluid basic
                    disabled={!(last_page >= (page + 1))}
                    onClick={(e) => setPage((prev) => prev + 1)}
                >
                    <i className="fas fa-arrow-down"></i> Obtener más registros
                </Button>
            </div>
        </div>
    )
}

const VerifySignerGroup = ({ notification }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false);
    const [team, setTeam] = useState({});
    const [is_refresh, setIsRefresh] = useState(false);

    // memo
    const current_status = useMemo(() => {
        return configStatus[team?.group?.status] || {};
    }, [team]);

    // options
    const options = {
        headers: { NotificationId: notification.id }
    }
    
    const getTeam = async () => {
        setCurrentLoading(true);
        await teamProvider.show(notification.object_id, options)
        .then(res => {
            let { team } = res.data;
            setTeam(team);
            setIsError(false);
        }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    const verifyTeam = async () => {
        app_context.setCurrentLoading(true);
        await teamProvider.verify(team.id, options)
        .then(res => {
            let { message } = res.data;
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'success', text: message });
            setIsRefresh(true);
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: err.message });
        })
        app_context.setCurrentLoading(false);
    }

    useEffect(() => {
        getTeam();
    }, []);

    useEffect(() => {
        if (is_refresh) getTeam();
    }, [is_refresh]);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    // render
    return (
        <Fragment>
            <div className="card-header">
                <Show condicion={!current_loading}
                    predeterminado={<Skeleton/>}
                >
                    <i className="fas fa-users"></i> Grupo: {team?.group?.title}  
                    <span className="close cursor-pointer" onClick={() => setIsRefresh(true)}>
                        <i className="fas fa-sync"></i>
                    </span>
                </Show>
            </div>

            <div className="card-body">
                <div className="row">
                    <div className="col-md-5">
                        <h5>
                            <Show condicion={!current_loading}
                                predeterminado={<Skeleton/>}
                            >
                                <u><i className="fas fa-i"></i> Información detallada</u>
                            </Show>
                        </h5>
                        <ul>
                            <Show condicion={!current_loading}
                                predeterminado={
                                    <Fragment>
                                        <li><Skeleton/></li>
                                        <li><Skeleton/></li>
                                        <li><Skeleton/></li>
                                        <li><Skeleton/></li>
                                    </Fragment>
                                }
                            >
                                <li>Descripción: <b>{team?.group?.description}</b></li>
                                <li>Certificado Digital: <span className="badge badge-dark">{team?.certificate?.serial_number}</span></li>
                                <li>Página a firmar: <b>{team?.page}</b></li>
                                <li>Posición de Firma: <b>{team?.position}</b></li>
                                <li>Solicitud de permiso: <span className={`badge badge-${team.verify ? 'success' : 'light'}`}>{team.verify ? 'Aceptado' : 'En proceso'}</span></li>
                                <li>Estado del Grupo: <span className={current_status?.className}>{current_status?.text}</span></li>
                            </Show>
                        </ul>
                    </div>
                    <div className="col-md-7">
                        <Show condicion={!current_loading}>
                            <ListFiles group={team?.group}
                                notification={notification}
                            />
                        </Show>
                    </div>
                </div>
            </div>
            {/* pie */}
            <Show condicion={!team.verify}>
                <div className="card-footer">
                    <div className="card-body text-right">
                        <Show condicion={!current_loading}
                            predeterminado={
                                <Skeleton height="40px" width="200px"/>
                            }
                        >
                            <Button color="teal"
                                onClick={verifyTeam}
                            >
                                <i className="fas fa-check"></i> Otorgar Permisos
                            </Button>
                        </Show>
                    </div>
                </div>
            </Show>
        </Fragment>
    )
}

export default VerifySignerGroup;