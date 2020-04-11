import React, { Component } from 'react';
import Show from './show';

export default class Cover extends Component {

    render() {
        return (
            <div class="page-cover">
                    <div class="text-center py-3 pt-5">
                        <a href={this.props.image} target="_blank" class="user-avatar user-avatar-xl"
                            style={{ width: "150px", height: "150px", borderRadius: "50%" }}
                        >
                            <img src={this.props.image ? this.props.image: "/img/perfil.jpg"} 
                                alt={this.props.titulo}
                                style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }}
                            />
                        </a>
                        <h2 class="h4 mt-2 mb-0 uppercase">{this.props.titulo}</h2>
                        <div class="my-1"></div>
                        <Show condicion={this.props.username}>
                            <p class="text-muted"> Username: {this.props.username}</p>
                        </Show>
                        <Show condicion={this.props.email}>
                            <p class="text-muted"> Cuenta: <a href={`mailto:${this.props.email}`}>{this.props.email}</a> </p>
                        </Show>
                        <p> Perfil de Usuario </p>
                    </div>
                    <div class="cover-controls cover-controls-bottom">
                        {/* <a href="https://uselooper.com/user-profile.html#" class="btn btn-light" data-toggle="modal" data-target="#followersModal">
                            2,159 Followers
                        </a> 
                        <a href="https://uselooper.com/user-profile.html#" class="btn btn-light" data-toggle="modal" data-target="#followingModal">
                            136 Following
                        </a> */}
                    </div>
            </div>
        );
    }

}