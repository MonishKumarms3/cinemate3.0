from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # API views
    PopularMoviesView, SearchMoviesView, MovieDetailView, 
    MovieCreditsView, SimilarMoviesView, GenresView, 
    RecommendationsView, GuessMovieView, MovieTriviaView,
    # Database model views
    UserAuthView, GenreViewSet, MovieViewSet, 
    UserProfileViewSet, WatchHistoryViewSet, MovieTriviaViewSet
)

# Create router for viewsets
router = DefaultRouter()
router.register(r'db/genres', GenreViewSet)
router.register(r'db/movies', MovieViewSet)
router.register(r'db/profiles', UserProfileViewSet)
router.register(r'db/watch-history', WatchHistoryViewSet)
router.register(r'db/movie-trivia', MovieTriviaViewSet)

urlpatterns = [
    # API endpoints
    path('movies/popular/', PopularMoviesView.as_view(), name='popular-movies'),
    path('movies/search/', SearchMoviesView.as_view(), name='search-movies'),
    path('movies/<int:movie_id>/', MovieDetailView.as_view(), name='movie-detail'),
    path('movies/<int:movie_id>/credits/', MovieCreditsView.as_view(), name='movie-credits'),
    path('movies/<int:movie_id>/similar/', SimilarMoviesView.as_view(), name='similar-movies'),
    path('movies/genres/', GenresView.as_view(), name='genres'),
    
    # Recommendation endpoint
    path('recommendations/', RecommendationsView.as_view(), name='recommendations'),
    
    # AI feature endpoints
    path('ai/guess-movie/', GuessMovieView.as_view(), name='guess-movie'),
    path('ai/movie-trivia/', MovieTriviaView.as_view(), name='movie-trivia'),
    
    # Authentication endpoint
    path('auth/', UserAuthView.as_view(), name='user-auth'),
    
    # Include router URLs for database models
    path('', include(router.urls)),
]
