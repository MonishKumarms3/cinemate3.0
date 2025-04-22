/** @format */

import React, { useState } from "react";

const SearchBar = ({ onSearch, placeholder = "Search for movies..." }) => {
	const [query, setQuery] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		if (query.trim()) {
			onSearch(query.trim());
		}
	};

	const handleClear = () => {
		setQuery("");
		onSearch("");
	};

	return (
		<div className='search-bar'>
			<form onSubmit={handleSubmit} className='search-form'>
				<div className='search-input-container'>
					<input
						type='text'
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={placeholder}
						className='search-input'
					/>
					{query && (
						<button
							type='button'
							className='clear-button'
							onClick={handleClear}
							aria-label='Clear search'>
							<i className='fas fa-times'></i>
						</button>
					)}
				</div>
				<button type='submit' className='search-button'>
					Search
				</button>
			</form>

			<style jsx>{`
				.search-bar {
					margin-bottom: 2rem;
					width: 100%;
				}

				.search-form {
					display: flex;
					max-width: 600px;
					margin: 0 auto;
				}

				.search-input-container {
					position: relative;
					flex-grow: 1;
				}

				.search-input {
					width: 100%;
					padding: 12px 40px;
					border: 1px solid var(--border);
					border-radius: 4px 0 0 4px;
					font-size: 1rem;
					transition: border-color 0.3s, box-shadow 0.3s;
				}

				.search-input:focus {
					outline: none;
					border-color: var(--accent);
					box-shadow: 0 0 0 2px rgba(1, 180, 228, 0.2);
				}

				.search-icon {
					position: absolute;
					left: 12px;
					top: 50%;
					transform: translateY(-50%);
					color: var(--text-light);
				}

				.clear-button {
					position: absolute;
					right: 12px;
					top: 50%;
					transform: translateY(-50%);
					background: none;
					border: none;
					color: var(--text-light);
					cursor: pointer;
					padding: 0;
					font-size: 0.9rem;
				}

				.clear-button:hover {
					color: var(--text);
				}

				.search-button {
					background-color: var(--accent);
					color: white;
					border: none;
					border-radius: 0 4px 4px 0;
					padding: 0 20px;
					font-weight: 500;
					cursor: pointer;
					transition: background-color 0.3s;
				}

				.search-button:hover {
					background-color: #019fcb;
				}

				@media (max-width: 480px) {
					.search-bar {
						margin-bottom: 1rem;
					}
					.search-form {
						flex-direction: column;
					}

					.search-input {
						border-radius: 4px;
						font-size: 16px;
						padding: 8px 32px 8px 12px;
					}

					.search-button {
						border-radius: 4px;
						margin-top: 10px;
						padding: 8px 16px;
					}
				}
				@media (min-width: 2560px) {
					.search-bar {
						max-width: 800px;
						margin: 0 auto 2rem;
					}
				}
			`}</style>
		</div>
	);
};

export default SearchBar;
