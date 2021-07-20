import React, { useMemo } from 'react';
import Show from '../../show';

const letterTypes = {
    vacation: "App/Models/Vacation",
    permission: "App/Models/Permission",
    license: "App/Models/License",
    ballot: "App/Models/Ballot"
} 

const ItemDetail = ({ discount }) => {

    const current_type = discount?.type
    const current_object = discount?.object || {};

    const displayText = useMemo(() => {
        if (letterTypes.ballot == current_type) {
            return current_object?.is_applied ? 'P' : 'CS'
        } else if (letterTypes.vacation == current_type) {
            return 'V';
        } else if (letterTypes.license == current_type) {
            return current_object?.is_pay ? 'LCG' : 'LSG'
        } else if (letterTypes.permission == current_type) {
            return 'P'
        } else return null;
    }, [discount]);

    return displayText;
}

const ItemDiscountDetail = ({ date = {} }) => {

    const discounts =  date?.discounts || [];
    const isDiscounts = discounts?.length || 0; 

    const currentStatus = useMemo(() => {
        return date?.schedule?.status;
    }, [date]);

    const currentDiscount = useMemo(() => {
        return date?.schedule?.discount;
    }, [date]);

    const isSuccess = useMemo(() => {
        return !isDiscounts && currentStatus == 'A' && !currentDiscount;
    }, [currentStatus]);

    const isDanger = useMemo(() => {
        return currentStatus == 'F';
    }, [currentStatus]);

    const isWarning = useMemo(() => {
        return currentStatus == 'A' && !isSuccess;
    }, [currentStatus]);

    const IsPrimary = useMemo(() => {
        return (currentStatus == 'D' || !isWarning) && isDiscounts;
    }, [currentStatus]);

    const styleClass = useMemo(() => {
        if (isSuccess) return 'success';
        if (isDanger) return 'danger';
        if (isWarning) return 'warning';
        if (IsPrimary) return 'primary'
        return null;
    }, [isSuccess, isDanger, isWarning]);

    return (
        <th className={`text-center font-11 ${styleClass}`}>
            <Show condicion={!isDanger}
                predeterminado={<span className="cursor-pointer" title={`Descuento: ${currentDiscount}`}>F</span>}
            >
                <Show condicion={!isSuccess}
                    predeterminado={<div className="cursor-pointer">A</div>}
                >
                    <Show condicion={isWarning}>
                        <span className="cursor-pointer" title={`Descuento: ${currentDiscount}`}>
                            {/* ballots */}
                            <Show condicion={!currentDiscount}
                                predeterminado={currentDiscount}
                            >
                                {discounts?.map((d, indexD) => 
                                    <span key={`list-item-d-${indexD}`}
                                        className="cursor-pointer"
                                    >
                                        <ItemDetail discount={d}/>
                                    </span>    
                                )}
                            </Show>
                        </span>
                    </Show>
                </Show>
            </Show>

            <Show condicion={IsPrimary}>
                {discounts?.map((d, indexD) => 
                    <span key={`list-item-d-${indexD}`}
                        className="cursor-pointer"
                    >
                        <ItemDetail discount={d}/>
                    </span>    
                )}  
            </Show>
        </th>
    )
}


export default ItemDiscountDetail;