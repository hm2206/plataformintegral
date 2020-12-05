import React, { Component, useContext } from 'react';
import { Tab } from 'semantic-ui-react'
import Router from 'next/router';
import TabDatos from './tabDatos';
import TabTeam from './tabTeam';
import TabPlanTrabajo from './tabPlanTrabajo';
import TabSaldoFinanciero from './tabSaldoFinanciero';
import TabMeta from './tabMetas';
import TabProjectInitial from './tabProjectInitial';

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
                menuItem: {key: 'team', icon: 'info circle', content: 'Proyecto Inicial', disabled: false }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabProjectInitial/>
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
                menuItem: {key: 'saldo_financiero', icon: 'info circle', content: 'Saldo Financiero', disabled: false }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabSaldoFinanciero/>
                    </Tab.Pane> 
            },
            { 
                menuItem: {key: 'meta_project', icon: 'info circle', content: 'Metas de Proyecto', disabled: false }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabMeta/>
                    </Tab.Pane> 
            },
            { 
                menuItem: {key: 'meta_project', icon: 'info circle', content: 'Seguimiento', disabled: false }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <TabMeta/>
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