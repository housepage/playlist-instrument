/*global gapi b:true*/
/*global $ b:true*/
/*global YT b:true*/

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// The client ID is obtained from the {{ Google Cloud Console }}
// at {{ https://cloud.google.com/console }}.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.
var OAUTH2_CLIENT_ID = '1089990470294-qp0oiokbfi40ij4gk3o0i9v0msr04oni.apps.googleusercontent.com';
var OAUTH2_SCOPES = [
  'https://www.googleapis.com/auth/youtube'
];

var OAUTH2_CLIENT_SECRET = '13jPtk4BjJZszhm1NHyb5xc6';

var player;

// Upon loading, the Google APIs JS client automatically invokes this callback.
function googleApiClientReady() {
  loadAPIClientInterfaces();
  /*console.log("Getting ready");
  gapi.auth.init(function() {
    window.setTimeout(checkAuth, 1);
  });*/
}

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
function checkAuth() {
  gapi.auth.authorize({
    client_id: OAUTH2_CLIENT_ID,
    scope: OAUTH2_SCOPES,
    immediate: true
  }, handleAuthResult);
}

// Handle the result of a gapi.auth.authorize() call.
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // Authorization was successful. Hide authorization prompts and show
    // content that should be visible after authorization succeeds.
    $('.pre-auth').hide();
    $('.post-auth').show();
    loadAPIClientInterfaces();
  } else {
    // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
    // client flow. The current function is called when that flow completes.
    $('#login-link').click(function() {
      gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: false
        }, handleAuthResult);
    });
  }
}

// Load the client interfaces for the YouTube Analytics and Data APIs, which
// are required to use the Google APIs JS client. More info is available at
// https://developers.google.com/api-client-library/javascript/dev/dev_jscript#loading-the-client-library-and-the-api
function loadAPIClientInterfaces() {
  gapi.client.init({apiKey: 'AIzaSyBdL3GreHV24Qn-xae-PAJchrK_PSepYXA'})
  gapi.client.load('youtube', 'v3', function() {
    handleAPILoaded();
  });
}

// After the API loads, call a function to enable the search box.
function handleAPILoaded() {
  console.log("API loaded");
}

gapi.load('client', googleApiClientReady);

// Search for a specified string.
function search(q, cb) {
  var request = gapi.client.youtube.search.list({
    key: 'AIzaSyBdL3GreHV24Qn-xae-PAJchrK_PSepYXA',
    maxResults: 1,
    q: q,
    part: 'snippet',
    type: 'video'
  });

  request.execute(function(response) {
    cb(response)
  });
}

const playlists = [
  {
    name: 'Late Night Driving',
    songs: [{artist:{ name: 'David Bowie' }, title: 'Space Oddity', album: 'Simple Bullshit'}]
  }
]

function SongItem(props) {
  return (
    <div className="song" onClick={props.onClick}>
      <div className="songTitle">{props.song.title}</div>
      <div className="artist">{props.song.artist.name}</div>
      <div className="album">{props.song.album}</div>
    </div>
  );
}

class Playlist extends React.Component {
  render() {
    var self = this;
    const songItems = this.props.songs.map((song, index) => {
      const onClick = () => {
        console.log("Clicking and searching");
        search(song.title, (response) => {
           console.log("Search back");
           window.player.loadVideoById({'videoId': response.items[0].id.videoId,
               'suggestedQuality': 'large'});
        })  
      }

      return (
        <SongItem song={song} key={song.title} onClick={onClick} />
      );
    })
    
    return (
      <div className="playlist col-md-4">
        <ol>{songItems}</ol>
      </div>
    );
  }
}

class Playlists extends React.Component {
  render() {
    return (
      <div className="playlists col-md-4">
        <ol>{this.props.playlists}</ol>
      </div>
    );
  }
}

class Player extends React.Component {
  render() {
    return (
      <div id="player" className="col-md-4">
      </div>
    );
  }
}

class PlaylistViewer extends React.Component {
  constructor() {
    super();
    this.state = {
      playlists: playlists,
      current_playlist: 0
    };
  }
  
  handlePlaylistClick(i) {
    this.setState({current_playlist: i})
  }
  
  render() {
    const playlistItems = this.state.playlists.map((playlist, index) => {
      return (
        <div className="row" key={playlist.name} onClick={() => this.handlePlaylistClick(index)}>{playlist.name}</div>
      );
    })
    
    return (
      <div className="row">
        <Playlists playlists={playlistItems} />
        <Playlist songs={this.state.playlists[this.state.current_playlist].songs}/>
        <Player />
      </div>
    );
  }
}

// 2. This code loads the IFrame Player API code asynchronously.
var youtubeTag = document.createElement('script');

youtubeTag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(youtubeTag, firstScriptTag);

function onPlayerReady(input) {
  console.log("Player Ready: " + input);
}

function onPlayerStateChange(){
  
}
// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
window.onYouTubeIframeAPIReady = function() {
  console.log('Getting ready');
  window.player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'M7lc1UVf-VE',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

ReactDOM.render(
  <PlaylistViewer />,
  document.getElementById('root')
);
