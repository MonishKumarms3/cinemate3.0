/** @format */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import {
	fetchMovieDetails,
	fetchMovieCredits,
	fetchSimilarMovies,
} from "../services/api";
import MovieGrid from "../components/MovieGrid";

const MovieDetail = ({ userPreferences, updateUserPreferences }) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [movie, setMovie] = useState(null);
	const [credits, setCredits] = useState(null);
	const [similarMovies, setSimilarMovies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Check if movie is in user's favorites
	const isFavorite = userPreferences.favoriteMovies?.some(
		(m) => m.tmdb_id === parseInt(id)
	);
	// Check if movie is in user's watched list
	const isWatched = userPreferences.watchedMovies?.some(
		(m) => m.tmdb_id === parseInt(id)
	);
	console.log(movie, "id", id);
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const [movieData, creditsData, similarData] = await Promise.all([
					fetchMovieDetails(id),
					fetchMovieCredits(id),
					fetchSimilarMovies(id),
				]);

				setMovie(movieData);
				setCredits(creditsData);
				setSimilarMovies(similarData.results);
				setError(null);
			} catch (err) {
				setError("Failed to load movie details. Please try again later.");
				console.error("Error fetching movie details:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	const handleToggleFavorite = () => {
		if (isFavorite) {
			// Remove from favorites
			updateUserPreferences({
				favoriteMovies: userPreferences.favoriteMovies.filter(
					(m) => m.tmdb_id !== parseInt(id)
				),
			});
		} else if (movie) {
			// Add to favorites
			updateUserPreferences({
				favoriteMovies: [
					...(userPreferences.favoriteMovies || []),
					{
						id: movie.id,
						tmdb_id: movie.id,
						title: movie.title,
						poster_path: movie.poster_path,
						genre_ids: movie.genres?.map((g) => g.id) || [],
					},
				],
			});
		}
	};

	const handleToggleWatched = () => {
		if (isWatched) {
			// Remove from watched
			updateUserPreferences({
				watchedMovies: userPreferences.watchedMovies.filter(
					(m) => m.tmdb_id !== parseInt(id)
				),
			});
		} else if (movie) {
			// Add to watched
			updateUserPreferences({
				watchedMovies: [
					...(userPreferences.watchedMovies || []),
					{
						id: movie.id,
						tmdb_id: movie.id,
						title: movie.title,
						poster_path: movie.poster_path,
						genre_ids: movie.genres?.map((g) => g.id) || [],
					},
				],
			});
		}
	};

	if (loading) {
		return <LoadingSpinner message='Loading movie details...' />;
	}

	if (error) {
		return (
			<div className='error-container'>
				<div className='error-message'>
					<i className='fas fa-exclamation-circle'></i> {error}
				</div>
				<button className='btn' onClick={() => navigate(-1)}>
					Go Back
				</button>
			</div>
		);
	}

	if (!movie) {
		return (
			<div className='error-container'>
				<div className='error-message'>
					<i className='fas fa-exclamation-circle'></i> Movie not found
				</div>
				<button className='btn' onClick={() => navigate(-1)}>
					Go Back
				</button>
			</div>
		);
	}

	// Format runtime to hours and minutes
	const formatRuntime = (minutes) => {
		if (!minutes) return "N/A";
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}m`;
	};

	// Format release date
	const formatReleaseDate = (date) => {
		if (!date) return "N/A";
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Format budget and revenue
	const formatCurrency = (amount) => {
		if (!amount) return "N/A";
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<div className='movie-detail-page'>
			<div
				className='backdrop-container'
				style={{
					backgroundImage: movie.backdrop_path
						? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
						: "none",
				}}>
				<div className='backdrop-overlay'></div>
			</div>

			<div className='movie-content'>
				<div className='movie-poster-container'>
					<img
						src={
							movie.poster_path
								? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
								: "https://via.placeholder.com/500x750?text=No+Poster+Available"
						}
						alt={`${movie.title} poster`}
						className='movie-poster'
					/>
				</div>

				<div className='movie-info'>
					<h1>
						{movie.title}{" "}
						{movie.release_date && (
							<span className='release-year'>
								({new Date(movie.release_date).getFullYear()})
							</span>
						)}
					</h1>

					<div className='movie-meta'>
						<div className='rating'>
							<i className='fas fa-star'></i>{" "}
							{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
						</div>
						<div className='runtime'>{formatRuntime(movie.runtime)}</div>
						<div className='release-date'>
							{formatReleaseDate(movie.release_date)}
						</div>
					</div>

					<div className='movie-actions'>
						<button
							className={`btn ${isFavorite ? "btn-secondary" : "btn-outline"}`}
							onClick={handleToggleFavorite}>
							<i className={`fas fa-heart ${isFavorite ? "active" : ""}`}></i>
							{isFavorite ? "Remove from Favorites" : "Add to Favorites"}
						</button>
						<button
							className={`btn ${isWatched ? "btn-secondary" : "btn-outline"}`}
							onClick={handleToggleWatched}>
							<i className={`fas fa-eye ${isWatched ? "active" : ""}`}></i>
							{isWatched ? "Remove from Watched" : "Mark as Watched"}
						</button>
					</div>

					<div className='genres'>
						{movie.genres?.map((genre) => (
							<span key={genre.id} className='genre-tag'>
								{genre.name}
							</span>
						))}
					</div>

					<div className='overview'>
						<h3>Overview</h3>
						<p>{movie.overview || "No overview available."}</p>
					</div>

					<div className='additional-info'>
						<div className='info-row'>
							<div className='info-item'>
								<h4>Status</h4>
								<p>{movie.status}</p>
							</div>
							<div className='info-item'>
								<h4>Budget</h4>
								<p>{formatCurrency(movie.budget)}</p>
							</div>
							<div className='info-item'>
								<h4>Revenue</h4>
								<p>{formatCurrency(movie.revenue)}</p>
							</div>
						</div>
					</div>

					{credits && (
						<div className='cast'>
							<h3>Top Cast</h3>
							<div className='cast-list'>
								{credits.cast.slice(0, 6).map((person) => (
									<div key={person.id} className='cast-item'>
										<div className='cast-photo'>
											{person.profile_path ? (
												<img
													src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
													alt={person.name}
												/>
											) : (
												<div className='no-photo'>
													<i className='fas fa-user'></i>
												</div>
											)}
										</div>
										<div className='cast-name'>{person.name}</div>
										<div className='cast-character'>{person.character}</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{similarMovies.length > 0 && (
				<div className='similar-movies-section'>
					<h2>Similar Movies</h2>
					<MovieGrid movies={similarMovies} />
				</div>
			)}

			<style jsx>{`
				.movie-detail-page {
					position: relative;
				}

				.backdrop-container {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 350px;
					background-size: cover;
					background-position: center top;
					z-index: -1;
				}

				.backdrop-overlay {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: linear-gradient(
						to bottom,
						rgba(3, 37, 65, 0.8),
						rgba(3, 37, 65, 1)
					);
				}

				.movie-content {
					display: grid;
					grid-template-columns: 300px 1fr;
					gap: 2rem;
					margin-top: 30px;
					padding: 20px;
					color: white;
				}

				.movie-poster-container {
					align-self: start;
				}

				.movie-poster {
					width: 100%;
					border-radius: 8px;
					box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
				}

				.movie-info {
					padding-top: 20px;
				}

				.movie-info h1 {
					font-size: 2.5rem;
					margin-bottom: 1rem;
					color: black;
				}

				.release-year {
					font-weight: 400;
					opacity: 0.8;
				}

				.movie-meta {
					display: flex;
					gap: 2rem;
					margin-bottom: 1.5rem;
					color: rgb(253 10 255);
				}

				.rating {
					display: flex;
					align-items: center;
					gap: 0.5rem;
				}

				.rating i {
					color: var(--secondary-accent);
				}

				.movie-actions {
					display: flex;
					gap: 1rem;
					margin-bottom: 1.5rem;
				}

				.genres {
					display: flex;
					flex-wrap: wrap;
					gap: 0.5rem;
					margin-bottom: 1.5rem;
				}

				.genre-tag {
					background: rgba(255, 255, 255, 0.1);
					padding: 4px 10px;
					border-radius: 4px;
					font-size: 0.9rem;
				}

				.tagline {
					font-style: italic;
					font-size: 1.1rem;
					margin-bottom: 1rem;
					opacity: 0.8;
					color: #ff6666;
				}

				.overview h3 {
					margin-bottom: 0.5rem;
					color: black;
				}

				.overview p {
					margin-top: 3rem;
					margin-bottom: 2rem;
					line-height: 1.6;
					color: rgba(0, 0, 0, 0.9);
				}

				.additional-info {
					margin-bottom: 2rem;
					background: rgba(0, 0, 0, 0.05);
					border-radius: 8px;
					padding: 1rem;
				}

				.info-row {
					display: flex;
					gap: 2rem;
				}

				.info-item h4 {
					margin-bottom: 0.5rem;
					color: rgba(0, 0, 0, 0.8);
					font-size: 1rem;
				}
				.info-item p {
					color: rgba(0, 0, 0, 0.7);
				}
				.cast h3 {
					margin-bottom: 1rem;
					color: rgba(0, 0, 0, 0.8);
				}

				.cast-list {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
					gap: 1rem;
				}

				.cast-item {
					background: rgba(255, 255, 255, 0.05);
					border-radius: 8px;
					overflow: hidden;
					transition: transform 0.3s;
				}

				.cast-item:hover {
					transform: translateY(-5px);
				}

				.cast-photo {
					width: 100%;
					height: 180px;
					overflow: hidden;
				}

				.cast-photo img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				.no-photo {
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					background: #192841;
					color: white;
					font-size: 2rem;
				}

				.cast-name {
					padding: 10px 10px 5px;
					font-weight: 600;
					font-size: 0.95rem;
					color: rgba(0, 0, 0, 0.9);
				}

				.cast-character {
					padding: 0 10px 10px;
					font-size: 0.85rem;
					opacity: 0.8;
					color: rgba(0, 0, 0, 0.7);
				}

				.similar-movies-section {
					padding: 2rem 20px;
					background-color: var(--background);
					border-radius: 8px 8px 0 0;
					margin-top: 2rem;
				}

				.similar-movies-section h2 {
					color: var(--primary);
					margin-bottom: 1.5rem;
				}

				.error-container {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					gap: 1rem;
					padding: 3rem 1rem;
				}

				@media (max-width: 992px) {
					.movie-content {
						grid-template-columns: 250px 1fr;
					}
				}

				@media (max-width: 768px) {
					.movie-content {
						grid-template-columns: 1fr;
					}

					.movie-poster-container {
						max-width: 300px;
						margin: 0 auto;
					}

					.info-row {
						flex-direction: column;
						gap: 1rem;
					}
					.genre-tag {
						background: black;
					}
					.overview h3 {
						color: black;
					}
				}
			`}</style>
		</div>
	);
};

export default MovieDetail;
