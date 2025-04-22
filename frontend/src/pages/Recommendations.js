/** @format */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MovieGrid from "../components/MovieGrid";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchRecommendations, fetchGenres } from "../services/api";

const Recommendations = ({ userPreferences }) => {
	const navigate = useNavigate();
	const [recommendations, setRecommendations] = useState([]);
	const [genres, setGenres] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [noPreferences, setNoPreferences] = useState(false);

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);

				// Check if user has preferences set
				const hasPreferences =
					userPreferences.favoriteGenres?.length > 0 ||
					userPreferences.favoriteMovies?.length > 0;

				if (!hasPreferences) {
					setNoPreferences(true);
					setLoading(false);
					return;
				}

				// Load genres for display
				const genresData = await fetchGenres();
				setGenres(genresData.genres);

				// Get movie recommendations based on preferences
				const recommendationsData = await fetchRecommendations(userPreferences);
				setRecommendations(recommendationsData.results);
				setNoPreferences(false);
				setError(null);
			} catch (err) {
				setError("Failed to load recommendations. Please try again later.");
				console.error("Error fetching recommendations:", err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [userPreferences]);

	// Function to get genre names from IDs
	const getGenreNames = (genreIds) => {
		if (!genres.length || !genreIds) return [];
		return genreIds
			.map((id) => {
				const genre = genres.find((g) => g.id === id);
				return genre ? genre.name : "";
			})
			.filter((name) => name);
	};

	if (loading) {
		return <LoadingSpinner message='Loading your recommendations...' />;
	}

	return (
		<div className='recommendations-page'>
			<div className='recommendations-header'>
				<h1>Your Movie Recommendations</h1>
				{!noPreferences && userPreferences.favoriteGenres?.length > 0 && (
					<div className='preference-summary'>
						<h3>Based on your genre preferences:</h3>
						<div className='genre-tags'>
							{getGenreNames(userPreferences.favoriteGenres).map((genre) => (
								<span key={genre} className='genre-tag'>
									{genre}
								</span>
							))}
						</div>
					</div>
				)}
				{!noPreferences && userPreferences.favoriteMovies?.length > 0 && (
					<div className='preference-summary'>
						<h3>Based on movies you like:</h3>
						<div className='movie-chips'>
							{userPreferences.favoriteMovies.map((movie) => (
								<span key={movie.id} className='movie-chip'>
									{movie.title}
								</span>
							))}
						</div>
					</div>
				)}
			</div>

			{noPreferences ? (
				<div className='no-preferences'>
					<div className='empty-state'>
						<i className='fas fa-film fa-3x'></i>
						<h2>Set Your Preferences First</h2>
						<p>
							We need to know a bit about what you like to provide personalized
							recommendations.
						</p>
						<button
							className='btn btn-primary'
							onClick={() => navigate("/preferences")}>
							Set Your Preferences
						</button>
					</div>
				</div>
			) : (
				<div className='recommendations-container'>
					{error ? (
						<div className='error-message'>
							<i className='fas fa-exclamation-circle'></i> {error}
						</div>
					) : (
						<>
							{recommendations.length === 0 ? (
								<div className='empty-state'>
									<i className='fas fa-search fa-3x'></i>
									<h2>No Recommendations Found</h2>
									<p>
										Try updating your preferences with more genres or favorite
										movies.
									</p>
									<button
										className='btn btn-primary'
										onClick={() => navigate("/preferences")}>
										Update Preferences
									</button>
								</div>
							) : (
								<MovieGrid movies={recommendations} />
							)}
						</>
					)}
				</div>
			)}

			<style jsx>{`
				.recommendations-page {
					min-height: 100%;
					padding: 10px;
				}

				.recommendations-header {
					margin-bottom: 2rem;
					padding-bottom: 1.5rem;
					border-bottom: 1px solid var(--border);
				}

				.recommendations-header h1 {
					margin-bottom: 1.5rem;
					color: var(--primary);
				}

				.preference-summary {
					margin-bottom: 1rem;
				}

				.preference-summary h3 {
					font-size: 1.2rem;
					margin-bottom: 0.5rem;
					color: var(--text);
				}

				.genre-tags,
				.movie-chips {
					display: flex;
					flex-wrap: wrap;
					gap: 0.5rem;
				}

				.genre-tag {
					background-color: var(--primary);
					color: black;
					padding: 6px 14px;
					border-radius: 20px;
					font-size: 0.9rem;
				}

				.movie-chip {
					background-color: var(--accent);
					color: rgba(0, 0, 0, 0.8);
					padding: 6px 14px;
					border-radius: 20px;
					font-size: 0.9rem;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					max-width: 200px;
				}

				.recommendations-container {
					min-height: 300px;
				}

				.no-preferences {
					min-height: 300px;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.empty-state {
					text-align: center;
					max-width: 500px;
					margin: 0 auto;
					padding: 2rem;
				}

				.empty-state i {
					color: var(--primary);
					opacity: 0.7;
					margin-bottom: 1.5rem;
				}

				.empty-state h2 {
					margin-bottom: 1rem;
					color: var(--primary);
				}

				.empty-state p {
					margin-bottom: 1.5rem;
					color: var(--text-light);
				}
			`}</style>
		</div>
	);
};

export default Recommendations;
