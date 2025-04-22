/** @format */

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";

const Navbar = ({ user, handleUserChange }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const closeMenu = () => {
		setIsMenuOpen(false);
	};

	const handleLogout = () => {
		logoutUser();
		handleUserChange(null);
		closeMenu();
		navigate("/");
	};

	return (
		<nav className='navbar'>
			<div className='navbar-container'>
				<Link to='/' className='navbar-logo'>
					<span className='logo-text'>Cinemate</span>
					<i className='fas fa-film logo-icon'></i>
				</Link>

				<div className='navbar-mobile-toggle' onClick={toggleMenu}>
					<i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
				</div>

				<ul className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
					<li className='navbar-item'>
						<Link
							to='/'
							className={`navbar-link ${
								location.pathname === "/" ? "active" : ""
							}`}
							onClick={closeMenu}>
							<i className='fas fa-home'></i> Home
						</Link>
					</li>
					<li className='navbar-item'>
						<Link
							to='/recommendations'
							className={`navbar-link ${
								location.pathname === "/recommendations" ? "active" : ""
							}`}
							onClick={closeMenu}>
							<i className='fas fa-thumbs-up'></i> Pick
						</Link>
					</li>
					<li className='navbar-item'>
						<Link
							to='/guess-movie'
							className={`navbar-link ${
								location.pathname === "/guess-movie" ? "active" : ""
							}`}
							onClick={closeMenu}>
							<i className='fas fa-question-circle'></i> Guess Movie
						</Link>
					</li>
					<li className='navbar-item'>
						<Link
							to='/movie-trivia'
							className={`navbar-link ${
								location.pathname === "/movie-trivia" ? "active" : ""
							}`}
							onClick={closeMenu}>
							<i className='fas fa-brain'></i> Movie Trivia
						</Link>
					</li>
					<li className='navbar-item'>
						<Link
							to='/preferences'
							className={`navbar-link ${
								location.pathname === "/preferences" ? "active" : ""
							}`}
							onClick={closeMenu}>
							<i className='fas fa-cog'></i> Prefs
						</Link>
					</li>
					{user ? (
						<li className='navbar-item user-item'>
							<div className='user-info'>
								<span className='user-greeting'>
									<i className='fas fa-user'></i> {user.username}
								</span>
								<button className='logout-button' onClick={handleLogout}>
									<i className='fas fa-sign-out-alt'></i> Logout
								</button>
							</div>
						</li>
					) : (
						<li className='navbar-item'>
							<Link
								to='/login'
								className={`navbar-link ${
									location.pathname === "/login" ? "active" : ""
								}`}
								onClick={closeMenu}>
								<i className='fas fa-sign-in-alt'></i> Login
							</Link>
						</li>
					)}
				</ul>
			</div>

			<style jsx>{`
				.navbar {
					background-color: rgba(51, 49, 49, 0.8);
					padding: 1rem 0;
					position: sticky;
					top: 0;
					z-index: 1000;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
				}

				.navbar-container {
					display: flex;
					justify-content: space-between;
					align-items: center;
					max-width: 1200px;
					margin: 0 auto;
					padding: 0 20px;
				}

				.navbar-logo {
					display: flex;
					align-items: center;
					text-decoration: none;
					color: white;
					font-size: 1.5rem;
					font-weight: 700;
				}

				.logo-text {
					margin-right: 0.5rem;
				}

				.logo-icon {
					color: var(--secondary-accent);
				}

				.navbar-menu {
					display: flex;
					list-style: none;
					align-items: center;
				}

				.navbar-item {
					margin-left: 1.5rem;
				}

				.user-item {
					margin-left: 2rem;
					padding-left: 1.5rem;
					border-left: 1px solid rgba(255, 255, 255, 0.2);
				}

				.user-info {
					display: flex;
					flex-direction: column;
					align-items: flex-start;
				}

				.user-greeting {
					color: white;
					font-size: 0.9rem;
					font-weight: 500;
					margin-bottom: 0.25rem;
					display: flex;
					align-items: center;
					overflow: hidden;
					max-width: 80px;
				}

				.user-greeting i {
					margin-right: 0.4rem;
					color: var(--secondary-accent);
				}

				.logout-button {
					background: none;
					border: none;
					font-size: 0.85rem;
					color: rgba(255, 255, 255, 0.7);
					cursor: pointer;
					padding: 0;
					display: flex;
					align-items: center;
					transition: color 0.3s;
				}

				.logout-button:hover {
					color: var(--secondary-accent);
				}

				.logout-button i {
					margin-right: 0.3rem;
					font-size: 0.8rem;
				}

				.navbar-link {
					color: white;
					text-decoration: none;
					font-weight: 500;
					transition: color 0.3s;
					display: flex;
					align-items: center;
				}

				.navbar-link i {
					margin-right: 0.5rem;
				}

				.navbar-link:hover,
				.navbar-link.active {
					color: var(--secondary-accent);
				}

				.navbar-mobile-toggle {
					display: none;
					color: white;
					font-size: 1.5rem;
					cursor: pointer;
				}

				@media (max-width: 768px) {
					.navbar-mobile-toggle {
						display: block;
						padding: 8px;
						z-index: 1000;
					}

					.navbar-menu {
						display: flex;
						flex-direction: column;
						position: fixed;
						top: 60px;
						right: 0;
						width: 80%;
						height: auto;
						background-color: var(--primary);
						overflow: hidden;
						max-height: 0;
						transition: max-height 0.3s ease-in-out;
						z-index: 999;
					}

					.navbar-logo {
						font-size: 1.25rem;
					}

					.navbar-container {
						padding: 0 15px;
					}

					.navbar-menu.active {
						max-height: 400px;
						box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
						background-color: rgba(203, 194, 194, 0.9);
					}

					.navbar-item {
						margin: 0;
						text-align: center;
					}

					.user-item {
						margin: 0;
						padding: 0.5rem 0 1rem;
						border-left: none;
						border-top: 1px solid rgba(255, 255, 255, 0.1);
					}

					.user-info {
						align-items: center;
					}

					.navbar-link {
						padding: 1rem 0;
						display: block;
						border-bottom: 1px solid rgba(255, 255, 255, 0.1);
					}

					.user-greeting {
						margin-bottom: 0.5rem;
					}
				}
			`}</style>
		</nav>
	);
};

export default Navbar;
