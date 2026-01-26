import React, { useState, useEffect } from 'react'
import { BtnFloat, Body } from '../../../components/Utils';
import Router, { useRouter } from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Form } from 'semantic-ui-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { authentication } from '../../../services/apis';
import DataTable from '../../../components/datatable';
import btoa from 'btoa';

const SedeIndex = () => {
    const router = useRouter();
    const { pathname, query } = router;

    const [sede, setSede] = useState({ data: [], lastPage: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [query_search, setQuerySearch] = useState(query.query_search || "");

    // cargar datos
    const fetchSedes = async () => {
        setLoading(true);
        const page = query.page || 1;
        const search = query.query_search || '';
        await authentication.get(`sede?page=${page}&query_search=${search}`)
            .then(res => {
                setSede(res.data.sede || { data: [], lastPage: 1, total: 0 });
            })
            .catch(err => {
                console.error(err);
                setSede({ data: [], lastPage: 1, total: 0 });
            });
        setLoading(false);
    };

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchSedes();
    }, [query.page, query.query_search]);

    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    const handleOption = async (obj, key, index) => {
        let { push } = Router;
        let id = btoa(obj.id);
        query.id = id;
        if (key == 'info') push({ pathname: `${pathname}/edit`, query });
    }

    const handleSearch = async () => {
        let { push } = Router;
        query.page = 1;
        query.query_search = query_search;
        await push({ pathname, query });
    }

    return (
        <div className="col-md-12">
            <Body>
                <Form>
                    <div className="col-md-12">
                        <DataTable
                            titulo={<span>Lista de Sedes</span>}
                            loading={loading}
                            headers={["#ID", "Descripción", "Dirección"]}
                            data={sede?.data || []}
                            index={[
                                { key: "id", type: "text" },
                                { key: "descripcion", type: "text", className: "uppercase" },
                                { key: "direccion", type: "icon" }
                            ]}
                            options={[
                                { key: "info", icon: "fas fa-info" }
                            ]}
                            getOption={handleOption}
                        >
                            <div className="col-md-12 mt-2">
                                <div className="row">
                                    <div className="col-md-7 mb-1 col-10">
                                        <Form.Field>
                                            <input
                                                type="text"
                                                placeholder="Buscar por: Descripción o Dirección"
                                                name="query_search"
                                                value={query_search}
                                                onChange={(e) => setQuerySearch(e.target.value)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-xs col-2">
                                        <Button
                                            className="tw-w-full"
                                            onClick={handleSearch}
                                        >
                                            <i className="fas fa-search"></i>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body mt-4">
                                <h4>Resultados: {sede?.total || 0}</h4>
                            </div>
                        </DataTable>

                        <div className="text-center">
                            <hr/>
                            <Pagination
                                activePage={query.page || 1}
                                totalPages={sede?.lastPage || 1}
                                onPageChange={handlePage}
                            />
                        </div>
                    </div>

                    <BtnFloat
                        onClick={() => Router.push({ pathname: `${pathname}/create` })}
                    >
                        <i className="fas fa-plus"></i>
                    </BtnFloat>
                </Form>
            </Body>
        </div>
    )
}

export default SedeIndex;
