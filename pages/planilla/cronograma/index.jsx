import React, { useContext, useEffect, useState } from 'react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import { AUTHENTICATE } from '../../../services/auth';
import { Form, Button, Pagination } from 'semantic-ui-react';
import { BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../../components/boardSimple';
import { EntityContext } from '../../../contexts/EntityContext';


const CronogramaIndex = ({ pathname, query, success, cronogramas }) => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [year, setYear] = useState(query.year || "");
    const [mes, setMes] = useState(query.mes || "");
    const [block, setBlock] = useState(false);

    // setting entity
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // búscar
    const handleSearch = async () => {
        let { push } = Router;
        query.year = year;
        query.mes = mes;
        await push({ pathname, query });
    }

    // obtener opciones
    const getOption = async (obj, key, index) => {
        let { push } = Router;
        // verificar
        switch (key) {
            case 'informacion':
            case 'add':
            case 'remove':
            case 'report':
            case 'edit':
            case 'email':
            case 'edit':
                let newQuery =  {};
                newQuery.id = btoa(obj.id);
                newQuery.href = btoa(location.href);
                await push({ pathname: `${pathname}/${key}`, query: newQuery });
                break;
            default:
                break;
        }
    }

    // exportar datos
    const handleExport = async () => {
        let answer = await Confirm("warning", "¿Deseas exportar los cronogramas a excel?")
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await unujobs.fetch(`exports/personal/${year}/${mes}`)
        .then(resdata => resdata.blob())
        .then(blob => {
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `report_${year}_${mes}.xlsx`;
            a.target = "_blank";
            a.click();
        }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
        app_context.setCurrentLoading(false);
    }

    // siguiente página
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        query.query_search = query_search;
        await push({ pathname, query });
    }

    // crear cronograma
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/register`, query: newQuery });
    }

    // renderizado
    return (
        <div className="col-md-12">
            <BoardSimple
                prefix="C"
                bg="danger"
                options={[]}
                title="Cronograma"
                info={["Lista de planillas por mes"]}
            >
                <Datatable
                    isFilter={false}
                    headers={ ["#ID", "Planilla", "Sede", "F. Creado", "N° Trabajadores", "Estado"]}
                    index={
                        [
                            {
                                key: "id",
                                type: "text"
                            }, 
                            {
                                key: "planilla.nombre",
                                type: "text",
                                children: [
                                    {
                                        key: "adicional",
                                        type: "icon",
                                        prefix: "Adicional"
                                    }
                                ]
                            }, 
                            {
                                key: "sede.descripcion",
                                type: "text"
                            }, 
                            {
                                key: "created_at",
                                type: "date"
                            },
                            {
                                key: "historial_count",
                                type: "icon",
                                bg: 'dark'
                            },
                            {
                                key: "estado",
                                type: "option",
                                data: [
                                    { key: 1, text: "En Curso", className: "badge-success" },
                                    { key: 0, text: "Cerrada", className: "badge-danger" },
                                    { key: 2, text: "Anulada", className: "badge-red" }
                                ]
                            }
                        ]
                    }
                    options={
                        [
                            {
                                key: "error",
                                icon: "fas fa-bug",
                                className: "bg-red",
                                title: "Corregir errores",
                                rules: {
                                    key: "error",
                                    value: 1
                                }
                            },
                            {
                                key: "edit",
                                icon: "fas fa-pencil-alt",
                                title: "Editar cronograma",
                                rules: {
                                    key: "estado",
                                    value: 1
                                }
                            }, 
                            {
                                key: "informacion",
                                icon: "fas fa-info",
                                title: "Visualizar cronograma detalladamente",
                                rules: {
                                    key: "estado",
                                    value: 1,
                                    or: {
                                        key: "error",
                                        value: 0
                                    }
                                }
                            }, 
                            {
                                key: "informacion",
                                icon: "fas fa-info",
                                title: "Visualizar cronograma detalladamente",
                                rules: {
                                    key: "estado",
                                    value: 0,
                                    or: {
                                        key: "error",
                                        value: 0
                                    }
                                }
                            },
                            {
                                key: "add",
                                icon: "fas fa-user-plus",
                                title: "Agregar trabajadores al cronograma",
                                rules: {
                                    key: "estado",
                                    value: 1,
                                    or: {
                                        key: "error",
                                        value: 0
                                    }
                                }
                            }, 
                            {
                                key: "remove",
                                icon: "fas fa-user-minus",
                                title: "Eliminar trabajadores al cronograma",
                                rules: {
                                    key: "estado",
                                    value: 1,
                                    or: {
                                        key: "error",
                                        value: 0
                                    }
                                }
                            }, 
                            {
                                key: "email",
                                icon: "fas fa-paper-plane",
                                title: "Enviar correo",
                                rules: {
                                    key: "estado",
                                    value: 0
                                }
                            },
                            {
                                key: "report",
                                icon: "fas fa-file-alt",
                                title: "Reportes"
                            }
                        ]
                    }
                    getOption={getOption}
                    data={cronogramas.data || []}>
                    <Form className="mb-3">
                        <div className="row">
                            <div className="col-md-4 mb-1 col-6 col-sm-6 col-xl-2">
                                <Form.Field>
                                    <input type="number" 
                                        placeholder="Año" 
                                        name="year"
                                        value={year || ""}
                                        onChange={({ target }) => setYear(target.value)}
                                    />
                                </Form.Field>
                            </div>
                            <div className="col-md-4 mb-1 col-6 col-sm-6 col-xl-2">
                                <Form.Field>
                                    <input type="number" 
                                        min="1" 
                                        max="12" 
                                        placeholder="Mes" 
                                        name="mes"
                                        value={mes || ""}
                                        onChange={({ target }) => setMes(target.value)}
                                    />
                                </Form.Field>
                            </div>
                            <div className="col-md-3 col-6 col-sm-12 col-xl-2 mb-1">
                                <Button 
                                    fluid
                                    onClick={handleSearch}
                                    color="blue"
                                >
                                    <i className="fas fa-search mr-1"></i>
                                    <span>Buscar</span>
                                </Button>
                            </div>

                            <Show condicion={!block}>
                                <div className="col-md-3 col-6 col-sm-12 col-xl-2">
                                    <Button 
                                        fluid
                                        disabled={!cronogramas.total}
                                        color="olive"
                                        onClick={handleExport}
                                    >
                                        <i className="fas fa-share mr-1"></i>
                                        <span>Exportar</span>
                                    </Button>
                                </div>
                            </Show>
                        </div>
                        <hr/>
                    </Form>
                </Datatable>
                {/* paginación */}
                <div className="text-center">
                    <hr/>
                    <Pagination activePage={query.page || 1} 
                        totalPages={cronogramas.last_page || 1}
                        onPageChange={handlePage}
                    />
                </div>
                {/* event create cronograma */}
                <BtnFloat
                    onClick={handleCreate}
                >
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </BoardSimple>
        </div>
    )
}

// server
CronogramaIndex.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // filtros
    let fecha = new Date();
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.year = typeof query.year != 'undefined' ? query.year : fecha.getFullYear();
    query.mes = typeof query.mes != 'undefined' ? query.mes : fecha.getMonth() + 1;
    // obtener datos
    let query_string = `page=${query.page}&year=${query.year}&mes=${query.mes}`;
    let { success, cronogramas } = await unujobs.get(`cronograma?${query_string}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, cronogramas: {} }))
    // response
    return { pathname, query, success, cronogramas }; 
}

// exportar
export default CronogramaIndex;