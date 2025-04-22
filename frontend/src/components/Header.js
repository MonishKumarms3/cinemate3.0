/** @format */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navigate = useNavigate();

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleSearchSubmit = (query) => {
		navigate(`/?search=${encodeURIComponent(query)}`);
	};

	return (
		<header style={styles.header}>
			<div style={styles.container}>
				<div style={styles.logoContainer}>
					<Link to='/' style={styles.logo}>
						<span style={styles.logoText}>CineMind</span>
						<span style={styles.logoTagline}>AI Movie Recommender</span>
					</Link>
					<button style={styles.menuButton} onClick={toggleMenu}>
						<i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
					</button>
				</div>

				<div
					style={{
						...styles.navContainer,
						...(!isMenuOpen && window.innerWidth <= 768
							? { display: "none" }
							: {}),
					}}>
					<nav style={styles.nav}>
						<Link to='/' style={styles.navLink}>
							Home
						</Link>
						<Link to='/recommendations' style={styles.navLink}>
							Recommendations
						</Link>
						<Link to='/movie-guessing' style={styles.navLink}>
							Movie Guessing
						</Link>
						<Link to='/movie-trivia' style={styles.navLink}>
							Movie Trivia
						</Link>
					</nav>

					<div style={styles.searchContainer}>
						<SearchBar onSearch={handleSearchSubmit} />
					</div>
				</div>
			</div>
		</header>
	);
};

const styles = {
	header: {
		backgroundColor: "var(--primary-color)",
		padding: "1rem 0",
		boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
		"@media (max-width: 480px)": {
			padding: "0.5rem 0",
		},
		"@media (min-width: 2560px)": {
			padding: "1.5rem 0",
		},
		position: "sticky",
		top: 0,
		zIndex: 100,
	},
	container: {
		maxWidth: "1200px",
		margin: "0 auto",
		padding: "0 1rem",
		display: "flex",
		flexDirection: "column",
		"@media (min-width: 768px)": {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
	},
	logoContainer: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "1rem",
		"@media (min-width: 768px)": {
			marginBottom: 0,
		},
	},
	logo: {
		display: "flex",
		flexDirection: "column",
		color: "var(--secondary-color)",
		textDecoration: "none",
	},
	logoText: {
		fontSize: "1.8rem",
		fontWeight: "bold",
	},
	logoTagline: {
		fontSize: "0.8rem",
		color: "var(--tertiary-color)",
	},
	menuButton: {
		display: "block",
		background: "none",
		border: "none",
		color: "var(--secondary-color)",
		fontSize: "1.5rem",
		cursor: "pointer",
		"@media (min-width: 768px)": {
			display: "none",
		},
	},
	navContainer: {
		"@media (min-width: 768px)": {
			display: "flex",
			alignItems: "center",
		},
	},
	nav: {
		display: "flex",
		flexDirection: "column",
		marginBottom: "1rem",
		"@media (min-width: 768px)": {
			flexDirection: "row",
			marginBottom: 0,
			marginRight: "1rem",
		},
	},
	navLink: {
		color: "var(--text-color)",
		padding: "0.5rem 0",
		marginRight: "1.5rem",
		textDecoration: "none",
		fontWeight: "500",
		transition: "color 0.3s",
		"@media (min-width: 768px)": {
			padding: "0.5rem 0.75rem",
		},
		":hover": {
			color: "var(--secondary-color)",
		},
	},
	searchContainer: {
		width: "100%",
		"@media (min-width: 768px)": {
			width: "auto",
		},
	},
};

export default Header;
