import React, { useContext, useState, useEffect } from 'react';
import { Button, Form, Select, Pagination } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import DataTable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import { unujobs } from '../../../services/apis';
import { SelectCargo } from '../../../components/select/cronograma';
import { AppContext } from '../../../contexts/AppContext';
import Show from '../../../components/show';
import BoardSimple from '../../../components/boardSimple';
import UpdateRemuneracionMassive from '../../../components/contrato/updateRemuneracionMassive';
import SyncRemuneracionMassive from '../../../components/contrato/syncRemuneracionMassive';
import { EntityContext } from '../../../contexts/EntityContext';

const Contrato = ({ success, infos, query }) => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [option, setOption] = useState("");

    // estados
    const [form, setForm] = useState({ 
        query_search: query.query_search,
        estado: query.estado,
        cargo_id: query.cargo_id
    })

    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // opciones
    const handleOption = (obj, key, index) => {
        let { pathname, push, asPath } = Router;
        switch (key) {
            case 'pay':
            case 'edit':
                let id = btoa(obj.id);
                let href = btoa(asPath || "");
                let query = { clickb: 'Info', id, href };
                push({ pathname: `${pathname}/${key}`, query });
                break;
            default:
                break;
        }
    }

    // cambio del form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm)
    }

    // buscar
    const handleSearch = async (e) => {
        Router.push({ 
            pathname: Router.pathname, 
            query: { 
                query_search: form.query_search || "",
                cargo_id: form.cargo_id || "",
                estado: form.estado || 0,
                page: 1
            } 
        })
    }

    // obtener 
    const handleBoard = (e, index, obj) => {
        switch (obj.key) {
            case 'UPDATE_REMUNERACION_MASSIVE':
            case 'SYNC_REMUNERACION_MASSIVE':
                setOption(obj.key);
                break;
            default:
                break;
        }
    }

    // cambiar de página
    const handlePage = async (e, { activePage }) => {
        let { pathname, query, push } = Router;
        query.page = activePage;
        query.estado = form.estado || 0;
        query.cargo_id = form.cargo_id || "";
        await push({ pathname, query });
    }

    // render
    return (
        <div className="col-md-12">
            <BoardSimple
                prefix="CN"
                title="Contratos y Nombramientos"
                info={["Listado de contratos"]}
                bg="danger"
                options={[
                    { key: "UPDATE_REMUNERACION_MASSIVE", title: 'Actualizar masivamente', icon: 'fas fa-coins' },
                    { key: "SYNC_REMUNERACION_MASSIVE", title: 'Sincronizar masivamente', icon: 'fas fa-sync' }
                ]}
                onOption={handleBoard}
            >
                <Form>
                    <div className="col-md-12">
                        <DataTable
                            headers={["#ID", "Apellidos y Nombres", "Planilla", "Part. Pres", "Estado"]}
                            data={infos.data || []}
                            index={[
                                { key: "id", type: "text" },
                                { key: "person.fullname", type: "text", className: "uppercase" },
                                { key: "planilla.nombre", type: "icon", bg: "primary" },
                                { key: "cargo.alias", type: "icon", bg: "dark" },
                                { key: "estado", type: "switch", is_true: "Activo", is_false: "Terminado"}
                            ]}
                            options={[
                                { key: "pay", icon: "fas fa-coins" }
                            ]}
                            getOption={handleOption}
                        >
                            <div className="col-md-12 mt-2">
                                <div className="row">
                                    <div className="col-md-4 col-sm-4 col-12 col-lg-4 mb-1">
                                        <Form.Field>
                                            <input type="text" 
                                                placeholder="Buscar trabajador por: Apellidos y Nombres, Plaza"
                                                name="query_search"
                                                value={form.query_search || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-3 col-sm-3 col-12 col-lg-3 mb-1">
                                        <Form.Field>
                                            <SelectCargo
                                                name="cargo_id"
                                                value={form.cargo_id}
                                                onChange={(e, obj) => handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>


                                    <div className="col-md-3 col-sm-4 col-9 col-lg-3 mb-1">
                                        <Form.Field>
                                            <Select
                                                placeholder={`Select. Modo de Búsqueda`}
                                                value={`${form.estado}`}
                                                name="estado"
                                                fluid
                                                options={[
                                                    { key: 'activo', value: "1", text: 'Contratos Activos'},
                                                    { key: 'deshabilitado', value: "0", text: 'Contratos Terminados'},
                                                    { key: 'anulados', value: "2", text: 'Contratos Anulados'}
                                                ]}
                                                onChange={(e, obj) => handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-xs col-sm-3 col-3 col-lg-2 mb-1">
                                        <Button color="blue"
                                            fluid
                                            onClick={handleSearch}
                                        >
                                            <i className="fas fa-search"></i>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body mt-4">
                                <Show condicion={success}>
                                    <h4>Resultados: {infos && infos.data && infos.data.length * infos.current_page || 0} de {infos && infos.total}</h4>
                                </Show>
                            </div>
                        </DataTable>
                    
                        <div className="text-center">
                            <hr/>
                            <Pagination activePage={query.page || 1} 
                                totalPages={infos.last_page || 1}
                                onPageChange={handlePage}
                            />
                        </div>
                    </div>
                </Form>

                <Show condicion={option == 'UPDATE_REMUNERACION_MASSIVE'}>
                    <UpdateRemuneracionMassive isClose={(e) => setOption("")}/>
                </Show>

                <Show condicion={option == 'SYNC_REMUNERACION_MASSIVE'}>
                    <SyncRemuneracionMassive isClose={(e) => setOption("")}/>
                </Show>
            </BoardSimple>
    </div>)
}

// server rendering
Contrato.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query } = ctx;
    query.estado = typeof query.estado != 'undefined' ? query.estado : 1;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
    query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
    // request
    let { success, infos } = await unujobs.get(`info?page=${query.page}&estado=${query.estado}&query_search=${query.query_search}&cargo_id=${query.cargo_id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false }))
    console.log(success);
    // response
    return { success, infos: infos || {}, query };
}

// export 
export default Contrato;