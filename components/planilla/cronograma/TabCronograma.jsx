import React, { useContext, useMemo } from 'react';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import { Tab } from 'semantic-ui-react'
import Work from './work';
import Afectacion from './afectacion';
import Remuneracion from './remuneracion';
import Descuento from './descuento.jsx';
import Aportacion from './aportacion';
import Sindicato from './sindicato';
import Obligacion from './obligacion';

const TabCronograma = (props) => {

  const { edit, active, block, setActive, loading, setIsEditable, cronograma } = useContext(CronogramaContext);

  const isPrincipal = useMemo(() => {
    return cronograma?.planilla?.principal
  }, [cronograma])

  const onTabChange = (e, { activeIndex }) => {
    setActive(activeIndex);
  }

  let styles = {
    border: '0px'
  }

  const panes = [
    { 
      menuItem: {key: 'info', icon: 'info circle', content: 'Datos Per.', disabled: edit || loading || block }, 
      render: () => (
        <Tab.Pane style={styles}>
          <Work/>
        </Tab.Pane> 
      )
    },
    {
      menuItem: {key: 'afectacion', icon: 'cogs', content: 'Config. Trab.', disabled: edit || loading || block },
      render: () => (
        <Tab.Pane style={styles}>
          <Afectacion/>
        </Tab.Pane>
      )
    },
    {
      menuItem: {key: 'remuneracion', icon: 'dollar', content: 'Remuneración', disabled: edit || loading || block },
      render: () => (
        <Tab.Pane style={styles}>
          <Remuneracion/>
        </Tab.Pane>
      )
    },
    {
      menuItem: {key: 'descuento', icon: 'arrow down cart', content: 'Descuentos', disabled: edit || loading || block },
      render: () => (
        <Tab.Pane style={styles}>
          <Descuento/>
        </Tab.Pane>
      )
    },
  ];

  const otherPanes = [
    {
      menuItem: {key: 'sindicato', icon: 'users', content: 'Afiliación', disabled: edit || loading || block },
      render: () => (
        <Tab.Pane style={styles}>
          <Sindicato/>
        </Tab.Pane>
      )
    },
    {
      menuItem: {key: 'obligacion', icon: 'balance scale', content: 'Obligaciones', disabled: edit || loading || block },
      render: () => (
        <Tab.Pane style={styles}>
          <Obligacion/>
        </Tab.Pane>
      )
    },
    {
      menuItem: {key: 'aportacion', icon: 'certificate', content: 'Aporte Empleador', disabled: edit || loading || block },
      render: () => (
        <Tab.Pane style={styles}>
          <Aportacion/>
        </Tab.Pane>
      )
    }
  ]

  return (
    <Tab
      panes={isPrincipal && !cronograma.remanente ? [...panes, ...otherPanes] : panes} 
      menu={props.menu} 
      activeIndex={active} 
      onTabChange={onTabChange} 
      className="w-100 mt-3"
    />
  )
}

export default TabCronograma;