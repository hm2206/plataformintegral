import React, { useContext, useEffect, useState, Fragment } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Select, Icon } from 'semantic-ui-react';
import { parseOptions, Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../contexts/AppContext';
import { SelectTypeSindicato } from '../select/cronograma';

const PlaceHolderButton = ({ count = 1, height = "38px" }) => <Skeleton height={height} count={count}/>

const FragmentSindicato = () => (
    <div className="col-md-4 mb-3">
        <div className="row">
            <div className="col-md-9 col-lg-10 col-10">
                <PlaceHolderButton/>
            </div>

            <div className="col-md-3 col-lg-2 col-2">
                <PlaceHolderButton/>
            </div>
        </div>
    </div>
)

const PlaceholderSindicato = () => {

    const datos = [1, 2, 3, 4];

    return (
        <Fragment>
            {datos.map(d => <Fragment key={`sindicator-placeholder-${d}`}>
                <FragmentSindicato/>
                <FragmentSindicato/>
                <FragmentSindicato/>
            </Fragment>)}
        </Fragment>
    );
}


const Sindicato = () => {

    // cronograma
    const { edit, setEdit, loading, historial, setBlock, cronograma, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
    const [current_loading, setCurrentLoading] = useState(true);
    const [sindicatos, setSindicatos] = useState([]);
    const [old, setOld] = useState([]);
    const [error, setError] = useState(false);
    const [form, setForm] = useState({});
    
    // app
    const app_context = useContext(AppContext);

    // obtener descuentos detallados
    const findSindicato = async () => {
        setCurrentLoading(true);
        setBlock(true);
        await unujobs.get(`historial/${historial.id}/sindicato`)
            .then(res => {
                let { data } = res;
                let { success, message } = data;
                if (!success) throw new Error(message);
                setSindicatos(data.sindicatos);
                setOld(JSON.parse(JSON.stringify(data.sindicatos)));
                setBlock(false);
            }).catch(err => {
                setSindicatos([]);
                setOld([]);
                setError(true);
                setBlock(false);
            });
        setCurrentLoading(false);
    }
    
    // primera carga
    useEffect(() => {
        setIsEditable(true);
        setIsUpdatable(false);
        if (historial.id) findSindicato();
        return () => {}
    }, [historial.id]);

    // cambios en el form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, JSON.parse(JSON.stringify(form)));
        newForm[name] = value;
        setForm(newForm);
    }

    // crear sindicato
    const createSindicato = async () => {
        let answer = await Confirm('warning', '¿Deseas guardar el Sindicato/Afiliación?');
        if (answer) {
            app_context.setCurrentLoading(true);
            let payload = {
                historial_id: historial.id,
                type_sindicato_id: form.type_sindicato_id
            };
            // send
            await unujobs.post('sindicato', payload, { headers: { CronogramaID: historial.cronograma_id } })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await findSindicato();
                setEdit(false);
                setForm({});
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
            setBlock(false);
        }
    }

    // eliminar sindicato
    const deleteSindicato = async (id, index) => {
        let answer = await Confirm('warning', '¿Deseas eliminar el Sindicato/Afiliación?');
        if (answer) {
            app_context.setCurrentLoading(true);
            setBlock(true);
            await unujobs.post(`sindicato/${id}`, { _method: 'DELETE' }, { headers: { CronogramaID: historial.cronograma_id } })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                let newSindicatos = JSON.parse(JSON.stringify(sindicatos));
                await newSindicatos.splice(index, 1);
                setSindicatos(newSindicatos);
                setOld(JSON.parse(JSON.stringify(newSindicatos)));
            })
            .catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
            setBlock(false);
        }
    }
 
    return (
    <Form className="row">
        <div className="col-md-12">
            <div className="row">
                <div className="col-md-8 col-lg-5 col-10 mb-1">       
                    <SelectTypeSindicato
                        name="type_sindicato_id"
                        disabled={!edit || loading || current_loading}
                        value={form.type_sindicato_id || ""}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>
                
                <div className="col-xs col-md-4 col-lg-2 col-2">
                    <Show condicion={!loading && !current_loading}
                        predeterminado={<PlaceHolderButton/>}
                    >
                        <Button color="green"
                            disabled={!form.type_sindicato_id || !edit}   
                            onClick={createSindicato} 
                            fluid
                        >
                            <i className="fas fa-plus"></i>
                        </Button>
                    </Show>
                </div>
            </div>
        </div>
                
        <div className="col-md-12">
            <hr/>
        </div>

        <Show condicion={!loading && !current_loading}
            predeterminado={<PlaceholderSindicato/>}
        >
            {sindicatos.map((obj, index) => 
                <div className="col-md-12 col-lg-4 mb-2 col-12" key={`sindicato-${obj.id}`}>
                    <div className="row">
                        <div className="col-md-9 col-lg-10 col-10">
                            <Button fluid>
                                {obj.type_sindicato.nombre} 
                                <Show condicion={obj.porcentaje > 0}>
                                    <span className="ml-2 badge badge-dark">%{obj.porcentaje}</span>
                                </Show>
                                <Show condicion={obj.porcentaje == 0}>
                                    <span className="ml-2 badge badge-dark">S./{obj.monto}</span>
                                </Show>
                            </Button>
                        </div>  

                        <div className="col-md-3 col-lg-2 col-2">
                            <Button color="red" fluid
                                disabled={!edit}
                                onClick={(e) => deleteSindicato(obj.id, index)}
                            >
                                <i className="fas fa-trash-alt"></i>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Show>
    </Form>)
}


export default Sindicato;