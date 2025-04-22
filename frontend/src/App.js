/** @format */

import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Recommendations from "./pages/Recommendations";
import GuessMovie from "./pages/GuessMovie";
import MovieTrivia from "./pages/MovieTrivia";
import UserPreferences from "./pages/UserPreferences";
import Login from "./pages/Login";
import {
	getCurrentUser,
	syncGenresFromTMDB,
	fetchUserProfile,
	getCurrentUserProfile,
} from "./services/api";
import "./App.css";
import Footer from "./components/Footer";

export const appContext = createContext();
function App() {
	const [genres, setGenres] = useState([]);
	const [selectedGenres, setSelectedGenres] = useState([]);
	const [favoriteMovies, setFavoriteMovies] = useState([]);
	const [watchedMovies, setWatchedMovies] = useState([]);
	const [userProfile, setUserProfile] = useState(null);
	const [recommendations, setRecommendations] = useState([]);
	const [noPreferences, setNoPreferences] = useState(false);

	const contextValue = {
		genres,
		setGenres,
		selectedGenres,
		setSelectedGenres,
		favoriteMovies,
		setFavoriteMovies,
		watchedMovies,
		setWatchedMovies,
		userProfile,
		setUserProfile,
		recommendations,
		setRecommendations,
		noPreferences,
		setNoPreferences,
	};

	const [user, setUser] = useState(getCurrentUser());
	const [userPreferences, setUserPreferences] = useState({
		favoriteGenres: [],
		favoriteMovies: [],
		watchedMovies: [],
		requireAuth: false,
	});

	// Sync genres from TMDB on app load
	useEffect(() => {
		const initializeApp = async () => {
			try {
				// Sync genres from TMDB API to database
				await syncGenresFromTMDB();
			} catch (error) {
				console.error("Error syncing genres from TMDB:", error);
			}
		};

		initializeApp();
	}, []);

	// Check for user on app load
	useEffect(() => {
		const currentUser = getCurrentUser();
		setUser(currentUser);
		console.log("Current User:", currentUser);
		const userProfile = getCurrentUserProfile();
		console.log("User Profile:", userProfile);
		if (userProfile) {
			const genres = userProfile.favorite_genres.map((genre) => genre.tmdb_id);
			const watchedMovies = userProfile.watch_history.map(
				(movieit) => movieit.movie
			);
			setUserPreferences((prev) => ({
				...prev,
				favoriteGenres: genres,
				favoriteMovies: userProfile.favorite_movies,
				watchedMovies: watchedMovies,
			}));
		}
		console.log("User Preferences:", userPreferences);
	}, []);

	const updateUserPreferences = (newPreferences) => {
		setUserPreferences((prev) => ({
			...prev,
			...newPreferences,
		}));
	};

	const handleUserChange = (newUser) => {
		setUser(newUser);
	};
	console.log(user, userPreferences);
	return (
		<appContext.Provider value={contextValue}>
			<Router>
				<div className='app'>
					<Navbar user={user} handleUserChange={handleUserChange} />
					<main className='app-content'>
						<Routes>
							<Route
								path='/'
								element={<Home userPreferences={userPreferences} />}
							/>
							<Route
								path='/movie/:id'
								element={
									<MovieDetail
										userPreferences={userPreferences}
										updateUserPreferences={updateUserPreferences}
										user={user}
									/>
								}
							/>
							<Route
								path='/recommendations'
								element={<Recommendations userPreferences={userPreferences} />}
							/>
							<Route path='/guess-movie' element={<GuessMovie />} />
							<Route path='/movie-trivia' element={<MovieTrivia />} />
							<Route
								path='/preferences'
								element={
									<UserPreferences
										userPreferences={userPreferences}
										updateUserPreferences={updateUserPreferences}
									/>
								}
							/>
							<Route path='/login' element={<Login />} />
						</Routes>
					</main>
					<Footer />
				</div>
			</Router>
		</appContext.Provider>
	);
}

export default App;
