import React, { useContext, useEffect, useState } from 'react';
import { Body, BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { system_store } from '../../../services/verify.json';
import { projectTracking } from '../../../services/apis';
import Datatable from '../../../components/datatable';
import { AppContext } from '../../../contexts/AppContext';
import Router, { useRouter } from 'next/router';
import btoa from 'btoa';

const IndexRole = ({ roles }) => {
    const router = useRouter();
    const { pathname, query } = router;

    useEffect(() => {
        if (!AUTHENTICATE()) return;
    }, []);


    // app
    const app_context = useContext(AppContext);

    // handle options
    const getOption = async (obj, key, index) => {
        switch (key) {
            case 'information':
            case 'edit':
                let id = btoa(obj.id);
                Router.push({ pathname: `${Router.pathname}/${key}`, query: { id } });
                break;
            default:
                break;
        }
    }

    // render
    return (
    <div className="col-md-12">
        <Body>
            <Datatable
                titulo="Lista de Roles"
                isFilter={false}
                headers={["#ID", "Slug", "Descripción", "Principal", "Estado"]}
                index={[
                    { key: "id", type: "text" },
                    { key: "slug", type: "text" },
                    { key: "description", type: "text" },
                    { key: "principal", type: "switch", bg_true: "dark", is_true: "Si", bg_false: "warning", is_false: "No" },
                    { key: "state", type: "switch", bg_true: "success", is_true: "Activo", bg_false: "danger", is_false: "Desactivado" }
                ]}
                data={success ? roles.data : []}
                options={[
                    { 
                        key: "edit",
                        icon: "fas fa-pencil-alt",
                        title: "Editar Plan de Trabajo"  
                    }
                ]}
                getOption={getOption}
            />
        </Body>
        
        <BtnFloat
            onClick={(e) => Router.push({ pathname: `${Router.pathname}/create` })} 
        >
            <i className="fas fa-plus"></i>
        </BtnFloat>
    </div>)
}

export default IndexRole;