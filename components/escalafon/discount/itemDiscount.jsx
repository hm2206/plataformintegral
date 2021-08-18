import React from 'react';
import ItemDiscountDetail from './itemDiscountDetail';

const ItemDiscount = ({ index = 0, info = {} }) => {

    return (
        <tr>
            <th>{index + 1}</th>
            <th className="capitalize font-12">{info?.work?.person?.fullname || ""}</th>
            <th className="capitalize font-12 text-center">{info?.work?.person?.document_number || ""}</th>
            <th className="capitalize font-12 text-center">{info?.type_categoria?.descripcion || ""}</th>
            {info?.dates?.map((d, indexD) => 
                <ItemDiscountDetail 
                    info={info}
                    key={`item-date-${info.id}-${indexD}`}
                    date={d}
                />    
            )}
            <th className="font-12 text-right">{info?.count || "-"}</th>
            <th className="font-12 text-right">{info?.discount || "-"}</th>
            <th className="font-12 text-right">{info?.discount_min}</th>
            <th className="font-12 text-right">{info?.base || 0}</th>
        </tr>
    )
}

export default ItemDiscount;