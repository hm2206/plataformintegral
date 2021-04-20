import React from 'react';
import { AUTHENTICATE } from '../../services/auth';
import BoardSimple from '../../components/boardSimple';
import { BtnFloat } from '../../components/Utils';

const Assistance = ({ pathname, query }) => {

    // render
    return (
        <div className="col-12">
            <BoardSimple
                title="Asistencia"
                info={["Control de asistencia"]}
                bg="danger"
                options={[]}
            >

            </BoardSimple>
            {/* btn para crear asistencia */}
            <BtnFloat>
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </div>
    );
}

// server
Assistance.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    return { query, pathname }
}


// exportar
export default Assistance;