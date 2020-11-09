import React, { Component, useContext } from 'react';
import { Tab } from 'semantic-ui-react'
import Router from 'next/router';
import TabDatos from '../../components/project-tracking/tabDatos';
import TabTeam from '../../components/project-tracking/tabTeam';
import TabPlanTrabajo from '../../components/project-tracking/tabPlanTrabajo';
import TabSaldoFinanciero from '../../components/project-tracking/tabSaldoFinanciero';
import TabComponente from '../../components/project-tracking/tabComponente';
import TabActivity from './tabActivity';

const TabProject = (props) => {

    const onTabChange = (e, { activeIndex }) => {
        // setActive(activeIndex);
    }

    let styles = {
        border: '0px'
    }

    const panes = [
            { 
                menuItem: {key: 'info', icon: 'info circle', content: 'Datos Generales', disabled: false }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabDatos/>
                    </Tab.Pane> 
            },
            { 
                menuItem: {key: 'team', icon: 'info circle', content: 'Equipo Técnico', disabled: false }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabTeam/>
                    </Tab.Pane> 
            },
            { 
                menuItem: {key: 'plan_trabajo', icon: 'info circle', content: 'Plan Trabajo', disabled: false }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabPlanTrabajo/>
                    </Tab.Pane> 
            },
            { 
                menuItem: {key: 'componentes', icon: 'info circle', content: 'Componentes', disabled: false }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabComponente/>
                    </Tab.Pane> 
            },
            { 
                menuItem: {key: 'actividades', icon: 'info circle', content: 'Actividades', disabled: false }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabActivity/>
                    </Tab.Pane> 
            },
            { 
                menuItem: {key: 'saldo_financiero', icon: 'info circle', content: 'Saldo Financiero', disabled: false }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabSaldoFinanciero/>
                    </Tab.Pane> 
            },
    ];

    return <Tab panes={panes} 
                menu={props.menu} 
                // activeIndex={active} 
                // onTabChange={onTabChange} 
                className="w-100 mt-3"
            />
}



export default TabProject;