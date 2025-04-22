/** @format */

import axios from "axios";

// Backend API URL - using relative URL because of proxy in package.json
const API_URL = "/api";

// Create axios instance with default config
const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add authentication token to requests if available
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("authToken");
	if (token) {
		config.headers.Authorization = `Token ${token}`;
	}
	return config;
});

// Movies API
export const fetchPopularMovies = async () => {
	try {
		const response = await api.get("/movies/popular/");
		return response.data;
	} catch (error) {
		console.error("Error fetching popular movies:", error);
		throw error;
	}
};

export const searchMovies = async (query) => {
	try {
		const response = await api.get(
			`/movies/search/?query=${encodeURIComponent(query)}`
		);
		return response.data;
	} catch (error) {
		console.error("Error searching movies:", error);
		throw error;
	}
};

export const fetchMovieDetails = async (movieId) => {
	try {
		const response = await api.get(`/movies/${movieId}/`);
		return response.data;
	} catch (error) {
		console.error("Error fetching movie details:", error);
		throw error;
	}
};

export const fetchMovieCredits = async (movieId) => {
	try {
		const response = await api.get(`/movies/${movieId}/credits/`);
		return response.data;
	} catch (error) {
		console.error("Error fetching movie credits:", error);
		throw error;
	}
};

export const fetchSimilarMovies = async (movieId) => {
	try {
		const response = await api.get(`/movies/${movieId}/similar/`);
		return response.data;
	} catch (error) {
		console.error("Error fetching similar movies:", error);
		throw error;
	}
};

export const fetchGenres = async () => {
	try {
		const response = await api.get("/movies/genres/");
		return response.data;
	} catch (error) {
		console.error("Error fetching genres:", error);
		throw error;
	}
};

// Recommendations API
export const fetchRecommendations = async (userPreferences) => {
	try {
		const response = await api.post("/recommendations/", userPreferences);
		return response.data;
	} catch (error) {
		console.error("Error fetching recommendations:", error);
		throw error;
	}
};

// AI Features API
export const guessMovieFromPlot = async (plotDescription) => {
	try {
		const response = await api.post("/ai/guess-movie/", {
			plot_description: plotDescription,
		});
		return response.data;
	} catch (error) {
		console.error("Error guessing movie from plot:", error);
		throw error;
	}
};

export const generateMovieTrivia = async (movieTitle) => {
	try {
		const response = await api.post("/ai/movie-trivia/", {
			movie_title: movieTitle,
		});
		return response.data;
	} catch (error) {
		console.error("Error generating movie trivia:", error);
		throw error;
	}
};

// Authentication API
export const registerUser = async (userData) => {
	try {
		const response = await api.post("/auth/", {
			...userData,
			action: "register",
		});
		return response.data;
	} catch (error) {
		console.error("Error registering user:", error);
		throw error;
	}
};

export const loginUser = async (credentials) => {
	try {
		const response = await api.post("/auth/", {
			...credentials,
			action: "login",
		});
		// Store token in localStorage
		if (response.data.token) {
			localStorage.setItem("authToken", response.data.token);
			localStorage.setItem(
				"user",
				JSON.stringify({
					id: response.data.user_id,
					username: response.data.username,
					favoraiteGenres: response.data.favorite_genres,
					favoriteMovies: response.data.favorite_movies,
					watchedMovies: response.data.watched_movies,
				})
			);
		}
		return response.data;
	} catch (error) {
		console.error("Error logging in:", error);
		throw error;
	}
};

export const logoutUser = () => {
	localStorage.removeItem("authToken");
	localStorage.removeItem("user");
	localStorage.removeItem("currentUserProfile");
};

export const getCurrentUser = () => {
	const userStr = localStorage.getItem("user");
	if (userStr) {
		return JSON.parse(userStr);
	}
	return null;
};

export const getCurrentUserProfile = () => {
	const profileStr = localStorage.getItem("currentUserProfile");
	if (profileStr) {
		return JSON.parse(profileStr);
	}
	return null;
};

// User Profile API
export const fetchUserProfile = async () => {
	try {
		const response = await api.get("/db/profiles/");
		if (response.data.length > 0) {
			localStorage.setItem(
				"currentUserProfile",
				JSON.stringify(response.data[0])
			);
		}
		return response.data.length > 0 ? response.data[0] : null;
	} catch (error) {
		console.error("Error fetching user profile:", error);
		throw error;
	}
};

export const addFavoriteGenre = async (profileId, genreId) => {
	try {
		const response = await api.post(
			`/db/profiles/${profileId}/add_favorite_genre/`,
			{ genre_id: genreId }
		);
		fetchUserProfile();
		return response.data;
	} catch (error) {
		console.error("Error adding favorite genre:", error);
		throw error;
	}
};

export const addFavoriteMovie = async (profileId, movieId) => {
	try {
		const response = await api.post(
			`/db/profiles/${profileId}/add_favorite_movie/`,
			{ movie_id: movieId }
		);
		fetchUserProfile();
		return response.data;
	} catch (error) {
		console.error("Error adding favorite movie:", error);
		throw error;
	}
};

export const addWatchedMovie = async (
	profileId,
	movieId,
	userRating = null
) => {
	try {
		const response = await api.post(
			`/db/profiles/${profileId}/add_watched_movie/`,
			{
				movie_id: movieId,
				user_rating: userRating,
			}
		);
		fetchUserProfile();
		return response.data;
	} catch (error) {
		console.error("Error adding watched movie:", error);
		throw error;
	}
};

// Watch History API
export const fetchWatchHistory = async () => {
	try {
		const response = await api.get("/db/watch-history/");
		return response.data;
	} catch (error) {
		console.error("Error fetching watch history:", error);
		throw error;
	}
};

// Database operations for movies
export const saveMovieToDatabase = async (tmdbId) => {
	try {
		const response = await api.post("/db/movies/save_movie/", {
			tmdb_id: tmdbId,
		});
		return response.data;
	} catch (error) {
		console.error("Error saving movie to database:", error);
		throw error;
	}
};

export const syncGenresFromTMDB = async () => {
	try {
		const response = await api.post("/db/genres/sync_from_tmdb/");
		return response.data;
	} catch (error) {
		console.error("Error syncing genres from TMDB:", error);
		throw error;
	}
};

// Movie Trivia API
export const generateAndSaveMovieTrivia = async (movieId) => {
	try {
		const response = await api.post("/db/movie-trivia/generate_and_save/", {
			movie_id: movieId,
		});
		return response.data;
	} catch (error) {
		console.error("Error generating and saving movie trivia:", error);
		throw error;
	}
};
