import React, { useMemo } from 'react';
import ItemDiscountDetail from './itemDiscountDetail';

const ItemDiscount = ({ index = 0, discount = {} }) => {

    const isSuccess = useMemo(() => {
        return !discount?.discount;
    }, [discount]);

    return (
        <tr className={isSuccess ? 'success' : ''}>
            <th>{index + 1}</th>
            <th className="capitalize font-12">{discount?.work?.person?.fullname || ""}</th>
            <th className="capitalize font-12 text-center">{discount?.work?.person?.document_number || ""}</th>
            <th className="capitalize font-12 text-center">{discount?.type_categoria?.descripcion || ""}</th>
            {discount?.dates?.map((d, indexD) => 
                <ItemDiscountDetail 
                    key={`item-date-${discount.id}-${indexD}`}
                    date={d}
                />    
            )}
            <th className="font-12 text-right">{discount?.count || "-"}</th>
            <th className="font-12 text-right">{discount?.discount || "-"}</th>
            <th className="font-12 text-right">{discount?.discount_min}</th>
            <th className="font-12 text-right">{discount?.base || 0}</th>
        </tr>
    )
}

export default ItemDiscount;