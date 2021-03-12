import React, { useState, useContext, useEffect  } from 'react';
import BoardSimple from '../../components/boardSimple';
import { Form, Button, Message } from 'semantic-ui-react';
import { SelectAuthEntityDependencia } from '../../components/select/authentication';
import { SelectTramiteType } from '../../components/select/tramite'; 
import { AppContext } from '../../contexts/AppContext';
import { tramite } from '../../services/apis';
import Skeleton from 'react-loading-skeleton';
import Show from '../../components/show';
import CardReportTramite from '../../components/tramite/cardReportTramite';
import { EntityContext } from '../../contexts/EntityContext';

const PlaceholderTramite = () => {
    const datos = [1, 2, 3, 4];
    return datos.map(d => 
        <div className="col-md-3 mb-2"
            key={`list-placeholder-${d}`}
        >
            <Skeleton height="200px"/>
        </div>    
    )
} 


const ReportIndex = () => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [form, setForm] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_page, setCurrentPage] = useState(1);
    const [current_total, setCurrentTotal] = useState(0);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_data, setCurrentData] = useState([]);
    const [is_filter, setIsFilter] = useState(false);

    // cargar entity
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // dependencia por defecto
    const dependenciaDefault = (dependencias = []) => {
        if (!form.dependencia_id) {
            let isAllow = dependencias.length;
            if (isAllow >= 2) {
                let current_dependencia = dependencias[1];
                let dependencia_id = current_dependencia.value;
                setForm({ ...form, dependencia_id });
                setIsFilter(true);
            }
        }
    }

    // obtener tramites
    const getTramites = async (add = false) => {
        setCurrentLoading(true);
        let query = `page=${current_page}`;
        // filtros
        await Object.keys(form).map(key => query += `&${key}=${form[key]}`);
        let options = {
            headers: {
                DependenciaId: form.dependencia_id || ""
            }
        };
        // request
        await tramite.get(`auth/tramite?${query}`, options)
        .then(res => {
            let { tramites } = res.data;
            setCurrentLastPage(tramites.lastPage || 0);
            setCurrentTotal(tramites.total || 0);
            setCurrentData(add ? [...current_data, ...tramites.data] : tramites.data);
        }).catch(err => {
            console.log(err.message);
        });
        setCurrentLoading(false);
    }

    // limpiar datos de tramite
    const clearTramites = () => {
        setCurrentPage(1);
        setCurrentTotal(0);
        setCurrentLastPage(0);
        setCurrentData([]);
    }

    // primera carga
    useEffect(() => {
        if (is_filter && form.dependencia_id) getTramites();
        else clearTramites();
    }, [is_filter]);

    // quitar is filter
    useEffect(() => {
        if (is_filter) setIsFilter(false);
    }, [is_filter]);

    // siguient pagina
    useEffect(() => {
        if (current_page > 1) getTramites(true);
    }, [current_page]);

    // render
    return (
        <div className="col-md-12">
            <BoardSimple
                title="Reporte de trámite"
                prefix="RT"
                bg="danger"
                info={["Filtrar trámites según dependencia"]}
                options={[]}
            >
                <div className="card-body mt-4">
                    <h4><i className="fas fa-filter"></i> Filtros avanzados</h4>
                    <Form>
                        <div className="row">
                            <div className="col-md-4 mb-2">
                                <input type="text"
                                    name="query_search"
                                    placeholder="Buscar por: Código, N° documento, Asunto y Archivo"
                                    value={form.query_search || ""}
                                    onChange={({ target }) => handleInput(target)}
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <SelectAuthEntityDependencia
                                    onReady={dependenciaDefault}
                                    name="dependencia_id"
                                    entity_id={entity_context.entity_id}
                                    onChange={(e, obj) => {
                                        handleInput(obj)
                                        clearTramites();
                                        setIsFilter(true);
                                    }}
                                    value={form.dependencia_id}
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <SelectTramiteType
                                    name="tramite_type_id"
                                    onChange={(e, obj) => {
                                        handleInput(obj)
                                        clearTramites();
                                        setIsFilter(true);
                                    }}
                                    value={form.tramite_type_id}
                                />
                            </div>

                            <div className="col-md-2 mb-2">
                                <Button fluid
                                    color="blue"
                                    disabled={!form.dependencia_id}
                                    onClick={(e) => {
                                        clearTramites();
                                        setIsFilter(true);
                                    }}
                                >
                                    <i className="fas fa-search"></i>
                                </Button>
                            </div>

                            <div className="col-md-12 mb-2">
                                <hr/>
                            </div>

                            <div className="col-md-12 mb-3">
                                Resultado <b>{current_data.length || 0}</b> de <b>{current_total}</b>
                            </div>

                            {current_data.map((d, indexD) => 
                                <div className="col-md-3 col-lg-3 mb-2"
                                    key={`list-tramite-${indexD}`}
                                >  
                                    <CardReportTramite object={d}/>
                                </div>  
                            )}

                            {/* no hay datos */}
                            <Show condicion={!current_loading && !current_data.length}>
                                <div className="col-md-12">
                                    <Message info className="text-center">
                                        No se encontró registros
                                    </Message>
                                </div>
                            </Show>

                            {/* preloader */}
                            <Show condicion={current_loading}>
                                <PlaceholderTramite/>
                            </Show>

                            {/* next page */}
                            <Show condicion={current_last_page >= (current_page + 1)}>
                                <div className="col-md-12 mt-4 text-center">
                                    <hr/>
                                    <Button fluid
                                        onClick={(e) => setCurrentPage(current_page + 1)}
                                    >
                                        <i className="fas fa-arrow-down"></i> Obtener más datos
                                    </Button>
                                </div>
                            </Show>
                        </div>
                    </Form>
                </div>
            </BoardSimple>
        </div>
    );
}

export default ReportIndex;