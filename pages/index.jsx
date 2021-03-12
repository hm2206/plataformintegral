import React, { useContext } from 'react';
import { AUTHENTICATE } from '../services/auth';
import { Body } from '../components/Utils';
import CardProfile from '../components/cardProfile';
import CardToken from '../components/cardToken';
import CardChangePassword from '../components/cardChangePassword';

const Index = () => {

    // renderizar
    return (
        <div className="col-md-12">
            <Body>
                <div className="row">
                    <div className="col-md-7">
                        <div className="card">
                            <CardProfile/>
                        </div>
                    </div>

                    <div className="col-md-5">
                        <CardChangePassword/>
                        {/* <CardToken/> */}
                    </div>
                </div>
            </Body>
        </div>
    )
}

// server 
Index.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    return { query, pathname }
}

// exportar
export default Index;