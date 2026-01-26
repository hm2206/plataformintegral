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
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import NotFoundData from '../../../components/notFoundData'

const actions = {
    ADD_ENTITY: "ADD_ENTITY",
    ADD_DEPENDENCIA: "ADD_DEPENDENCIA",
    ADD_PERMISOS: "ADD_PERMISOS",
};

const ConfigUser = () => {
    const router = useRouter();
    const { pathname, query } = router;

    // app
    const app_context = useContext(AppContext);

    // estados
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [option, setOption] = useState();
    const [form, setForm] = useState({});
    const [edit, setEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [reset_password, setResetPassword] = useState();

    // obtener usuario
    const fetchUser = async () => {
        if (!query.id) return;
        setLoading(true);
        try {
            const id = atob(query.id);
            const res = await authentication.get(`user/${id}`);
            setUser(res.data.user || null);
            setForm(res.data.user || {});
        } catch (err) {
            console.error(err);
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchUser();
    }, [query.id]);

    // reset form cuando se cancela edición
    useEffect(() => {
        if (!edit && user) setForm(Object.assign({}, user));
    }, [edit, user]);

    // loading state
    if (loading) {
        return (
            <div className="col-md-12 text-center py-5">
                <i className="fas fa-spinner fa-spin fa-2x"></i>
                <p className="mt-2">Cargando...</p>
            </div>
        );
    }

    // not found
    if (!user) return <NotFoundData/>

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
                                            <div className="col-md-6 text-right">
                                                <Button variant="secondary" onClick={autoResetPassword}>
                                                    <i className="fas fa-key mr-1"></i> Reset Password
                                                </Button>
                                            </div>
                                        }
                                    >
                                        <div className="col-md-6 mb-3 text-right">
                                            <Form.Field>
                                                <label htmlFor="">
                                                    Sincronizar email con el
                                                    <span className="ml-1 badge badge-light">email de contacto</span>
                                                </label>
                                                <div className="mt-2">
                                                    <label className="tw-relative tw-inline-flex tw-items-center tw-cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="sync"
                                                            checked={form.sync ? true : false}
                                                            onChange={(e) => handleInput({ name: 'sync', value: e.target.checked ? 1 : 0 })}
                                                            className="tw-sr-only tw-peer"
                                                        />
                                                        <div className="tw-w-11 tw-h-6 tw-bg-gray-200 tw-rounded-full tw-peer peer-checked:tw-bg-primary-500 peer-checked:after:tw-translate-x-full after:tw-content-[''] after:tw-absolute after:tw-top-0.5 after:tw-left-[2px] after:tw-bg-white after:tw-rounded-full after:tw-h-5 after:tw-w-5 after:tw-transition-all"></div>
                                                    </label>
                                                </div>
                                            </Form.Field>
                                        </div>

                                        <div className="col-12 text-right tw-space-x-2">
                                            <Button
                                                variant="outline"
                                                className="tw-text-red-500 tw-border-red-300 hover:tw-bg-red-50"
                                                onClick={() => setEdit(false)}
                                            >
                                                <i className="fas fa-times mr-1"></i> Cancelar
                                            </Button>

                                            <Button onClick={handleUpdate}>
                                                <i className="fas fa-sync mr-1"></i> Guardar cambios
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

// exportar
export default ConfigUser;