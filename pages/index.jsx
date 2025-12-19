import React, { useEffect } from 'react';
import { AUTHENTICATE } from '../services/auth';
import { Body } from '../components/Utils';
import CardProfile from '../components/cardProfile';
import CardChangePassword from '../components/cardChangePassword';

const Index = () => {

    useEffect(() => {
        AUTHENTICATE();
    }, []);

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
                    </div>
                </div>
            </Body>
        </div>
    )
}

export default Index;
