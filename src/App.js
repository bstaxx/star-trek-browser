import React, { Component } from 'react';
//import logo from './logo.svg';
//import './App.css';
import Episode from './components/Episode';

class App extends Component {
  
  constructor( props ) {
    super( props );
    this.state = {
      items: [],
      episodes: [],
      seasons: [],
      seasonOptions: [],
      selectedSeason: "1",
      sortBy: "episode",
      sortDirection: 'ascending',
      sortFuncts: {
        title: { 
          ascending: this.sortByTitleAsce, 
          descending: this.sortByTitleDesc,
          defaultDirection: 'ascending'
        },
        rating: { 
          ascending: this.sortByRatingAsce, 
          descending: this.sortByRatingDesc,
          defaultDirection: 'descending'
        },
        votes: { 
          ascending: this.sortByVotesAsce, 
          descending: this.sortByVotesDesc,
          defaultDirection: 'descending'
        },
        episode: {
          ascending: this.sortByEpisodeAsce,
          descending: this.sortByEpisodeDesc,
          defaultDirection: 'ascending'
        }
      }
    }
    this.onSeasonChange = this.onSeasonChange.bind( this );
    this.onSortBy = this.onSortBy.bind( this );
  }

  onSeasonChange( event ) {
    let season = event.target.value;
    let episodes = this.getEpisodes( { season: season } );
    this.setState( { selectedSeason: season, episodes: episodes } );
  }

  onSortBy( sortBy ) {
    let episodes = this.getEpisodes( { sortBy: sortBy } );
    this.setState( { episodes : episodes } );
  }

  componentDidMount() {
    fetch('http://ec2-52-90-200-167.compute-1.amazonaws.com:8080')
      .then( resp => resp.json() )
      .then( items => { 
        let seasons = this.indexSeasons( items );
        let seasonOptions = this.getSeasonOptions( seasons );
        let episodes = this.getEpisodes( { season: this.state.selectedSeason, items: seasons[ this.state.selectedSeason ] } );
        return {
          items: items,
          seasons: seasons,
          seasonOptions: seasonOptions,
          episodes: episodes
        }
      })
      .then( state => this.setState( state ) )
      .catch( error => console.log( error ) );   
  }
  
  render() {
    let sortBy = this.state.sortBy;
    let sortDirection = this.state.sortDirection == 'ascending' ? 'arrow_drop_up' : 'arrow_drop_down';
    return (
      <div className="App">
        <header className="App-header">
          <nav className="navbar navbar-dark bg-dark d-flex flex-column">
            
            <a className="navbar-brand flex-grow-1" href="#">Star Trek Episodes</a>
            
            <form className=" my-2 p-0 w-100 mb-3">
              <select className="form-control form-control-lg w-100" onChange={ this.onSeasonChange } >
                { this.state.seasonOptions }
              </select>
            </form>

            <div className="ml-2"></div>

            <div className="d-flex justify-content-md-center w-100 mb-3">
              <button className={`btn btn-primary d-flex center col ${ sortBy == 'episode' ? 'active' : '' }`} title="Sort By Episode" type="button" onClick={ () => this.onSortBy( 'episode' ) } >
                <i className={`material-icons bg-dark mr-1 ${ sortBy != 'episode' ? 'd-none' : '' }`}>{ sortDirection }</i>
                <span className="flex-fill" >Episode</span>
              </button>
              <button className={`btn btn-primary ml-2 d-flex center col ${ sortBy == 'title' ? 'active' : '' }`} title="Sort By Title" type="button" onClick={ () => this.onSortBy( 'title' ) } >
                <i className={`material-icons bg-dark mr-1 ${ sortBy != 'title' ? 'd-none' : '' }`}>{ sortDirection }</i>
                <span className="flex-fill" >Title</span>
              </button>
              <button className={`btn btn-primary ml-2 d-flex center col ${ sortBy == 'votes' ? 'active' : '' }`} title="Sort By Votes" type="button" onClick={ () => this.onSortBy( 'votes' ) } >
                <i className={`material-icons bg-dark mr-1 ${ sortBy != 'votes' ? 'd-none' : '' }`}>{ sortDirection }</i>
                <span className="flex-fill" >Votes</span>
              </button>
              <button className={`btn btn-primary ml-2 d-flex center col ${ sortBy == 'rating' ? 'active' : '' }`} title="Sort By Rating" type="button" onClick={ () => this.onSortBy( 'rating' ) } >
                <i className={`material-icons bg-dark mr-1 ${ sortBy != 'rating' ? 'd-none' : '' }`}>{ sortDirection }</i>
                <span className="flex-fill" >Rating</span>
              </button>
            </div>

          </nav>
        </header>
        <ul className="list-group" >{ this.state.episodes }</ul>
      </div>
    );
  }

