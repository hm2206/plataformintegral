import React, {Fragment, useContext} from 'react';
import {Button, Form, Pagination} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext';

const Afp = ({ query, success, afps }) => {

    const app_context = useContext(AppContext);

    const handleSearch = () => {
        let { push, query, pathname } = Router;
        query.page = 1;
        push({ pathname, query });
    }

    // opciones
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

    // cambiar página
    const handlePage = async (e, { activePage }) => {
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // CAMBIAR ESTADO DEL AFP
    const changedState = async (obj, estado = 1) => {
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar'} el Ley Social "${obj.descripcion}"?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`afp/${obj.id}/estado`, { estado })
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
                    <Body>
                        <Datatable titulo="Lista de Leyes Sociales"
                        isFilter={false}
                        headers={
                            ["#ID", "Descripcion", "Porcentaje", "Aporte Obligatorio", "Prima Seguro", "Prima Limite", "Privado", "Estado"]
                        }
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, 
                                {
                                    key: "descripcion",
                                    type: "text"
                                },
                                {
                                    key: "porcentaje",
                                    type: "icon",
                                    bg: "dark",
                                    justify: "center"
                                },
                                {
                                    key: "aporte",
                                    type: "icon",
                                    bg: "dark"
                                },
                                {
                                    key: "prima",
                                    type: "icon",
                                    bg: "dark",
                                },
                                {
                                    key: "prima_limite",
                                    type: "icon",
                                    bg: "dark",
                                },
                                {
                                    key: "private",
                                    type: "switch",
                                    justify: "center",
                                    is_true: "AFP",
                                    is_false: "ONP / OTRO",
                                    bg_true: "primary",
                                    bg_false: "dark"
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
                                    id: 1,
                                    key: "edit",
                                    icon: "fas fa-pencil-alt",
                                    title: "Editar Ley Social",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, {
                                    id: 1,
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Ley Social",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                }, {
                                    id: 1,
                                    key: "delete",
                                    icon: "fas fa-times",
                                    title: "Desactivar Ley Social",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={getOption}
                        data={afps.data || []}
                    />
                </Body>

                <div className="table-responsive text-center">
                    <Pagination
                        activePage={query.page}
                        onPageChange={handlePage}
                        totalPages={afps.lastPage || 1}
                    />
                </div>

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
Afp.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    // get Afp
    let { success, afps } = await unujobs.get(`afp?page=${query.page}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false }))
    return { query, success, afps: afps || {} };
}


// export
export default Afp;