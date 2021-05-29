import React, { useContext, useEffect, useState } from 'react';
import { AUTHENTICATE } from '../../services/auth';
import BoardSimple from '../../components/boardSimple';
import { EntityContext } from '../../contexts/EntityContext';
import CreateClock from '../../components/escalafon/createClock';
import ListClock from '../../components/escalafon/listClock';

const Clock = ({ pathname, query }) => {

    // entity
    const { fireEntity, entity_id } = useContext(EntityContext);

    // estados
    const [datos, setDatos] = useState([]);
    const [block, setBlock] = useState(false);

    const handleAdd = async (newClock = {}) => {
        let collect = await datos.filter(d => d.id != newClock.id);
        collect.push(newClock);
        setDatos(collect);
    }

    useEffect(() => {
        fireEntity({ render: true });
        return () => fireEntity({ render: false });
    }, []); 

    // render
    return (
        <div className="col-12">
            <BoardSimple
                title="Reloj Biométrico"
                info={["Control de reloj biométrico"]}
                bg="danger"
                prefix="RB"
                options={[]}
            >
                <div className="card-body">
                    <div className="row">
                        <div className="col-8">
                            <ListClock datos={datos}
                                setDatos={setDatos}
                                block={block}
                                setBlock={setBlock}
                            />
                        </div>
                        <div className="col-4">
                            <CreateClock handleAdd={handleAdd}/>
                        </div>
                    </div>
                </div>
            </BoardSimple>
        </div>
    );
}

// server
Clock.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    return { query, pathname }
}


// exportar
export default Clock;