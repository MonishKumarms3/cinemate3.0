/** @format */

import React, { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { guessMovieFromPlot } from "../services/api";

const GuessMovie = () => {
	const [plotDescription, setPlotDescription] = useState("");
	const [guessResult, setGuessResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!plotDescription.trim()) {
			setError("Please enter a plot description first.");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const result = await guessMovieFromPlot(plotDescription);
			setGuessResult(result);
		} catch (err) {
			setError("Failed to guess the movie. Please try again later.");
			console.error("Error guessing movie:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleClear = () => {
		setPlotDescription("");
		setGuessResult(null);
		setError(null);
	};

	return (
		<div className='guess-movie-page'>
			<div className='guess-movie-header'>
				<h1>Plot to Movie</h1>
				<p className='description'>
					Describe a movie plot, and our AI will try to guess which movie you're
					thinking of. The more details you provide, the better the guess will
					be!
				</p>
			</div>

			<div className='guess-movie-form-container'>
				<form onSubmit={handleSubmit} className='guess-movie-form'>
					<div className='form-group'>
						<label htmlFor='plotDescription'>Movie Plot Description:</label>
						<textarea
							id='plotDescription'
							value={plotDescription}
							onChange={(e) => setPlotDescription(e.target.value)}
							placeholder='E.g., A billionaire creates a theme park with dinosaurs cloned from prehistoric DNA...'
							rows={6}
							disabled={loading}></textarea>
						<div className='character-count'>
							{plotDescription.length} characters (
							{plotDescription.trim().split(/\s+/).length} words)
						</div>
					</div>

					{error && (
						<div className='error-message'>
							<i className='fas fa-exclamation-circle'></i> {error}
						</div>
					)}

					<div className='form-actions'>
						<button
							type='submit'
							className='btn btn-primary'
							disabled={loading || !plotDescription.trim()}>
							{loading ? "Guessing..." : "Guess Movie"}
						</button>
						{plotDescription.trim() && !loading && (
							<button
								type='button'
								className='btn btn-outline'
								onClick={handleClear}>
								Clear
							</button>
						)}
					</div>
				</form>

				{loading && (
					<LoadingSpinner message='AI is analyzing your plot description...' />
				)}

				{guessResult && !loading && (
					<div className='guess-result'>
						<h2>Movie Guess</h2>
						<div className='guess-card'>
							<div className='guess-content'>
								<h3>{guessResult.movie_title}</h3>
								{guessResult.release_year && (
									<div className='guess-meta'>
										Released: {guessResult.release_year}
									</div>
								)}
								<div className='guess-confidence'>
									Confidence:
									<span
										className={`confidence-level ${
											guessResult.confidence > 80
												? "high"
												: guessResult.confidence > 50
												? "medium"
												: "low"
										}`}>
										{guessResult.confidence}%
									</span>
								</div>
								<div className='guess-explanation'>
									<h4>Why This Movie?</h4>
									<p>{guessResult.explanation}</p>
								</div>
								{guessResult.alternative_guesses &&
									guessResult.alternative_guesses.length > 0 && (
										<div className='alternative-guesses'>
											<h4>Other Possibilities:</h4>
											<ul>
												{guessResult.alternative_guesses.map((movie, index) => (
													<li key={index}>
														{movie.title} ({movie.year}) - {movie.confidence}%
														confidence
													</li>
												))}
											</ul>
										</div>
									)}
							</div>
						</div>
					</div>
				)}
			</div>

			<div className='example-plots'>
				<h3>Example Plot Descriptions</h3>
				<div className='example-grid'>
					<div
						className='example-card'
						onClick={() =>
							setPlotDescription(
								"A farm boy discovers he has a special power and teams up with an old mentor to rescue a princess from a dark lord."
							)
						}>
						<div className='example-name'>Star Wars</div>
						<div className='example-text'>
							A farm boy discovers he has a special power and teams up with an
							old mentor to rescue a princess from a dark lord.
						</div>
					</div>
					<div
						className='example-card'
						onClick={() =>
							setPlotDescription(
								"A teenager is accidentally sent 30 years into the past in a time-traveling car and must make sure his parents fall in love to ensure his own existence."
							)
						}>
						<div className='example-name'>Back to the Future</div>
						<div className='example-text'>
							A teenager is accidentally sent 30 years into the past in a
							time-traveling car and must make sure his parents fall in love to
							ensure his own existence.
						</div>
					</div>
					<div
						className='example-card'
						onClick={() =>
							setPlotDescription(
								"A cowboy toy is threatened by the arrival of a space ranger figure who doesn't realize he's a toy."
							)
						}>
						<div className='example-name'>Toy Story</div>
						<div className='example-text'>
							A cowboy toy is threatened by the arrival of a space ranger figure
							who doesn't realize he's a toy.
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				.guess-movie-page {
					min-height: 100%;
					padding: 10px;
				}

				.guess-movie-header {
					margin-bottom: 2rem;
					text-align: center;
				}

				.guess-movie-header h1 {
					color: var(--primary);
					margin-bottom: 1rem;
				}

				.description {
					max-width: 800px;
					margin: 0 auto;
					color: var(--text-light);
					font-size: 1.1rem;
				}

				.guess-movie-form-container {
					max-width: 800px;
					margin: 0 auto 3rem;
				}

				.guess-movie-form {
					background-color: white;
					border-radius: 8px;
					padding: 2rem;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
					margin-bottom: 2rem;
				}

				.form-group {
					margin-bottom: 1.5rem;
				}

				label {
					display: block;
					margin-bottom: 0.5rem;
					font-weight: 500;
					color: var(--text);
				}

				textarea {
					width: 100%;
					border: 1px solid var(--border);
					border-radius: 4px;
					padding: 1rem;
					font-size: 1rem;
					resize: vertical;
					transition: border-color 0.3s;
					min-height: 150px;
				}

				textarea:focus {
					outline: none;
					border-color: var(--accent);
					box-shadow: 0 0 0 2px rgba(1, 180, 228, 0.2);
				}

				.character-count {
					text-align: right;
					font-size: 0.9rem;
					color: var(--text-light);
					margin-top: 0.5rem;
				}

				.form-actions {
					display: flex;
					gap: 1rem;
				}

				.guess-result {
					margin-top: 2rem;
				}

				.guess-result h2 {
					margin-bottom: 1rem;
					color: var(--primary);
				}

				.guess-card {
					background-color: white;
					border-radius: 8px;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
					overflow: hidden;
					display: flex;
				}

				.guess-image {
					flex: 0 0 200px;
				}

				.guess-image img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				.guess-content {
					flex: 1;
					padding: 2rem;
				}

				.guess-content h3 {
					font-size: 1.5rem;
					margin-bottom: 0.5rem;
					color: var(--primary);
				}

				.guess-meta {
					color: var(--text-light);
					margin-bottom: 1rem;
				}

				.guess-confidence {
					margin-bottom: 1.5rem;
					font-weight: 500;
				}

				.confidence-level {
					margin-left: 0.5rem;
					padding: 2px 8px;
					border-radius: 4px;
					font-weight: 600;
				}

				.confidence-level.high {
					background-color: #4caf50;
					color: white;
				}

				.confidence-level.medium {
					background-color: #ff9800;
					color: white;
				}

				.confidence-level.low {
					background-color: #f44336;
					color: white;
				}

				.guess-explanation h4 {
					margin-bottom: 0.5rem;
					font-size: 1.1rem;
					color: var(--text);
				}

				.guess-explanation p {
					line-height: 1.6;
					color: var(--text);
				}

				.alternative-guesses {
					margin-top: 1.5rem;
				}

				.alternative-guesses h4 {
					margin-bottom: 0.5rem;
					font-size: 1.1rem;
					color: var(--text);
				}

				.alternative-guesses ul {
					list-style-type: none;
					padding: 0;
				}

				.alternative-guesses li {
					padding: 8px 0;
					border-bottom: 1px solid var(--border);
					color: var(--text);
				}

				.alternative-guesses li:last-child {
					border-bottom: none;
				}

				.example-plots {
					margin-top: 3rem;
				}

				.example-plots h3 {
					text-align: center;
					margin-bottom: 1.5rem;
					color: var(--primary);
				}

				.example-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
					gap: 1.5rem;
				}

				.example-card {
					background-color: white;
					border-radius: 8px;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					padding: 1.5rem;
					cursor: pointer;
					transition: transform 0.3s, box-shadow 0.3s;
					border-left: 3px solid var(--accent);
				}

				.example-card:hover {
					transform: translateY(-5px);
					box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
				}

				.example-name {
					font-weight: 600;
					margin-bottom: 0.5rem;
					color: var(--primary);
				}

				.example-text {
					color: var(--text-light);
					font-size: 0.95rem;
					line-height: 1.5;
				}

				@media (width: 320px) {
					.guess-image {
						margin-bottom: 50%;
					}
				}

				@media (max-width: 378px) {
					.guess-image {
						margin-bottom: 65%;
					}
				}
				@media (max-width: 414) {
					.guess-image {
						margin-bottom: 65%;
					}
				}

				@media (max-width: 769px) {
					.guess-card {
						flex-direction: column;
					}

					.guess-image {
						flex: 0 0 auto;
						max-height: 300px;
						margin-bottom: 110vw;
					}

					.example-grid {
						grid-template-columns: 1fr;
					}
				}
			`}</style>
		</div>
	);
};

export default GuessMovie;
