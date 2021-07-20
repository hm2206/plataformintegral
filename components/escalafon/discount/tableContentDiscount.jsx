import React, { useEffect, useState } from 'react';
import Show from '../../show';
import DiscountProvider from '../../../providers/escalafon/DiscountProvider';
import Skeleton from 'react-loading-skeleton';

const discountProvider = new DiscountProvider();

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

const TableContentDiscount = ({ is_fetch, year, month }) => {

    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [is_error, setIsError] = useState([]);

    const getDiscountDetails = async () => {
        setCurrentLoading(true);
        await discountProvider.preViewDetails(year, month)
        .then(res => {
            let { details } = res.data;
            setDatos(details);
            setIsError(false);  
        }).catch(err => setIsError(true))
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (is_fetch) getDiscountDetails();
    }, [is_fetch]);
    
    return (
        <div className="table-responsive">
            <table className="table-excel font-12">
                <thead>
                    <tr>
                        <th width="70%" colSpan="2" className="text-center no-wrap">DONDE:</th>
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
                            <th colSpan="2" className="text-center font-13">No hay regístros disponibles</th>
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