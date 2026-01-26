import React, { useContext, useState, useEffect } from 'react';
import Datatable from '../../../components/datatable';
import Router, { useRouter } from 'next/router';
import btoa from 'btoa';
import { AUTHENTICATE } from '../../../services/auth';
import { Form } from 'semantic-ui-react';
import ReactSelect from 'react-select';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import { authentication } from '../../../services/apis';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import BoardSimple from '../../../components/boardSimple';
import { AppContext } from '../../../contexts/AppContext';


const DependenciaIndex = () => {
    const router = useRouter();
    const { pathname, query } = router;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [dependencia, setDependencia] = useState({});

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchInitialData();
    }, [query.page, query.query_search, query.type]);

    const fetchInitialData = async () => {
        setLoading(true);
        const page = query.page || 1;
        const query_search = query.query_search || '';
        const type = query.type || '';
        await authentication.get(`dependencia?page=${page}&query_search=${query_search}&type=${type}`)
            .then(res => {
                setSuccess(res.data.success);
                setDependencia(res.data.dependencia);
            })
            .catch(err => console.error(err));
        setLoading(false);
    };


    // app
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState(query);


    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // realizar búsqueda
    const searchAction = async () => {
        let { push } = Router;
        query.page = 1;
        query.query_search = form.query_search;
        query.type = form.type;
        await push({ pathname, query });
    }

    // obtener opciones
    const getOption = async (obj, key, index) => {
        let { push } = Router;
        switch (key) {
            case 'edit':
                let newQuery =  {};
                newQuery.id = btoa(obj.id);
                newQuery.href = btoa(location.href);
                await push({ pathname: `${pathname}/${key}`, query: newQuery });
                break;
            case 'delete':
                let response = await changeState(obj.id, key);
                if (response) push({ pathname, query });
                break;
            default:
                break;
        }
    }

    // cambiar estado
    const changeState = async (id, estado) => {
        let answer = await Confirm("warning", `¿Deseas ${estado} la dependencia?`);
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        return await authentication.post(`dependencia/${id}/${estado}`)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            return true;
        }).catch(async err => {
            app_context.setCurrentLoading(false);
            await Swal.fire({ icon: 'error', text: err.message });
            return false;
        });
    }

    // siguiente página
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // crear dependencia
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

    // render
    return (
        <div className="col-md-12">
            <BoardSimple
                options={[]}
                prefix="D"
                bg="danger"
                title="Dependencias"
                info={["Lista de dependencias"]}
            >
                <Datatable
                    isFilter={false}
                    headers={ ["#ID", "Nombre", "Descripción", "Tipo", "Estado"]}
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
                                key: "descripcion",
                                type: "text"
                            }, 
                            {
                                key: "type",
                                type: "icon"
                            },
                            {
                                key: "state",
                                type: "switch",
                                is_true: "Activo",
                                is_false: "Deshabilitado"
                            }
                        ]
                    }
                    options={
                        [
                            {
                                key: "edit",
                                icon: "fas fa-pencil-alt",
                                title: "Editar"
                            },
                            {
                                key: "delete",
                                icon: "fas fa-times",
                                title: "Deshabilitar"
                            }
                        ]
                    }
                    getOption={getOption}
                    data={dependencia && dependencia.data || []}
                >
                    <Form className="mb-3">
                        <div className="row">
                            <div className="col-md-6 mb-1 col-6 col-sm-6 col-xl-4">
                                <Form.Field>
                                    <input type="text" 
                                        placeholder="Buscar dependencia" 
                                        name="query_search"
                                        value={form.query_search || ""}
                                        onChange={(e) => handleInput(e.target)}
                                    />
                                </Form.Field>
                            </div>
                            <div className="col-md-4 mb-1 col-6 col-sm-6 col-xl-2">
                                <ReactSelect
                                    placeholder="TODOS"
                                    name="type"
                                    value={[
                                        { value: "", label: 'TODOS'},
                                        { value: 'OTRO', label: 'OTRO'},
                                        { value: 'ESCUELA', label: 'ESCUELA'},
                                        { value: 'FACULTAD', label: 'FACULTAD'},
                                        { value: 'OFICINA', label: 'OFICINA'},
                                    ].find(opt => opt.value === form.type) || null}
                                    onChange={(selected) => handleInput({ name: 'type', value: selected?.value || '' })}
                                    options={[
                                        { value: "", label: 'TODOS'},
                                        { value: 'OTRO', label: 'OTRO'},
                                        { value: 'ESCUELA', label: 'ESCUELA'},
                                        { value: 'FACULTAD', label: 'FACULTAD'},
                                        { value: 'OFICINA', label: 'OFICINA'},
                                    ]}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-3 col-6 col-sm-12 col-xl-2 mb-1">
                                <Button
                                    className="tw-w-full"
                                    onClick={searchAction}
                                >
                                    <i className="fas fa-search mr-1"></i>
                                    <span>Buscar</span>
                                </Button>
                            </div>
                        </div>
                        <hr/>
                    </Form>
                </Datatable>
                {/* paginacion */}
                <div className="text-center">
                    <hr/>
                    <Pagination
                        activePage={dependencia?.page || 1}
                        totalPages={dependencia?.lastPage || 1}
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

// exportar
export default DependenciaIndex;