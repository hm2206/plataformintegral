import React, { useEffect, useContext } from 'react';
import { AUTHENTICATE } from '../services/auth';
import { Body } from '../components/Utils';
import CardProfile from '../components/cardProfile';
import CardChangePassword from '../components/cardChangePassword';
import { AuthContext } from '../contexts/AuthContext';

const Index = () => {
    const { is_logged, loading } = useContext(AuthContext);

    useEffect(() => {
        AUTHENTICATE();
    }, []);

    // No mostrar nada mientras carga o no está autenticado
    if (loading || !is_logged) {
        return null;
    }

    return (
        <div className="col-md-12">
            <Body>
                <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-5">
                    <div className="lg:tw-col-span-7">
                        <CardProfile/>
                    </div>
                    <div className="lg:tw-col-span-5">
                        <CardChangePassword/>
                    </div>
                </div>
            </Body>
        </div>
    )
}

export default Index;
