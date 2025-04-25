import random
from itertools import chain
from collections import Counter
from .movie_service import MovieService


class RecommendationService:
    """Service for generating movie recommendations based on user preferences"""
    
    def __init__(self, movie_service, user_preferences):
        """
        Initialize the recommendation service
        
        Args:
            movie_service (MovieService): Instance of MovieService
            user_preferences (dict): User preferences including favorite genres, movies, etc.
        """
        self.movie_service = movie_service
        self.user_preferences = user_preferences
    
    def get_recommendations(self, limit=20):
        """
        Generate movie recommendations based on user preferences
        
        Args:
            limit (int): Maximum number of recommendations to return
            
        Returns:
            list: List of recommended movies
        """
        # If no preferences are set, return popular movies
        if (not self.user_preferences.get('favoriteGenres') and 
            not self.user_preferences.get('favoriteMovies')):
            return self.movie_service.get_popular_movies()[:limit]
        
        recommendations = []
        
        # Get recommendations based on favorite genres
        if self.user_preferences.get('favoriteGenres'):
            genre_recommendations = self._get_genre_based_recommendations()
            recommendations.extend(genre_recommendations)
        
        # Get recommendations based on favorite movies
        if self.user_preferences.get('favoriteMovies'):
            movie_recommendations = self._get_movie_based_recommendations()
            recommendations.extend(movie_recommendations)
        
        # Remove duplicates by creating a dictionary using movie ID as key
        unique_recommendations = {}
        for movie in recommendations:
            if movie['id'] not in unique_recommendations:
                unique_recommendations[movie['id']] = movie
        
        # Remove movies that are in the user's watched list
        if self.user_preferences.get('watchedMovies'):
            watched_ids = [movie['id'] for movie in self.user_preferences['watchedMovies']]
            for movie_id in watched_ids:
                if movie_id in unique_recommendations:
                    del unique_recommendations[movie_id]
        
        # Convert back to list and sort by popularity
        recommendations_list = list(unique_recommendations.values())
        recommendations_list.sort(key=lambda x: x.get('popularity', 0), reverse=True)
        
        # Return limited number of recommendations
        return recommendations_list[:limit]
    
    def _get_genre_based_recommendations(self):
        """
        Get movie recommendations based on favorite genres
        
        Returns:
            list: List of recommended movies based on genres
        """
        genre_ids = self.user_preferences.get('favoriteGenres', [])
        if not genre_ids:
            return []
        
        return self.movie_service.discover_movies_by_genre(genre_ids)
    
    def _get_movie_based_recommendations(self):
        """
        Get movie recommendations based on favorite movies
        
        Returns:
            list: List of recommended movies based on favorite movies
        """
        favorite_movies = self.user_preferences.get('favoriteMovies', [])
        if not favorite_movies:
            return []
        
        # Get recommendations for each favorite movie
        all_recommendations = []
        for movie in favorite_movies:
            try:
                similar_movies = self.movie_service.get_movie_recommendations(movie['id'])
                all_recommendations.extend(similar_movies)
            except Exception:
                # If getting recommendations for a movie fails, continue with next movie
                continue
        
        return all_recommendations
    
    def _calculate_movie_scores(self, movies):
        """
        Calculate recommendation scores for movies
        
        Args:
            movies (list): List of movies to score
            
        Returns:
            dict: Dictionary of movie IDs and their scores
        """
        scores = {}
        favorite_genres = self.user_preferences.get('favoriteGenres', [])
        
        for movie in movies:
            movie_id = movie['id']
            if movie_id not in scores:
                scores[movie_id] = 0
            
            # Score based on genre match
            genre_ids = movie.get('genre_ids', [])
            matching_genres = set(genre_ids).intersection(set(favorite_genres))
            scores[movie_id] += len(matching_genres) * 2
            
            # Score based on popularity and vote average
            scores[movie_id] += movie.get('popularity', 0) / 100
            scores[movie_id] += movie.get('vote_average', 0) / 2
        
        return scores
