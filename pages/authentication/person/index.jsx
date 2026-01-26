import React, { useEffect, useState } from 'react'
import { BtnFloat } from '../../../components/Utils';
import Router, { useRouter } from 'next/router';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { Form } from 'semantic-ui-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { authentication } from '../../../services/apis';
import DataTable from '../../../components/datatable';
import btoa from 'btoa';
import BoardSimple from '../../../components/boardSimple';
import { system_store } from '../../../services/verify.json';
import CreatePerson from '../../../components/authentication/person/createPerson'
import Show from '../../../components/show'

const IndexPerson = () => {
    const router = useRouter();
    const { pathname, query } = router;

    const [people, setPeople] = useState({ data: [], lastPage: 1, total: 0, page: 1 });
    const [loading, setLoading] = useState(true);
    const [query_search, setQuerySearch] = useState(query.query_search || "");
    const [option, setOption] = useState()
    const [is_refresh, setIsRefresh] = useState(false)

    // cargar datos
    const fetchPeople = async () => {
        setLoading(true);
        const page = query.page || 1;
        const search = query.query_search || '';
        await authentication.get(`person?page=${page}&query_search=${search}`)
            .then(res => {
                setPeople(res.data.people || { data: [], lastPage: 1, total: 0, page: 1 });
            })
            .catch(err => {
                console.error(err);
                setPeople({ data: [], lastPage: 1, total: 0, page: 1 });
            });
        setLoading(false);
    };

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchPeople();
    }, [query.page, query.query_search]);
    
    // next page
    const handlePage = async (e, { activePage }) => {
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // realizar búsqueda
    const handleSearch = async () => {
        let { push } = Router;
        query.page = 1;
        query.query_search = query_search
        await push({ pathname, query });
    }

    // obtener opciones
    const getOption = async (obj, key, index) => {
        switch (key) {
            case 'edit':
                let newQuery =  {};
                newQuery.id = btoa(obj.id);
                newQuery.href = btoa(location.href);
                await Router.push({ pathname: `${pathname}/${key}`, query: newQuery });
                break;
            default:
                break;
        }
    }

    const onSave = (person) => {
        setQuerySearch(person?.document_number)
        setOption("");
        setIsRefresh(true)
    }

    useEffect(() => {
        if (is_refresh) handleSearch();
    }, [is_refresh])

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    // renderizar
    return (
        <div className="col-md-12">
            <BoardSimple
                prefix="P"
                bg="danger"
                options={[]}
                title="Persona"
                info={["Lista de personas"]}
            >
                <Form>
                    <div className="col-md-12">
                        <DataTable
                            headers={["#ID", "Foto", "Apellidos y Nombres", "N° Documento", "Fecha de Nac."]}
                            data={people && people.data || []}
                            index={[
                                { key: "id", type: "text" },
                                { key: 'image_images.image_50x50', type: 'cover' },
                                { key: "fullname", type: "text", className: "uppercase" },
                                { key: "document_number", type: "icon" },
                                { key: "date_of_birth", type: "date", bg: 'dark' }
                            ]}
                            options={[
                                { key: "edit", icon: "fas fa-pencil-alt" }
                            ]}
                            getOption={getOption}
                        >
                            <div className="col-md-12 mt-2">
                                <div className="row">
                                    <div className="col-md-7 mb-1 col-10">
                                        <Form.Field>
                                            <input type="text" 
                                                placeholder="Buscar trabajador por: Apellidos y Nombres"
                                                name="query_search"
                                                value={query_search || ""}
                                                onChange={({ target }) => setQuerySearch(target.value)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-xs col-2">
                                        <Button
                                            className="tw-w-full"
                                            onClick={() => setIsRefresh(true)}
                                        >
                                            <i className="fas fa-search"></i>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body mt-4">
                                <h4>Resultados: {(people.data && people.data.length || 0) * (people.page || 1)} de {people.total || 0}</h4>
                            </div>
                        </DataTable>
                        
                        <div className="text-center">
                            <hr/>
                            <Pagination
                                activePage={query.page || 1}
                                totalPages={people?.lastPage || 1}
                                onPageChange={handlePage}
                            />
                        </div>
                    </div>

                    {/* crear nueva persona */}
                    <Show condicion={option == 'CREATE'}
                        predeterminado={
                            <BtnFloat onClick={() => setOption('CREATE')}>
                                <i className="fas fa-plus"></i>
                            </BtnFloat>
                        }
                    >
                        <CreatePerson onSave={onSave}
                            onClose={() => setOption("")}
                        />
                    </Show>
                </Form>
            </BoardSimple>
        </div>
    )
}

// exportar
export default IndexPerson;