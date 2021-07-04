import React, { useContext, useEffect, useState } from 'react';
import BoardSimple from '../../components/boardSimple';
import TramiteProvider from '../../providers/tramite/TramiteProvider';
import { AuthContext } from '../../contexts/AuthContext';
import { EntityContext } from '../../contexts/EntityContext';
import { system_store } from '../../services/verify.json';
import { AUTHENTICATE, VERIFY } from '../../services/auth';
import Show from '../../components/show';
import { Button, Form, Pagination } from 'semantic-ui-react'
import Router from 'next/router';
import { Confirm } from '../../services/utils';
import { AppContext } from '../../contexts';
import Swal from 'sweetalert2';

// providers
const tramiteProvider = new TramiteProvider();

const AdminTramite = ({ pathname, query, success, tramites }) => {

    // app
    const app_context = useContext(AppContext)

    // auth
    const { auth } = useContext(AuthContext);

    // entity
    const { fireEntity } = useContext(EntityContext);

    // estados
    const [query_search, setQuerySearch] = useState(query.query_search || "");

    const handleSearch = () => {
        query.page = 1;
        query.query_search = query_search;
        Router.push({ pathname, query });
    }

    const handleToggleCurrent = async (tramite, status) => {
        let answer = await Confirm('warning', `¿Estás seguro en ${status == 'enabled' ? 'habilitar el trámite en la dependencia origen' : 'continuar el flujo del trámite'}?`)
        if (!answer) return;
        app_context.setCurrentLoading(true);
        await tramiteProvider.toggleCurrent(tramite.id, { status })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            handleSearch();
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: "No se pudó procesar la operación" })
        })
    }

    const handleDelete = async (tramite) => {
        let answer = await Confirm('warning', '¿Estás seguro en eliminar el trámite?')
        if (!answer) return;
        app_context.setCurrentLoading(true);
        await tramiteProvider.delete(tramite.id)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            handleSearch();
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: "No se pudó eliminar el trámite" })
        })
    }

    const handlePage = async (e, { activePage }) => {
        query.page = activePage;
        Router.push({ pathname, query });
    }

    // effect
    useEffect(() => {
        fireEntity({ render: true });
        return () => fireEntity({ render: false });
    }, []);

    // render
    return (
        <div className="col-12">
            <BoardSimple
                prefix="T"
                bg="danger"
                options={[]}
                title="Trámites"
                info={["Lista de todos los trámites"]}
            >
                <div className="card-body mt-4">
                    <Form>
                        <div className="row">
                            <div className="col-md-4">
                                <Form.Field>
                                    <input type="text" 
                                        placeholder="Ingrese el asunto o código del trámite"
                                        name="query_search"
                                        value={query_search || ""}
                                        onChange={({ target }) => setQuerySearch(target.value || "")}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-2">
                                <Button color="blue" 
                                    fluid
                                    onClick={handleSearch}
                                >
                                    <i className="fas fa-search"></i>
                                </Button>
                            </div>

                            <div className="col-12">
                                <hr/>
                            </div>

                            <div className="col-12">
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead className="font-12 text-center">
                                            <tr>
                                                <th width="5%">Código</th>
                                                <th width="30%" className="text-left">Asunto</th>
                                                <th width="7%">Tipo</th>
                                                <th width="10%">Documento</th>
                                                <th width="15%">Origen</th>
                                                <th width="15%">Propietario</th>
                                                <th width="5%">Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>    
                                        <tbody>
                                            {tramites?.data?.map(tra =>
                                                <tr key={`list-tramite-${tra.id}`}>
                                                    <td>
                                                        <span className="badge badge-dark">{tra?.slug}</span>
                                                    </td>
                                                    <td>
                                                        <div>{tra?.asunto}</div>
                                                    </td>
                                                    <td>{tra?.tramite_type?.description || ""}</td>
                                                    <td>{tra?.document_number}</td>
                                                    <td>
                                                        <span className="badge badge-warning">{tra?.dependencia?.nombre || ""}</span>
                                                    </td>
                                                    <td className="capitalize">
                                                        {tra?.person?.fullname || ""}
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`badge badge-${tra?.current_tracking?.status ? 'success' : 'danger'}`}>{tra?.current_tracking?.status || 'ANULADO'}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <Button.Group size="mini">
                                                            <Show condicion={tra.state && tra?.current_tracking ? true : false}>
                                                                <Show condicion={tra?.__meta__?.current_tracking_count > 1 && tra?.current_tracking?.first}>
                                                                    <Button onClick={() => handleToggleCurrent(tra, 'disabled')}>
                                                                        <i className="fas fa-sync"></i>
                                                                    </Button>
                                                                </Show>

                                                                <Show condicion={!tra?.current_tracking?.first}>
                                                                    <Button color="black" basic 
                                                                        title="Activar dependencia origen"
                                                                        onClick={() => handleToggleCurrent(tra, 'enabled')}    
                                                                    >
                                                                        <i className="fas fa-circle"></i>
                                                                    </Button>
                                                                </Show>
                                                            </Show>

                                                            <Button onClick={() => handleDelete(tra)} 
                                                                color="red"
                                                                title="Eliminar trámite"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </Button>
                                                        </Button.Group>
                                                    </td>
                                                </tr>    
                                            )}
                                            <Show condicion={!tramites?.total}>
                                                <tr>
                                                    <th className="text-center" colSpan="8">No se encontró registros disponibles</th>
                                                </tr>
                                            </Show>
                                        </tbody>
                                    </table>   
                                </div> 
                                <Show condicion={tramites?.lastPage > 1}>
                                    <div className="text-center">
                                        <Pagination
                                            onPageChange={handlePage}
                                            activePage={query.page || 1}
                                            totalPages={tramites.lastPage || 0}
                                        /> 
                                    </div> 
                                </Show>                     
                            </div>
                        </div>
                    </Form>
                </div>
            </BoardSimple>
        </div>
    )
}

AdminTramite.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    await VERIFY(ctx, system_store.TRAMITE_DOCUMENTARIO, pathname);
    let { success, tramites } = await tramiteProvider.index(query, {}, ctx)
    .then(res => res.data)
    .catch(() => ({ success: false, tramites: {} }))
    // response
    return { pathname, query, success, tramites }
}

export default AdminTramite;