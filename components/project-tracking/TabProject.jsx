import React, { useContext } from 'react';
import { Tab } from 'semantic-ui-react'
import TabDatos from './tabDatos';
import TabTeam from './tabTeam';
import TabPlanTrabajo from './tabPlanTrabajo';
import TabProjectInitial from './tabProjectInitial';
import TabTracking from './tabTracking';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';

const TabProject = ({ menu }) => {
    
    let styles = {
        border: '0px'
    }

    // project
    const { edit } = useContext(ProjectContext);

    const panes = [
            { 
                menuItem: {key: 'info', icon: 'info circle', content: 'Datos Generales', disabled: edit }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabDatos/>
                    </Tab.Pane> 
            },
            { 
                menuItem: {key: 'project', icon: 'chart line', content: 'Proyecto', disabled: edit }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabProjectInitial/>
                    </Tab.Pane> 
            },
            { 
                menuItem: {key: 'team', icon: 'puzzle', content: 'Equipo Técnico', disabled: edit }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabTeam/>
                    </Tab.Pane> 
            },
            { 
                menuItem: {key: 'plan_trabajo', icon: 'server', content: 'Plan Trabajo', disabled: edit }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabPlanTrabajo/>
                    </Tab.Pane> 
            },
            { 
                menuItem: {key: 'tracking_project', icon: 'sitemap', content: 'Seguimiento', disabled: edit }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabTracking/>
                    </Tab.Pane> 
            },
    ];

    return <Tab panes={panes} 
                menu={menu} 
                className="w-100 mt-3"
            />
}



export default TabProject;