import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./components/Home";
import Settings from "./components/Settings";
import MyFiles from "./components/MyFiles";
import Uploads from "./components/Uploads";
import Favorites from "./components/Favorites";
import Default from "./components/Default";
import Files from "./components/Files";
import { LocationContext } from "./Contexts/LocationContext";
import { FavoritesContext } from "./Contexts/FavoritesContext";
import { AuthContext } from "./Contexts/AuthContext";
import SearchPage from "./components/SearchPage";
import SignUp from "./components/SignUp";
import Login from "./components/Reusable/Login";
import Cookies from "js-cookie";

function App() {
  const [location, setLocation] = useState("home");
  const [favoriteCategory, setFavoriteCategory] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Cookies.get("authToken") ? true : false,
  );

  useEffect(() => {
    if (
      Cookies.get("authToken") === undefined &&
      location !== "login" &&
      location !== "signup" &&
      location !== "home"
    ) {
      window.location.href = "/";
    }
    return () => {};
  }, [isAuthenticated, location]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <LocationContext.Provider value={{ location, setLocation }}>
        <FavoritesContext.Provider
          value={{ favoriteCategory, setFavoriteCategory }}
        >
          <Router>
            <Routes>
              <Route exact path="/" Component={Default} />
              <Route
                exact
                path="/home"
                Component={() => (isAuthenticated ? <Home /> : <Login />)}
              />
              <Route
                exact
                path="/upload"
                Component={() => (isAuthenticated ? <Uploads /> : <Login />)}
              />
              <Route
                exact
                path="/myfiles"
                Component={() => (isAuthenticated ? <MyFiles /> : <Login />)}
              />
              <Route
                exact
                path="/favorites"
                Component={() => (isAuthenticated ? <Favorites /> : <Login />)}
              />
              <Route
                exact
                path="/settings"
                Component={() => (isAuthenticated ? <Settings /> : <Login />)}
              />
              <Route
                exact
                path="/files"
                Component={() => (isAuthenticated ? <Files /> : <Login />)}
              />
              <Route
                exact
                path="/files/pictures"
                Component={(props) =>
                  isAuthenticated ? (
                    <Files {...props} category="pictures" />
                  ) : (
                    <Login />
                  )
                }
              />
              <Route
                exact
                path="/files/videos"
                Component={(props) =>
                  isAuthenticated ? (
                    <Files {...props} category="videos" />
                  ) : (
                    <Login />
                  )
                }
              />
              <Route
                exact
                path="/files/audio"
                Component={(props) =>
                  isAuthenticated ? (
                    <Files {...props} category="audio" />
                  ) : (
                    <Login />
                  )
                }
              />
              <Route
                exact
                path="/files/documents"
                Component={(props) =>
                  isAuthenticated ? (
                    <Files {...props} category="documents" />
                  ) : (
                    <Login />
                  )
                }
              />
              <Route
                exact
                path="/search"
                Component={() => (isAuthenticated ? <SearchPage /> : <Login />)}
              />
              <Route exact path="/signup" Component={SignUp} />
              <Route exact path="/login" Component={Login} />
            </Routes>
          </Router>
        </FavoritesContext.Provider>
      </LocationContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
