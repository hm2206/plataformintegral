import React, { useContext, useState } from 'react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import { Form, Button, Pagination } from 'semantic-ui-react';
import { BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../boardSimple';
import CreateCronograma from './create-cronograma';
import { microPlanilla } from "../../../services/apis";

const ListCronograma = ({ principal = true, pathname, query, cronogramas }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [options, setOptions] = useState();
    const [year, setYear] = useState(query.year || "");
    const [mes, setMes] = useState(query.mes || "");
    const [block, setBlock] = useState(false);

    // búscar
    const handleSearch = async () => {
        let { push } = Router;
        query.year = year;
        query.mes = mes;
        await push({ pathname, query });
    }

    // refresh to create
    const handleSave = (cronograma) => {
        setOptions();
        setYear(cronograma.year);
        setMes(cronograma.month);
        handleSearch();
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
        await microPlanilla.get(`historials/${year}/${mes}/exports.xlsx`, { responseType: "blob" })
        .then(({ data }) => {
            app_context.setCurrentLoading(false);
            let a = document.createElement('a');
            a.href = URL.createObjectURL(data);
            a.download = `report_${year}_${mes}.xlsx`;
            a.target = "_blank";
            a.click();
        }).catch(() => {
            Swal.fire({ icon: 'error', text: "No se puedo generar el excel" })
            app_context.setCurrentLoading(false);
        });
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
        setOptions('CREATE');
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
                    headers={ ["#ID", "Planilla", "F. Creado", "N° Trabajadores", "Estado"]}
                    index={
                        [
                            {
                                key: "id",
                                type: "text"
                            }, 
                            {
                                key: "planilla.name",
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
                                key: "createdAt",
                                type: "date"
                            },
                            {
                                key: "historialsCount",
                                type: "icon",
                                bg: 'dark'
                            },
                            {
                                key: "state",
                                type: "option",
                                data: [
                                    { key: 1, text: "En Curso", className: "badge-success" },
                                    { key: 0, text: "Cerrada", className: "badge-danger" }
                                ]
                            }
                        ]
                    }
                    options={
                        [
                            // {
                            //     key: "edit",
                            //     icon: "fas fa-pencil-alt",
                            //     title: "Editar cronograma",
                            //     rules: {
                            //         key: "state",
                            //         value: 1
                            //     }
                            // }, 
                            {
                                key: "informacion",
                                icon: "fas fa-info",
                                title: "Visualizar cronograma detalladamente",
                            },
                            {
                                key: "add",
                                icon: "fas fa-user-plus",
                                title: "Agregar trabajadores al cronograma",
                                rules: {
                                    key: "state",
                                    value: 1
                                }
                            }, 
                            {
                                key: "remove",
                                icon: "fas fa-user-minus",
                                title: "Eliminar trabajadores al cronograma",
                                rules: {
                                    key: "state",
                                    value: 1
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
                    data={cronogramas.items || []}>
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
                                        disabled={!cronogramas.meta?.totalItems}
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
            {/* modales */}
            <Show condicion={options == 'CREATE'}>
              <CreateCronograma
                onClose={() => setOptions()}
                principal={principal}
                onSave={handleSave}    
              />
            </Show>
        </div>
    )
}

// exportar
export default ListCronograma;