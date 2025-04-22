/** @format */

import React, { useState } from "react";
import { loginUser, registerUser } from "../services/api";

const Authentication = ({ onAuthSuccess }) => {
	const [isLogin, setIsLogin] = useState(true);
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			let response;
			if (isLogin) {
				response = await loginUser({
					username: formData.username,
					password: formData.password,
				});
			} else {
				response = await registerUser({
					username: formData.username,
					email: formData.email,
					password: formData.password,
				});
			}

			if (response.token) {
				onAuthSuccess(response);
				alert(
					isLogin
						? "Login successful! Redirecting..."
						: "Registration successful! Redirecting..."
				);
			}
		} catch (error) {
			setError(error.response?.data?.error || "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const toggleForm = () => {
		setIsLogin(!isLogin);
		setError("");
	};

	return (
		<div className='auth-form-container'>
			<div className='auth-tabs'>
				<button
					className={`auth-tab ${isLogin ? "active" : ""}`}
					onClick={() => setIsLogin(true)}>
					Login
				</button>
				<button
					className={`auth-tab ${!isLogin ? "active" : ""}`}
					onClick={() => setIsLogin(false)}>
					Register
				</button>
			</div>

			{error && (
				<div className='error-message'>
					<i className='fas fa-exclamation-circle'></i> {error}
				</div>
			)}

			<form onSubmit={handleSubmit} className='auth-form'>
				<div className='form-group'>
					<label htmlFor='username'>Username</label>
					<input
						type='text'
						id='username'
						name='username'
						value={formData.username}
						onChange={handleChange}
						required
						className='auth-input'
						placeholder='Enter your username'
					/>
				</div>

				{!isLogin && (
					<div className='form-group'>
						<label htmlFor='email'>Email</label>
						<input
							type='email'
							id='email'
							name='email'
							value={formData.email}
							onChange={handleChange}
							required={!isLogin}
							className='auth-input'
							placeholder='Enter your email'
						/>
					</div>
				)}

				<div className='form-group'>
					<label htmlFor='password'>Password</label>
					<input
						type='password'
						id='password'
						name='password'
						value={formData.password}
						onChange={handleChange}
						required
						className='auth-input'
						placeholder='Enter your password'
					/>
				</div>

				<button type='submit' className='auth-submit-btn' disabled={loading}>
					{loading ? <i className='fas fa-spinner fa-spin'></i> : ""}
					{loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
				</button>
			</form>

			<p className='toggle-form'>
				{isLogin ? "Don't have an account? " : "Already have an account? "}
				<button type='button' onClick={toggleForm} className='link-button'>
					{isLogin ? "Register" : "Login"}
				</button>
			</p>

			<style jsx>{`
				/* Container */
				.auth-form-container {
					width: 80%;
					max-width: 400px;
					margin: 2rem auto;
					padding: 2rem;
					background: #dfdfdf;
					border-radius: var(--border-radius);
					box-shadow: var(--box-shadow);
				}

				/* Responsive container adjustments */
				@media (max-width: 480px) {
					.auth-form-container {
						margin: 1rem auto;
						padding: 1rem;
						max-width: 80%;
					}
				}

				@media (min-width: 2560px) {
					.auth-form-container {
						max-width: 600px;
						padding: 3rem;
					}
				}

				/* Tabs */
				.auth-tabs {
					display: flex;
					margin-bottom: 2rem;
					border-bottom: 1px solid var(--border-color, #ddd);
					gap: 1rem;
				}

				.auth-tab {
					flex: 1;
					background: none;
					border: none;
					padding: 1rem 0;
					font-size: 1rem;
					cursor: pointer;
					transition: all 0.3s ease;
					color: var(--text-light, #666);
					position: relative;
				}

				.auth-tab.active {
					color: var(--primary-color);
					font-weight: 600;
				}

				.auth-tab.active::after {
					content: "";
					position: absolute;
					bottom: -1px;
					left: 0;
					width: 100%;
					height: 2px;
					background-color: var(--primary-color);
				}

				/* Form Groups */
				.form-group {
					margin-bottom: 1.5rem;
				}

				.form-group label {
					display: block;
					margin-bottom: 0.5rem;
					font-weight: 500;
					color: rgb(0, 0, 0);
				}

				/* Inputs */
				.auth-input {
					width: 100%;
					padding: 0.875rem;
					border: 1px solid var(--border-color, #ddd);
					border-radius: var(--border-radius, 4px);
					font-size: 1rem;
					transition: all 0.3s ease;
					background-color: var(--background-color);
				}

				.auth-input:focus {
					outline: none;
					border-color: var(--primary-color);
					box-shadow: 0 0 0 2px rgba(13, 37, 63, 0.1);
				}

				@media (max-width: 480px) {
					.auth-input {
						padding: 0.75rem;
						font-size: 16px; /* Prevent zoom on mobile */
					}
				}

				/* Submit Button */
				.auth-submit-btn {
					width: 100%;
					padding: 1rem;
					background-color: var(--primary-color);
					color: white;
					border: none;
					border-radius: var(--border-radius, 4px);
					font-size: 1rem;
					font-weight: 600;
					cursor: pointer;
					transition: all 0.3s ease;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 0.5rem;
				}

				.auth-submit-btn:hover:not(:disabled) {
					background-color: var(--primary-color-dark, #021d2f);
					transform: translateY(-1px);
				}

				.auth-submit-btn:disabled {
					opacity: 0.7;
					cursor: not-allowed;
				}

				@media (max-width: 480px) {
					.auth-submit-btn {
						padding: 0.875rem;
						font-size: 0.9375rem;
					}
				}

				/* Error Message */
				.error-message {
					background-color: var(--error-bg, rgba(244, 67, 54, 0.1));
					color: var(--error-color, #f44336);
					padding: 1rem;
					border-radius: var(--border-radius, 4px);
					margin-bottom: 1.5rem;
					font-size: 0.875rem;
					display: flex;
					align-items: center;
					gap: 0.5rem;
				}

				/* Toggle Form Text */
				.toggle-form {
					margin-top: 1.5rem;
					text-align: center;
					color: var(--text-light, #666);
					font-size: 0.875rem;
				}

				.link-button {
					background: none;
					border: none;
					color: var(--primary-color);
					cursor: pointer;
					font-size: 0.875rem;
					font-weight: 600;
					padding: 0;
					margin-left: 0.25rem;
					text-decoration: underline;
					transition: color 0.3s ease;
				}

				.link-button:hover {
					color: var(--primary-color-dark, #021d2f);
				}

				/* Loading Spinner */
				@keyframes spin {
					to {
						transform: rotate(360deg);
					}
				}

				.fa-spinner {
					animation: spin 1s linear infinite;
				}

				/* Dark Mode Support */
				@media (prefers-color-scheme: dark) {
					.auth-form-container {
						background: #dfdfdf;
					}

					.auth-input {
						background: #ffffff;
						color: black;
					}

					.auth-tab {
						color: var(--text-light-dark, #888);
					}

					.toggle-form {
						color: var(--text-light-dark, #888);
					}
				}
			`}</style>
		</div>
	);
};

export default Authentication;
