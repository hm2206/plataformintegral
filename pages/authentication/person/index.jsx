import React, { useState } from 'react'
import { BtnFloat } from '../../../components/Utils';
import Router from 'next/router';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { Button, Form, Pagination } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import DataTable from '../../../components/datatable';
import btoa from 'btoa';
import BoardSimple from '../../../components/boardSimple';
import { system_store } from '../../../services/verify.json';

const IndexPerson = ({ pathname, query, success, people }) => {

    const [query_search, setQuerySearch] = useState(query.query_search || "");
    
    // next page
    const handlePage = async (e, { activePage }) => {
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // realizar búsqueda
    const handleSearch = async () => {
        let { push } = Router;
        query.page = 1;
        query.query_search = query_search
        await push({ pathname, query });
    }

    // obtener opciones
    const getOption = async (obj, key, index) => {
        switch (key) {
            case 'edit':
                let newQuery =  {};
                newQuery.id = btoa(obj.id);
                newQuery.href = btoa(location.href);
                await Router.push({ pathname: `${pathname}/${key}`, query: newQuery });
                break;
            default:
                break;
        }
    }

    // crear people
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

    // renderizar
    return (
        <div className="col-md-12">
            <BoardSimple
                prefix="P"
                bg="danger"
                options={[]}
                title="Persona"
                info={["Lista de personas"]}
            >
                <Form>
                    <div className="col-md-12">
                        <DataTable
                            headers={["#ID", "Foto", "Apellidos y Nombres", "N° Documento", "Fecha de Nac."]}
                            data={people && people.data || []}
                            index={[
                                { key: "id", type: "text" },
                                { key: 'image_images.image_50x50', type: 'cover' },
                                { key: "fullname", type: "text", className: "uppercase" },
                                { key: "document_number", type: "icon" },
                                { key: "date_of_birth", type: "date", bg: 'dark' }
                            ]}
                            options={[
                                { key: "edit", icon: "fas fa-pencil-alt" }
                            ]}
                            getOption={getOption}
                        >
                            <div className="col-md-12 mt-2">
                                <div className="row">
                                    <div className="col-md-7 mb-1 col-10">
                                        <Form.Field>
                                            <input type="text" 
                                                placeholder="Buscar trabajador por: Apellidos y Nombres"
                                                name="query_search"
                                                value={query_search || ""}
                                                onChange={({ target }) => setQuerySearch(target.value)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-xs col-2">
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
                                <h4>Resultados: {(people.data && people.data.length || 0) * (people.page || 1)} de {people.total || 0}</h4>
                            </div>
                        </DataTable>
                        
                        <div className="text-center">
                            <hr/>
                            <Pagination activePage={query.page} 
                                totalPages={people.lastPage || 1}
                                onPageChange={handlePage}
                            />
                        </div>
                    </div>

                    <BtnFloat
                        onClick={handleCreate}
                    >
                        <i className="fas fa-plus"></i>
                    </BtnFloat>
                </Form>
            </BoardSimple>
        </div>
    )
}

// server
IndexPerson.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    await VERIFY(ctx, system_store.AUTHENTICATION, pathname);
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
    // request
    let query_string = `page=${query.query_search}&query_search=${query.query_search}`;
    let { success, people } = await authentication.get(`person?${query_string}`, {}, ctx)
        .then(res =>  res.data)
        .catch(err => ({ success: false, people: {} }))
    // response
    return { pathname, query, success, people }
}

// exportar
export default IndexPerson;