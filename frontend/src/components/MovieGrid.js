/** @format */

import React from "react";
import MovieCard from "./MovieCard";
import LoadingSpinner from "./LoadingSpinner";

const MovieGrid = ({ movies, loading, error }) => {
	if (loading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return (
			<div className='error-message'>
				<i className='fas fa-exclamation-circle'></i> {error}
			</div>
		);
	}

	if (!movies || movies.length === 0) {
		return (
			<div className='empty-state'>
				<i className='fas fa-film fa-3x'></i>
				<p>No movies found. Try different search criteria.</p>
			</div>
		);
	}

	return (
		<div className='movie-grid'>
			{movies.map((movie) => (
				<MovieCard key={movie.id} movie={movie} />
			))}

			<style jsx>{`
				.movie-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
					gap: 1.5rem;
					margin-top: 1.5rem;
				}

				.empty-state {
					text-align: center;
					padding: 3rem 0;
					color: var(--text-light);
				}

				.empty-state i {
					margin-bottom: 1rem;
					color: var(--primary);
					opacity: 0.7;
				}

				@media (max-width: 390px) {
					.movie-grid {
						grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
						gap: 1rem;
					}
				}

				@media (min-width: 390px) and (max-width: 480px) {
					.movie-grid {
						grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
						gap: 1rem;
					}
				}

				@media (min-width: 768px) and (max-width: 1024px) {
					.movie-grid {
						grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
					}
				}

				@media (min-width: 1920px) {
					.movie-grid {
						grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
						max-width: 1800px;
						margin: 1.5rem auto;
					}
				}
			`}</style>
		</div>
	);
};

export default MovieGrid;
