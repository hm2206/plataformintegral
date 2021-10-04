import React, { useContext, useEffect, useState, Fragment } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Select, Icon } from 'semantic-ui-react';
import { Confirm, parseOptions } from '../../services/utils';
import Swal from 'sweetalert2';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../contexts/AppContext';
import usePaginate from '../../hooks/usePaginate'

const PlaceHolderButton = ({ count = 1, height = "38px" }) => <Skeleton height={height} count={count}/>

const FragmentAportacion = () => (
    <div className="col-md-4 mb-3">
        <PlaceHolderButton/>
    </div>
)

const PlaceholderAportacion = () => {

    const datos = [1, 2, 3, 4];

    return (
        <Fragment>
            {datos.map(d => <Fragment key={`aportacion-placeholder-${d}`}>
                <FragmentAportacion/>
                <FragmentAportacion/>
                <FragmentAportacion/>
            </Fragment>)}
        </Fragment>
    );
}


const Discount = () => {

    // cronograma
    const { edit, setEdit, send, setSend, loading, historial, setBlock, cronograma, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
    const [discounts, setDiscounts] = useState([]);
    const [old, setOld] = useState([]);
    const [error, setError] = useState(false);

    // app
    const app_context = useContext(AppContext);

    // hooks
    const request = usePaginate({ api: unujobs, url: `historial/${historial.id}/discounts`, execute: false }, (data, add) => {
        setDiscounts(add ? [...discounts, ...data] : data); 
        setOld(add ? [...discounts, ...data] : data);
    });

    // monto
    const handleMonto = async (index, value, obj) => {
        let newMonto = Object.assign({}, obj);
        let newDiscounts = JSON.parse(JSON.stringify(discounts));
        newMonto.send = true;
        newMonto.monto = value;
        newDiscounts[index] = newMonto;
        setDiscounts(newDiscounts);
    }

    // actualizar discounts
    const update = async () => {
        const form = new FormData();
        let datos = await discounts.filter(rem => rem.send == true);
        form.append('_method', 'PUT');
        datos.map((d, index) => {
            let attributes = Object.keys(d);
            attributes.forEach(a => {
                let allow = ['id', 'monto'];
                if (!allow.includes(a)) return;
                form.append(`discounts[${index}][${a}]`, d[a]);
            });
        });
        // valdiar que se modificarón los datos
        if (!datos.length)  await Swal.fire({ icon: 'warning', text: 'No se encontraron cambios' });
        // send changes
        else {
            app_context.setCurrentLoading(true);
            await unujobs.post(`historial/${historial.id}/discounts`, form, { headers: { CronogramaID: cronograma.id } })
            .then(async () => {
                app_context.setCurrentLoading(false);
                await Swal.fire({ icon: 'success', text: "Los cambios se guardarón correctamente!" });
                setEdit(false);
                request.setIsRefresh(true);
            })
            .catch(() => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: "No se pudó guardar los cambios" });
            });
        }   
        setSend(false);
        setBlock(false);
    }
    
    // primera carga
    useEffect(() => {
        setIsEditable(true);
        setIsUpdatable(true);
        if (historial.id) request.setIsRefresh(true);
        return () => {}
    }, [historial.id]);

    useEffect(() => {
        setBlock(request.loading);
    }, [request.loading]);

    useEffect(() => {
        if (!edit && !send) setDiscounts(old);
    }, [!edit]);

    // update discounts
    useEffect(() => {
        if (send) update();
    }, [send]);


    // eliminar aportacion
    // const deleteAportacion = async (id, index) => {
    //     let answer = await Confirm("warning", `¿Deseas elminar la aportacion del empleador?`);
    //     if (answer) {
    //         app_context.setCurrentLoading(true);
    //         setBlock(true);
    //         await unujobs.post(`aportacion/${id}`, { _method: "DELETE" })
    //         .then(async res => {
    //             app_context.setCurrentLoading(false);
    //             let { success, message } = res.data;
    //             if (!success) throw new Error(message);
    //             await Swal.fire({ icon: 'success', text: message });
    //             let newAportaciones = JSON.parse(JSON.stringify(aportaciones));
    //             newAportaciones.splice(index, 1);
    //             setAportaciones(newAportaciones);
    //             setOld(JSON.parse(JSON.stringify(newAportaciones)));
    //             setEdit(false);
    //         }).catch(err => {
    //             app_context.setCurrentLoading(false);
    //             Swal.fire({ icon: 'error', text: err.message });
    //         });
    //         setBlock(false);
    //     }
    // }

    return (
    <Form className="row">
        <Show condicion={!loading && !request.loading}
            predeterminado={<PlaceholderAportacion/>}
        >
            {discounts.map((obj, index) => 
                <div  key={`remuneracion-${obj.id}`}
                    className="col-md-4 mb-1 col-lg-4"
                >
                    <b className="mb-1">{obj.name}</b>
                    <input type="number"
                        step="any" 
                        value={obj.monto || ""}
                        disabled={!edit}
                        onChange={({target}) => handleMonto(index, target.value, obj)}
                        min="0"
                    />
                </div>
            )}
        </Show>
    </Form>)
}


export default Discount;