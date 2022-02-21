import React, { useContext, useEffect, useState } from 'react';
import Show from '../../components/show';
import Router from 'next/router';
import { AUTHENTICATE } from '../../services/auth';
import { Form, Button, Pagination, Select } from 'semantic-ui-react';
import { microPlanilla } from '../../services/apis';
import BoardSimple from '../../components/boardSimple';
import { AppContext } from '../../contexts/AppContext';
import { BtnFloat } from '../../components/Utils';
import { Confirm } from '../../services/utils';
import { EntityContext } from '../../contexts/EntityContext';
import urljoin from "url-join"

const ItemBoleta = ({ data, is_check = false, onClick = null }) => {

    // estados
    const [history, setHistory] = useState({});

    useEffect(() => {
        setHistory(data || {});
    }, [data]);

    // renderizado
    return (
        <tr>
            <td>{history.id || ""}</td>
            <td className="capitalize">{history?.info?.contract?.work?.person?.fullName || ""}</td>
            <td>
                <span className="badge badge-primary">{history?.cronograma?.year || ""}</span>
            </td>
            <td>
                <span className="badge badge-dark">{history?.cronograma?.month || ""}</span>
            </td>
            <td>
                <span className="badge badge-dark">{history?.info?.contract?.typeCategory?.typeCargo.name || ""}</span>
            </td>
            <td className="text-center">
                <span className="badge badge-warning">{history?.info?.contract?.typeCategory?.name || ""}</span>
            </td>
            <td className="text-center">
                <div className="btn-group">
                    <Show condicion={!is_check}
                        predeterminado={
                            <button className="btn btn-sm btn-danger"
                                onClick={(e) => typeof onClick == 'function' ? onClick(e, 'DELETE') : null}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        }
                    >
                        <button className="btn btn-sm btn-outline-success"
                            onClick={(e) => typeof onClick == 'function' ? onClick(e, 'ADD') : null}
                        >
                            <i className="fas fa-check"></i>
                        </button>
                    </Show>
                </div>
            </td>
        </tr>
    )
}


const IndexBoleta = ({ pathname, query, historial }) => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [query_search, setQuerySearch] = useState("");
    const [type_boleta, setTypeBoleta] = useState("boleta");
    const [historial_select, setHistorialSelect] = useState([]);

    // realizar busqueda
    const handleSearch = async () => {
        let { push } = Router;
        query.query_search = query_search;
        query.page = 1;
        await push({ pathname, query });
    }

    // obtener boleta
    const handleBoleta = async () => {
        let answer = await Confirm("warning", `¿Estas seguro en generar las boletas?`, 'Generar');
        if (!answer) return false;
        const ids = historial_select.join(":");
        const link = urljoin(microPlanilla.path, `historials/${ids}/ticketCollection.pdf`);
        const a = document.createElement("a");
        a.href = link;
        a.target = "__blank";
        a.click();
        setHistorialSelect([]);
    }

    // toggle select
    const toggleSelect = (obj, option) => {
        switch (option) {
            case 'ADD':
                setHistorialSelect([...historial_select, obj.id]);
                break;
            case 'DELETE':
                let index = historial_select.indexOf(obj.id);
                if (index >= 0) {
                    let newDatos = historial_select.filter(h => h != obj.id);
                    setHistorialSelect(newDatos);
                }
                break;
            default:
                break;
        }
    }

    // siguiente página
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        query.query_search = query_search;
        await push({ pathname, query });
    }

    // obtener entity
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, [])

    // renderizar
    return (
        <div className="col-md-12">
            <BoardSimple
                title="Boleta"
                info={["Historial de boletas"]}
                prefix="B"
                bg="danger"
                options={[]}
            >
                <div className="card-body">
                    <Form className="mb-3">
                        <div className="row">
                            <div className="col-md-6 mb-1 col-6 col-sm-6 col-xl-5">
                                <Form.Field>
                                    <input type="text"  
                                        placeholder="Buscar Boletas: Apellidos y Nombres" 
                                        name="query_search"
                                        value={query_search || ""}
                                        onChange={({ target }) => setQuerySearch(target.value || "")}
                                    />
                                </Form.Field>
                            </div>
                            <div className="col-md-4 mb-1 col-4 col-sm-4 col-xl-3">
                                <Form.Field>
                                    <Select  placeholder="Tipo de Boleta"
                                        name="type_boleta"
                                        options={[
                                            { key: 'default', value: 'boleta', text: 'Predeterminada' },
                                            // { key: 'airhsp', value: 'boleta_airhsp', text: 'Airhsp' }
                                        ]}
                                        value={type_boleta || "boleta"}
                                        onChange={(e, obj) => setTypeBoleta(obj.value || "")}
                                    />
                                </Form.Field>
                            </div>
                            <div className="col-md-3 col-6 col-sm-12 col-xl-2 mb-1">
                                <Button 
                                    fluid
                                    color="blue"
                                    onClick={handleSearch}
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
                                    <th>#ID</th>
                                    <th>Apellidos y Nombre</th>
                                    <th>Año</th>
                                    <th>Mes</th>
                                    <th>Cargo</th>
                                    <th className="text-center">Tip. Categoría</th>
                                    <th className="text-center">Opciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <Show condicion={historial?.items?.length}>
                                    {historial?.items?.map((d, indexD) => 
                                        <ItemBoleta 
                                            key={`list-boleta-history-${indexD}`}
                                            data={d}
                                            onClick={(e, option) => toggleSelect(d, option)}
                                            is_check={historial_select.includes(d.id) ? true : false}
                                        />
                                    )}
                                </Show>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="text-center">
                    <hr/>
                    <Pagination activePage={query.page || 1} 
                        totalPages={historial.meta?.totalPages || 0}
                        onPageChange={handlePage}
                    />
                </div>

                {/* botton flotante */}
                <Show condicion={historial_select.length}>
                    <BtnFloat onClick={handleBoleta}>
                        <i className="fas fa-paper-plane"></i>
                    </BtnFloat>
                </Show>
            </BoardSimple>
        </div>
    )
}

IndexBoleta.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // filtros
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
    // request
    let query_string = `page=${query.page}&querySearch=${query.query_search}`;
    let historial = await microPlanilla.get(`historials?${query_string}`, {}, ctx)
        .then(res => res.data)
        .catch(() => ({}));
    // response
    return { pathname, query, historial };
}

export default IndexBoleta;