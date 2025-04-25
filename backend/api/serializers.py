from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Genre, Movie, UserProfile, WatchHistory, MovieTrivia
import json


class MovieSerializer(serializers.Serializer):
    """Serializer for movie data received from TMDB API"""
    id = serializers.IntegerField()
    title = serializers.CharField()
    overview = serializers.CharField(allow_blank=True, required=False)
    poster_path = serializers.CharField(allow_null=True, required=False)
    backdrop_path = serializers.CharField(allow_null=True, required=False)
    release_date = serializers.DateField(allow_null=True, required=False)
    vote_average = serializers.FloatField(required=False)
    vote_count = serializers.IntegerField(required=False)
    genre_ids = serializers.ListField(child=serializers.IntegerField(), required=False)


class GenreSerializer(serializers.Serializer):
    """Serializer for genre data received from TMDB API"""
    id = serializers.IntegerField()
    name = serializers.CharField()


class MovieDetailSerializer(MovieSerializer):
    """Serializer for detailed movie information"""
    genres = GenreSerializer(many=True, required=False)
    runtime = serializers.IntegerField(allow_null=True, required=False)
    tagline = serializers.CharField(allow_blank=True, required=False)
    status = serializers.CharField(required=False)
    budget = serializers.IntegerField(required=False)
    revenue = serializers.IntegerField(required=False)


class CastMemberSerializer(serializers.Serializer):
    """Serializer for cast member data"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    character = serializers.CharField(required=False)
    profile_path = serializers.CharField(allow_null=True, required=False)


class CrewMemberSerializer(serializers.Serializer):
    """Serializer for crew member data"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    job = serializers.CharField()
    profile_path = serializers.CharField(allow_null=True, required=False)


class CreditsSerializer(serializers.Serializer):
    """Serializer for movie credits data"""
    cast = CastMemberSerializer(many=True)
    crew = CrewMemberSerializer(many=True)


class UserPreferencesSerializer(serializers.Serializer):
    """Serializer for user preferences"""
    favoriteGenres = serializers.ListField(child=serializers.IntegerField(), required=False)
    favoriteMovies = MovieSerializer(many=True, required=False)
    watchedMovies = MovieSerializer(many=True, required=False)


class PlotDescriptionSerializer(serializers.Serializer):
    """Serializer for plot description input"""
    plot_description = serializers.CharField(min_length=10)


class MovieGuessSerializer(serializers.Serializer):
    """Serializer for movie guess response"""
    movie_title = serializers.CharField()
    release_year = serializers.CharField(required=False)
    confidence = serializers.IntegerField(min_value=0, max_value=100)
    explanation = serializers.CharField()
    movie_image = serializers.URLField(required=False)
    alternative_guesses = serializers.ListField(required=False)


class MovieTriviaRequestSerializer(serializers.Serializer):
    """Serializer for movie trivia request"""
    movie_title = serializers.CharField(min_length=1)


class TriviaQuestionSerializer(serializers.Serializer):
    """Serializer for trivia question"""
    question = serializers.CharField()
    answers = serializers.ListField(child=serializers.CharField())
    correct_answer_index = serializers.IntegerField(min_value=0)
    explanation = serializers.CharField()


class MovieTriviaSerializer(serializers.Serializer):
    """Serializer for movie trivia response"""
    movie_title = serializers.CharField()
    questions = TriviaQuestionSerializer(many=True)


# Database Model Serializers
class GenreModelSerializer(serializers.ModelSerializer):
    """Serializer for Genre model"""
    class Meta:
        model = Genre
        fields = '__all__'


class MovieModelSerializer(serializers.ModelSerializer):
    """Serializer for Movie model"""
    genres = GenreModelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Movie
        fields = '__all__'


class WatchHistorySerializer(serializers.ModelSerializer):
    """Serializer for WatchHistory model"""
    movie = MovieModelSerializer(read_only=True)
    
    class Meta:
        model = WatchHistory
        fields = ['id', 'movie', 'watched_date', 'user_rating']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        UserProfile.objects.create(user=user)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    user = serializers.ReadOnlyField(source='user.username')
    favorite_genres = GenreModelSerializer(many=True, read_only=True)
    favorite_movies = MovieModelSerializer(many=True, read_only=True)
    watch_history = WatchHistorySerializer(source='watchhistory_set', many=True, read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'favorite_genres', 'favorite_movies', 'watch_history']


class MovieTriviaModelSerializer(serializers.ModelSerializer):
    """Serializer for MovieTrivia model"""
    movie = MovieModelSerializer(read_only=True)
    answers = serializers.SerializerMethodField()
    
    class Meta:
        model = MovieTrivia
        fields = ['id', 'movie', 'question', 'answers', 'correct_answer_index', 'explanation']
        
    def get_answers(self, obj):
        return obj.answers
