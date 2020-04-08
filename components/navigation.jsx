import React, { Component, Fragment } from 'react';
import SkullNavigation from './loaders/skullNavigation';
import Router from 'next/router';
import Link from 'next/link';


const NavLink = ({ children, active = false, url = '/', onClick }) => {
    return (
        <a href={url} 
            className={`menu-link ${active ? 'text-dark' : ''}`}
            onClick={onClick}
        >
            { children }
        </a>
    )
}


class Navigation extends Component {

    constructor(props) {
        super(props);
        this.state = { newOptions: [] }

        this.handleClick = this.handleClick.bind(this);
        this.ActiveChildren = this.ActiveChildren.bind(this);
    }


    async componentWillReceiveProps(newProps) {
        await this.setState((state, props) => ({
            newOptions: newProps.options
        }));
        await this.activeToggle();
    }


    handleClick(id, e) {
        this.setState(async (state, props) => {
            let newOptions = await state.newOptions.filter(async opt => {
                let isActive = opt.id == id || props.current == `/${opt.url}` ? true : false;
                let isParent = opt.modules && opt.modules.length > 0;
                // actulizamos el active de las opciones
                opt.active = isActive;
                // verificamos que tengan hijos y si el padre esta activo
                if (isActive && isParent) {
                    // actualizamos los toggles de los padres
                    opt.toggle = !opt.toggle;
                }else {
                    // desactivamos los toggles de los padres
                    opt.toggle = false;
                }
                // devolvemos una nueva options modificada
                return e;   
            });

            return { options: newOptions };
        });
    }

    async ActiveChildren(childID, index, e) {
        let option = this.state.newOptions[index];
        await option.modules.map(ch => {
            let isActive = ch.id == childID;
            ch.active = isActive;
            return ch;
        });

        this.setState(state => {
            state.newOptions[index] = option;
            state.newOptions[index].toggle = true;
            return { newOptions: state.newOptions };
        });
    }

    activeToggle = async () => {
        let tmpParent = Router.pathname.split('/');
        let parent = `/${tmpParent[1]}`;
        let child = tmpParent[2];
         await this.setState(async state => {
            let options = await state.newOptions.map(async opt => {
                if(opt.path == parent) {
                    opt.toggle = true;
                    opt.modules = await this.activeModule(opt, child);
                }
                // retornar
                return opt;
            });
            return { newOptions: options };
        });
    }

    activeModule = async (option, child) => {
        let modules = await option.modules.filter(obj => {
            obj.active = child == obj.alias ? true : false;
            return obj;
        });
        // modules
        return modules;
    }

    handleNav = (e, obj) => {
        e.preventDefault();
        let { href } = e.target;
        Router.push({ pathname: obj.slug, query: { clickb: obj.name } })
    }

    render() {

        let { newOptions } = this.state;
        if (newOptions && newOptions.length > 0) {
            return newOptions.map((obj, index) => 
                <li className={`menu-item ${obj.toggle ? 'has-open has-active' : 'has-child'}`}
                    key={`option-sidebar-${obj.id}`}
                >
                    <span style={{ cursor: 'pointer' }} className="menu-link" onClick={this.handleClick.bind(this, obj.id)}>
                      <span className={`menu-icon ${obj.icon}`}></span>
                      <span className="menu-text">{obj.name}</span>{" "}
                      <span className="badge badge-xs badge-warning">{obj.version}</span>
                    </span>
                    {
                        obj.modules ? 
                        <ul className="menu">
                            <li className="menu-subhead">{obj.name}</li>
                            {obj.modules.map( mod => 
                                <li className="menu-item" key={`childre-${mod.id}`}>
                                    <NavLink url={`${mod.slug}`} 
                                        active={mod.active}
                                        onClick={(e) => this.handleNav(e, mod)}
                                    >
                                        { mod.name }
                                    </NavLink>
                                </li>
                            )}
                        </ul> : null
                    }
                </li>  
            );
        } 

        return <SkullNavigation/>
    }

}


export default Navigation