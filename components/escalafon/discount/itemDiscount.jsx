import React, { useMemo } from 'react';
import Show from '../../show';

const ItemDiscountDetail = ({ date }) => {

    const isDiscounts = date?.discounts?.length || 0;

    const letterTypes = {
        vacation: "App/Models/Vacation",
        permission: "App/Models/Permission",
        license: "App/Models/License",
    }  

    const isWarning = useMemo(() => {
        return !isDiscounts && date?.schedule?.discount;
    }, [date]);

    return (
        <th className={`text-center font-11 ${isWarning ? 'warning' : ''}`}>
            <Show condicion={!isDiscounts}>
                {date?.schedule?.discount} 
            </Show>

            <Show condicion={isDiscounts}>
                {date?.discounts?.map(d => 
                    <span className="cursor-pointer text-primary">
                        <Show condicion={d.type == letterTypes.vacation}>
                            V
                        </Show>
                        <Show condicion={d.type == letterTypes.permission}>
                            P
                        </Show>
                        <Show condicion={d.type == letterTypes.license}>
                            {d?.license?.is_pay ? 'LCG' : 'LSG'}
                        </Show>
                    </span>    
                )}
            </Show>
        </th>
    )
}

const ItemDiscount = ({ index = 0, discount = {} }) => {

    return (
        <tr>
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
            <th className="font-12 text-center">{discount?.count || "-"}</th>
            <th className="font-12 text-center">{discount?.discount || "-"}</th>
            <th className="font-12 text-center">{discount?.discount_min}</th>
            <th className="font-12 text-center">{discount?.base || 0}</th>
        </tr>
    )
}

export default ItemDiscount;