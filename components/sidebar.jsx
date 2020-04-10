import React, { Component, Fragment } from "react";
import Navigation from "./navigation";
import { authentication } from '../services/apis';
import Router from 'next/router';
import { connect } from 'react-redux';
import initStore from '../storage/store';
import { app } from '../env.json';
import { version } from '../package.json';
import Swal from 'sweetalert2'
import Cookies from 'js-cookie';


class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      pathname: "/"
    };
  }

  async componentDidMount() {
    this.getProfile();
    this.setting();
    if (typeof Router == 'object') await this.setState({ pathname: Router.pathname });
  }

  setting = () => {
    this.setState((state, props) => {
      let { user } = props.getState().auth ? props.getState().auth : {};
      return { auth: user };
    });
  }

  getProfile =  async () => {
    await authentication.get(`profile`)
    .then(res => {
        this.setState({ options: res.data });
    }).catch(err => console.log(err));
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

    let { auth } = this.state;

    return (
        <Fragment>   
          <aside className={`app-aside app-aside-expand-md app-aside-light ${this.props.toggle ? 'show' : ''}`}>
          <div className="aside-content">
            <header className="aside-header d-block d-md-none">
              <button
                className="btn-account"
                type="button"
                data-toggle="collapse"
                data-target="#dropdown-aside"
              >
                <span className="user-avatar user-avatar-lg">
                  <img src={auth && auth.person && auth.person.image ? `${authentication.path}/${auth.person.image}` : '/img/perfil.jpg'} alt={auth && auth.person && auth.person.fullname} />
                </span>{" "}
                <span className="account-icon">
                  <span className="fa fa-caret-down fa-lg"></span>
                </span>{" "}
                <span className="account-summary">
                  <span className="account-name">{auth && auth.username ? auth.username : 'fetching...'}</span>{" "}
                  <span className="account-description">{auth && auth.person ? auth.person.fullname : 'fetching...'}</span>
                </span>
              </button>
              <div id="dropdown-aside" className="dropdown-aside collapse">
                <div className="pb-3">
                  <a className="dropdown-item" href="/">
                    <span className="dropdown-icon oi oi-person"></span> Perfil
                  </a>{" "}
                  <a className="dropdown-item" href="#" onClick={this.logout}>
                    <span className="dropdown-icon oi oi-account-logout"></span>{" "}
                    Cerrar Sesión
                  </a>
                </div>
              </div>
            </header>
            <div className="aside-menu overflow-hidden">
              <nav id="stacked-menu" className="stacked-menu">
                <ul className="menu">
                  <li className={`menu-item ${this.state.pathname == '/' ? 'has-active' : ''}`}>
                    <a href="/" className="menu-link">
                      <span className="menu-icon fas fa-user"></span>{" "}
                      <span className="menu-text">Perfil</span>
                    </a>
                  </li>
                  <Navigation options={this.state.options}/>
                  <li className={`menu-item ${this.state.pathname == '/help' ? 'has-active' : ''}`}>
                    <a href="/help" className="menu-link">
                      <b className="menu-icon fas fa-comment"></b>{" "}
                      <b className="menu-text">Help</b>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
            <footer className="aside-footer border-top p-3">
                Versión <b className="badge badge-dark">{version}</b>
            </footer>
          </div>
        </aside>
      </Fragment>
    );
  }
}

export default connect(initStore)(Sidebar);