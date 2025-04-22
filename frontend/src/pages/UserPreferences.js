/** @format */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import Authentication from "../components/Authentication";
import {
	fetchGenres,
	searchMovies,
	getCurrentUser,
	fetchUserProfile,
	addFavoriteGenre,
	addFavoriteMovie,
	addWatchedMovie,
	saveMovieToDatabase,
} from "../services/api";

const UserPreferences = ({ userPreferences, updateUserPreferences }) => {
	const navigate = useNavigate();
	const [genres, setGenres] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [selectedGenres, setSelectedGenres] = useState(
		userPreferences?.favoriteGenres || []
	);
	const [favoriteMovies, setFavoriteMovies] = useState(
		userPreferences?.favoriteMovies || []
	);
	const [watchedMovies, setWatchedMovies] = useState(
		userPreferences?.watchedMovies || []
	);
	const [loading, setLoading] = useState(false);
	const [searching, setSearching] = useState(false);
	const [error, setError] = useState(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Authentication and user profile states
	const [user, setUser] = useState(getCurrentUser());
	const [userProfile, setUserProfile] = useState(null);
	const [loadingProfile, setLoadingProfile] = useState(false);

	const [removedMovie, setRemovedMovie] = useState(null);
	const [removedGenre, setRemovedGenre] = useState(null);
	const [removedWatchedMovie, setRemovedWatchedMovie] = useState(null);

	// Load user profile if authenticated
	console.log("selectedGenres", selectedGenres);
	console.log("favoriteMovies", favoriteMovies);
	console.log("watchedMovies", watchedMovies);
	useEffect(() => {
		const loadUserProfile = async () => {
			if (user) {
				try {
					setLoadingProfile(true);
					const profile = await fetchUserProfile();
					setUserProfile(profile);
				} catch (err) {
					console.error("Error fetching user profile:", err);
				} finally {
					setLoadingProfile(false);
				}
			}
		};

		loadUserProfile();
	}, [user]);

	useEffect(() => {
		const loadGenres = async () => {
			try {
				setLoading(true);
				const genresData = await fetchGenres();
				setGenres(genresData.genres);
				setError(null);
			} catch (err) {
				setError("Failed to load genres. Please try again later.");
				console.error("Error fetching genres:", err);
			} finally {
				setLoading(false);
			}
		};

		loadGenres();
	}, []);

	useEffect(() => {
		// Initialize selected genres from user preferences
		setSelectedGenres(userPreferences.favoriteGenres || []);
		setFavoriteMovies(userPreferences.favoriteMovies || []);
		setWatchedMovies(userPreferences.watchedMovies || []);
	}, [userPreferences]);

	const handleGenreToggle = (genreId) => {
		setSelectedGenres((prev) => {
			if (prev.includes(genreId)) {
				return prev.filter((id) => id !== genreId);
			} else {
				return [...prev, genreId];
			}
		});
	};

	const handleSearch = async () => {
		if (!searchQuery.trim()) return;

		try {
			setSearching(true);
			setError(null);

			const data = await searchMovies(searchQuery);
			setSearchResults(data.results);
		} catch (err) {
			setError("Failed to search movies. Please try again later.");
			console.error("Error searching movies:", err);
		} finally {
			setSearching(false);
		}
	};

	const handleAddFavorite = (movie) => {
		const movieExists = favoriteMovies.some((m) => m.id === movie.id);

		if (!movieExists) {
			const newMovie = {
				id: movie.id,
				tmdb_id: movie.id,
				title: movie.title,
				poster_path: movie.poster_path,
				genre_ids: movie.genre_ids,
			};

			setFavoriteMovies((prev) => [...prev, newMovie]);
		}
	};

	const handleRemoveFavorite = (movieId) => {
		setFavoriteMovies((prev) => prev.filter((movie) => movie.id !== movieId));
	};

	const handleRemoveWatched = (movieId) => {
		setWatchedMovies((prev) => prev.filter((movie) => movie.id !== movieId));
	};

	// Handle authentication
	const handleAuthSuccess = (authData) => {
		setUser(getCurrentUser());
	};

	// Save preferences to database if logged in, or to local state if not
	const handleSavePreferences = async () => {
		if (user && userProfile) {
			try {
				setLoading(true);

				// First, sync selected genres to user profile

				await addFavoriteGenre(userProfile.id, selectedGenres);

				// Save favorite movies to database
				let favMovies = [];
				for (const movie of favoriteMovies) {
					// First save the movie to the database
					console.log("Saving movie to database:", movie);
					const savedMovie = await saveMovieToDatabase(movie.tmdb_id);
					// Then add it to user's favorites
					favMovies.push(savedMovie.id);
				}
				await addFavoriteMovie(userProfile.id, favMovies);

				// Save watch history
				let watchedMoviesIds = [];
				for (const movie of watchedMovies) {
					const savedMovie = await saveMovieToDatabase(movie.tmdb_id);
					watchedMoviesIds.push(savedMovie.id);
				}
				await addWatchedMovie(userProfile.id, watchedMoviesIds);

				setSaveSuccess(true);
			} catch (err) {
				setError(
					"Failed to save preferences to your profile. Please try again."
				);
				console.error("Error saving preferences:", err);
			} finally {
				setLoading(false);
			}
		} else {
			// Save to local storage via parent component
			updateUserPreferences({
				favoriteGenres: selectedGenres,
				favoriteMovies: favoriteMovies,
				watchedMovies: watchedMovies,
			});

			setSaveSuccess(true);
		}

		// Reset success message after 3 seconds
		setTimeout(() => {
			setSaveSuccess(false);
		}, 3000);
	};

	const handleViewRecommendations = () => {
		navigate("/recommendations");
	};

	// Show authentication form if user is not authenticated
	if (!user && userPreferences.requireAuth) {
		return (
			<div className='auth-container'>
				<h2>Sign In to Save Your Preferences</h2>
				<p className='auth-description'>
					Sign in or create an account to save your movie preferences and get
					personalized recommendations across devices.
				</p>
				<Authentication onAuthSuccess={handleAuthSuccess} />
			</div>
		);
	}

	if (loading || loadingProfile) {
		return <LoadingSpinner message='Loading data...' />;
	}

	return (
		<div className='preferences-page'>
			<div className='preferences-header'>
				<h1>Your Movie Preferences</h1>
				<p className='description'>
					Customize your movie preferences to get personalized recommendations.
					Select your favorite genres and movies to help us understand your
					taste.
				</p>
			</div>

			{error && (
				<div className='error-message'>
					<i className='fas fa-exclamation-circle'></i> {error}
				</div>
			)}

			{saveSuccess && (
				<div className='success-message'>
					<i className='fas fa-check-circle'></i> Your preferences have been
					saved successfully!
				</div>
			)}

			<div className='preferences-content'>
				<div className='preferences-section'>
					<h2>Favorite Genres</h2>
					<p className='section-description'>
						Select the genres you enjoy watching the most.
					</p>

					<div className='genres-grid'>
						{genres.map((genre) => (
							<div
								key={genre.id}
								className={`genre-item ${
									selectedGenres.includes(genre.id) ? "selected" : ""
								}`}
								onClick={() => handleGenreToggle(genre.id)}>
								<span className='genre-name'>{genre.name}</span>
								{selectedGenres.includes(genre.id) && (
									<i className='fas fa-check selected-icon'></i>
								)}
							</div>
						))}
					</div>
				</div>

				<div className='preferences-section'>
					<h2>Favorite Movies</h2>
					<p className='section-description'>
						Search and add movies that you love to get better recommendations.
					</p>

					<div className='search-container'>
						<div className='search-input-wrapper'>
							<input
								type='text'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder='Search for movies...'
								className='search-input'
								onKeyDown={(e) => e.key === "Enter" && handleSearch()}
							/>
							<button
								className='search-button'
								onClick={handleSearch}
								disabled={searching}>
								{searching ? (
									<i className='fas fa-spinner fa-spin'></i>
								) : (
									<i className='fas fa-search'></i>
								)}
							</button>
						</div>
					</div>

					{searching && (
						<div className='loading-container'>
							<LoadingSpinner size='small' message='Searching movies...' />
						</div>
					)}

					{searchResults.length > 0 && !searching && (
						<div className='search-results'>
							<h3>Search Results</h3>
							<div className='movie-results-grid'>
								{searchResults.map((movie) => (
									<div key={movie.id} className='movie-result-card'>
										<div className='movie-poster-container'>
											{movie.poster_path ? (
												<img
													src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
													alt={movie.title}
													className='movie-poster'
												/>
											) : (
												<div className='no-poster'>
													<i className='fas fa-film'></i>
												</div>
											)}
										</div>
										<div className='movie-result-info'>
											<h4>{movie.title}</h4>
											<p className='movie-year'>
												{movie.release_date
													? new Date(movie.release_date).getFullYear()
													: "N/A"}
											</p>
											<button
												className='add-favorite-btn'
												onClick={() => handleAddFavorite(movie)}
												disabled={favoriteMovies.some(
													(m) => m.id === movie.id
												)}>
												{favoriteMovies.some((m) => m.id === movie.id) ? (
													<span>
														<i className='fas fa-check'></i> Added
													</span>
												) : (
													<span>
														<i className='fas fa-plus'></i> Add to Favorites
													</span>
												)}
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					<div className='selected-movies'>
						<h3>Your Favorite Movies</h3>
						{favoriteMovies.length === 0 ? (
							<div className='empty-state'>
								<p>You haven't added any favorite movies yet.</p>
							</div>
						) : (
							<div className='selected-movies-grid'>
								{favoriteMovies.map((movie) => (
									<div key={movie.id} className='selected-movie-card'>
										{movie.poster_path ? (
											<img
												src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
												alt={movie.title}
												className='selected-movie-poster'
											/>
										) : (
											<div className='no-poster'>
												<i className='fas fa-film'></i>
											</div>
										)}
										<div className='selected-movie-info'>
											<h4>{movie.title}</h4>
											<button
												className='remove-btn'
												onClick={() => handleRemoveFavorite(movie.id)}>
												<i className='fas fa-times'></i> Remove
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div className='preferences-section'>
					<h2>Watched Movies</h2>
					<p className='section-description'>
						Movies you've marked as watched.
					</p>

					<div className='watched-movies'>
						{watchedMovies.length === 0 ? (
							<div className='empty-state'>
								<p>You haven't marked any movies as watched yet.</p>
							</div>
						) : (
							<div className='watched-movies-grid'>
								{watchedMovies.map((movie) => (
									<div key={movie.id} className='watched-movie-card'>
										{movie.poster_path ? (
											<img
												src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
												alt={movie.title}
												className='watched-movie-poster'
											/>
										) : (
											<div className='no-poster'>
												<i className='fas fa-film'></i>
											</div>
										)}
										<div className='watched-movie-info'>
											<h4>{movie.title}</h4>
											<button
												className='remove-btn'
												onClick={() => handleRemoveWatched(movie.id)}>
												<i className='fas fa-times'></i> Remove
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div className='preferences-actions'>
					<button
						className='btn btn-primary save-btn'
						onClick={handleSavePreferences}>
						Save Preferences
					</button>
					<button
						className='btn btn-secondary view-recommendations-btn'
						onClick={handleViewRecommendations}>
						View Recommendations
					</button>
				</div>
			</div>

			{!user && (
				<div className='auth-prompt'>
					<div className='auth-prompt-content'>
						<h3>Save Your Preferences</h3>
						<p>
							Create an account or sign in to save your preferences and get
							personalized recommendations across devices.
						</p>
						<button className='sign-in-btn' onClick={() => navigate("/login")}>
							Sign In / Register
						</button>
					</div>
				</div>
			)}

			<style jsx>{`
				.auth-container {
					max-width: 500px;
					margin: 0 auto;
					padding: 2rem;
					background-color: white;
					border-radius: 8px;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
				}

				.auth-container h2 {
					color: var(--primary);
					margin-bottom: 1rem;
					text-align: center;
				}

				.auth-description {
					color: var(--text-light);
					margin-bottom: 2rem;
					text-align: center;
				}

				.auth-prompt {
					background-color: rgba(1, 180, 228, 0.05);
					border: 1px solid rgba(1, 180, 228, 0.2);
					border-radius: 8px;
					padding: 1.5rem;
					margin-bottom: 2rem;
				}

				.auth-prompt-content {
					text-align: center;
				}

				.auth-prompt h3 {
					color: var(--primary);
					margin-bottom: 0.5rem;
				}

				.auth-prompt p {
					color: var(--text-light);
					margin-bottom: 1rem;
				}

				.sign-in-btn {
					background-color: var(--primary);
					color: white;
					border: none;
					padding: 0.6rem 1.2rem;
					border-radius: 4px;
					font-size: 1rem;
					cursor: pointer;
					transition: background-color 0.3s;
				}

				.sign-in-btn:hover {
					background-color: #021d2f;
				}
				.preferences-page {
					min-height: 100%;
					padding: 10px;
				}

				.preferences-header {
					margin-bottom: 2rem;
					text-align: center;
				}

				.preferences-header h1 {
					color: var(--primary);
					margin-bottom: 1rem;
				}

				.description {
					max-width: 800px;
					margin: 0 auto;
					color: var(--text-light);
					font-size: 1.1rem;
				}

				.success-message {
					background-color: rgba(56, 142, 60, 0.1);
					color: var(--success);
					padding: 1rem;
					border-radius: 4px;
					margin-bottom: 1.5rem;
					display: flex;
					align-items: center;
				}

				.success-message i {
					margin-right: 0.5rem;
					font-size: 1.2rem;
				}

				.preferences-content {
					background-color: white;
					border-radius: 8px;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
					padding: 2rem;
					margin-bottom: 2rem;
				}

				.preferences-section {
					margin-bottom: 3rem;
				}

				.preferences-section:last-child {
					margin-bottom: 0;
				}

				.preferences-section h2 {
					color: var(--primary);
					margin-bottom: 0.5rem;
					font-size: 1.5rem;
				}

				.section-description {
					color: var(--text-light);
					margin-bottom: 1.5rem;
				}

				.genres-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
					gap: 1rem;
				}

				.genre-item {
					padding: 0.75rem 1rem;
					border-radius: 4px;
					border: 1px solid var(--border);
					cursor: pointer;
					transition: all 0.3s;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				.genre-item:hover {
					border-color: var(--accent);
					transform: translateY(-2px);
				}

				.genre-item.selected {
					background-color: rgba(1, 180, 228, 0.1);
					border-color: var(--accent);
				}

				.selected-icon {
					color: var(--accent);
				}

				.search-container {
					margin-bottom: 1.5rem;
				}

				.search-input-wrapper {
					display: flex;
					border: 1px solid var(--border);
					border-radius: 4px;
					overflow: hidden;
				}

				.search-input {
					flex: 1;
					padding: 0.75rem 1rem;
					border: none;
					font-size: 1rem;
				}

				.search-input:focus {
					outline: none;
				}

				.search-button {
					background-color: var(--primary);
					color: white;
					border: none;
					padding: 0 1.5rem;
					cursor: pointer;
					transition: background-color 0.3s;
				}

				.search-button:hover {
					background-color: #021d2f;
				}

				.loading-container {
					display: flex;
					justify-content: center;
					padding: 1.5rem 0;
				}

				.search-results {
					margin-bottom: 2rem;
				}

				.search-results h3,
				.selected-movies h3,
				.watched-movies h3 {
					margin-bottom: 1rem;
					color: var(--text);
					font-size: 1.2rem;
				}

				.movie-results-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
					gap: 1rem;
				}

				.movie-result-card {
					display: flex;
					border: 1px solid var(--border);
					border-radius: 6px;
					overflow: hidden;
					transition: transform 0.3s, box-shadow 0.3s;
				}

				.movie-result-card:hover {
					transform: translateY(-3px);
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
				}

				.movie-poster-container {
					width: 80px;
					height: 120px;
					flex-shrink: 0;
				}

				.movie-poster {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				.no-poster {
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: #f0f0f0;
					color: var(--text-light);
					font-size: 1.5rem;
				}

				.movie-result-info {
					padding: 0.75rem;
					flex: 1;
					display: flex;
					flex-direction: column;
				}

				.movie-result-info h4 {
					margin-bottom: 0.25rem;
					color: var(--primary);
					font-size: 1rem;
				}

				.movie-year {
					color: var(--text-light);
					font-size: 0.9rem;
					margin-bottom: 0.75rem;
				}

				.add-favorite-btn {
					background-color: transparent;
					border: 1px solid var(--accent);
					color: var(--accent);
					padding: 0.4rem 0.75rem;
					border-radius: 4px;
					cursor: pointer;
					font-size: 0.9rem;
					transition: all 0.3s;
					margin-top: auto;
				}

				.add-favorite-btn:hover:not(:disabled) {
					background-color: var(--accent);
					color: white;
				}

				.add-favorite-btn:disabled {
					opacity: 0.7;
					cursor: default;
					background-color: rgba(1, 180, 228, 0.1);
				}

				.selected-movies-grid,
				.watched-movies-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
					gap: 1rem;
				}

				.selected-movie-card,
				.watched-movie-card {
					border-radius: 6px;
					overflow: hidden;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					transition: transform 0.3s;
				}

				.selected-movie-card:hover,
				.watched-movie-card:hover {
					transform: translateY(-5px);
				}

				.selected-movie-poster,
				.watched-movie-poster {
					width: 100%;
					height: 225px;
					object-fit: cover;
				}

				.selected-movie-info,
				.watched-movie-info {
					padding: 0.75rem;
				}

				.selected-movie-info h4,
				.watched-movie-info h4 {
					font-size: 0.95rem;
					margin-bottom: 0.5rem;
					color: var(--text);
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.remove-btn {
					background-color: transparent;
					border: 1px solid #f44336;
					color: #f44336;
					padding: 0.3rem 0.6rem;
					border-radius: 4px;
					cursor: pointer;
					font-size: 0.8rem;
					transition: all 0.3s;
					width: 100%;
				}

				.remove-btn:hover {
					background-color: #f44336;
					color: white;
				}

				.empty-state {
					padding: 2rem;
					text-align: center;
					background-color: #f9f9f9;
					border-radius: 4px;
					color: var(--text-light);
				}

				.preferences-actions {
					display: flex;
					justify-content: center;
					gap: 1rem;
					margin-top: 2rem;
				}

				.save-btn,
				.view-recommendations-btn {
					padding: 0.75rem 2rem;
					font-size: 1.1rem;
				}

				@media (max-width: 768px) {
					.genres-grid {
						grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
					}

					.movie-results-grid {
						grid-template-columns: 1fr;
					}

					.selected-movies-grid,
					.watched-movies-grid {
						grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
					}

					.preferences-actions {
						flex-direction: column;
						align-items: center;
					}

					.save-btn,
					.view-recommendations-btn {
						width: 100%;
						max-width: 300px;
					}
				}
			`}</style>
		</div>
	);
};

export default UserPreferences;
