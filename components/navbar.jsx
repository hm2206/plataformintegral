import React, { Component, Fragment } from "react";
import SkullAuth from "../components/loaders/skullAuth";
import Logo from "../components/logo";
import { authentication } from '../services/apis';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { connect } from 'react-redux';
import initStore from '../storage/store';
import Notification from './notification';
import { app } from '../env.json';
import Router from "next/router";
import Show from "./show";


class Navbar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      show: true,
      config: false,
      loading: true,
      auth: { },
    };

    this.responsive = this.responsive.bind(this);
    this.handleConfig = this.handleConfig.bind(this);
  }


  componentDidMount() {
    this.setState((state, props) => {
      let { user } = props.getState().auth ? props.getState().auth : {};
      return { auth: user };
    });
  }


  async responsive(e) {
    
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

  async logout(e) {
    e.preventDefault();
    await authentication.post('logout')
    .then(async res => {
      let { success, message } = res.data;
      if (success) {
        Cookies.remove('auth_token');
        await Swal.fire({ icon: 'success', text: message });
        history.go('/login');
      } else {
        Swal.fire({ icon: 'error', text: message });
      }
    }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
  }

  
  render() {

    let { loading, auth } = this.state;
    let { screen_lg, screenX, my_app, logout } = this.props;

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
                  <Notification/>
                </ul>

                      <div className="dropdown d-flex">
                        {auth ? (
                          <button
                            className="btn-account d-none d-md-flex"
                            type="button"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <span className="user-avatar user-avatar-md">
                              <img
                                src={auth.person && auth.image ? `${auth.image}` : '/img/perfil.jpg'}
                                alt=""
                              />
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

export default connect(initStore)(Navbar);