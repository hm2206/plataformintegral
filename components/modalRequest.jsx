import React, { useEffect, useState } from 'react'
import Modal from './modal';
import { Button, Form, List, Image, } from 'semantic-ui-react';
import Show from './show'
import Skeleton from 'react-loading-skeleton';

const PlaceholderItem = () => {
    // render
    return (
        <List.Item>
            <List.Content>
                <div className="mb-1">
                    <Skeleton height="40px"/>
                </div>
                <div className="mb-1">
                    <Skeleton height="40px"/>
                </div>
                <div className="mb-1">
                    <Skeleton height="40px"/>
                </div>
                <div className="mb-1">
                    <Skeleton height="40px"/>
                </div>
            </List.Content>
        </List.Item>
    )
}

const schemaData = {
    image: "",
    text: "",
    badge: "",
};

const ModalRequest = ({ 
    api, result, path = "", isClose, getAdd = null, show = true,
    data = schemaData, title = "Assignar Persona", icon = "fas fa-user",
    verifyHidden = 'id', hidden = [], disabled = []
}) => {

    const [current_loading, setCurrentLoading] = useState(false);
    const [query_search, setQuerySearch] = useState("");
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [is_search, setIsSearch] = useState(false);
    const [is_error, setIsError] = useState(false);

    const getDatos = async (add = false) => {
        setCurrentLoading(true);
        await api.get(`${path}?page=${current_page}&query_search=${query_search}`)
        .then(async res => {
            let response = res.data[result];
            let newData = await settingData(response.data || [])
            setDatos(add ? [...datos, ...newData] : newData);
            setCurrentTotal(response.total || 0);
            setCurrentLastPage(response.lastPage || response.last_page || 0);
            setIsError(false);
        }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    // renderizar item
    const renderObj = (name, obj = {}) => {
        if (!name) return name;
        let newObj = JSON.parse(JSON.stringify(obj || {}));
        let value = data[name] || "";
        let data_string = `${value}`.split('.');
        // obtener obj
        for (let attr of data_string) {
            if (typeof newObj[attr] == 'object') newObj = newObj[attr];
            else return newObj[attr] || "";
        }
        // response 
        return response;
    }

    const settingData = async (datos = []) => {
        let payload = []
        for (let d of datos) {
            if (await validateHidden(d)) continue;
            payload.push({
                __id: d[verifyHidden],
                image: renderObj('image', d),
                text: renderObj('text', d),
                badge: renderObj('badge', d),
                obj: d
            });
        }
        // response
        return payload;
    }

    const validateHidden = (obj = {}) => {
        let value = obj[verifyHidden];
        if (!value) return false;
        if (!hidden.includes(value)) return false;
        return true;
    }

    const handleAdd = (data) => {
        let obj = data.obj;
        if (typeof getAdd == 'function') getAdd(obj);
    }

    // primera carga
    useEffect(() => {
        getDatos();
    }, []);

    // buscador
    useEffect(() => {
        if (is_search) {
            getDatos();
            setIsSearch(false);
        }
    }, [is_search]);

    // next page
    useEffect(() => {
        if (current_page > 1) getDatos(true);
    }, [current_page]);

    // render
    return (
        <Modal
            show={show}
            isClose={isClose}
            titulo={<span><i className={icon}></i> {title}</span>}
        >
            <Form className="card-body">
                <div className="row justify-content-center pl-4 pr-4">
                    <div className="col-md-10 mb-2 text-left">
                        <Form.Field>
                            <input type="text"
                                placeholder="Buscar persona por: Nombre Completos"
                                value={query_search || ""}
                                name="query_search"
                                onChange={({ target }) => setQuerySearch(target.value)}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-2">
                        <Button fluid
                            onClick={(e) => {
                                setCurrentPage(1);
                                setIsSearch(true);
                            }}
                        >
                            <i className="fas fa-search"></i>
                        </Button>
                    </div>
                </div>

                <div className="pl-4 mt-4 pr-4">

                    <List divided verticalAlign='middle'>
                        {datos.map(obj => 
                            <List.Item key={`list-people-${obj.__id}`}>
                                <List.Content floated='right'>
                                    <Button color="blue"
                                        disabled={disabled.includes(obj.__id)}
                                        onClick={(e) => handleAdd(obj)}
                                    >
                                        <i className="fas fa-plus"></i>
                                    </Button>
                                </List.Content>
                                <Image avatar src={obj.image || '/img/base.png'} 
                                    style={{ objectFit: 'cover' }}
                                />
                                <List.Content>
                                    <span className="uppercase">{obj.text || ""}</span>
                                    <span className="badge badge-dark ml-1">{obj?.badge || ''}</span>
                                </List.Content>
                            </List.Item>
                        )}
                        {/* no hay registros */}
                        <Show condicion={!current_loading && !datos.length}>
                            <List.Item>
                                <List.Content>
                                    <div className="text-center text-muted"><b>No hay datos disponibles</b></div>
                                </List.Content>
                            </List.Item>
                        </Show>

                        {/* preloader */}
                        <Show condicion={current_loading}>
                            <PlaceholderItem/>
                        </Show>
                    </List>    
                </div>

                <div className="col-md-12 mt-3">
                    <Button fluid
                        disabled={current_loading || !(current_last_page >= (current_page + 1))}
                        onClick={(e) => setCurrentPage(current_page + 1)}
                    >
                        <i className="fas fa-arrow-down"></i> Obtener más registros
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

export default ModalRequest;