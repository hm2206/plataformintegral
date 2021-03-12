import React, { useState, useContext, useEffect, Fragment } from 'react';
import { BtnBack, funcBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import { Form, Button } from 'semantic-ui-react';
import { unujobs, handleErrorRequest } from '../../../services/apis';
import Router from 'next/router';
import Swal from 'sweetalert2'
import { AUTHENTICATE } from '../../../services/auth';
import Show from '../../../components/show';
import atob from 'atob';
import BoardSimple from '../../../components/boardSimple';
import HeaderCronograma from '../../../components/cronograma/headerCronograma'
import { AppContext } from '../../../contexts/AppContext';
import ContentControl from '../../../components/contentControl';
import { EntityContext } from '../../../contexts/EntityContext';
import NotFoundData from '../../../components/notFoundData';

const EditCronograma = ({ pathname, query, success, cronograma }) => {

    // validar data
    if (!success) return <NotFoundData/>

    // app
    const app_context = useContext(AppContext);
    
    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [edit, setEdit] = useState(false);

    // handle entity
    useEffect(() => {
        entity_context.fireEntity({ render: true, disabled: true });
        return () => entity_context.fireEntity({ render: false, disabled: false });
    }, []);

    // habilitar edición
    useEffect(() => {
        if (!edit) setForm(JSON.parse(JSON.stringify(cronograma)));
    }, [edit]);

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // actualizar cronograma
    const update = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en guardar los datos?', 'Estoy suguro')
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        let datos = new FormData;
        datos.append('descripcion', form.descripcion || "");
        datos.append('observacion', form.observacion || "");
        datos.append('sello', form.sello || "");
        datos.append('token_verify', form.token_verify || "");
        datos.append('_method', 'PUT');
        await unujobs.post(`cronograma/${cronograma.id}`, datos)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            await Router.push(location.href);
            setEdit(false);
        })
        .catch(err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
    }

    // eliminando cronograma
    const destroy = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en eliminar el cronograma permanentemente?`, 'Eliminar');
        if (!answer) return false;
        let anulado = 0;
        app_context.setCurrentLoading(true);
        let datos = Object.assign({}, form);
        datos._method  = 'DELETE';
        datos.anulado = anulado;
        await unujobs.post(`cronograma/${cronograma.id}`, datos)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message })
            let { push } = Router;
            push(funcBack());
        }).catch(err => handleErrorRequest(err, null,  () => app_context.setCurrentLoading(false)));
    }

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    title={<HeaderCronograma cronograma={cronograma}/>}
                    info={["Editar cronograma"]}
                    prefix={<BtnBack/>}
                    options={[]}
                    bg="light"
                >
                    <Form className="card-body">
                        <div className="row">
                            <div className="col-md-12">
                                <b>( <b className="text-red">*</b> ) Campos obligatorios</b>
                                <hr/>
                            </div>

                            <div className="col-md-4">
                                <Form.Field>
                                    <label htmlFor="">Planilla</label>
                                    <input type="text"
                                        readOnly
                                        defaultValue={cronograma.planilla && cronograma.planilla.nombre}
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label htmlFor="">Adicional</label>
                                    <input type="text" 
                                        defaultValue={cronograma.adicional ? cronograma.adicional : ' No'}
                                        readOnly
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-4">
                                <Form.Field>
                                    <label htmlFor="">Año</label>
                                    <input type="text"
                                        defaultValue={cronograma.year}
                                        readOnly
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label htmlFor="">Remanente</label>
                                    <input type="text"
                                        defaultValue={cronograma.remanente ? 'Si' : 'No'}
                                        readOnly
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-4">
                                <Form.Field>
                                    <label htmlFor="">Mes</label>
                                    <input type="text"
                                        defaultValue={cronograma.mes}
                                        readOnly
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label htmlFor="">Dias</label>
                                    <input type="text"
                                        defaultValue={cronograma.dias}
                                        readOnly
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mt-3">
                                <Form.Field>
                                    <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                    <input type="text"
                                        value={form.descripcion || ""}
                                        disabled={current_loading}
                                        readOnly={!edit}
                                        name="descripcion"
                                        onChange={({ target }) => handleInput(target)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-2 mt-3">
                                <Form.Field>
                                    <label htmlFor="">Sello</label>
                                    <label htmlFor="sello" className="ui black button text-white">
                                        <i className="fas fa-file"></i>
                                        <input type="file" 
                                            accept="image/*"
                                            id="sello"
                                            hidden
                                            name="sello"
                                            readOnly={!edit}
                                            onChange={({ target }) => handleInput({ name: target.name, value: target.files[0] })}
                                        />
                                    </label>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mt-3">
                                <Form.Field>
                                    <label htmlFor="">Observación <b className="text-red">*</b></label>
                                    <textarea name="" id="" cols="30" rows="10"
                                        value={form.observacion || ""}
                                        name="observacion"
                                        readOnly={!edit}
                                        onChange={({ target }) => handleInput(target)}
                                    />
                                </Form.Field>
                            </div>

                            <Show condicion={typeof form.sello == 'string'}>
                                <div className="col-md-6 mt-3 text-center">
                                    <b><i className="fas fa-image"></i> Imagen del Sello</b> <br/>
                                    <img src={form.sello} alt="sello"
                                        style={{ border: "1px solid #000", width: "300px", height: "200px", objectFit: "contain" }}
                                    />
                                </div>
                            </Show>
                        </div>
                    </Form>
                </BoardSimple>
            </div>
            {/* panel de control */}
            <ContentControl>
                {/* sin editar */}
                <Show condicion={!edit}>
                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="blue"
                            basic
                            onClick={(e) => setEdit(true)}
                        >
                            <i className="fas fa-pencil-alt"></i>
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="red"
                            onClick={destroy}
                        >
                            <i className="fas fa-trash"></i>
                        </Button>
                    </div>
                </Show>
                {/* editar */}
                <Show condicion={edit}>
                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="red"
                            disabled={current_loading}
                            onClick={(e) => setEdit(false)}
                        >
                            <i className="fas fa-times"></i>
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="blue"
                            disabled={current_loading}
                            onClick={update}
                            loading={current_loading}
                        >
                            <i className="fas fa-sync"></i>
                        </Button>
                    </div>
                </Show>
            </ContentControl>
        </Fragment>
    )
}

// server
EditCronograma.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // obtener id
    let id = atob(query.id) || "__error";
    //find cronograma
    let { success, cronograma } = await unujobs.get(`cronograma/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false }));
    // response
    return { pathname, query, success, cronograma };
}

// export 
export default EditCronograma;