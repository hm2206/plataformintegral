import React, { Component } from "react";

export default class PageNav extends Component {
  render() {
    return (
      <nav className="page-navs">
        <div className="nav-scroller">
          <div className="nav nav-tabs">
            {this.props.options &&
              this.props.options.map((obj) => (
                <a
                  className={`nav-link show ${obj.active ? "active" : ""}`}
                  key={`notification-link-${obj.key}`}
                  data-toggle="tab"
                  href={`#nav-option-${obj.key}`}
                >
                  {obj.text}
                </a>
              ))}
          </div>
        </div>
      </nav>
    );
  }
}
