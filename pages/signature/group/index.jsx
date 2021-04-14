import React, { useContext, useEffect, useState } from 'react';
import Router from 'next/router';
import { Body, BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import { Button, Message, Form } from 'semantic-ui-react'
import { SelectAuthEntityDependencia } from '../../../components/select/authentication';
import CreateGroup from '../../../components/signature/group/createGroup';
import { AppContext } from '../../../contexts/AppContext';
import { AUTHENTICATE } from '../../../services/auth';
import { SignatureProvider } from '../../../contexts/SignatureContext';
import ListarGroup from '../../../components/signature/group/listarGroup';
import BoardSimple from '../../../components/boardSimple';
import { EntityContext } from '../../../contexts/EntityContext';
 

const GroupPdf = ({ pathname, query }) => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [current_refresh, setCurrentRefresh] = useState(false);
    const [tab, setTab] = useState("LIST");
    const [option, setOption] = useState("");
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [query_search, setQuerySearch] = useState("");
    const [current_group, setCurrentGroup] = useState({});

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

    // montar componente
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, [query.dependencia_id]);

    // cambiar de estado
    useEffect(() => {
        if (current_refresh) setCurrentRefresh(false);
    }, [current_refresh]);

    // render
    return (
        <div className="col-md-12">
            <BoardSimple 
                bg="danger"
                prefix="FM"
                title="Firma Masiva de PDF"
                info={['Firmar PDF según lo requerido']}
                options={[]}
            >
                <Body>
                    <SignatureProvider value={{ 
                        refresh: current_refresh,
                        setRefresh: setCurrentRefresh,
                        dependencia_id: query.dependencia_id,
                        query_search: query_search,
                        setQuerySearch: setQuerySearch,
                        page: current_page,
                        setPage: setCurrentPage,
                        last_page: current_last_page,
                        setLastPage: setCurrentLastPage,
                        total: current_total,
                        setTotal: setCurrentTotal,
                        datos: datos,
                        setDatos: setDatos,
                        tab: tab,
                        setTab: setTab,
                        group: current_group,
                        setGroup: setCurrentGroup,
                    }}>
                        <div className="card-body">
                            <Form className="w-100">
                                <div className="row mb-4">
                                    <Form.Field className="col-md-4 mb-2">
                                        <input type="text"
                                            value={query_search || ""}
                                            onChange={({ target }) => setQuerySearch(target.value)}
                                            placeholder="Buscar: título o descripción de grupo"
                                        />
                                    </Form.Field>

                                    <div className="col-md-4 mb-2">
                                        <SelectAuthEntityDependencia
                                            onReady={dependenciaDefault}
                                            entity_id={entity_context.entity_id || ""}
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
                                        <Button color="blue" 
                                            basic 
                                            onClick={(e) => {
                                                setCurrentPage(1);
                                                setCurrentRefresh(true);
                                            }}
                                        >
                                            <i className="fas fa-sync"></i>
                                        </Button>
                                    </div>
                                </div>
                            </Form>

                            <hr/>

                            <div className="" style={{ minHeight: '70vh' }}>
                                <Show condicion={query.dependencia_id}
                                    predeterminado={
                                        <div>
                                            <Message color="yellow">
                                                Porfavor seleccione una dependencia!
                                            </Message>
                                        </div>
                                    }
                                >
                                    <ListarGroup/>
                                </Show>
                            </div>
                        </div>
                        {/* crear tramite */}
                        <Show condicion={option == 'CREATE'}>
                            <CreateGroup 
                                isClose={(e) => {
                                    setOption("")
                                    setTab('LIST')
                                }}
                            />
                        </Show>
                    </SignatureProvider>
                </Body>

                <BtnFloat onClick={(e) => setOption("CREATE")}>
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </BoardSimple>
        </div>
    )
}

// server
GroupPdf.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    query.dependencia_id = typeof query.dependencia_id != 'undefined' ? query.dependencia_id : "";
    // response
    return { pathname, query };
}

// exportar
export default GroupPdf;