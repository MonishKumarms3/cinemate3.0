from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
import json

from .models import Genre, Movie, UserProfile, WatchHistory, MovieTrivia
from .serializers import (
    # API response serializers
    MovieSerializer, MovieDetailSerializer, CreditsSerializer, 
    GenreSerializer, UserPreferencesSerializer, PlotDescriptionSerializer,
    MovieGuessSerializer, MovieTriviaRequestSerializer, MovieTriviaSerializer,
    # Database model serializers
    GenreModelSerializer, MovieModelSerializer, WatchHistorySerializer,
    UserRegistrationSerializer, UserProfileSerializer, MovieTriviaModelSerializer
)
from .services.movie_service import MovieService
from .services.recommendation_service import RecommendationService
from .services.gemini_service import GeminiService

movie_service = MovieService(settings.TMDB_API_KEY, settings.TMDB_API_BASE_URL)
gemini_service = GeminiService(settings.GEMINI_API_KEY)


class PopularMoviesView(APIView):
    """View to retrieve popular movies from TMDB API"""
    def get(self, request):
        try:
            print("working")
            movies = movie_service.get_popular_movies()
          
            serializer = MovieSerializer(movies, many=True)
            return Response({'results': serializer.data})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SearchMoviesView(APIView):
    """View to search for movies using TMDB API"""
    def get(self, request):
        query = request.query_params.get('query', '')
        if not query:
            return Response(
                {'error': 'Query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            movies = movie_service.search_movies(query)
            serializer = MovieSerializer(movies, many=True)
            return Response({'results': serializer.data})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MovieDetailView(APIView):
    """View to retrieve detailed information about a specific movie"""
    def get(self, request, movie_id):
        try:
            movie = movie_service.get_movie_details(movie_id)
            serializer = MovieDetailSerializer(movie)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MovieCreditsView(APIView):
    """View to retrieve credits information for a specific movie"""
    def get(self, request, movie_id):
        try:
            credits = movie_service.get_movie_credits(movie_id)
            serializer = CreditsSerializer(credits)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SimilarMoviesView(APIView):
    """View to retrieve similar movies for a specific movie"""
    def get(self, request, movie_id):
        try:
            movies = movie_service.get_similar_movies(movie_id)
            serializer = MovieSerializer(movies, many=True)
            return Response({'results': serializer.data})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GenresView(APIView):
    """View to retrieve all available movie genres"""
    def get(self, request):
        try:
            genres = movie_service.get_genres()
            serializer = GenreSerializer(genres, many=True)
            return Response({'genres': serializer.data})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RecommendationsView(APIView):
    """View to get movie recommendations based on user preferences"""
    def post(self, request):
        serializer = UserPreferencesSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Create recommendation service with user preferences
            recommendation_service = RecommendationService(
                movie_service=movie_service,
                user_preferences=serializer.validated_data
            )
            
            # Get movie recommendations
            recommendations = recommendation_service.get_recommendations()
            
            # Serialize and return recommendations
            movie_serializer = MovieSerializer(recommendations, many=True)
            return Response({'results': movie_serializer.data})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GuessMovieView(APIView):
    """View to handle the 'guess movie from plot' AI feature"""
    def post(self, request):
        serializer = PlotDescriptionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            plot_description = serializer.validated_data['plot_description']
            movie_guess = gemini_service.guess_movie_from_plot(plot_description)
            
            guess_serializer = MovieGuessSerializer(data=movie_guess)
            if guess_serializer.is_valid():
                return Response(guess_serializer.validated_data)
            else:
                return Response(
                    {'error': guess_serializer.errors},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MovieTriviaView(APIView):
    """View to generate movie trivia questions using AI"""
    def post(self, request):
        serializer = MovieTriviaRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            movie_title = serializer.validated_data['movie_title']
            trivia = gemini_service.generate_movie_trivia(movie_title)
            
            trivia_serializer = MovieTriviaSerializer(data=trivia)
            if trivia_serializer.is_valid():
                return Response(trivia_serializer.validated_data)
            else:
                return Response(
                    {'error': trivia_serializer.errors},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Database Model Views
class UserAuthView(APIView):
    """View for user registration and authentication"""
    permission_classes = [AllowAny]
    
    def post(self, request, format=None):
        action = request.data.get('action')
        
        if action == 'register':
            serializer = UserRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user_id': user.id,
                    'username': user.username
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        elif action == 'login':
            username = request.data.get('username')
            password = request.data.get('password')
            
            user = authenticate(username=username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user_id': user.id,
                    'username': user.username
                })
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        return Response(
            {'error': 'Invalid action. Use "register" or "login".'},
            status=status.HTTP_400_BAD_REQUEST
        )


class GenreViewSet(viewsets.ModelViewSet):
    """ViewSet for Genre model"""
    queryset = Genre.objects.all()
    serializer_class = GenreModelSerializer
    
    @action(detail=False, methods=['post'])
    def sync_from_tmdb(self, request):
        """Sync genres from TMDB API"""
        try:
            tmdb_genres = movie_service.get_genres()
            for tmdb_genre in tmdb_genres:
                Genre.objects.update_or_create(
                    tmdb_id=tmdb_genre['id'],
                    defaults={'name': tmdb_genre['name']}
                )
            return Response({'status': 'Genres synced successfully'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MovieViewSet(viewsets.ModelViewSet):
    """ViewSet for Movie model"""
    queryset = Movie.objects.all()
    serializer_class = MovieModelSerializer
    
    @action(detail=False, methods=['post'])
    def save_movie(self, request):
        """Save a movie from TMDB to the database"""
        tmdb_id = request.data.get('tmdb_id')
        if not tmdb_id:
            return Response(
                {'error': 'tmdb_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Get movie details from TMDB
            tmdb_movie = movie_service.get_movie_details(tmdb_id)
            
            # Create or update movie in database
            movie, created = Movie.objects.update_or_create(
                tmdb_id=tmdb_movie['id'],
                defaults={
                    'title': tmdb_movie['title'],
                    'overview': tmdb_movie.get('overview', ''),
                    'poster_path': tmdb_movie.get('poster_path', ''),
                    'backdrop_path': tmdb_movie.get('backdrop_path', ''),
                    'release_date': tmdb_movie.get('release_date'),
                    'vote_average': tmdb_movie.get('vote_average', 0),
                    'vote_count': tmdb_movie.get('vote_count', 0)
                }
            )
            
            # Add genres
            if 'genres' in tmdb_movie:
                for genre_data in tmdb_movie['genres']:
                    genre, _ = Genre.objects.get_or_create(
                        tmdb_id=genre_data['id'],
                        defaults={'name': genre_data['name']}
                    )
                    movie.genres.add(genre)
            
            serializer = MovieModelSerializer(movie)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for UserProfile model"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset to only return the authenticated user's profile"""
        return UserProfile.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_favorite_genre(self, request, pk=None):
        """Add a genre to user's favorites"""
        genre_id = request.data.get('genre_id')
        try:
            profile = self.get_object()
            profile.favorite_genres.clear()
            for i in genre_id:
                print("genre id", i)
                genre = Genre.objects.get(tmdb_id=i)
                print("genre", genre)
                profile.favorite_genres.add(genre)
            return Response({'status': 'Genre added to favorites'})
        except Genre.DoesNotExist:
            return Response(
                {'error': 'Genre not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def add_favorite_movie(self, request, pk=None):
        """Add a movie to user's favorites"""
        movie_id = request.data.get('movie_id')
        try:
            profile = self.get_object()
            profile.favorite_movies.clear()
            for i in movie_id:
                movie = Movie.objects.get(id=i)
                profile.favorite_movies.add(movie)
            return Response({'status': 'Movie added to favorites'})
        except Movie.DoesNotExist:
            return Response(
                {'error': 'Movie not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def add_watched_movie(self, request, pk=None):
        """Add a movie to user's watch history"""
        movie_id = request.data.get('movie_id')
        user_rating = request.data.get('user_rating')
        
        try:
            profile = self.get_object()
            profile.watched_movies.clear()
            created= False
            for i in movie_id:
                movie = Movie.objects.get(id=i)
                
                watch_history, created = WatchHistory.objects.update_or_create(
                    user_profile=profile,
                    movie=movie,
                    defaults={'user_rating': user_rating}
                )
            
            return Response({
                'status': 'Movie added to watch history',
                'created': created
            })
        except Movie.DoesNotExist:
            return Response(
                {'error': 'Movie not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WatchHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet for WatchHistory model"""
    queryset = WatchHistory.objects.all()
    serializer_class = WatchHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset to only return the authenticated user's watch history"""
        return WatchHistory.objects.filter(user_profile__user=self.request.user)


class MovieTriviaViewSet(viewsets.ModelViewSet):
    """ViewSet for MovieTrivia model"""
    queryset = MovieTrivia.objects.all()
    serializer_class = MovieTriviaModelSerializer
    
    @action(detail=False, methods=['post'])
    def generate_and_save(self, request):
        """Generate trivia for a movie and save it to the database"""
        movie_id = request.data.get('movie_id')
        if not movie_id:
            return Response(
                {'error': 'movie_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            movie = Movie.objects.get(id=movie_id)
            
            # Generate trivia using Gemini
            trivia_data = gemini_service.generate_movie_trivia(movie.title)
            
            # Save trivia questions to database
            saved_questions = []
            for question_data in trivia_data['questions']:
                trivia = MovieTrivia.objects.create(
                    movie=movie,
                    question=question_data['question'],
                    answers_json=json.dumps(question_data['answers']),
                    correct_answer_index=question_data['correct_answer_index'],
                    explanation=question_data['explanation']
                )
                saved_questions.append(trivia)
            
            serializer = MovieTriviaModelSerializer(saved_questions, many=True)
            return Response(serializer.data)
        except Movie.DoesNotExist:
            return Response(
                {'error': 'Movie not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
