/** @format */

import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchPopularMovies, generateMovieTrivia } from "../services/api";

const MovieTrivia = () => {
	const [selectedMovie, setSelectedMovie] = useState(null);
	const [popularMovies, setPopularMovies] = useState([]);
	const [customMovieTitle, setCustomMovieTitle] = useState("");
	const [showCustomInput, setShowCustomInput] = useState(false);
	const [triviaQuestions, setTriviaQuestions] = useState([]);
	const [userAnswers, setUserAnswers] = useState({});
	const [score, setScore] = useState(null);
	const [loading, setLoading] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [error, setError] = useState(null);
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		const loadPopularMovies = async () => {
			try {
				setLoading(true);
				const data = await fetchPopularMovies();
				setPopularMovies(data.results.slice(0, 10)); // Use top 10 popular movies
				setError(null);
			} catch (err) {
				setError("Failed to load popular movies. Please try again later.");
				console.error("Error fetching popular movies:", err);
			} finally {
				setLoading(false);
			}
		};

		loadPopularMovies();
	}, []);

	const handleMovieSelect = (movie) => {
		setSelectedMovie(movie);
		setCustomMovieTitle("");
		setShowCustomInput(false);
		setTriviaQuestions([]);
		setUserAnswers({});
		setScore(null);
		setSubmitted(false);
	};

	const handleCustomMovieSelect = () => {
		setSelectedMovie(null);
		setShowCustomInput(true);
		setTriviaQuestions([]);
		setUserAnswers({});
		setScore(null);
		setSubmitted(false);
	};

	const handleGenerateTrivia = async () => {
		const movieTitle = selectedMovie ? selectedMovie.title : customMovieTitle;

		if (!movieTitle.trim()) {
			setError("Please select a movie or enter a movie title.");
			return;
		}

		try {
			setGenerating(true);
			setError(null);
			setTriviaQuestions([]);
			setUserAnswers({});
			setScore(null);
			setSubmitted(false);

			const trivia = await generateMovieTrivia(movieTitle);
			setTriviaQuestions(trivia.questions);
		} catch (err) {
			setError("Failed to generate trivia questions. Please try again later.");
			console.error("Error generating trivia:", err);
		} finally {
			setGenerating(false);
		}
	};

	const handleAnswerSelect = (questionIndex, answerIndex) => {
		setUserAnswers((prev) => ({
			...prev,
			[questionIndex]: answerIndex,
		}));
	};

	const handleSubmitAnswers = () => {
		if (triviaQuestions.length === 0) return;

		// Calculate score
		let correctCount = 0;

		triviaQuestions.forEach((question, index) => {
			if (userAnswers[index] === question.correct_answer_index) {
				correctCount++;
			}
		});

		const percentage = Math.round(
			(correctCount / triviaQuestions.length) * 100
		);
		setScore({
			correct: correctCount,
			total: triviaQuestions.length,
			percentage,
		});

		setSubmitted(true);
	};

	const handleReset = () => {
		setTriviaQuestions([]);
		setUserAnswers({});
		setScore(null);
		setSubmitted(false);
	};

	return (
		<div className='movie-trivia-page'>
			<div className='movie-trivia-header'>
				<h1>Movie Trivia Challenge</h1>
				<p className='description'>
					Test your movie knowledge with our AI-generated trivia questions!
					Select a popular movie or enter any movie title.
				</p>
			</div>

			{loading ? (
				<LoadingSpinner message='Loading popular movies...' />
			) : (
				<div className='trivia-setup'>
					<h2>Choose a Movie</h2>

					{error && (
						<div className='error-message'>
							<i className='fas fa-exclamation-circle'></i> {error}
						</div>
					)}

					<div className='movie-selection'>
						<div className='popular-movies'>
							{popularMovies.map((movie) => (
								<div
									key={movie.id}
									className={`movie-option ${
										selectedMovie?.id === movie.id ? "selected" : ""
									}`}
									onClick={() => handleMovieSelect(movie)}>
									{movie.poster_path ? (
										<img
											src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
											alt={movie.title}
											className='movie-thumbnail'
										/>
									) : (
										<div className='movie-thumbnail-placeholder'>
											<i className='fas fa-film'></i>
										</div>
									)}
									<span className='movie-title'>{movie.title}</span>
								</div>
							))}

							<div
								className={`movie-option custom ${
									showCustomInput ? "selected" : ""
								}`}
								onClick={handleCustomMovieSelect}>
								<div className='custom-icon'>
									<i className='fas fa-plus'></i>
								</div>
								<span className='movie-title'>Custom Movie</span>
							</div>
						</div>

						{showCustomInput && (
							<div className='custom-movie-input'>
								<input
									type='text'
									value={customMovieTitle}
									onChange={(e) => setCustomMovieTitle(e.target.value)}
									placeholder='Enter movie title...'
									className='custom-movie-field'
								/>
							</div>
						)}

						<div className='generate-actions'>
							<button
								className='btn btn-primary generate-btn'
								onClick={handleGenerateTrivia}
								disabled={
									generating || (!selectedMovie && !customMovieTitle.trim())
								}>
								{generating ? "Generating..." : "Generate Trivia Questions"}
							</button>
						</div>
					</div>
				</div>
			)}

			{generating && (
				<LoadingSpinner message='Generating trivia questions...' />
			)}

			{triviaQuestions.length > 0 && !generating && (
				<div className='trivia-quiz'>
					<h2 className='quiz-title'>
						{selectedMovie ? selectedMovie.title : customMovieTitle} Trivia Quiz
					</h2>

					<div className='questions-container'>
						{triviaQuestions.map((question, qIndex) => (
							<div key={qIndex} className='question-card'>
								<h3 className='question-text'>{question.question}</h3>
								<div className='answers-list'>
									{question.answers.map((answer, aIndex) => (
										<div
											key={aIndex}
											className={`answer-option ${
												userAnswers[qIndex] === aIndex ? "selected" : ""
											} ${
												submitted
													? question.correct_answer_index === aIndex
														? "correct"
														: userAnswers[qIndex] === aIndex
														? "incorrect"
														: ""
													: ""
											}`}
											onClick={() =>
												!submitted && handleAnswerSelect(qIndex, aIndex)
											}>
											<div className='answer-letter'>
												{String.fromCharCode(65 + aIndex)}
											</div>
											<div className='answer-text'>{answer}</div>
											{submitted &&
												question.correct_answer_index === aIndex && (
													<div className='answer-icon correct'>
														<i className='fas fa-check'></i>
													</div>
												)}
											{submitted &&
												userAnswers[qIndex] === aIndex &&
												question.correct_answer_index !== aIndex && (
													<div className='answer-icon incorrect'>
														<i className='fas fa-times'></i>
													</div>
												)}
										</div>
									))}
								</div>
								{submitted && (
									<div className='answer-explanation'>
										<h4>Explanation:</h4>
										<p>{question.explanation}</p>
									</div>
								)}
							</div>
						))}
					</div>

					<div className='quiz-actions'>
						{!submitted ? (
							<button
								className='btn btn-primary submit-btn'
								onClick={handleSubmitAnswers}
								disabled={
									Object.keys(userAnswers).length !== triviaQuestions.length
								}>
								Submit Answers
							</button>
						) : (
							<button
								className='btn btn-outline reset-btn'
								onClick={handleReset}>
								Start New Quiz
							</button>
						)}
					</div>

					{submitted && score && (
						<div
							className={`score-card ${
								score.percentage >= 80
									? "high-score"
									: score.percentage >= 50
									? "medium-score"
									: "low-score"
							}`}>
							<h3>Your Score</h3>
							<div className='score-display'>
								<div className='score-circle'>
									<span className='score-percentage'>{score.percentage}%</span>
								</div>
								<div className='score-breakdown'>
									<p>
										You got <strong>{score.correct}</strong> out of{" "}
										<strong>{score.total}</strong> questions correct.
									</p>
									{score.percentage >= 80 && (
										<p>Amazing job! You really know this movie well!</p>
									)}
									{score.percentage >= 50 && score.percentage < 80 && (
										<p>Good job! You have solid knowledge about this movie.</p>
									)}
									{score.percentage < 50 && (
										<p>
											Keep trying! Maybe watch the movie again for a refresher.
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			<style jsx>{`
				.movie-trivia-page {
					min-height: 100%;
					padding: 10px;
				}

				.movie-trivia-header {
					margin-bottom: 2rem;
					text-align: center;
				}

				.movie-trivia-header h1 {
					color: var(--primary);
					margin-bottom: 1rem;
				}

				.description {
					max-width: 800px;
					margin: 0 auto;
					color: var(--text-light);
					font-size: 1.1rem;
				}

				.trivia-setup {
					max-width: 900px;
					margin: 0 auto 3rem;
				}

				.trivia-setup h2 {
					margin-bottom: 1.5rem;
					color: var(--primary);
					text-align: center;
				}

				.movie-selection {
					background-color: white;
					border-radius: 8px;
					padding: 2rem;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
				}

				.popular-movies {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
					gap: 1rem;
					margin-bottom: 1.5rem;
				}

				.movie-option {
					display: flex;
					flex-direction: column;
					align-items: center;
					padding: 1rem;
					border-radius: 6px;
					border: 2px solid transparent;
					cursor: pointer;
					transition: transform 0.2s, border-color 0.3s, background-color 0.3s;
					text-align: center;
				}

				.movie-option:hover {
					background-color: rgba(1, 180, 228, 0.05);
					transform: translateY(-3px);
				}

				.movie-option.selected {
					border-color: var(--accent);
					background-color: rgba(1, 180, 228, 0.1);
				}

				.movie-thumbnail {
					width: 92px;
					height: 138px;
					object-fit: cover;
					border-radius: 4px;
					margin-bottom: 0.5rem;
					box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
				}

				.movie-thumbnail-placeholder,
				.custom-icon {
					width: 92px;
					height: 138px;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: #f0f0f0;
					border-radius: 4px;
					margin-bottom: 0.5rem;
					color: var(--text-light);
					font-size: 2rem;
				}

				.movie-title {
					font-weight: 500;
					font-size: 0.95rem;
					max-width: 150px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.custom-movie-input {
					margin-top: 1rem;
					margin-bottom: 1.5rem;
				}

				.custom-movie-field {
					width: 100%;
					padding: 0.75rem 1rem;
					border: 1px solid var(--border);
					border-radius: 4px;
					font-size: 1rem;
				}

				.generate-actions {
					display: flex;
					justify-content: center;
					margin-top: 2rem;
				}

				.generate-btn {
					padding: 0.75rem 2rem;
					font-size: 1.1rem;
				}

				.trivia-quiz {
					max-width: 800px;
					margin: 0 auto 3rem;
				}

				.quiz-title {
					text-align: center;
					margin-bottom: 2rem;
					color: var(--primary);
				}

				.questions-container {
					margin-bottom: 2rem;
				}

				.question-card {
					background-color: white;
					border-radius: 8px;
					padding: 1.5rem;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
					margin-bottom: 1.5rem;
				}

				.question-text {
					font-size: 1.2rem;
					margin-bottom: 1.5rem;
					color: var(--primary);
				}

				.answers-list {
					display: flex;
					flex-direction: column;
					gap: 0.75rem;
					margin-bottom: 1.5rem;
				}

				.answer-option {
					display: flex;
					align-items: center;
					padding: 1rem;
					border: 1px solid var(--border);
					border-radius: 6px;
					cursor: pointer;
					transition: background-color 0.3s, transform 0.2s;
					position: relative;
				}

				.answer-option:hover {
					background-color: rgba(1, 180, 228, 0.05);
					transform: translateX(5px);
				}

				.answer-option.selected {
					border-color: var(--accent);
					background-color: rgba(1, 180, 228, 0.1);
				}

				.answer-option.correct {
					border-color: #4caf50;
					background-color: rgba(76, 175, 80, 0.1);
				}

				.answer-option.incorrect {
					border-color: #f44336;
					background-color: rgba(244, 67, 54, 0.1);
				}

				.answer-letter {
					width: 30px;
					height: 30px;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: #f0f0f0;
					border-radius: 50%;
					margin-right: 1rem;
					font-weight: 600;
				}

				.answer-text {
					flex: 1;
				}

				.answer-icon {
					width: 30px;
					height: 30px;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 50%;
					margin-left: 1rem;
					color: white;
				}

				.answer-icon.correct {
					background-color: #4caf50;
				}

				.answer-icon.incorrect {
					background-color: #f44336;
				}

				.answer-explanation {
					background-color: #f9f9f9;
					border-radius: 6px;
					padding: 1rem;
					border-left: 4px solid var(--accent);
				}

				.answer-explanation h4 {
					margin-bottom: 0.5rem;
					color: var(--primary);
				}

				.answer-explanation p {
					color: var(--text);
					line-height: 1.5;
				}

				.quiz-actions {
					display: flex;
					justify-content: center;
					margin-bottom: 2rem;
				}

				.submit-btn,
				.reset-btn {
					padding: 0.75rem 2rem;
					font-size: 1.1rem;
				}

				.score-card {
					background-color: white;
					border-radius: 8px;
					padding: 2rem;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
					text-align: center;
					border-top: 6px solid var(--primary);
				}

				.score-card.high-score {
					border-top-color: #4caf50;
				}

				.score-card.medium-score {
					border-top-color: #ff9800;
				}

				.score-card.low-score {
					border-top-color: #f44336;
				}

				.score-card h3 {
					margin-bottom: 2rem;
					color: var(--primary);
					font-size: 1.5rem;
				}

				.score-display {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 2rem;
				}

				.score-circle {
					width: 120px;
					height: 120px;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: var(--primary);
					color: white;
				}

				.high-score .score-circle {
					background-color: #4caf50;
				}

				.medium-score .score-circle {
					background-color: #ff9800;
				}

				.low-score .score-circle {
					background-color: #f44336;
				}

				.score-percentage {
					font-size: 2rem;
					font-weight: 700;
				}

				.score-breakdown {
					text-align: left;
					max-width: 350px;
				}

				.score-breakdown p {
					margin-bottom: 0.5rem;
					line-height: 1.6;
				}

				@media (max-width: 768px) {
					.popular-movies {
						grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
					}

					.score-display {
						flex-direction: column;
						gap: 1rem;
					}

					.score-breakdown {
						text-align: center;
					}
				}
			`}</style>
		</div>
	);
};

export default MovieTrivia;
