import React, { Component } from 'react';
import Work from './work';
import Afectacion from './afectacion';
import Remuneracion from './_remuneracion';
import Descuento from './_descuento.jsx';
import Aportacion from './aportacion';
import { Tab } from 'semantic-ui-react'
import Obligacion from './obligacion';
import Sindicato from './sindicato';
import Detallado from './detallado';

export default class TabCronograma extends Component
{

    constructor(props) {
        super(props);
    }

    render() {

        let { cancel, edit, send, total, ubigeos, bancos, screenX } = this.props;

        let styles = {
            border: '0px'
        }

        const panes = [
            { 
                menuItem: {key: 'info', icon: 'info circle', content: 'Datos Per.', disabled: edit }, 
                render: () => 
                    <Tab.Pane style={styles}>
                        <Work 
                            type_documents={this.props.type_documents}
                            bancos={bancos}
                            ubigeos={ubigeos}
                            edit={this.props.edit}
                            historial={this.props.historial}
                            send={send}
                            cancel={cancel}
                            total={total}
                            updatingHistorial={this.props.updatingHistorial}
                            setLoading={this.props.setLoading}
                            screenX={screenX}
                        />
                    </Tab.Pane> 
            },
            {
                menuItem: {key: 'afectacion', icon: 'cogs', content: 'Config. Trab.', disabled: edit },
                render: () => (
                    <Tab.Pane style={styles}>
                        <Afectacion
                            bancos={bancos}
                            ubigeos={ubigeos}
                            edit={this.props.edit}
                            historial={this.props.historial}
                            send={send}
                            cancel={cancel}
                            total={total}
                            setEdit={this.props.setEdit}
                            setLoading={this.props.setLoading}
                            setSend={this.props.setSend}
                            setCancel={this.props.setCancel}
                            updatingHistorial={this.props.updatingHistorial}
                            screenX={screenX}
                        /> 
                    </Tab.Pane>
                )
            },
            {
                menuItem: {key: 'remuneracion', icon: 'dollar', content: 'Remuneración', disabled: edit },
                render: () => (
                    <Tab.Pane style={styles}>
                        <Remuneracion
                            bancos={bancos}
                            ubigeos={ubigeos}
                            edit={this.props.edit}
                            historial={this.props.historial}
                            data={this.props.remuneraciones}
                            send={send}
                            cancel={cancel}
                            total={total}
                            setEdit={this.props.setEdit}
                            setLoading={this.props.setLoading}
                            setSend={this.props.setSend}
                            setCancel={this.props.setCancel}
                            updatingHistorial={this.props.updatingHistorial}
                            screenX={screenX}
                        /> 
                    </Tab.Pane>
                )
            },
            {
                menuItem: {key: 'descuento', icon: 'arrow down cart', content: 'Descuentos', disabled: edit },
                render: () => (
                    <Tab.Pane style={styles}>
                        <Descuento
                            bancos={bancos}
                            ubigeos={ubigeos}
                            edit={this.props.edit}
                            historial={this.props.historial}
                            data={this.props.descuentos}
                            send={send}
                            cancel={cancel}
                            total={total}
                            setEdit={this.props.setEdit}
                            setLoading={this.props.setLoading}
                            setSend={this.props.setSend}
                            updatingHistorial={this.props.updatingHistorial}
                            screenX={screenX}
                        /> 
                    </Tab.Pane>
                )
            },
            {
                menuItem: {key: 'detallado', icon: 'briefcase', content: 'Más descuentos', disabled: edit },
                render: () => (
                    <Tab.Pane style={styles}>
                        <Detallado
                            bancos={bancos}
                            ubigeos={ubigeos}
                            edit={this.props.edit}
                            historial={this.props.historial}
                            send={send}
                            total={total}
                            setEdit={this.props.setEdit}
                            setLoading={this.props.setLoading}
                            setSend={this.props.setSend}
                            updatingHistorial={this.props.updatingHistorial}
                            screenX={screenX}
                        /> 
                    </Tab.Pane>
                )
            },
            {
                menuItem: {key: 'obligacion', icon: 'balance scale', content: 'Obligaciones', disabled: edit },
                render: () => (
                    <Tab.Pane style={styles}>
                        <Obligacion
                            bancos={bancos}
                            ubigeos={ubigeos}
                            edit={this.props.edit}
                            historial={this.props.historial}
                            send={send}
                            cancel={cancel}
                            total={total}
                            setEdit={this.props.setEdit}
                            setLoading={this.props.setLoading}
                            setSend={this.props.setSend}
                            updatingHistorial={this.props.updatingHistorial}
                            screenX={screenX}
                        /> 
                    </Tab.Pane>
                )
            },
            {
                menuItem: {key: 'sindicato', icon: 'users', content: 'Afiliación', disabled: edit },
                render: () => (
                    <Tab.Pane style={styles}>
                        <Sindicato
                            bancos={bancos}
                            ubigeos={ubigeos}
                            edit={this.props.edit}
                            historial={this.props.historial}
                            send={send}
                            cancel={cancel}
                            total={total}
                            setEdit={this.props.setEdit}
                            setLoading={this.props.setLoading}
                            setSend={this.props.setSend}
                            updatingHistorial={this.props.updatingHistorial}
                            screenX={screenX}
                        /> 
                    </Tab.Pane>
                )
            },
            {
                menuItem: {key: 'aportacion', icon: 'certificate', content: 'Aporte Empleador', disabled: edit },
                render: () => (
                    <Tab.Pane style={styles}>
                        <Aportacion
                            bancos={bancos}
                            ubigeos={ubigeos}
                            edit={this.props.edit}
                            historial={this.props.historial}
                            data={this.props.aportaciones}
                            send={send}
                            cancel={cancel}
                            total={total}
                            setEdit={this.props.setEdit}
                            setLoading={this.props.setLoading}
                            setSend={this.props.setSend}
                            updatingHistorial={this.props.updatingHistorial}
                            screenX={screenX}
                        /> 
                    </Tab.Pane>
                )
            }
        ];

        return <Tab panes={panes} menu={this.props.menu} activeIndex={this.props.activeIndex} onTabChange={this.props.onTabChange} className="w-100 mt-3"/>

    }

}