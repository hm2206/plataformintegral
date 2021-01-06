import React, { Component, Fragment } from "react";
import { Skull } from "../Utils";

export default class SkullNavigation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Fragment>
        <br />
        <Skull height="2em" radius="0.4em" />
        <div style={{ paddingLeft: "2em" }}>
          <Skull height="1.2em" radius="0.3em" />
          <Skull height="1.2em" radius="0.3em" />
          <Skull height="1.2em" radius="0.3em" />
        </div>
        <br />
        <Skull height="2em" radius="0.4em" />
        <div style={{ paddingLeft: "2em" }}>
          <Skull height="1.2em" radius="0.3em" />
          <Skull height="1.2em" radius="0.3em" />
        </div>
        <br />
        <Skull height="2em" radius="0.4em" />
        <Skull height="2em" radius="0.4em" />
        <Skull height="2em" radius="0.4em" />
        <br />
        <Skull height="7em" radius="0.4em" />
      </Fragment>
    );
  }
}
