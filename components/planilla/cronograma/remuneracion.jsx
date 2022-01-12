import React, { useContext, useState, useEffect, Fragment } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Input } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../contexts/AppContext';

const PlaceHolderButton = ({ count = 1 }) => <Skeleton height="38px" count={count}/>

const PlaceholderRemuneracion = () => (
    <Fragment>
        <div className="col-md-3">
            <PlaceHolderButton count={3}/>
        </div>

        <div className="col-md-3">
            <PlaceHolderButton count={3}/>
        </div>

        <div className="col-md-3">
            <PlaceHolderButton count={3}/>
        </div>

        <div className="col-md-3">
            <PlaceHolderButton count={3}/>
        </div>
    </Fragment>
);

const Remuneracion = () => {

    // cronograma
    const { edit, setEdit, send, setSend, loading, setLoading, historial, setBlock, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
    const [total_bruto, setTotalBruto] = useState(0);
    const [total_desct, setTotalDesct] = useState(0);
    const [base, setBase] = useState(0);
    const [total_neto, setTotalNeto] = useState(0);
    const [current_loading, setCurrentLoading] = useState(true);
    const [remuneraciones, setRemuneraciones] = useState([]);
    const [old, setOld] = useState([]);
    const [error, setError] = useState(false);

    // app
    const app_context = useContext(AppContext);

    const findRemuneracion = async () => {
        setCurrentLoading(true);
        setBlock(true);
        await unujobs.get(`historial/${historial.id}/remuneracion`)
            .then(res => {
                let { data } = res;
                let { success, message } = data;
                if (!success) throw new Error(message);
                setRemuneraciones(data.remuneraciones);
                setOld(data.remuneraciones);
                setTotalBruto(data.total_bruto);
                setTotalDesct(data.total_desct);
                setTotalNeto(data.total_neto);
                setBase(data.base);
            })
            .catch(err => {
                setRemuneraciones([]);
                setOld([]);
                setTotalBruto(0);
                setTotalDesct(0)
                setTotalNeto(0);
                setBase(0);
                setError(true);
            });
        setCurrentLoading(false);
        setBlock(false);
    }

    useEffect(() => {
        setIsEditable(true);
        setIsUpdatable(true);
        if (historial.id) findRemuneracion();
        return () => {}
    }, [historial.id]);

    useEffect(() => {
        if (!edit && !send) setRemuneraciones(old);
    }, [!edit]);

    const handleMonto = async (index, value, obj) => {
        let newMonto = Object.assign({}, obj);
        let newRemuneraciones = JSON.parse(JSON.stringify(remuneraciones));
        newMonto.send = true;
        newMonto.monto = value;
        newRemuneraciones[index] = newMonto;
        await setRemuneraciones(newRemuneraciones);
    }
    
    const updateRemuneraciones = async () => {
        const form = new FormData();
        let datos = await remuneraciones.filter(rem => rem.send == true);
        form.append('_method', 'PUT');
        form.append('remuneraciones', JSON.stringify(datos));
        // valdiar que se modificarón los datos
        if (!datos.length)  await Swal.fire({ icon: 'warning', text: 'No se encontraron cambios' });
        // send changes
        else {app_context.setCurrentLoading(true);
            await unujobs.post(`remuneracion/${historial.id}/all`, form, { headers: { CronogramaID: historial.cronograma_id } })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setEdit(false);
                await findRemuneracion();
            })
            .catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
        }   
        setSend(false);
        setBlock(false);
    }

    // update remuneraciones
    useEffect(() => {
        if (send) updateRemuneraciones();
    }, [send]);
 
    return (
        <Form className="row">
            <div className="col-md-12">
                <div className="row justify-content-center">
                    <b className="col-md-3 col-6 mb-1">
                        <Show condicion={!loading && !current_loading}
                            predeterminado={<PlaceHolderButton/>}
                        >
                            <Button basic fluid color="black">
                                Total Bruto: S/ {total_bruto}
                            </Button>
                        </Show>
                    </b>

                    <b className="col-md-3 col-6 mb-1">
                        <Show condicion={!loading && !current_loading}
                            predeterminado={<PlaceHolderButton/>}
                        >
                            <Button basic fluid color="black">
                                Total Descuentos: S/ {total_desct}
                            </Button>
                        </Show>
                    </b>

                    <b className="col-md-3 col-6 mb-1">
                        <Show condicion={!loading && !current_loading}
                            predeterminado={<PlaceHolderButton/>}
                        >
                            <Button basic fluid color="black">
                                Base Imponible: S/ {base}
                            </Button>
                        </Show>
                    </b>
                    
                    <b className="col-md-3 col-6 mb-1">
                        <Show condicion={!loading && !current_loading}
                            predeterminado={<PlaceHolderButton/>}
                        >
                            <Button basic fluid color="black">
                                Total Neto: S/ {total_neto}
                            </Button>
                        </Show>
                    </b>
                </div>
            </div>
                
            <div className="col-md-12">
                <hr/>
            </div>

            <Show condicion={!loading && !current_loading}
                predeterminado={<PlaceholderRemuneracion/>}
            >
                {remuneraciones.map((obj, index) => 
                    <div  key={`remuneracion-${obj.id}`}
                         className="col-md-3 mb-3"
                    >
                        <span className={obj.monto > 0 ? 'text-red' : ''}>
                            {obj.key}
                        </span>
                            .-
                        <span className={obj.monto > 0 ? 'text-primary' : ''}>
                            {obj.alias}
                        </span>

                        <Show condicion={obj.base == 0}>
                            <b className="ml-1 badge badge-dark mb-1" title="Calculable a la Base imponible">
                                <i className="fas fa-calculator"></i>
                            </b>
                        </Show>

                        <Form.Field>
                            <input type="number"
                                step="any" 
                                value={obj.monto || ""}
                                disabled={!obj.edit || !edit}
                                onChange={({target}) => handleMonto(index, target.value, obj)}
                                min="0"
                            />
                        </Form.Field>
                    </div>
                )}
            </Show>        
        </Form>
    )
}


export default Remuneracion;


