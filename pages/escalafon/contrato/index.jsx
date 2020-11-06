import React, { useState } from 'react';
import { Button, Form, Select, Pagination } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import DataTable from '../../../components/datatable';
import { BtnFloat } from '../../../components/Utils';
import Router from 'next/router';
import btoa from 'btoa';
import { Body } from '../../../components/Utils';
import { unujobs } from '../../../services/apis';
import { SelectCargo } from '../../../components/select/cronograma';

const Contrato = ({ success, infos, query }) => {

    const [form, setForm] = useState({ 
        query_search: query.query_search,
        estado: query.estado,
        cargo_id: query.cargo_id
    })

    // opciones
    const handleOption = (obj, key, index) => {
        let { pathname, push } = Router;
        switch (key) {
            case 'pay':
            case 'edit':
                let id = btoa(obj.id);
                let query = { clickb: 'Info', id };
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
            <Body>
                <Form>
                    <div className="col-md-12">
                        <DataTable titulo={<span>Lista de Contratos</span>}
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
                                { key: "pay", icon: "fas fa-coins" },
                                { key: "edit", icon: "fas fa-pencil-alt" }
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
                                <h4>Resultados: {infos && infos.data.length * infos.current_page || 0} de {infos && infos.total}</h4>
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

                    <BtnFloat
                        onClick={(e) => Router.push({ pathname: `${Router.pathname}/register` })}
                    >
                        <i className="fas fa-plus"></i>
                    </BtnFloat>
                </Form>
            </Body>
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
    // response
    return { success, infos: infos || {}, query };
}

// export 
export default Contrato;