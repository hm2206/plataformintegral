import React, { useContext, useEffect, useMemo, useState } from 'react';
import ItemDiscountDetail from './itemDiscountDetail';
import DiscountProvider from '../../../providers/escalafon/DiscountProvider'
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext'

const discountProvider = new DiscountProvider();

const ItemDiscount = ({ index = 0, discount = {} }) => {

    const app_context = useContext(AppContext)

    const [current_discount, setCurrentDiscount] = useState({}) 

    const isSuccess = useMemo(() => {
        return !current_discount?.discount;
    }, [current_discount]);

    const handleEditDays = async () => {
        let answer = await prompt(`¿Estas seguro en editar el dia?`, current_discount?.days);
        if (!answer || answer == current_discount?.days) return;
        app_context.setCurrentLoading(true)
        await discountProvider.update(discount?.discount_id, {  days: answer})
        .then(({ data }) => {
            app_context.setCurrentLoading(false)
            let updateDiscount = data?.discount;
            Swal.fire({ icon: 'success', text: 'Los cambios se guardarón correctamente!' })
            setCurrentDiscount(prev => ({ ...prev, ...updateDiscount }))
        }).catch(() => {
            app_context.setCurrentLoading(false)
            Swal.fire({ icon: 'error', text: 'No se pudó guardar los datos' })
        })
    }

    useEffect(() => {
        setCurrentDiscount(Object.assign({}, discount))
    }, [discount]);

    return (
        <tr className={isSuccess ? 'success' : ''}>
            <th>{index + 1}</th>
            <th className="capitalize font-12">{current_discount?.work?.person?.fullname || ""}</th>
            <th className="capitalize font-12 text-center">{current_discount?.work?.person?.document_number || ""}</th>
            <th className="capitalize font-12 text-center">{current_discount?.type_categoria?.descripcion || ""}</th>
            {current_discount?.dates?.map((d, indexD) => 
                <ItemDiscountDetail 
                    key={`item-date-${current_discount.id}-${indexD}`}
                    date={d}
                />    
            )}
            <th className="font-12 text-right">{current_discount?.count || "-"}</th>
            <th className="font-12 text-right">{current_discount?.discount || "-"}</th>
            <th className="font-12 text-right">{current_discount?.discount_min}</th>
            <th className="font-12 text-center cursor-pointer" 
                title="Doble click para editar el dia" 
                onDoubleClick={handleEditDays}
            >
                {current_discount?.days}
            </th>
            <th className="font-12 text-right">{current_discount?.base || 0}</th>
        </tr>
    )
}

export default ItemDiscount;