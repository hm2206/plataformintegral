import React, { useContext, useEffect, useState } from 'react';
import Show from '../../show';
import ConfigDiscountProvider from '../../../providers/escalafon/ConfigDiscountProvider';
import Skeleton from 'react-loading-skeleton';
import { DiscountContext } from '../../../contexts/escalafon/DiscountContext';

const configDiscountProvider = new ConfigDiscountProvider();

const PlaceholderTable = () => {
    const datos = [1, 2, 3, 4, 5, 6];
    return datos?.map(d => 
        <tr key={`list-item-table-detail-${d}`}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>
    )
}

const TableContentDiscount = () => {

    const { config_discount, cargo_id, type_categoria_id } = useContext(DiscountContext)

    const [datos, setDatos] = useState([])
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_refresh, setIsRefresh] = useState(false);
    const [is_error, setIsError] = useState([]);

    const getDetails = async () => {
        setCurrentLoading(true);
        await configDiscountProvider.headDiscounts(config_discount?.id, { type_categoria_id, cargo_id })
        .then(res => {
            let { details } = res.data;
            setDatos(details);
            setIsError(false);  
        }).catch(err => setIsError(true))
        setCurrentLoading(false);
    }

    useEffect(() => {
        setIsRefresh(true);
    }, [config_discount?.id, cargo_id, type_categoria_id]);
    
    useEffect(() => {
        if (is_refresh) getDetails()
    }, [is_refresh]);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);
    
    return (
        <div className="table-responsive">
            <table className="table-excel font-12">
                <thead>
                    <tr>
                        <th width="10%" className="text-center no-wrap">
                            <i className="fas fa-sync cursor-pointer" onClick={() => setIsRefresh(true)}></i>
                        </th>
                        <th width="60%" className="text-center no-wrap">DONDE:</th>
                        <th width="30%" className="text-center no-wrap">N° TRAB</th>
                    </tr>
                </thead>
                <tbody>
                    {/* mostrar datos */}
                    <Show condicion={!current_loading}>
                        {datos?.map((d, indexD) =>
                            <tr key={`list-datos-detail-${indexD}`}>
                                <td>{d?.index}</td>
                                <td>{d?.text}</td>
                                <td className="text-center">{d?.count}</td>
                            </tr>
                        )}
                    </Show>
                    {/* no hay datos */}
                    <Show condicion={!current_loading && !datos.length}>
                        <tr>
                            <th colSpan="3" className="text-center font-13">No hay regístros disponibles</th>
                        </tr>
                    </Show>
                    {/* loading de datos */}
                    <Show condicion={current_loading}>
                        <PlaceholderTable/>
                    </Show>
                </tbody>
            </table>
        </div>
    )
}

export default TableContentDiscount;