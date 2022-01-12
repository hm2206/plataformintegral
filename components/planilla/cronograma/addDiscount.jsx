import React, { useMemo, useState } from 'react';
import Modal from '../../modal'
import usePaginate from '../../../hooks/usePaginate';
import { unujobs } from '../../../services/apis'
import { List, Button, Image } from 'semantic-ui-react'
import Skeleton from 'react-loading-skeleton'
import Show from '../../show'
import { Confirm } from '../../../services/utils'
import Swal from 'sweetalert2';

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

const DiscountItem = ({ cronograma, data, onSave = null }) => {

    const [current_loading, setCurrenLoading] = useState(false);

    const config = {
        headers: { CronogramaId: cronograma?.id }
    }

    const applyDiscount = useMemo(() => {
        return parseFloat(data?.neto) ? true : false;
    }, [data]);

    const assocDiscount = async () => {
        let answer = await Confirm("warning", "¿Estás seguro en asocciar el descuento?", "Estoy seguro");
        if (!answer) return;
        setCurrenLoading(true);
        await unujobs.post(`cronograma/${cronograma?.id}/discounts`, { discount_id: data.id }, config)
        .then(async () => {
            await Swal.fire({ icon: 'success', text: "El descuento se aplico correctamente!" })
            if (typeof onSave == 'function') onSave();
        }).catch(() => Swal.fire({ icon: 'error', text: "No se pudo aplicar el descuento"}))
        setCurrenLoading(false);
    }

    return (
        <List.Item className={!applyDiscount ? 'text-muted' : ''}>
            <List.Content floated='right'>
                <Button color="red"
                    onClick={assocDiscount}
                    disabled={!applyDiscount || current_loading}
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
                <i className="fas fa-arrow-right ml-1"></i>
                <span className="ml-1">
                    a descontar <b>{data?.monto}</b> del 
                    <b className="ml-1 mr-1">{data?.month}/{data.year}</b>
                    del neto
                    <b className="ml-1">{data?.neto}</b>
                </span>
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
                            cronograma={cronograma}
                            onSave={() => request.setIsRefresh(true)}
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