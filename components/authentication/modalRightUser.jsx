import React, { useEffect, useState } from 'react';
import { Form, Input, Icon } from 'semantic-ui-react';
import { authentication } from '../../services/apis';
import ModalRight from '../modalRight';
import ItemCheck from '../itemCheck';
import Skeleton from 'react-loading-skeleton'
import Show from '../show';

const Placeholder = () => {

    const datos = [1, 2, 3, 4, 5];

    return datos.map((d, indexD) => 
        <Skeleton
            className="mb-2"
            height="35px"
            key={`placeholder-list-${indexD}`}
        />
    )
}

const ModalRightUser = ({ title, show, onClose = null, onCheck = null, checked = [] }) => {

    // states
    const [query_search, setQuerySearch] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [datos, setDatos] = useState([]);
    const [is_search, setIsSearch] = useState(true);

    // obtener usuarios
    const getUser = async (add = false) => {
        setCurrentLoading(true);
        await authentication.get(`user?page=${current_page}&query_search=${query_search}`)
        .then(async res => {
            let { users } = res.data;
            setCurrentLastPage(users.lastPage);
            setCurrentTotal(users.total);
            let payload = users.data || [];
            await payload.map(p => {
                let check = checked.includes(p.id) ? true : false;
                p.check = check;
                return p;
            });
            setDatos(add ? [...datos, ...payload] : payload);
        })
        .catch(err => console.log(err))
        setCurrentLoading(false);
        setIsSearch(false);
    }

    // montar componente
    useEffect(() => {
        if (current_page > 1) getUser(true);
    }, [current_page]);

    useEffect(() => {
        if (is_search) getUser();
    }, [is_search]);

    // render
    return (
        <ModalRight
            show={show}
            title={title}
            onClose={onClose}
        >
            <Form>
                <Form.Field>
                    <Input type="text"
                        icon={
                            <Icon name='search' 
                                inverted 
                                circular 
                                link 
                                onClick={(e) => {
                                    setCurrentPage(1)
                                    setIsSearch(true);
                                }}
                            />
                        }    
                        name="query_search"
                        placeholder="Buscar integrante"
                        value={query_search || ""}
                        onChange={(e, obj) => setQuerySearch(obj.value || "")}
                    />
                </Form.Field>
                <div><hr/></div>
                <h6 className="dropdown-header"> {current_page * 20} de {current_total} </h6>
                <div className="card-body">
                    <Show condicion={datos.length}>
                        {datos.map((d, indexD) => 
                            <ItemCheck
                                key={`list-team-${indexD}`}
                                title={d.person && d.person.fullname || ''}
                                checked={d._check}
                                image={d.image_images && d.image_images.image_50x50 || ''}
                                classNameTitle="capitalize"
                                disabled={d._check}
                                onClick={(e) => typeof onCheck == 'function' ? onCheck(e, d) : null}
                            />
                        )}
                    </Show>

                    <Show condicion={current_loading}>
                        <Placeholder/>
                    </Show>

                    <Show condicion={!current_loading && (current_page + 1 <= current_last_page)}>
                        <div className="text-center text-primary cursor-pointer"
                            onClick={(e) => setCurrentPage(current_page + 1)}
                        >
                            <i className="fas fa-arrow-down"></i> Obtener más datos
                        </div>
                    </Show>
                </div>
            </Form>
        </ModalRight>
    );
}

export default ModalRightUser;