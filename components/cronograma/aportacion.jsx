import React, { useContext, useEffect, useState, Fragment } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Select, Icon } from 'semantic-ui-react';
import { Confirm, parseOptions } from '../../services/utils';
import Swal from 'sweetalert2';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../contexts/AppContext';
import { SelectTypeAportacion } from '../select/cronograma';

const PlaceHolderButton = ({ count = 1, height = "38px" }) => <Skeleton height={height} count={count}/>

const FragmentAportacion = () => (
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


const Aportacion = () => {

    // cronograma
    const { edit, setEdit, loading, historial, setBlock, cronograma, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
    const [current_loading, setCurrentLoading] = useState(true);
    const [aportaciones, setAportaciones] = useState([]);
    const [old, setOld] = useState([]);
    const [error, setError] = useState(false);
    const [form, setForm] = useState({});
    
    // app
    const app_context = useContext(AppContext);

    // obtener aportacion empleador
    const findAportacion = async () => {
        setCurrentLoading(true);
        setBlock(true);
        await unujobs.get(`historial/${historial.id}/aportacion`)
            .then(res => {
                let { data } = res;
                let { success, message } = data;
                if (!success) throw new Error(message);
                setAportaciones(data.aportaciones);
                setOld(JSON.parse(JSON.stringify(data.aportaciones)));
                setBlock(false);
            }).catch(err => {
                setAportaciones([]);
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
        if (historial.id)  findAportacion();
        return () => {}
    }, [historial.id]);

    // crear aportacion
    const createAportacion = async () => {
        let answer = await Confirm("warning", `¿Deseas agregar la aportación de empleador?`, 'Aceptar');
        if (answer) {
            app_context.setCurrentLoading(true);
            setBlock(true);
            await unujobs.post('aportacion', {
                historial_id: historial.id,
                type_aportacion_id: form.type_aportacion_id || ""
            })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await findAportacion();
                setEdit(false);
            })
            .catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
            setBlock(false);
        }
    }

    // eliminar aportacion
    const deleteAportacion = async (id, index) => {
        let answer = await Confirm("warning", `¿Deseas elminar la aportacion del empleador?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            setBlock(true);
            await unujobs.post(`aportacion/${id}`, { _method: "DELETE" })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                let newAportaciones = JSON.parse(JSON.stringify(aportaciones));
                newAportaciones.splice(index, 1);
                setAportaciones(newAportaciones);
                setOld(JSON.parse(JSON.stringify(newAportaciones)));
                setEdit(false);
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message });
            });
            setBlock(false);
        }
    }

    // cambios en el form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, JSON.parse(JSON.stringify(form)));
        newForm[name] = value;
        setForm(newForm);
    }

    return (
    <Form className="row">
        <div className="col-md-12">
            <div className="row">
                <div className="col-md-8 col-lg-5 col-10">
                    <SelectTypeAportacion
                        name="type_aportacion_id"
                        value={`${form.type_aportacion_id || ""}`}
                        onChange={(e, obj) => handleInput(obj)}
                        disabled={!edit}
                    />
                </div>

                <div className="col-xs col-lg-2 col-md-4 col-2">
                    <Show condicion={!loading && !current_loading}
                        predeterminado={<PlaceHolderButton/>}
                    >
                        <Button color="green"
                            fluid
                            disabled={!edit || !form.type_aportacion_id}
                            onClick={createAportacion}    
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
            predeterminado={<PlaceholderAportacion/>}
        >
            {aportaciones.map((obj, index) => 
                <div  key={`remuneracion-${obj.id}`}
                    className="col-md-12 mb-1 col-lg-4"
                >
                    <div className="row">
                        <div className="col-md-10 col-10 col-lg-10">
                            <Button 
                                fluid
                            >
                                { obj.key }.-{ obj.descripcion } 
                                <i className="fas fa-arrow-right ml-1 mr-1"></i> 
                                <small className="badge badge-dark">S./ { obj.monto }</small>
                            </Button>
                        </div>

                        <div className="col-md-2 col-2 col-lg-2">
                            <Button color="red"
                                fluid
                                onClick={(e) => deleteAportacion(obj.id, index)}
                                disabled={!edit}
                            >
                                <i className="fas fa-trash"></i>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Show>
    </Form>)
}


export default Aportacion;