import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";

export const EntityContext = createContext();

const schemaEntity = {
    render: false,
    entity_id: "",
    disabled: false
};

export const EntityProvider = ({ children = null }) => {

    // estados
    const [entity_id, setEntityId] = useState("");
    const [render, setRender] = useState(false);
    const [disabled, setDisabled] = useState(false);

    // handleEntityID
    const fireEntity = (params = schemaEntity) => {
        let keys = Object.keys(params || {});
        // setting entity id
        if (keys.includes('entity_id')) {
            Cookies.set('EntityId', params.entity_id);
            setEntityId(params.entity_id);
        }
        // setting render
        if (keys.includes('render')) {
            setRender(params.render ? true : false);
        }
        // setting disable
        if (keys.includes('disabled')) {
            setDisabled(params.disabled ? true : false);
        }
    }

    // cookie entityId
    useEffect(() => {
        setEntityId(Cookies.get('EntityId'));
    }, []);
    
    // render
    return (
        <EntityContext.Provider value={{ 
                entity_id, 
                setEntityId,
                fireEntity, 
                render,  
                disabled
            }}
        >
            <div className="full-layout" id="main">
                <div className="gx-app-layout ant-layout ant-layout-has-sider">
                    <div className="ant-layout">
                        {children}
                    </div>
                </div>
            </div>
        </EntityContext.Provider>
    );
}