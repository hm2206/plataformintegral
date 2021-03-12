import React, {Fragment, useContext} from 'react';
import {Button, Form, Pagination} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../../components/boardSimple';

const TypeSindicato = ({ success, type_sindicatos, query }) => {

    const app_context = useContext(AppContext);

    const getOption = async (obj, key, index) => {
        let {pathname, push} = Router;
        let id = btoa(obj.id);
        switch (key) {
            case 'edit':
                await push({ pathname: `${pathname}/${key}`, query: { id } });
                break;
            case 'delete':
                await changedState(obj, 0);
                break;
            case 'restore':
                await changedState(obj, 1);
                break;
            default:
                break;
        }
    }

    const handleSearch = () => {
        let { pathname, query, push } = Router;
        query.page = 1;
        push({ pathname, query });
    }

    const handlePage = async (e, { activePage }) => {
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    const changedState = async (obj, estado = 1) => {
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar'} el Tip. Detalle "${obj.nombre}"?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`type_sindicato/${obj.id}/estado`, { estado })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await handleSearch();
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
        }
    }


    return (
        <Form className="col-md-12">
            <BoardSimple
                title="Tip. Afiliaciones"
                info={["Lista de Tip. Afiliaciones"]}
                prefix="A"
                bg="danger"
                options={[]}
            >
                <Datatable
                    isFilter={false}
                    headers={
                        ["#ID", "Descripción", "Tip. Descuento", "Monto", "Porcentaje", "Estado"]
                    }
                    index={
                        [
                            {
                                key: "id",
                                type: "text"
                            }, 
                            {
                                key: "nombre",
                                type: "text"
                            },
                            {
                                key: "type_descuento.descripcion",
                                type: "icon",
                                bg: "dark",
                                justify: "center"
                            },
                            {
                                key: "monto",
                                type: "text"
                            },
                            {
                                key: "porcentaje",
                                type: "text"
                            },
                            {
                                key: "estado",
                                type: "switch",
                                justify: "center",
                                is_true: "Activo",
                                is_false: "Eliminado"
                            }
                        ]
                    }
                    options={
                        [
                            {
                                key: "edit",
                                icon: "fas fa-pencil-alt",
                                title: "Editar Tip. Afiliación",
                                rules: {
                                    key: "estado",
                                    value: 1
                                }
                            }, 
                            {
                                key: "restore",
                                icon: "fas fa-sync",
                                title: "Restaurar Tip. Afiliación",
                                rules: {
                                    key: "estado",
                                    value: 0
                                }
                            }, 
                            {
                                key: "delete",
                                icon: "fas fa-times",
                                title: "Eliminar Tip. Afiliación",
                                rules: {
                                    key: "estado",
                                    value: 1
                                }
                            }
                        ]
                    }
                    optionAlign="text-center"
                    getOption={getOption}
                    data={type_sindicatos.data || []}
                />
                {/* paginate */}
                <div className="table-responsive text-center">
                    <Pagination
                        activePage={query.page || 1}
                        onPageChange={handlePage}
                        totalPages={type_sindicatos.lastPage || 1}
                    />
                </div>
            </BoardSimple>

            <BtnFloat
                onClick={async (e) => {
                    let { pathname, push } = Router;
                    push({ pathname: `${pathname}/create` });
                }}
            >
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </Form>
    )
}

// server rendering
TypeSindicato.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    let { success, type_sindicatos } = await unujobs.get(`type_sindicato?page=${query.page}`, {}, ctx)
        .then(res =>  res.data)
        .catch(err => ({ success: false }));
    // response
    return { query, success, type_sindicatos: type_sindicatos || {} };
}

// export 
export default TypeSindicato;