import React, { useContext, useEffect, useState } from 'react';
import { BtnBack, CheckBox, SimpleList, SimpleListContent } from '../../../components/Utils';
import { Form } from 'semantic-ui-react'
import { authentication, handleErrorRequest } from '../../../services/apis';
import { AUTHENTICATE } from '../../../services/auth';
import atob from 'atob';
import Show from '../../../components/show';
import ConfigEntity from '../../../components/authentication/user/configEntity';
import ConfigPermission from '../../../components/authentication/user/configPermission';
import ConfigEntityDependencia from '../../../components/authentication/user/configEntityDependencia';
import BoardSimple from '../../../components/boardSimple';
import { AppContext } from '../../../contexts';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import router from 'next/router';
import { Button, Checkbox } from 'semantic-ui-react';
import NotFoundData from '../../../components/notFoundData'

const actions = {
    ADD_ENTITY: "ADD_ENTITY",
    ADD_DEPENDENCIA: "ADD_DEPENDENCIA",
    ADD_PERMISOS: "ADD_PERMISOS",
};

 const ConfigUser = ({ pathname, query, success, user }) => {

    if (!success) return <NotFoundData/>

    // app
    const app_context = useContext(AppContext);

    // estados
    const [option, setOption] = useState();
    const [form, setForm] = useState({});
    const [edit, setEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [reset_password, setResetPassword] = useState();

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    const handleUpdate = async () => {
        let answer = await Confirm('info', `¿Estás seguro en guardar los cambios?`, 'Estoy seguro');
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await authentication.post(`user/${user.id}?_method=PUT`, form)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            await router.push(location.href);
            setEdit(false);
        }).catch(err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)))
    }

    const autoResetPassword = async () => {
        let answer = await Confirm('info', `¿Estás seguro en auto-generar contraseña?`, 'Estoy seguro');
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await authentication.post(`user/${user.id}/auto_reset_password?_method=PUT`, form)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message, password } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            await router.push(location.href);
            setResetPassword(password);
            setEdit(false);
        }).catch(err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)))
    }

    useEffect(() => {
        setForm(Object.assign({}, user || {}));
    }, []);

    useEffect(() => {
        if (!edit) setForm(Object.assign({}, user || {}));
    }, [edit]);

    // render
    return (
        <div className="col-md-12">
                <BoardSimple
                    prefix={<BtnBack/>}
                    title="Configuraciones de Usuario"
                    info={[user.username || ""]}
                    options={[]}
                    classNameInfo="capitalize"
                    bg="light"
                >
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-12">
                                        <h4><i className="fas fa-user"></i> Datos de Usuario</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Apellidos y Nombres</label>
                                            <input type="text" 
                                                className="uppercase"
                                                placeholder="Ingrese un nombre"
                                                value={user?.person?.fullname || ""}
                                                readOnly
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">N° Documento</label>
                                            <input type="text"
                                                placeholder="Ingrese un nombre"
                                                value={user?.person?.document_number || ""}
                                                readOnly
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors?.username?.[0] ? true : false}>
                                            <label htmlFor="">Username</label>
                                            <input type="text" 
                                                name="username"
                                                placeholder="Ingrese el username"
                                                value={form?.username || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors?.username?.[0] || ""}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors?.email?.[0] ? true : false}>
                                            <label htmlFor="">Email</label>
                                            <input type="text" 
                                                name="email"
                                                value={form?.email || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors?.email?.[0] || ""}</label>
                                        </Form.Field>
                                    </div>

                                    <Show condicion={reset_password}>
                                        <div className="col-md-12 mb-3">
                                            <Form.Field>
                                                <label htmlFor="">Contraseñ Auto-generada</label>
                                                <input type="text" 
                                                    value={reset_password || ""}
                                                    readOnly
                                                />
                                            </Form.Field>
                                        </div>
                                    </Show>

                                    <Show condicion={edit}
                                        predeterminado={
                                            <Form.Field className="col-md-6 text-right">
                                                <Button onClick={autoResetPassword}>
                                                    <i className="fas fa-key"></i> Reset Password
                                                </Button>
                                            </Form.Field>
                                        }
                                    >
                                        <div className="col-md-6 mb-3 text-right">
                                            <Form.Field>
                                                <label htmlFor="">
                                                    Sincronizar email con el 
                                                    <span className="ml-1 badge badge-light">email de contacto</span>
                                                </label>
                                                <Checkbox toggle
                                                    name="sync"
                                                    checked={form.sync ? true : false}
                                                    onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-12 text-right">
                                            <Button color="red"
                                                basic
                                                onClick={() => setEdit(false)}
                                            >
                                                <i className="fas fa-times"></i> Cancelar
                                            </Button>

                                            <Button color="blue"
                                                onClick={handleUpdate}
                                            >
                                                <i className="fas fa-sync"></i> Guardar cambios
                                            </Button>
                                        </div>
                                    </Show>

                                    <div className="col-md-12 mt-4">
                                        <hr/>
                                        <h4 className="pb-2"><i className="fas fa-cog"></i> Configuraciones</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <SimpleListContent>
                                                    <SimpleList
                                                        icon="fas fa-briefcase"
                                                        bg="primary"
                                                        title="Entidades"
                                                        onClick={(e) => setOption(actions.ADD_ENTITY)}
                                                    />
                                                    <SimpleList
                                                        icon="fas fa-building"
                                                        bg="orange"
                                                        title="Dependencias"
                                                        onClick={(e) => setOption(actions.ADD_DEPENDENCIA)}
                                                    />
                                                </SimpleListContent>
                                            </div>

                                            <div className="col-md-4">
                                                <SimpleListContent>
                                                    <SimpleList
                                                        icon="fas fa-user-tag"
                                                        bg="warning"
                                                        title="Permisos"
                                                        onClick={(e) => setOption(actions.ADD_PERMISOS)}
                                                    />
                                                </SimpleListContent>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </BoardSimple>
                {/* agregar entity */}
                <Show condicion={option == actions.ADD_ENTITY}>
                    <ConfigEntity user={user} isClose={(e) => setOption("")}/>
                </Show>
                {/* agregar dependencia */}
                <Show condicion={option == actions.ADD_DEPENDENCIA}>
                    <ConfigEntityDependencia user={user} isClose={(e) => setOption("")}/>
                </Show>
                {/* agregar permisos */}
                <Show condicion={option == actions.ADD_PERMISOS}>
                    <ConfigPermission user={user} isClose={(e) => setOption("")}/>
                </Show>
        </div>
    )
}

// server
ConfigUser.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // obtener usuario
    let id = query.id ? atob(query.id) : "__error";
    const { success, user } = await authentication.get(`user/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, user: {} }));
    // response
    return { query, pathname, success, user };
}

// exportar
export default ConfigUser;