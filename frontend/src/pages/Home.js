/** @format */

import React, { useState, useEffect } from "react";
import MovieGrid from "../components/MovieGrid";
import SearchBar from "../components/SearchBar";
import { fetchPopularMovies, searchMovies } from "../services/api";

const Home = ({ userPreferences }) => {
	const [movies, setMovies] = useState([]);
	const [trending, setTrending] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("popular");

	useEffect(() => {
		const loadPopularMovies = async () => {
			try {
				setLoading(true);
				const data = await fetchPopularMovies();
				setMovies(data.results);
				setTrending(data.results.slice(0, 5)); // Store top 5 as trending
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

	const handleSearch = async (query) => {
		setSearchQuery(query);

		if (!query) {
			setActiveTab("popular");
			return;
		}

		try {
			setLoading(true);
			setActiveTab("search");
			const data = await searchMovies(query);
			setMovies(data.results);
			setError(null);
		} catch (err) {
			setError("Failed to search movies. Please try again later.");
			console.error("Error searching movies:", err);
		} finally {
			setLoading(false);
		}
	};

	const getRecommendedMovies = () => {
		// Filter movies based on user preferences
		// This is a simple implementation - a more sophisticated algorithm would be in the backend
		if (
			!userPreferences.favoriteGenres ||
			userPreferences.favoriteGenres.length === 0
		) {
			return [];
		}

		const recommendedMovies = movies.filter((movie) => {
			if (!movie.genre_ids) return false;
			return movie.genre_ids.some((id) =>
				userPreferences.favoriteGenres.includes(id)
			);
		});

		return recommendedMovies.slice(0, 10); // Take top 10
	};

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		if (tab === "search" && !searchQuery) {
			setActiveTab("popular");
		}
	};

	// Determine which movies to display based on active tab
	const displayMovies = () => {
		switch (activeTab) {
			case "forYou":
				const recommended = getRecommendedMovies();
				return recommended.length ? recommended : movies;
			case "search":
				return movies;
			case "popular":
			default:
				return movies;
		}
	};

	return (
		<div className='home-page'>
			<div className='hero-section'>
				<div className='hero-content'>
					<h1>Discover your next favorite movie</h1>
					<p>Get personalized recommendations, trivia, and more</p>
					<SearchBar onSearch={handleSearch} />
				</div>
			</div>

			<div className='tab-navigation'>
				<button
					className={`tab-button ${activeTab === "popular" ? "active" : ""}`}
					onClick={() => handleTabChange("popular")}>
					<i className='fas fa-fire'></i> Popular
				</button>
				<button
					className={`tab-button ${activeTab === "forYou" ? "active" : ""}`}
					onClick={() => handleTabChange("forYou")}>
					<i className='fas fa-heart'></i> For You
				</button>
				{searchQuery && (
					<button
						className={`tab-button ${activeTab === "search" ? "active" : ""}`}
						onClick={() => handleTabChange("search")}>
						<i className='fas fa-search'></i> Search Results
					</button>
				)}
			</div>

			<div className='movies-container'>
				{activeTab === "popular" && <h2>Popular Movies</h2>}
				{activeTab === "forYou" && <h2>Recommended For You</h2>}
				{activeTab === "search" && <h2>Search Results for "{searchQuery}"</h2>}

				<MovieGrid movies={displayMovies()} loading={loading} error={error} />
			</div>

			<style jsx>{`
				.home-page {
					min-height: 100%;
					padding: 10px;
				}

				.hero-section {
					background: linear-gradient(to right, #032541, #01b4e4);
					padding: 3rem 1rem;
					margin-bottom: 2rem;
					border-radius: 8px;
					color: white;
				}

				.hero-content {
					max-width: 800px;
					margin: 0 auto;
					text-align: center;
				}

				.hero-content h1 {
					color: white;
					margin-bottom: 1rem;
				}

				.hero-content p {
					font-size: 1.2rem;
					margin-bottom: 2rem;
					opacity: 0.9;
				}

				.tab-navigation {
					display: flex;
					gap: 1rem;
					margin-bottom: 1.5rem;
					border-bottom: 1px solid var(--border);
					padding-bottom: 0.5rem;
				}

				.tab-button {
					background: none;
					border: none;
					font-size: 1rem;
					font-weight: 500;
					color: var(--text-light);
					padding: 0.5rem 1rem;
					cursor: pointer;
					transition: color 0.3s;
					display: flex;
					align-items: center;
					gap: 0.5rem;
				}

				.tab-button:hover {
					color: var(--primary);
				}

				.tab-button.active {
					color: var(--accent);
					border-bottom: 2px solid var(--accent);
				}

				.movies-container h2 {
					margin-bottom: 1.5rem;
					color: var(--primary);
				}

				@media (max-width: 768px) {
					.hero-section {
						padding: 2rem 1rem;
					}

					.hero-content h1 {
						font-size: 1.8rem;
					}

					.hero-content p {
						font-size: 1rem;
					}
				}
			`}</style>
		</div>
	);
};

export default Home;
