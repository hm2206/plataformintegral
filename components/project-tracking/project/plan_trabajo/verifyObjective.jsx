import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react'
import Show from '../../../show'
import { projectTracking } from '../../../../services/apis'
import CreateConfigObjective from '../config_objective/createConfigObjective';
import EditConfigObjective from '../config_objective/editConfigObjective';

const VerifyObjective = ({ objective = {}, plan_trabajo = {}, status = 'PREVIEW', children = null }) => {

    const [current_loading, setCurrentLoading] = useState(false)
    const [is_refresh, setIsRefresh] = useState(true)
    const [is_error, setIsError] = useState(false)
    const [current_config, setCurrentConfig] = useState({})
    const [option, setOption] = useState("")

    const getConfig = async () => {
        setCurrentLoading(true)
        await projectTracking.get(`objective/${objective.id}/config_objectives?plan_trabajo_id=${plan_trabajo?.id}`)
        .then(({ data }) => {
            setIsError(false)
            let { config_objectives } = data
            let config = config_objectives.find(c => c.status == status);
            setCurrentConfig(config || {})
        }).catch(err => setIsError(true))
        setCurrentLoading(false)
    }

    useEffect(() => {
        if (is_refresh) getConfig();
    }, [is_refresh]);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh])

    return (
        <Show condicion={!current_config.id}
            predeterminado={
                <>
                    <Button.Group size="mini">
                        {children}
                        <Button color="green" 
                            title="Verificado"
                            onClick={() => setOption('edit')}
                            disabled={current_loading}
                            loading={current_loading}
                        >
                            <i className="fas fa-check"></i>
                        </Button>
                    </Button.Group>

                    <Show condicion={option == 'edit'}>
                        <EditConfigObjective
                            config={current_config}
                            onClose={() => setOption("")}
                            onSave={() => setIsRefresh(true)}
                        />
                    </Show>
                </>
            }
        >
            <Button.Group size="mini">
                {children}
                <Button title="Verificar"
                    onClick={() => setOption('create')}
                    disabled={current_loading}
                    loading={current_loading}
                >
                    <i className="fas fa-check"></i>
                </Button>
            </Button.Group>

            <Show condicion={option == 'create'}>
                <CreateConfigObjective 
                    onClose={() => setOption("")}
                    onSave={() => setIsRefresh(true)}
                    objective={objective}
                    plan_trabajo={plan_trabajo}
                    status={status}
                />
            </Show>
        </Show>
    )
}

export default VerifyObjective