  getEpisodes( args ) {
    let season = args && args.season ? args.season : this.state.selectedSeason;
    let items = args && args.items ? args.items : this.state.seasons[ season ];
    let sortBy = args && args.sortBy ? args.sortBy : this.state.sortBy;
    let currentDirection = sortBy == this.state.sortBy ? this.state.sortDirection : false;
    let newDirection = currentDirection;
    if ( !currentDirection ) newDirection = this.state.sortFuncts[ sortBy ].defaultDirection;
    if ( !args.season && currentDirection == 'ascending' ) newDirection = 'descending';
    if ( !args.season && currentDirection == 'descending' ) newDirection = 'ascending';
    this.setState( { sortBy: sortBy, sortDirection: newDirection } );
    items = items.sort( this.state.sortFuncts[ sortBy ][ newDirection ] );
    let episodes = items.map( ( episode, index ) => <Episode key={ episode.tconst } episode={ episode } /> );
    return episodes;
  }

  indexSeasons( items ) {
    let seasons = {}
    for( var i = 0; i < items.length; i++ ) {
      let item = items[i];
      let seasonNumber = item.seasonNumber;
      seasons[ seasonNumber ] ? seasons[ seasonNumber ].push( item ) : seasons[ seasonNumber ] = [ item ];
    }
    return seasons;
  }

  getSeasonOptions( seasons ) {
    let season;
    let seasonOptions = [];
    let firstOption = true;
    for ( season in seasons ) {
      let seasonText = `Season ${ season }`;
      let option = firstOption ? 
        <option defaultValue key={ season } value={ season } >{ seasonText }</option> : 
        <option key={ season } value={ season } >{ seasonText }</option>;
      seasonOptions.push( option );
      firstOption = false;
    }
    return seasonOptions;
  }

  sortByTitleAsce( a, b ) {
    let x = a.originalTitle.toString().toLowerCase();
    let y = b.originalTitle.toString().toLowerCase();
    if ( x < y ) return -1;
    if ( x > y ) return 1;
    return 0;
  }

  sortByTitleDesc( a, b ) {
    let x = a.originalTitle.toString().toLowerCase();
    let y = b.originalTitle.toString().toLowerCase();
    if ( y < x ) return -1;
    if ( y > x ) return 1;
    return 0;
  }
  
  sortByRatingAsce( a, b ) {
    let x = a.averageRating;
    let y = b.averageRating;
    return x - y;
  }
  
  sortByRatingDesc( a, b ) {
    let x = a.averageRating;
    let y = b.averageRating;
    return y - x;
  }

  sortByVotesAsce( a, b ) {
    let x = a.numVotes;
    let y = b.numVotes;
    return x - y;
  }
  
  sortByVotesDesc( a, b ) {
    let x = a.numVotes;
    let y = b.numVotes;
    return y - x;
  }

  sortByEpisodeAsce( a, b ) {
    let x = a.episodeNumber;
    let y = b.episodeNumber;
    return x - y;
  }
  
  sortByEpisodeDesc( a, b ) {
    let x = a.episodeNumber;
    let y = b.episodeNumber;
    return y - x;
  }

}

export default App;
