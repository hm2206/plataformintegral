import React, { useContext, useState, useEffect } from 'react'
import { BtnFloat } from '../../../components/Utils';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Button, Form, Pagination } from 'semantic-ui-react'
import { escalafon } from '../../../services/apis';
import DataTable from '../../../components/datatable';
import btoa from 'btoa';
import BoardSimple from '../../../components/boardSimple';
import { EntityContext } from '../../../contexts/EntityContext'; 
import { AppContext } from '../../../contexts';
import ReportProvider from '../../../providers/escalafon/ReportProvider'
import Swal from 'sweetalert2';
import Visualizador from '../../../components/visualizador';
import { Confirm } from '../../../services/utils'
import { SelectCargo } from '../../../components/select/cronograma'
import Show from '../../../components/show'

const reportProvider = new ReportProvider();

const IndexWork = ({ pathname, query, success, works }) => {

    // estados
    const [query_search, setQuerySearch] = useState(query.query_search || "");
    const [cargo_id, setCargoId] = useState(query.cargo_id || "")
    const [current_file, setCurrentFile] = useState({})

    const isFile = Object.keys(current_file || {}).length

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);
    

    // obtener opciones
    const handleOption = async (obj, key, index) => {
        switch (key) {
            case 'profile':
                let newQuery =  {};
                newQuery.id = btoa(obj.id);
                newQuery.href = btoa(location.href);
                await Router.push({ pathname: `${pathname}/${key}`, query: newQuery });
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
        query.cargo_id = cargo_id;
        push({ pathname, query });
    }

    // siguiente página
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // crear trabajador
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

    const reportGeneral = async () => {
        let answer = await Confirm('info', `¿Deseas generar el reporte de trabajadores activos?`, 'Generar')
        if (!answer) return; 
        app_context.setCurrentLoading(true);
        reportProvider.general({ cargo_id })
        .then(res => {
            let name = "reporte-general.pdf"
            let file = new File([res.data], name);
            let url = URL.createObjectURL(res.data);
            let extname = "pdf";
            let size = file.size
            setCurrentFile({ name, url, extname, size });
            app_context.setCurrentLoading(false);
        }).catch(err => {
            Swal.fire("No se pudó generar el reporte");
            app_context.setCurrentLoading(false);
        })
    }

    const onOption = (e, index, obj) => {
        switch (obj.key) {
            case 'pdf-work':
                reportGeneral();
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // renderizar
    return (
        <div className="col-md-12">
            <BoardSimple
                prefix="T"
                title="Trabajadores"
                info={["Listado de trabajadores"]}
                bg="danger"
                options={[
                    { key: "pdf-work", title: "Generar reporte de trabajadores activos", icon: "fas fa-file-pdf" }
                ]}
                onOption={onOption}
            >
                <Form>
                    <div className="col-md-12">
                        <DataTable
                            headers={["#ID", "Imagen", "Apellidos y Nombres", "N° Documento", "N° Cussp", "Estado"]}
                            data={works?.data || []}
                            index={[
                                { key: "person.id", type: "text" },
                                { key: "person.image_images.image_50x50", type: 'cover' },
                                { key: "person.fullname", type: "text", className: "uppercase" },
                                { key: "person.document_number", type: "icon" },
                                { key: "numero_de_cussp", type: "icon", bg: 'dark' },
                                { key: "__meta__.infos_count", type: "switch", bg_true: "success", bg_false: "danger", is_true: "Activo", is_false: "Inactivo" }
                            ]}
                            options={[
                                { key: "profile", icon: "fas fa-info" }
                            ]}
                            getOption={handleOption}
                        >
                            <div className="col-md-12 mt-2">
                                <div className="row">
                                    <div className="col-md-6 mb-1 col-12">
                                        <Form.Field>
                                            <input type="text" 
                                                placeholder="Buscar trabajador por: Apellidos y Nombres"
                                                name="query_search"
                                                value={query_search || ""}
                                                onChange={({ target }) => setQuerySearch(target.value)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-1 col-8">
                                        <SelectCargo
                                            value={cargo_id}
                                            onChange={(e, obj) => setCargoId(obj.value)}
                                        />
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
                                <h4>Resultados: {works?.data?.length || 0} de {works?.total || 0}</h4>
                            </div>

                        </DataTable>
                        <div className="text-center">
                            <hr/>
                            <Pagination activePage={query.page || 1} 
                                totalPages={works?.lastPage || 0}
                                onPageChange={handlePage}
                            />
                        </div>
                    </div>

                    <BtnFloat onClick={handleCreate}>
                        <i className="fas fa-plus"></i>
                    </BtnFloat>
                </Form>

                {/* visualizador */}
                <Show condicion={isFile}>
                    <Visualizador id="visualizador-item"
                        onClose={() => setCurrentFile({})}
                        name={current_file?.name}
                        extname={current_file?.extname}
                        url={current_file?.url}
                        is_observation={false}
                        is_print={true}
                    />
                </Show>
            </BoardSimple>
        </div>
    )
}

// server
IndexWork.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // filtros
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
    query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
    // request
    let { success, works } = await escalafon.get(`works?page=${query.page}&query_search=${query.query_search}&cargo_id=${query.cargo_id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, works: {} }));
    // response
    return { pathname, query, success, works };
}

// exportar
export default IndexWork;