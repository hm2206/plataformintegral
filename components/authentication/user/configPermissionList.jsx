import React, { Fragment, useEffect, useState } from 'react';
import { Accordion, Menu, Form } from 'semantic-ui-react';
import SystemProvider from '../../../providers/authentication/SystemProvider';
import PermissionProvider from '../../../providers/authentication/PermisssionProvider';
import collect from 'collect.js';

// provider
const systemProvider = new SystemProvider();
const permissionProvider = new PermissionProvider();

const ItemAction = ({ user = {}, module = {} }) => {

    // estados
    const [current, setCurrent] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false);

    // eliminar
    const handleDelete = async () => {
        setCurrentLoading(true);
        await permissionProvider.delete(current.permission_id)
            .then(res => {
                setIsError(false);
                setCurrent({ ...current, checked: false });
            }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    // agregar
    const handleStore = async () => {
        setCurrentLoading(true);
        let payload = { user_id: user.id, module_id: current.id };
        await permissionProvider.store(payload)
            .then(res => {
                setIsError(false);
                setCurrent({ ...current, checked: true });
            }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    // obtener module
    useEffect(() => {
        if (module) setCurrent(Object.assign({}, module || {}));
    }, [module]);

    // render
    return (
        <Form.Checkbox 
            className={is_error ? 'text-red' : null}
            disabled={current_loading}
            label={current.name} 
            checked={current.checked}
            onChange={(e, obj) => current.checked ? handleDelete() : handleStore()}
        /> 
    )
}

const ItemPermission = ({ active = false, user = {}, system = {}, permissions = [] }) => {
    
    // estado
    const [execute, setExecute] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [is_error, setIsError] = useState(false);

    // obtener systemas
    const findSystem = async () => {
        setCurrentLoading(true);
        await systemProvider.show(system.id)
            .then(async res => {
                let { modules } = res.system;
                let newPermissions = collect([...permissions]);
                let plucked = newPermissions.pluck('module_id').toArray();
                let payload = await modules.filter(m => {
                    let is_index = plucked.indexOf(m.id);
                    let exists = is_index >= 0 ? true : false;
                    m.checked = exists;
                    if (exists) {
                        let config = permissions[is_index] || {};
                        m.permission_id = config.id || undefined;
                    }
                    return m;
                });
                // fixed
                setDatos(payload);
                setIsError(false);
            }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    // activar ejecución
    useEffect(() => {
        if (active) setExecute(true);
    }, [active]);

    // executar consulta
    useEffect(() => {
        if (execute) findSystem();
    }, [execute]);

    // render
    return (
        <Accordion.Content active={active}>
            <Fragment>
                <Form.Group grouped>
                    {datos.map((mod, indexM) => 
                        <ItemAction key={`modulo-${mod.id}-${indexM}`}
                            module={mod}
                            checked={mod.checked}
                            user={user}
                        />   
                    )}
                </Form.Group>
            </Fragment>
        </Accordion.Content>
    );
}

const ConfigPermissionList = ({ user, data = [], disabled = false }) => {

    // estados
    const [datos, setDatos] = useState([]);
    const [page, setPage] = useState(1);
    const [last_page, setLastPage] = useState(0);
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false);
    const [index, setIndex] = useState(undefined);

    // obtener sistemas
    const getSystem = async (add = false) => {
        setCurrentLoading(true);
        await systemProvider.index({ page })
            .then(res => {
                let { systems } = res;
                setDatos(add ? [...datos, ...systems.data] : systems.data);
                setLastPage(systems.lastPage || 0);
                setIsError(false);
            }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    // executar
    useEffect(() => {
        getSystem();
    }, []);

    // desactivar
    if (disabled) return null;

    // render
    return (
        <div className="table-responsive">
            <Accordion as={Menu} vertical fluid>
                {datos.map((d, indexD) => 
                    <Menu.Item key={`list-menu-systen-${indexD}`}>
                        <Accordion.Title
                            active={index == indexD}
                            content={<b>{d.name}</b>}
                            index={indexD}
                            onClick={(e) => setIndex(indexD)}
                        />
                        <ItemPermission 
                            active={indexD == index}
                            permissions={data}
                            system={d}
                            user={user}
                        />
                    </Menu.Item>    
                )}
            </Accordion>
        </div>
    )
}

export default ConfigPermissionList;