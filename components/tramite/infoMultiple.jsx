import React, { useEffect, useState, Fragment } from 'react';
import Modal from '../modal';
import { tramite } from '../../services/apis';
import Show from '../show';
import { Button } from 'semantic-ui-react';
import Skeleton from 'react-loading-skeleton';

const PlaceholderItem = () => {
    
    return (
        <Fragment>
            <tr>
                <th colSpan="3"><Skeleton height="40px"/></th>
            </tr>
            <tr>
                <th colSpan="3"><Skeleton height="40px"/></th>
            </tr>
            <tr>
                <th colSpan="3"><Skeleton height="40px"/></th>
            </tr>
            <tr>
                <th colSpan="3"><Skeleton height="40px"/></th>
            </tr>
        </Fragment>
    )
}

const ItemMultiple = ({ tracking = {} }) => {

    // preparar datos
    let { dependencia, person } = tracking || {};

    // renderizar
    return (
        <tr>
            <th className="capitalize">{dependencia && dependencia.nombre || ""}</th>
            <th className="capitalize">{person && person.fullname || ""}</th>
            <th className="capitalize">{`${tracking.status}`.toLowerCase()}</th>
        </tr>
    )
}

const InfoMultiple = ({ isClose = null, current_tracking = {} }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);

    // obtener multiple
    const getMultiple = async (add = false) => {
        setCurrentLoading(true);
        await tramite.get(`tracking/${current_tracking.id}/multiple`)
        .then(res => {
            let { multiples } = res.data;
            setCurrentLastPage(multiples.lastPage || 0);
            setCurrentTotal(multiples.total || 0);
            setDatos(add ? [...datos, ...multiples.data] : multiples.data);
        })
        .catch(err => console.log(err));
        setCurrentLoading(false);
    } 

    // primera carga
    useEffect(() => {
        getMultiple();
    }, []);

    // next page
    useEffect(() => {
        if (current_page > 1) getMultiple(true);
    }, [current_page]);

    // render
    return (
        <Modal show={true}
            isClose={isClose}
            titulo="Información Multiple"
            col="10"
        >
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Dependencia</th>
                                <th>Persona</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datos.map((d, indexD) => 
                                <ItemMultiple key={`list-item-table-multiple-${indexD}`}
                                    tracking={d}
                                />
                            )}
                            {/* no hay registros */}
                            <Show condicion={!current_loading && !datos.length}>
                                <tr>
                                    <th colSpan="3" className="text-center">
                                        No hay datos disponibles
                                    </th>
                                </tr>
                            </Show>
                            {/* preloader */}
                            <Show condicion={current_loading}>
                                <PlaceholderItem/>
                            </Show>
                            {/* más datos */}
                            <Show condicion={!current_loading}>
                                <tr>
                                    <th colSpan="3" className="text-center">
                                        <Button fluid
                                            disabled={!(current_last_page >= (current_page + 1))}
                                            onClick={(e) => setCurrentPage(current_page + 1)}
                                        >
                                            <i className="fas fa-arrow-down"></i> Obtener más datos
                                        </Button>
                                    </th>
                                </tr>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    )
}

export default InfoMultiple;