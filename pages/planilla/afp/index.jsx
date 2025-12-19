import React, { useContext, useEffect, useState } from 'react';
import { Pagination } from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router, { useRouter } from 'next/router';
import btoa from 'btoa';
import { BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { Confirm } from '../../../services/utils';
import { handleErrorRequest, unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../../components/boardSimple';

const Afp = () => {
    const router = useRouter();
    const { pathname, query } = router;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [afps, setAfps] = useState({});

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await unujobs.get(`afp?page=${query.page}`)
            .then(res => {
                setSuccess(res.data.success);
                setAfps(res.data.afps);
            })
            .catch(err => console.error(err));
        setLoading(false);
    };


    const app_context = useContext(AppContext);

    // realizar búsqueda
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
            }).catch(err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
        }
    }

    // crear cronograma
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

    // renderizado
    return (
        <div className="col-md-12">
            <BoardSimple
                title="Leyes Sociales"
                info={["Lista de Leyes Sociales"]}
                prefix="LS"
                bg="danger"
                options={[]}
            >
                <Datatable
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
                <div className="table-responsive text-center">
                    <Pagination
                        activePage={query.page}
                        onPageChange={handlePage}
                        totalPages={afps.lastPage || 1}
                    />
                </div>
            </BoardSimple>

            <BtnFloat onClick={handleCreate}>
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </div>
    )
}

// export
export default Afp;