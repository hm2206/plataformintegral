import React, { useEffect, useState, Fragment } from 'react'
import Modal from '../modal';
import { Button, Form, List } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Show from '../show';
import Router from 'next/router';
import Skeleton from 'react-loading-skeleton';

// preloader
const PlaceholderItem = () => {
    // renderizar
    return (
        <Fragment>
            <List.Item>
                <List.Content>
                    <Skeleton height="40px"/>
                </List.Content>
            </List.Item>
            <List.Item>
                <List.Content>
                    <Skeleton height="40px"/>
                </List.Content>
            </List.Item>
            <List.Item>
                <List.Content>
                    <Skeleton height="40px"/>
                </List.Content>
            </List.Item>
            <List.Item>
                <List.Content>
                    <Skeleton height="40px"/>
                </List.Content>
            </List.Item>
        </Fragment>
    )
}

const SearchCronograma = ({ cronograma, isClose = null, onSelect = null, show = false }) => {

    // fecha actual
    let fecha = new Date();

    // estados
    const [year, setYear] = useState(cronograma.year || fecha.getFullYear());
    const [mes, setMes] = useState(cronograma.mes || fecha.getMonth() + 1);
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [is_search, setIsSearch] = useState(false);

    //  obtener cronogramas
    const getCronogramas = async (add = false) => {
        setCurrentLoading(true);
        await unujobs.get(`cronograma?year=${year}&mes=${mes}&page=${current_page}`)
        .then(res => {
            let { cronogramas } = res.data;
            setCurrentLastPage(cronogramas.last_page || 0);
            setCurrentTotal(cronogramas.total || 0);
            setDatos(add ? [...datos, ...cronogramas.data] : cronogramas.data);
        }).catch(err => console.log(err.message));
        setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        getCronogramas();
    }, []);

    // búscar
    useEffect(() => {
        if (is_search) {
            getCronogramas();
            setIsSearch(false);
        }
    }, [is_search]);

    // renderizado
    return (
        <Modal
            show={show}
            isClose={isClose}
            titulo={<span><i className="fas fa-search"></i> Buscar cronogramas</span>}
            disabled={current_loading}
        >
            <Form className="card-body">
                <div className="row">
                    <div className="col-md-5 mb-1">
                        <input type="number" 
                            placeholder="Año"
                            name="year"
                            value={year || ""}
                            disabled={current_loading}
                            onChange={({ target }) => setYear(target.value)}
                        />
                    </div>

                    <div className="col-md-4 mb-1">
                        <input type="number" 
                            placeholder="Mes"
                            name="mes"
                            max="12"
                            min="1"
                            value={mes || ""}
                            disabled={current_loading}
                            onChange={({ target }) => setMes(target.value)}
                        />
                    </div>

                    <div className="col-md-3">
                        <Button fluid 
                            color="blue"
                            disabled={current_loading}
                            onClick={(e) => {
                                setCurrentPage(1);
                                setIsSearch(true);
                            }}
                        >
                            <i className="fas fa-search"></i>
                        </Button>
                    </div>

                    <div className="col-md-12">
                        <hr/>
                    </div>

                    <div className="col-md-12 mt-3">
                        <List divided verticalAlign='middle'>
                            {datos.map((cro, indexC) => 
                                <List.Item key={`list-people-${indexC}`}>
                                    <List.Content floated='right'>
                                        <Button color="black"
                                            onClick={(e) => typeof onSelect == 'function' ? onSelect(cro) : null}
                                            disabled={current_loading}
                                        >
                                            Ir
                                        </Button>
                                    </List.Content>
                                    <List.Content>
                                        <b>Planilla {cro.planilla && cro.planilla.nombre}</b> 
                                        <Show condicion={cro.adicional}>
                                            <span className="badge badge-primary ml-2">Adicional {cro.adicional}</span> 
                                        </Show>
                                        <span className="badge badge-warning ml-2"><i className="fas fa-user"></i> {cro.historial_count}</span>
                                    </List.Content>
                                </List.Item>    
                            )}
                            {/* preloader */}
                            <Show condicion={current_loading}>
                                <PlaceholderItem/>
                            </Show>
                            {/* no hay registros */}
                            <Show condicion={!current_loading && !datos.length}>
                                <List.Item>
                                    <List.Content>
                                        <div className="text-center text-muted">No hay regístros disponibles</div>
                                    </List.Content>
                                </List.Item>
                            </Show>
                        </List>    
                    </div>

                </div>
            </Form>
        </Modal>
    );
}

export default SearchCronograma;