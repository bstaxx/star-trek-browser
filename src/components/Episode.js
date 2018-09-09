import React, { Component } from 'react'

class Episode extends Component {
    
    constructor() {
        super();
        this.state = {
            episode: {}
        }
    }

    componentWillMount() {
        this.setState( { episode: this.props.episode } );
    }
    

    render() {
        let episode = this.state.episode;
        let rating = parseFloat( episode.averageRating, 10 ).toFixed( 1 );
        return ( 
            <li className="list-group-item list-group-item-dark d-flex justify-content-between align-items-center" >
                <div className="col col-md-auto flex-md-grow-1">
                    <div>{`Episode ${ episode.episodeNumber }`}</div>
                    <div className="h4" >{ episode.originalTitle }</div>
                </div>
                <div className="col col-md-auto">
                    <span className="badge badge-primary badge-pill">{`Votes ${ episode.numVotes }`}</span>
                    <span className={`badge badge-${ this.getRatingClass( rating ) } badge-pill`}>Rating <b>{ rating }</b> out of 10</span>
                </div>
            </li> 
        )
    }

    getRatingClass( rating ) {
        if( rating > 8 ) { return "success" }
        else if( rating > 6 ) { return "warning" }
        else { return "danger" }
    }
}

export default Episode;