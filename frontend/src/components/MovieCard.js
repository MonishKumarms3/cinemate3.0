import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  // Use a placeholder image if poster path is missing
  const imageUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=No+Poster+Available';

  // Format release date, handle missing dates
  const formatReleaseDate = () => {
    if (!movie.release_date) return 'N/A';
    const date = new Date(movie.release_date);
    return date.getFullYear();
  };

  // Format the movie rating to one decimal place, handle missing ratings
  const formatRating = () => {
    if (!movie.vote_average) return 'N/A';
    return movie.vote_average.toFixed(1);
  };

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card card">
      <div className="poster-container">
        <img 
          src={imageUrl} 
          alt={`${movie.title} poster`} 
          className="movie-card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster+Available';
          }}
        />
        {movie.vote_average > 0 && (
          <div className="movie-rating">
            <i className="fas fa-star"></i> {formatRating()}
          </div>
        )}
      </div>
      <div className="movie-card-content">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="movie-card-info">
          <span>{formatReleaseDate()}</span>
        </div>
      </div>

      <style jsx>{`
        .movie-card {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
          background: white;
          width: 100%;
        }

        @media (max-width: 480px) {
          .movie-card {
            font-size: 0.9rem;
          }

          .movie-card-content {
            padding: 8px;
          }

          .movie-card-title {
            font-size: 1rem;
          }
        }

        @media (min-width: 2560px) {
          .movie-card {
            font-size: 1.1rem;
          }

          .movie-card-content {
            padding: 16px;
          }

          .movie-card-title {
            font-size: 1.3rem;
          }
        }

        .poster-container {
          position: relative;
          overflow: hidden;
        }

        .movie-card-img {
          width: 100%;
          aspect-ratio: 2/3;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .movie-card:hover .movie-card-img {
          transform: scale(1.05);
        }

        .movie-rating {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.7);
          color: var(--secondary-accent);
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .movie-card-content {
          padding: 15px;
          background-color: var(--card-bg);
        }

        .movie-card-title {
          font-size: clamp(0.875rem, 1vw, 1.125rem);
          font-weight: 600;
          margin-bottom: 5px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          height: auto;
          min-height: 2.5rem;
        }

        @media (max-width: 480px) {
          .movie-card-content {
            padding: 10px;
          }

          .movie-rating {
            font-size: 0.8rem;
            padding: 3px 6px;
          }
        }

        @media (min-width: 2560px) {
          .movie-card-content {
            padding: 20px;
          }

          .movie-card-title {
            font-size: 1.25rem;
          }
        }

        .movie-card-info {
          color: var(--text-light);
          font-size: 0.9rem;
        }
      `}</style>
    </Link>
  );
};

export default MovieCard;