import React, { useMemo, useState } from 'react';
import Modal from '../modal'
import usePaginate from '../../hooks/usePaginate';
import { unujobs } from '../../services/apis'
import { List, Button, Image } from 'semantic-ui-react'
import Skeleton from 'react-loading-skeleton'
import Show from '../show'

const PlaceholderItem = () => {
    // render
    return (
        <List.Item>
            <List.Content>
                <div className="mb-1">
                    <Skeleton height="40px"/>
                </div>
                <div className="mb-1">
                    <Skeleton height="40px"/>
                </div>
                <div className="mb-1">
                    <Skeleton height="40px"/>
                </div>
                <div className="mb-1">
                    <Skeleton height="40px"/>
                </div>
            </List.Content>
        </List.Item>
    )
}

const DiscountItem = ({ data }) => {

    const applyDiscount = useMemo(() => {
        return parseInt(data?.neto) ? true : false;
    }, [data]);

    return (
        <List.Item className={!applyDiscount ? 'text-muted' : ''}>
            <List.Content floated='right'>
                <Button color="red"
                    disabled={!applyDiscount}
                >
                    {data?.monto}
                </Button>
            </List.Content>
            <Image avatar src={data?.person?.image_images?.image_50x50 || '/img/base.png'} 
                style={{ objectFit: 'cover' }}
            />
            <List.Content>
                <span className="uppercase">{data?.person.fullname}</span>
                <span className="badge badge-primary ml-2">{data?.displayCategoria}</span>
                <span className="badge badge-dark ml-2">{data?.neto}</span>
            </List.Content>
        </List.Item>
    )
}

const Discount = ({ cronograma, isClose = null }) => {

    const [datos, setDatos] = useState([]);

    const config = {
        headers: { CronogramaId: cronograma?.id }
    }

    // hooks
    const request = usePaginate({ api: unujobs, url: `cronograma/${cronograma?.id}/discounts`, config }, (data, add) => {
        setDatos(add ? [...datos, ...data] : data);
    })

    return (
        <Modal titulo={<span><i className="fas fa-balance-scale"></i> Descuento Escalafonario</span>}
            show={true}
            isClose={isClose}
        >
            <div className="card-body">
                <List divided verticalAlign='middle'>
                    {datos.map(d => 
                        <DiscountItem key={`list-info-${d.id}`}
                            data={d}
                        />
                    )}

                    <Show condicion={request.loading}>
                        <PlaceholderItem/>
                    </Show>

                    <List.Item>
                        <Button fluid disabled={request.loading || !request.canNext}>
                            <i className="fas fa-arrow-down"></i> Obtener más datos
                        </Button>
                    </List.Item>
                </List>
            </div>
        </Modal>
    )
}

export default Discount;