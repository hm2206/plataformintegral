import React, { Component, Fragment } from "react";
import Navigation from "./navigation";
import { authentication } from '../services/apis';
import Router from 'next/router';
import { connect } from 'react-redux';
import initStore from '../storage/store';
import { version } from '../package.json';
import { logout } from "../storage/actions/authsActions";


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

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.refresh && nextProps.refresh != this.props.refresh) this.getProfile();
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
      if (res.data.success == false) this.setState({ options: [] });
    }).catch(err => this.setState({ options: [] }));
  }

  render() {

    let { auth } = this.state;
    let { screen_lg, my_app, logout } = this.props;

    return (
        <Fragment>   
          <aside className={`app-aside app-aside-expand-md app-aside-light ${this.props.toggle ? 'show' : ''}`} style={{ display: screen_lg ? 'none' : 'block' }}>
          <div className="aside-content">
            <header className="aside-header d-block d-md-none">
              <button
                className="btn-account"
                type="button"
                data-toggle="collapse"
                data-target="#dropdown-aside"
              >
                <span className="user-avatar user-avatar-lg">
                  <img src={auth && auth.image ? auth.image && auth.image_images && auth.image_images.image_50x50 : '/img/perfil.jpg'} alt={auth && auth.person && auth.person.fullname} />
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
                  <a className="dropdown-item" href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      Router.push({ pathname: '/notify', query: { tab: 'all_notify' } });
                    }}
                  >
                    <span className="fas fa-bell"></span> Notificaciones
                  </a>{" "}
                  <a className="dropdown-item" href="/">
                    <span className="fas fa-user"></span> Perfil
                  </a>{" "}
                  <a className="dropdown-item" href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    <span className="fas fa-sign"></span>{" "}
                    Cerrar Sesión
                  </a>
                </div>
              </div>
            </header>
            <div className="aside-menu --overflow-hidden">
              <nav id="stacked-menu" className="stacked-menu">
                <ul className="menu">
                  <li className={`menu-item ${this.state.pathname == '/' ? 'has-active' : ''}`}>
                    <a className="menu-link"
                      href="/"
                    >
                      <span className="menu-icon fas fa-user"></span>{" "}
                      <span className="menu-text">Perfil</span>
                    </a>
                  </li>
                  <Navigation options={this.state.options}/>
                  <li className={`menu-item ${this.state.pathname == '/help' ? 'has-active' : ''}`}>
                    {/* <Link> */}
                      <a href="/help#menu" style={{ cursor: 'pointer' }}
                        className="menu-link"
                        onClick={(e) => Router.push('/help')}
                      >
                        <b className="menu-icon fas fa-info-circle"></b>{" "}
                        <b className="menu-text">Help</b>
                      </a>
                    {/* </Link> */}
                  </li>
                </ul>
              </nav>
            </div>
            <footer className="aside-footer border-top p-3">
              <a className="text-dark text-center" href={my_app.support_link} target="_blank"><b className="badge badge-dark w-100">Soporte: {my_app && my_app.support_name}</b></a>
            </footer>
          </div>
        </aside>
      </Fragment>
    );
  }
}

export default connect(initStore)(Sidebar);