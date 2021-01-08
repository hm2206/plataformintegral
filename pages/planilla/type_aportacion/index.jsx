import React, { useContext } from 'react';
import { Form, Pagination } from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext';

const TypeAportacion = ({ query, success, type_aportaciones }) => {

    // contexto
    const app_context = useContext(AppContext);

    // next
    const onChangePage = (e, { activePage }) => {
        let { query, pathname, push } = Router;
        query.page = activePage;
        push({ pathname, query });
    }

    // obtener opciones
    const getOption = async (obj, key, index) => {
        let { pathname, push } = Router;
        let id = btoa(`${obj.id || ""}`);
        switch (key) {
            case 'edit':
            case 'config_max':
                await push({ pathname: `${pathname}/${key}`, query: { id } });
                break;
            case 'delete':
                await changedState(obj, 0);
                break;
            case 'restore':
                changedState(obj, 1);
                break
            default:
                break;
        }
    }

    const changedState = async (obj, estado = 1) => {
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar'} el Tip. Aportación "${obj.descripcion}"?`);
        if (answer) {
            app_context.fireLoading(true);
            await unujobs.post(`type_aportacion/${obj.id}/estado`, { estado })
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                onChangePage({}, query.page || 1);
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
        }
    }

    return (
    <Form className="col-md-12">
        <Body>
            <Datatable titulo="Lista de Tip. Aportación"
                isFilter={false}
                headers={["#ID", "Descripción", "Exp Pptto", "Porcentaje%", "Minimo", "Predeterminado", "Estado"]}
                index={[
                    {
                        key: "key",
                        type: "text"
                    }, 
                    {
                        key: "descripcion",
                        type: "text"
                    },
                    {
                        key: "ext_pptto",
                        type: "icon"
                    },
                    {
                        key: "porcentaje",
                        type: "text"
                    },
                    {
                        key: "minimo",
                        type: "text"
                    },
                    {
                        key: "default",
                        type: "text"
                    },
                    {
                        key: "estado",
                        type: "switch",
                        justify: "center",
                        is_true: "Activo",
                        is_false: "Eliminado"
                    }
                ]}
                options={[
                    {
                        key: "edit",
                        icon: "fas fa-pencil-alt",
                        title: "Editar Tip. Aportación",
                        rules: {
                            key: "estado",
                            value: 1
                        }   
                    },
                    {
                        key: "config_max",
                        icon: "fas fa-cogs",
                        title: "Configuración máxima del Tip. Aportación",
                        rules: {
                            key: "estado",
                            value: 1
                        }   
                    },
                    {
                        key: "restore",
                        icon: "fas fa-sync",
                        title: "Restaurar Tip. Aportación",
                        rules: {
                            key: "estado",
                            value: 0
                        }
                    }, 
                    {
                        key: "delete",
                        icon: "fas fa-times",
                        title: "Deactivar Tip. Aportación",
                        rules: {
                            key: "estado",
                            value: 1
                        }
                    }
                ]}
                optionAlign="text-center"
                getOption={getOption}
                data={type_aportaciones.data || []}
            />
        </Body>

        <div className="table-responsive text-center">
            <hr/>
            <Pagination 
                totalPages={type_aportaciones.last_page || 1}
                activePage={type_aportaciones.current_page || 1}
                onPageChange={onChangePage}
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
    </Form>)
}

// server rendering
TypeAportacion.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    let { success, type_aportaciones } = await unujobs.get(`type_aportacion?page=${query.page}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false }))
    // response
    return { success, type_aportaciones: type_aportaciones || {}, query, pathname };
}

// export
export default TypeAportacion;
