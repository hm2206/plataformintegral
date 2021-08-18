import React, { useMemo, useState } from 'react';
import Show from '../../show';
import ItemInfoSchedule from './itemInfoSchedule';

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
    }, [discount?.discount]);

    return displayText;
}

const ItemDiscountDetail = ({ date = {}, info = {} }) => {

    const discounts =  date?.discounts || [];
    const isDiscounts = discounts?.length || 0; 

    const [option, setOption] = useState("")

    const currentStatus = useMemo(() => {
        return date?.schedule?.status;
    }, [date?.schedule]);

    const currentDiscount = useMemo(() => {
        let value = date?.schedule?.discount
        return  value ? parseInt(date?.schedule?.discount) : 0;
    }, [date?.schedule]);

    const isSuccess = useMemo(() => {
        return !isDiscounts && currentStatus == 'A' && !currentDiscount;
    }, [currentStatus, currentDiscount]);

    const isDanger = useMemo(() => {
        return currentStatus == 'F';
    }, [currentStatus, currentDiscount]);

    const isWarning = useMemo(() => {
        return currentStatus == 'A' && !isSuccess;
    }, [currentStatus, currentDiscount]);

    const IsPrimary = useMemo(() => {
        return (currentStatus == 'D' || !isWarning) && isDiscounts;
    }, [currentStatus, currentDiscount]);

    const styleClass = useMemo(() => {
        if (isSuccess) return '';
        if (isDanger) return 'danger';
        if (isWarning) return '';
        if (IsPrimary) return 'primary'
        return null;
    }, [isSuccess, isDanger, isWarning]);

    const handleInfo = () => {
        if (!isSuccess && !isWarning && !IsPrimary && !isDanger) return;
        setOption("INFO")
    }

    return (
        <th className={`text-center font-11 ${styleClass}`} onDoubleClick={handleInfo}>
            <Show condicion={!isDanger}
                predeterminado={<span className="cursor-pointer" title={`Descuento: ${currentDiscount}`}>F</span>}
            >
                <Show condicion={!isSuccess}
                    predeterminado={<div className="cursor-pointer">.</div>}
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

            {/* info de la schedule */}
            <Show condicion={option == 'INFO'}>
                <ItemInfoSchedule
                    info={info}
                    date={date}
                    onClose={() => setOption("")}
                />
            </Show>
        </th>
    )
}


export default ItemDiscountDetail;