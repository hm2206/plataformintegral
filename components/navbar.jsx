import React, { Component, Fragment } from "react";
import SkullAuth from "../components/loaders/skullAuth";
import Logo from "../components/logo";
import { authentication } from '../services/apis';
import { connect } from 'react-redux';
import initStore from '../storage/store';
import Notification from './notification';
import { app } from '../env.json';
import Show from "./show";
import { Select } from 'semantic-ui-react';
import { parseOptions } from '../services/utils'
import Cookies from 'js-cookie';
import Router from "next/router";
import Link from "next/link";
import btoa from 'btoa';


class Navbar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      show: true,
      config: false,
      loading: true,
      auth: { },
      entities: [],
      entity_id: "",
    };

    this.handleConfig = this.handleConfig.bind(this);
  }


  async componentDidMount() {
    await this.getEntities();
    this.settingEntity();
  }

  handleNavBar = () => {
    if (typeof this.props.onToggle == 'function') {
      this.props.onToggle();
    }
  }

  handleConfig(e) {
    this.setState(state => ({ config: !state.config }));
  }

  handleExtends = () => {
    let { setScreenLg } = this.props;
    if (typeof setScreenLg == 'function') setScreenLg();
  }

  getEntities = async (page = 1) => {
    await authentication.get(`auth/entity?page=${page}`)
    .then(res => {
      let { lastPage, data } = res.data;
      this.setState(state => ({ entities: [...state.entities, ...data] }))
      if (page < lastPage) this.getEntities(page + 1);
    }).catch(err => console.log(err.message))
  }

  settingEntity = async () => {
    await this.setState({ entity_id: parseInt(await Cookies.get('EntityId')) || "" });
    let { entities, entity_id } = this.state;
    // validate
    if (!entity_id && entities.length) {
      let entity_id = entities[0].id;
      await this.handleEntity({ name: 'entity_id', value: entity_id });
    }
  }

  handleEntity = async ({ name, value }) => {
    await this.setState({ [name]: value });
    await Cookies.set('EntityId', value);
    let { push, pathname, query } = Router;
    query.entity_id = btoa(value);
    push({ pathname, query });
  }

  render() {

    let { loading } = this.state;
    let { screen_lg, screenX, my_app, logout, config_entity, auth, notification, no_read } = this.props;
    let isAuth = Object.keys(auth).length

    return (
      <Fragment>
        <header className={`app-header app-header-dark bg-${app.theme}`}>
          <div className="top-bar">
            <div className="top-bar-brand" style={{ display: screen_lg || screenX < 767 ? 'none' : 'flex' }}>
              <a href="/">
                <Logo my_app={my_app}/>
              </a>
            </div>
            <div className="top-bar-list">
              <Show condicion={screenX > 767}>
                <div className="top-bar-item px-2">
                  <button className="btn text-white"
                    style={{ fontSize: '1.15em' }}
                    onClick={this.handleExtends}
                  >
                    <i className={`fas fa-${screen_lg ? 'times' : 'bars'}`}></i>
                  </button>
                </div>
              </Show>

              <Show condicion={config_entity.render}>
                <div className="col-md-5 capitalize">
                  <Select
                    options={parseOptions(this.state.entities, ['select-enti-nav', '', 'Select. Entidad'], ['id', 'id', 'name'])}
                    fluid
                    placeholder="Select. Entidad"
                    value={this.state.entity_id}
                    name="entity_id"
                    onChange={(e, obj) => this.handleEntity(obj)}
                    disabled={config_entity.disabled}
                  />
                </div>
              </Show>
              
              <div className="top-bar-item px-2 d-md-none d-lg-none d-xl-none">
                <button
                  className={`hamburger hamburger-squeeze ${this.props.toggle ? 'active' : ''}`}
                  type="button"
                  data-toggle="aside"
                  aria-label="toggle menu"
                  onClick={this.handleNavBar}
                >
                  <span className="hamburger-box">
                    <span className="hamburger-inner"></span>
                  </span>
                </button>
              </div>
              <div className="top-bar-item top-bar-item-right px-0 d-none d-sm-flex">
                <ul className="header-nav nav">
                  <Notification notification={notification} no_read={no_read}/>
                </ul>

                      <div className="dropdown d-flex">
                        {isAuth ? (
                          <button
                            className="btn-account d-none d-md-flex"
                            type="button"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <span className="user-avatar user-avatar-md">
                              <img
                                src={auth.person && auth.image ? `${auth.image && auth.image_images && auth.image_images.image_50x50}` : '/img/perfil.jpg'}
                                alt=""
                              />
                              <span className="avatar-badge online" title="online"></span>
                            </span>{" "}
                            <span className="account-summary pr-lg-4 d-none d-lg-block">
                              <span className="account-name" style={{ textTransform: 'capitalize' }}>
                                {auth && auth.username}
                              </span>{" "}
                              <span className="account-description">
                                {auth && auth.email}
                              </span>
                            </span>
                          </button>
                        ) : (
                          <SkullAuth />
                        )}

                        <div className="dropdown-menu">
                          <div className="dropdown-arrow ml-3"></div>
                          <h6 className="dropdown-header d-none d-md-block d-lg-none">
                            {auth && auth.username}
                          </h6>
                          <a className="dropdown-item" href="/">
                            <span className="fas fa-user"></span>{" "}
                            Perfil
                          </a>{" "}

                          <Link href="/docs">
                            <a className="dropdown-item">
                              <span className="fas fa-info-circle"></span>{" "}
                              Ayuda
                            </a>
                          </Link>

                                <a
                                  href="#logout"
                                  className="dropdown-item"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    logout();
                                  }}
                                >
                                  <span className="fas fa-sign"></span>{" "}
                                  Cerrar Cuenta
                                </a>

                        </div>
                      </div>

              </div>
            </div>
          </div>
        </header>
      </Fragment>
    );
  }
}

export default Navbar;