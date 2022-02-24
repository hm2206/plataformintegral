import React, { useContext, useState, useEffect } from 'react'
import Router from 'next/router';
import { AUTHENTICATE } from '../../services/auth';
import { Button, Form, Pagination } from 'semantic-ui-react'
import { handleErrorRequest, unujobs } from '../../services/apis';
import DataTable from '../../components/datatable';
import BoardSimple from '../../components/boardSimple';
import { InputCredencias, InputAuth, InputEntity } from '../../services/utils';
import { AppContext } from '../../contexts';
import { EntityContext } from '../../contexts/EntityContext';

const optionkeys = {
    RENTA: 'renta'
};

const Renta = ({ pathname, query, success, works }) => {

    // app 
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [query_search, setQuerySearch] = useState(query.query_search || "");
    const [year, setYear] = useState(query.year || "");
    const [option, setOption] = useState("");

    // obtener opciones
    const handleOption = async (obj, key, index) => {
        switch (key) {
            case optionkeys.RENTA:
                report(obj.id);
                break
            default:
                break;
        }
    }

    // realizar búsqueda
    const handleSearch = () => {
        let { push } = Router;
        query.page = 1;
        query.query_search = query_search;
        query.year = year;
        push({ pathname, query });
    }

    // siguiente página
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // report
    const report = async (id) => {
        let form = document.createElement('form');
        form.action = `${unujobs.path}/pdf/renta/${id}/${year}`; 
        form.target = '__blank';
        form.method = 'post';
        // config request
        form.appendChild(InputAuth());
        // add credenciales
        InputCredencias().filter(i => form.appendChild(i));
        // add EntityId
        form.appendChild(InputEntity());
        // add al DOM
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    }

    // mostrar entity
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // renderizar
    return (
        <div className="col-md-12">
            <BoardSimple
                prefix="R"
                title="Renta"
                info={["Listado de Renta anual"]}
                bg="danger"
                options={[]}
            >
                <Form>
                    <div className="col-md-12">
                        <DataTable
                            headers={["#ID", "Imagen", "Apellidos y Nombres", "N° Documento", "N° Cussp"]}
                            data={works.data || []}
                            index={[
                                { key: "person.id", type: "text" },
                                { key: "person.image_images.image_50x50", type: 'cover' },
                                { key: "person.fullname", type: "text", className: "uppercase" },
                                { key: "person.document_number", type: "icon" },
                                { key: "numero_de_cussp", type: "icon", bg: 'dark' }
                            ]}
                            options={[
                                { key: "renta", icon: "far fa-file-alt" }
                            ]}
                            getOption={handleOption}
                        >
                            <div className="col-md-12 mt-2">
                                <div className="row">
                                    <div className="col-md-5 mb-1 col-10">
                                        <Form.Field>
                                            <input type="text" 
                                                placeholder="Buscar trabajador por: Apellidos y Nombres"
                                                name="query_search"
                                                value={query_search || ""}
                                                onChange={({ target }) => setQuerySearch(target.value)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-3 mb-1 col-10">
                                        <Form.Field>
                                            <input type="number" 
                                                placeholder="Año"
                                                name="year"
                                                value={year || ""}
                                                onChange={({ target }) => setYear(target.value)}
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
                                <h4>Resultados: {works.data && works.data.length || 0} de {works.total || 0}</h4>
                            </div>

                        </DataTable>
                        <div className="text-center">
                            <hr/>
                            <Pagination activePage={query.page || 1} 
                                totalPages={works.last_page || 0}
                                onPageChange={handlePage}
                            />
                        </div>
                    </div>
                </Form>
            </BoardSimple>
        </div>
    )
}

// server
Renta.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // filtros
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.year = typeof query.year != 'undefined' ? query.year : new Date().getFullYear();
    query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
    // request
    let { success, works } = await unujobs.get(`work/${query.year}/anual?page=${query.page}&query_search=${query.query_search}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, works: {} }));
    // response
    return { pathname, query, success, works };
}

// exportar
export default Renta;