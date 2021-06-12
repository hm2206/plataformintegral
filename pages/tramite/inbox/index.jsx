import React, { useContext, useEffect, useReducer } from 'react';
import Router, { useRouter } from 'next/router';
import { TramiteSocketProvider } from '../../../contexts/sockets/TramiteSocket';
import { BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import { Button, Message, Form } from 'semantic-ui-react'
import { SelectAuthEntityDependencia } from '../../../components/select/authentication';
import CreateTramite from '../../../components/tramite/createTramite';
import { tramite } from '../../../services/apis';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { system_store } from '../../../services/verify.json';
import InboxShow from '../../../components/tramite/inboxShow';
import BoardSimple from '../../../components/boardSimple';
import InboxMenu from '../../../components/tramite/inboxMenu';
import InboxTab from '../../../components/tramite/inboxTab';
import { TramiteProvider, TramiteContext } from '../../../contexts/tramite/TramiteContext';
import dynamic from 'next/dynamic';
import { EntityContext } from '../../../contexts/EntityContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { tramiteTypes } from '../../../contexts/tramite/TramiteReducer';
const Visualizador = dynamic(() => import('../../../components/visualizador'), { ssr: false });

const reducer = (state, { type, payload }) => {
    let newState = Object.assign({}, state);
    switch (type) {
        case 'SET_DEPENDENCIA_ID':
            newState.dependencia_id = payload;
            return newState;
        default:
            return newState;
    }
};

const InboxContent = ({ pathname, query }) => {

    // router
    const router = useRouter();

    // auth
    const { auth } = useContext(AuthContext);

    // entity
    const entity_context = useContext(EntityContext);

    // tramite
    const tramite_context = useContext(TramiteContext);
    const { dispatch, setOption, setNext, setPage, setIsSearch, setQuerySearch, online, menu } = tramite_context;

    // reducer
    const [state, currentDispatch] = useReducer(reducer, { dependencia_id: "" });

    // cambio de dependencia
    const handleDependencia = ({ value }) => {
        query.dependencia_id = value;
        currentDispatch({ type: 'SET_DEPENDENCIA_ID', payload: value });
        router.push({ pathname, query });
    }

    // seleccionar la primera opción
    const dependenciaDefault = (dependencias = []) => {
        if (!query.dependencia_id) {
            let isAllow = dependencias.length;
            if (isAllow >= 2) {
                let current_dependencia = dependencias[1];
                query.dependencia_id = current_dependencia.value;
                currentDispatch({ type: 'SET_DEPENDENCIA_ID', payload: query.dependencia_id });
                let { push } = Router;
                push({ pathname, query });
            }
        }
    }

    // manejador de creado
    const handleOnSave = (tramite) => {
        setOption([]);
        setPage(1);
        if (menu != 'SENT') {
            setIsSearch(true);
            dispatch({ type: tramiteTypes.CHANGE_MENU, payload: "SENT" });
        } else {
            if (!online) setIsSearch(true);
        }
        // cambiar tab
        dispatch({ type: tramiteTypes.CHANGE_TRACKING, payload: tramite?.tracking || {} });
        dispatch({ type: tramiteTypes.CHANGE_RENDER, payload: 'SHOW' });
        dispatch({ type: tramiteTypes.DECREMENT_FILTRO, payload: 'SENT' })
    }

    // manejador de cambio de observation
    const handleFileObservation = (file) => {
        if (tramite_context.render == 'TAB') setIsSearch(true);
        else dispatch({ type: tramiteTypes.UPDATE_FILE_TRACKING, payload: file });
    }

    // render
    return (
        <>
            <div className="card-body">
                <Form>
                    <div className="row mb-1">
                        <div className="col-md-4 mb-2">
                            <SelectAuthEntityDependencia
                                onReady={dependenciaDefault}
                                entity_id={entity_context.entity_id}
                                name="dependencia_id"
                                onChange={(e, obj) => handleDependencia(obj)}
                                value={query.dependencia_id || ""}
                                disabled={tramite_context.current_loading}
                            />
                        </div>

                        <div className="col-md-6 mb-2">
                            <input type="text"
                                placeholder="Buscar trámite por código, numero de documento y nombre de archivo"
                                value={tramite_context.query_search || ""}
                                onChange={({ target }) => setQuerySearch(target.value)}
                                disabled={tramite_context.current_loading}
                            />
                        </div>

                        <div className="col-md-2 mb-2">
                            <Button color="blue"
                                disabled={tramite_context.current_loading}
                                onClick={(e) => {
                                    setPage(1);
                                    setIsSearch(true);
                                }}
                            >
                                <i className="fas fa-search"></i>
                            </Button>
                        </div>

                        <div className="col-md-12">
                            <hr/>
                        </div>
                    </div>
                </Form>
                {/* body */}
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
                        {/* menu */}
                        <InboxMenu dependencia_id={query.dependencia_id}/>
                        {/* tab */}
                        <Show condicion={tramite_context.render == 'TAB'}>
                            <InboxTab/>
                        </Show>
                        {/* show */}
                        <Show condicion={tramite_context.render == 'SHOW'}>
                            <div className="col-xl-10 col-md-9">
                                <InboxShow/>
                            </div>
                        </Show>
                    </div>
                </Show>
            </div>
            {/* btn crear */}
            <Show condicion={tramite_context.render == 'TAB'}>
                <BtnFloat onClick={(e) => {
                    setNext("");
                    setOption(["CREATE"]);
                }}>
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </Show>
            {/* modals */}
            <CreateTramite 
                show={tramite_context.option.includes('CREATE')}
                isClose={(e) => setOption([])}
                user={tramite_context.tab == 'DEPENDENCIA' ? tramite_context.boss.user : auth || {}}
                onSave={handleOnSave}
            />
            {/* visualizador de archivo */}
            <Show condicion={tramite_context.option.includes('VISUALIZADOR')}>
                <Visualizador
                    id={tramite_context.file?.id || '_error'}
                    observation={tramite_context.file?.observation || ""}
                    name={tramite_context.file?.name || ""}
                    extname={tramite_context.file?.extname || ""}
                    url={tramite_context.file?.url || ""}
                    onClose={(e) => setOption([])}
                    onUpdate={handleFileObservation}
                />
            </Show>
        </>
    )
}


const InboxIndex = ({ pathname, query, success, role, boss }) => {

    // entity
    const entity_context = useContext(EntityContext);

    // props
    const isRole = Object.keys(role).length;

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
 
    // renderizar entity
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // render
    return (
        <TramiteSocketProvider>
            <TramiteProvider 
                dependencia_id={query.dependencia_id || ""}
                role={role} 
                boss={boss}
            >
                <div className="col-12">
                    <BoardSimple 
                        bg="danger"
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
                        <InboxContent 
                            pathname={pathname}
                            query={query}
                        />
                    </BoardSimple>
                </div>
            </TramiteProvider>
        </TramiteSocketProvider>
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