import React, { useContext, useState, useEffect } from 'react';
import Router from 'next/router';
import { Form, Button, Select, Checkbox, Pagination } from 'semantic-ui-react';
import Show from '../../components/show';
import { Body, SimpleList } from '../../components/Utils';
import { authentication } from '../../services/apis';
import Swal from 'sweetalert2';
import ModalTracking from '../../components/tramite/modalTracking';
import ModalNextTracking from '../../components/tramite/modalNextTracking';
import ModalSend from '../../components/tramite/modalSend';
import ModalInfo from '../../components/tramite/modalInfo';
import moment from 'moment';
import { tramite } from '../../services/apis';
import { AppContext } from '../../contexts/AppContext';
import { TrackingContext } from '../../contexts/tracking/TrackingContext';
import { SelectAuthEntityDependencia } from '../../components/select/authentication';


const TableTracking = ({ title, query, onSearch, url }) => {

    // app
    const app_context = useContext(AppContext)

    // obtener tracking
    const { tracking, current_status, current_loading, setRefresh } = useContext(TrackingContext);

    // estados
    const [form, setForm] = useState({
        dependencia_id: query.dependencia_id
    });
    const [option, setOption] = useState({});
    const [config, setConfig] = useState({});
    const [semaforo, setSemaforo] = useState([]);
    const [current_config, setCurrentConfig] = useState({});
    const [send, setSend] = useState(false);

    // vaciar el form
    useEffect(() => {
        if (!app_context.entity_id) {
            query.dependencia_id = "";
        }
    }, [app_context.entity_id]);

    // obtener configuraciones
    useEffect(() => {
        if (app_context.entity_id && query.dependencia_id && query.status) {
            getConfig();
            getSemaforo();
        } else {
            setConfig({});
            setSemaforo([]);
        } 
    }, [app_context.entity_id, query.dependencia_id, query.status]);

    // obtener configuración para el next paso
    const getConfig = async () => {
        await tramite.get(`config/${query.status || '__error'}?variable=NEXT`)
            .then(res  => {
                let { success, message, config } = res.data;
                if (!success) throw new Error(message);
                setCurrentConfig(config);
            }).catch(err => setCurrentConfig({}));
    }

    // obtener configuración para el semaforo
    const getSemaforo = async (page = 1, add = false) => {
        await tramite.get(`config?variable=DAY_LIMIT&page=${page || 1}`)
            .then(async res  => {
                let { success, message, config } = res.data;
                if (!success) throw new Error(message);
                let { data, lastPage } = config;
                setSemaforo(add ? [...semaforo, ...data] : data);
                if (lastPage > page + 1) await getSemaforo(page + 1, true);
            }).catch(err =>  setSemaforo([]));
    }

    // seleccionar la primera dependencia
    const SelectDependenciaDefault = async (my_dependencias) => {
        if (!query.dependencia_id) {
            let count = my_dependencias.length;
            if (count >= 2) {
                query.dependencia_id = my_dependencias[1].value;
                query.query_search = "";
                query.page = 1;
                let { pathname, push } = Router;
                push({ pathname, query });
            }
        }
    }

    // cambiar el form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // manejador de búsqueda
    const handleSearch = async () => {
        let { push, pathname } = Router;
        let { query_search } = form;
        query.query_search = query_search || "";
        query.page = 1;
        push({ pathname, query });
        setRefresh(true);
        setSend(true);
        // fireSearch
        if (typeof onSearch == 'function') onSearch(true);
    }

    // cambiar de option
    const getOption = (obj, key, index) => {
        let newOption = Object.assign({}, option);
        newOption.key = key;
        newOption.tracking = obj;
        setOption(newOption);
    }

    // cambiar de estado
    const handleStatus = async (status) => {
        let { push, pathname } = Router;
        query.status = status;
        push({ pathname, query });
        setRefresh(true);
    }

    // dia actual
    const getCurrentDay = (_timestamp) => {
        let current = moment(moment().format('YYYY-MM-DD'));
        let comparar = moment(moment(_timestamp).format('YYYY-MM-DD'));
        let dias = current.diff(comparar, 'days');
        let lag = {
            VERDE: 'success',
            AMARILLO: 'warning',
            ROJO: 'red'
        };
        // get semaforo
        for (let sem of semaforo) {
            switch (sem.key) {
                case 'VERDE':
                case 'AMARILLO':
                    if (dias <= sem.value) return lag[sem.key];
                    break;
                case 'ROJO':
                    if (dias >= sem.value) return lag[sem.key];
                    break;
                default:
                    return lag['VERDE'];
            }
        }
        // response default
        return lag['VERDE'];
    }

    // meta información
    const getMeta = (status) => {
        let datos = {
            "REGISTRADO":  { className: 'badge-dark', next: true },
            "PENDIENTE":  { className: 'badge-orange', next: true },
            "DERIVADO": { className: "badge-purple", next: false },
            "ACEPTADO": { className: "badge-primary", next: false },
            "RECHAZADO": { className: "badge-danger", next: false },
            "FINALIZADO": { className: "badge-dark", next: false },
            "ANULADO": { className: "badge-red", next: false },
            "COPIA": { className: "badge-dark", next: false }
        }
        // response 
        return datos[status];
    }

    // manejador de pagina
    const handlePage = async (e, { activePage }) => {
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // render
    return (
        <div className="col-md-12">
            <Body>
                <div className="car card-fluid">
                    <div className="card-header">
                        {title}
                    </div>

                    <div className="card-body">
                        <div className="mt-3 mb-4">
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="list-group list-group-bordered">
                                        <SimpleList 
                                            icon="fas fa-table" 
                                            bg="dark" 
                                            title="Regístrados" 
                                            count={current_status && current_status.REGISTRADO}
                                            onClick={(e) => handleStatus("REGISTRADO")}
                                            active={query.status == 'REGISTRADO'}
                                        />

                                        <SimpleList 
                                            icon="fas fa-hourglass-start" 
                                            bg="orange" 
                                            title="Pendientes" 
                                            count={current_status && current_status.PENDIENTE}
                                            onClick={(e) => handleStatus("PENDIENTE")}
                                            active={query.status == 'PENDIENTE'}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="list-group list-group-bordered">
                                        <SimpleList 
                                            icon="fas fa-share" 
                                            bg="purple" 
                                            title="Derivados" 
                                            count={current_status && current_status.DERIVADO}
                                            onClick={(e) => handleStatus("DERIVADO")}
                                            active={query.status == 'DERIVADO'}
                                        />

                                        <SimpleList 
                                            icon="fas fa-bell" 
                                            bg="warning" 
                                            title="Entradas" 
                                            count={current_status && current_status.ENVIADO}
                                            onClick={(e) => getOption({}, 'ENVIADO', 0)}
                                            active={query.key == 'ENVIADO'}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="list-group list-group-bordered">
                                        <SimpleList 
                                            icon="fas fa-clipboard-list" 
                                            bgIcon="secundary" 
                                            bg="primary" 
                                            title="Aceptados" 
                                            count={current_status && current_status.ACEPTADO}
                                            onClick={(e) => handleStatus("ACEPTADO")}
                                            active={query.status == 'ACEPTADO'}
                                        />

                                        <SimpleList 
                                            icon="fas fa-exclamation" 
                                            bgIcon="secundary"
                                            bg="danger" 
                                            title="Rechazados" 
                                            count={current_status && current_status.RECHAZADO}
                                            onClick={(e) => handleStatus("RECHAZADO")}
                                            active={query.status == 'RECHAZADO'}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="list-group list-group-bordered">
                                        <SimpleList 
                                            icon="fas fa-check" 
                                            title="Finalizados" 
                                            count={current_status && current_status.FINALIZADO}
                                            onClick={(e) => handleStatus("FINALIZADO")}
                                            active={query.status == 'FINALIZADO'}
                                        />

                                        <SimpleList 
                                            icon="fas fa-times" 
                                            bg="red" 
                                            title="Anulados" 
                                            count={current_status && current_status.ANULADO}
                                            onClick={(e) => handleStatus("ANULADO")}
                                            active={query.status == 'ANULADO'}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <hr/>
                            </div>
                        </div>

                                <Form className="mb-3">
                                    <div className="row">
                                        <div className="col-md-12 mb-4">
                                            <div className="row">
                                                {semaforo.map(sem => 
                                                    <div className="col-md-4 mb-2" key={`semaforo-list-${sem.id}`}>
                                                        <div className="list-group list-group-bordered">
                                                            <SimpleList 
                                                                icon="fas fa-traffic-light" 
                                                                title={`Dias (${sem.value})`} 
                                                                bg={sem.key == 'ROJO' ? 'red' : sem.key == 'AMARILLO' ? 'warning' : 'success'}
                                                            />
                                                        </div>    
                                                    </div>
                                                )}
                                            </div>
                                            <hr/>
                                        </div>

                                        <div className="col-md-4 mb-1 col-12 col-sm-5 col-xl-3">
                                            <Form.Field>
                                                <input
                                                    placeholder="Ingres el código del trámite" 
                                                    name="query_search"
                                                    defaultValue={`${form.query_search || ""}`}
                                                    disabled={current_loading || !query.dependencia_id}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>
                                        <div className="col-md-5 mb-1 col-12 col-sm-6 col-xl-4">
                                            <Form.Field>
                                                <SelectAuthEntityDependencia
                                                    name="dependencia_id"
                                                    entity_id={app_context.entity_id}
                                                    value={query.dependencia_id}
                                                    disabled={current_loading || !app_context.entity_id}
                                                    onReady={SelectDependenciaDefault}
                                                    onChange={(e, obj) => {
                                                        let { push, pathname } = Router;
                                                        query.dependencia_id = obj.value;
                                                        push({ pathname, query });
                                                        setRefresh(true);
                                                        setSend(true);
                                                    }}
                                                />
                                            </Form.Field>
                                        </div>
                                        <div className="col-md-4 mb-1 col-12 col-sm-6 col-xl-2">
                                            <Form.Field>
                                                <Checkbox 
                                                    className="mt-2" 
                                                    label='Copia'
                                                    toggle
                                                    disabled={current_loading || !query.dependencia_id}
                                                    name="status"
                                                    checked={query.status == 'COPIA'}
                                                    onChange={async (e, obj) => {
                                                        let { push, pathname } = Router;
                                                        query.status = obj.checked ? 'COPIA' : 'REGISTRADO';
                                                        push({ pathname, query });
                                                        setRefresh(true);
                                                    }}
                                                />
                                            </Form.Field>
                                        </div>
                                        <div className="col-md-3 col-12 col-sm-12 col-xl-2 mb-1">
                                            <Button 
                                                fluid
                                                onClick={handleSearch}
                                                disabled={current_loading || !query.dependencia_id}
                                                color="blue"
                                            >
                                                <i className="fas fa-search mr-1"></i>
                                                <span>Buscar</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <hr/>
                                </Form>

                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>SM</th>
                                                <th>N° Seguimiento</th>
                                                <th>Tip. Trámite</th>
                                                <th>Asunto</th>
                                                <th>Orígen</th>
                                                <th>Fecha</th>
                                                <th>Estado</th>
                                                <th>Opciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tracking && tracking.data && tracking.data.map((tra, indexT) => 
                                                <tr key={`tracking-${tra.id}-${indexT}`} className={config && config.value && (((tracking.page - 1) * tracking.perPage) + (indexT + 1) > config.value) ? 'text-muted bg-disabled' : ''}>
                                                    <td>
                                                        <span className={`tile tile-circle bg-${getCurrentDay(tra.updated_at)}`.toLowerCase()}>
                                                            <i className="fas fa-traffic-light"></i> 
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <b className="badge badge-dark">{tra.slug}</b>
                                                    </td>
                                                    <td>{tra.description}</td>
                                                    <td>{tra.asunto}</td>
                                                    <td>
                                                        <b className="badge badge-dark">{tra.dependencia_origen.nombre}</b>
                                                    </td>
                                                    <td>
                                                        <b className="badge badge-red">{moment(tra.updated_at).format('DD/MM/YYYY h:mm a')}</b>
                                                    </td>
                                                    <td>
                                                        <b className={`badge ${getMeta(tra.status).className}`}>{tra.status}</b>
                                                    </td>
                                                    <td>
                                                        <div className="row justify-content-center">
                                                            <a className="mr-1 btn btn-sm btn-icon btn-secondary" href="#" 
                                                                title="Seguimiento del Tramite"
                                                                onClick={(e) => getOption(tra, 'TRACKING', indexT)}
                                                            >
                                                                <i className="fas fa-search"></i> 
                                                            </a>
                                                            <a className="mr-1 btn btn-sm btn-icon btn-secondary" href="#598" 
                                                                title="Más información"
                                                                onClick={(e) => getOption(tra, 'INFO', indexT)}
                                                            >
                                                                <i className="fas fa-info"></i> 
                                                            </a>

                                                            <Show condicion={getMeta(tra.status).next}>
                                                                <Show condicion={current_config && current_config.value  && !((((tracking.page - 1) * tracking.perPage) + (indexT + 1) > current_config.value))}>
                                                                    <a className="mr-1 btn btn-sm btn-icon btn-secondary" href="#598" 
                                                                        title="Continuar Trámite"
                                                                        onClick={(e) => getOption(tra, 'NEXT', indexT)}
                                                                    >
                                                                        <i className="fas fa-arrow-right"></i> 
                                                                    </a>
                                                                </Show>

                                                                <Show condicion={!Object.keys(current_config || {}).length}>
                                                                    <a className="mr-1 btn btn-sm btn-icon btn-secondary" href="#598" 
                                                                        title="Continuar Trámite"
                                                                        onClick={(e) => getOption(tra, 'NEXT', indexT)}
                                                                    >
                                                                        <i className="fas fa-arrow-right"></i> 
                                                                    </a>
                                                                </Show>                                                                
                                                            </Show>
                                                        </div>
                                                    </td>
                                                </tr>    
                                            )}

                                            <Show condicion={!current_loading && !(tracking && tracking.data && tracking.data.length)}>
                                                <tr>
                                                    <td colSpan="7" className="text-center">No hay registros disponibles</td>
                                                </tr>
                                            </Show>
                                        </tbody>
                                    </table>

                                    <hr/>

                                    <div className="text-center">
                                        <Pagination
                                            totalPages={tracking && tracking.lastPage || 1}
                                            activePage={query.page || 1}
                                            onPageChange={handlePage}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>      
                </Body>
                {/* options tracking */}
                <Show condicion={option.key == 'TRACKING'}>
                    <ModalTracking tramite={option.tracking}
                        isClose={(e) => getOption({}, "")}
                    />
                </Show>
                {/* tramites enviados */}
                <Show condicion={(send && current_status.ENVIADO) || option.key == 'ENVIADO'}>
                    <ModalSend 
                        url={url}
                        query={query}
                        onAction={getOption} isClose={async (e) => {
                            setSend(false);
                            getOption({}, '', 0);
                            let { pathname, push } = Router;
                            query.status = 'PENDIENTE';
                            push({ pathname, query });
                            setRefresh(true);
                        }}
                    />
                </Show>
                {/* options next */}
                <Show condicion={option.key == 'NEXT'}>
                    <ModalNextTracking 
                        tramite={option.tracking}
                        query={query}
                        isClose={async (e) => {
                            getOption({}, "");
                            let { push, pathname } = Router;
                            push({ pathname, query });
                            setRefresh(true);
                        }}
                        entity_id={app_context.entity_id || ""}
                    />
                </Show>
                {/* options info */}
                <Show condicion={option.key == 'INFO'}>
                    <ModalInfo tracking={option.tracking}
                        query={query}
                        isClose={(e) => getOption({}, "")}
                    />
                </Show>
            </div>
        )
}

export default TableTracking;
