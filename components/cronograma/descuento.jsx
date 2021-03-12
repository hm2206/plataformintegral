import React, { useContext, useState, useEffect, Fragment } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Input, Icon } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Show from '../show';
import { Confirm } from '../../services/utils';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../contexts/AppContext';

const PlaceHolderButton = ({ count = 1 }) => <Skeleton height="38px" count={count}/>

const PlaceholderDescuento = () => (
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

const Descuento = () => {

    // cronograma
    const { edit, setEdit, loading, send, historial, setBlock, setSend, cronograma, setIsEditable, setIsUpdatable, setRefresh } = useContext(CronogramaContext);
    const [total_bruto, setTotalBruto] = useState(0);
    const [total_desct, setTotalDesct] = useState(0);
    const [base, setBase] = useState(0);
    const [total_neto, setTotalNeto] = useState(0);
    const [current_loading, setCurrentLoading] = useState(true);
    const [descuentos, setDescuentos] = useState([]);
    const [old, setOld] = useState([]);
    const [error, setError] = useState(false);

    // app
    const app_context = useContext(AppContext);

    const findDescuento = async () => {
        setCurrentLoading(true);
        setBlock(true);
        await unujobs.get(`historial/${historial.id}/descuento`)
            .then(res => {
                let { data } = res;
                let { success, message } = data;
                if (!success) throw new Error(message);
                setDescuentos(data.descuentos);
                setOld(data.descuentos);
                setTotalBruto(data.total_bruto);
                setTotalDesct(data.total_desct);
                setTotalNeto(data.total_neto);
                setBase(data.base);
            })
            .catch(err => {
                setDescuentos([]);
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

    // primera entrada
    useEffect(() => {
        setIsEditable(true);
        setIsUpdatable(true);
        if (historial.id) findDescuento();
        return () => {}
    }, [historial.id]);

    // cancelar edit
    useEffect(() => {
        if (!edit && !send) setDescuentos(old);
    }, [!edit]);

    // cambiar montos
    const handleMonto = (index, value, obj) => {
        let newMonto = Object.assign({}, obj);
        let newDescuentos = JSON.parse(JSON.stringify(descuentos));
        newMonto.send = true;
        newMonto.monto = value;
        newDescuentos[index] = newMonto;
        setDescuentos(newDescuentos);
    }
    
    // sincronizar descuentos
    const syncDescuento = async (obj) => {
        if (!edit) return false;
        let answer = await Confirm(`warning`, `¿Estas seguro en sincronizar ${obj.descripcion}?`, 'Estoy seguro');
        if (!answer) return false;
        const form = {};
        form.monto = obj.monto;
        form._method = 'PUT';
        // send changes
        app_context.setCurrentLoading(true);
        await unujobs.post(`descuento/${obj.id}/sync`, form, { headers: { CronogramaID: historial.cronograma_id } })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            setEdit(false);
            await findDescuento();
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: err.message })
        });
        setSend(false);
        setBlock(false);
    }

    // actualizar descuentos
    const updateDescuentos = async () => {
        const form = new FormData();
        let datos = await descuentos.filter(des => des.send == true);
        form.append('_method', 'PUT');
        form.append('descuentos', JSON.stringify(datos));
        // valdiar que se modificarón los datos
        if (!datos.length) return await Swal.fire({ icon: 'warning', text: 'No se encontraron cambios' });
        // send changes
        else {
            app_context.setCurrentLoading(true);
            await unujobs.post(`descuento/${historial.id}/all`, form, { headers: { CronogramaID: historial.cronograma_id } })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setEdit(false);
                await findDescuento();
            })
            .catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
        }
        setSend(false);
        setBlock(false);
    }

    // editar descuento
    const handleEdit = async (obj, edit = 0) => {
        let answer = await Confirm("warning", `Deseas ${edit ? 'Desactivar' : 'Activar'} el calculo automático para "${obj.descripcion}"`, "Confirmar");
        if (answer) {
            app_context.setCurrentLoading(true);
            setBlock(true);
            await unujobs.post(`descuento/${obj.id}/edit`, { _method: 'PUT', edit }, { headers: { CronogramaID: cronograma.id, EntityId: cronograma.entity_id } })
            .then(async res => { 
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setEdit(false);
                setRefresh(true);
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
            setSend(false);
            setBlock(false);
        }
    }

    // update descuentos
    useEffect(() => {
        if (send) updateDescuentos();
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
                predeterminado={<PlaceholderDescuento/>}
            >
                {descuentos.map((obj, index) => 
                    <div  key={`descuento-${obj.id}`}
                         className="col-md-3 mb-3"
                    >
                        <span className={obj.monto > 0 ? 'text-red' : ''}>
                            {obj.key}
                        </span>
                            .-
                        <span className={obj.monto > 0 ? 'text-primary' : ''}>
                            {obj.descripcion}
                        </span>
                        
                        <Show condicion={obj.edit}>
                            <span className={`ml-1 ${edit ? 'cursor-pointer' : 'disabled'} font-9 badge badge-${obj.sync ? 'dark' : 'danger'}`}
                                title={`Sincronizar descuento global ${!obj.sync ? '(Modificado)' : ''}`}
                                onClick={(e) => syncDescuento(obj)}
                            >
                                <i className="fas fa-sync"></i>
                            </span>
                        </Show>

                        <Form.Field>
                            <div className="row justify-aligns-center mt-1">
                                <Show condicion={obj.edit}>
                                    <div className={!cronograma.remanente && edit ? 'col-md-9 col-9' : 'col-md-12 col-12'}>
                                        <input type="number"
                                            step="any" 
                                            value={obj.monto || ""}
                                            disabled={!edit}
                                            onChange={({target}) => handleMonto(index, target.value, obj)}
                                            min="0"
                                        />
                                    </div>

                                    <Show condicion={!cronograma.remanente && edit}>
                                        <div className="col-md-3 col-3">
                                            <Button 
                                                icon="asl"
                                                onClick={(e) => handleEdit(obj, 0)}
                                                style={{ width: "100%", height: "100%" }}
                                                size="small"
                                                basic
                                                disabled={current_loading || !edit || !historial.is_pay}>
                                            </Button>
                                        </div>
                                    </Show>
                                </Show>

                                <Show condicion={!obj.edit}>
                                    <Show condicion={!edit}>
                                        <div className="col-md-12 col-12">
                                            <Input icon='wait' iconPosition='left' 
                                                value={obj.monto || ""} 
                                                disabled
                                            />
                                        </div>
                                    </Show>

                                    <Show condicion={edit}>
                                        <div className="col-md-9 col-9">
                                            <input type="number"
                                                step="any" 
                                                value={obj.monto || ""}
                                                disabled
                                                onChange={({target}) => handleMonto(index, target.value, obj)}
                                                min="0"
                                            />
                                        </div>
                                    </Show>

                                    <Show condicion={edit}>
                                        <div className="col-md-3 col-3">
                                            <Button 
                                                icon="wait"
                                                onClick={(e) => handleEdit(obj, 1)}
                                                style={{ width: "100%", height: "100%" }}
                                                size="small"
                                                disabled={current_loading || !edit}>
                                            </Button>
                                        </div>
                                    </Show>
                                </Show>
                            </div>
                        </Form.Field>
                    </div>
                )}
            </Show>
        </Form>
    )
}


export default Descuento;