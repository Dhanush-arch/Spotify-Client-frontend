import React, { useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { useStateValue } from "./StateProvider";
import Player from "./Player";
import { getTokenFromResponse } from "./spotify";
import "./App.css";
import Login from "./Login";

const s = new SpotifyWebApi();

function App() {
  const [{ token }, dispatch] = useStateValue();

  useEffect(() => {
    let _token;

    //Persist Login
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      s.setAccessToken(loggedInUser);
      _token = loggedInUser;
    }
    if (!_token) {
      // Set token
      const hash = getTokenFromResponse();
      window.location.hash = "";
      _token = hash.access_token;
    }

    if (_token) {
      s.setAccessToken(_token);

      localStorage.setItem("user", _token);

      dispatch({
        type: "SET_TOKEN",
        token: _token,
      });

      s.getPlaylist("37i9dQZEVXcClPXwy8IFbp").then((response) =>
        dispatch({
          type: "SET_DISCOVER_WEEKLY",
          discover_weekly: response,
        })
      );

      s.getMyDevices().then((res) => {
        dispatch({
          type: "SET_DEVICE",
          device: (res?.devices[0]?.is_active) ? res?.devices[0]?.id : null,
        })
      })

      s.getMyTopArtists().then((response) =>
        dispatch({
          type: "SET_TOP_ARTISTS",
          top_artists: response,
        })
      );

      dispatch({
        type: "SET_SPOTIFY",
        spotify: s,
      });

      s.getMe().then((user) => {
        dispatch({
          type: "SET_USER",
          user,
        });
      });

      s.getUserPlaylists().then((playlists) => {
        dispatch({
          type: "SET_PLAYLISTS",
          playlists,
        });
      });
    }
  }, [token, dispatch]);

  return (
    <div className="app">
      {!token && <Login />}
      {token && <Player spotify={s} />}
    </div>
  );
}

export default App;
