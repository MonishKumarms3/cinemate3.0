from django.db import models
from django.contrib.auth.models import User
import json

class Genre(models.Model):
    """Model to store movie genres from TMDB"""
    tmdb_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Movie(models.Model):
    """Model to store basic movie information"""
    tmdb_id = models.IntegerField(unique=True)
    title = models.CharField(max_length=255)
    overview = models.TextField(blank=True, null=True)
    poster_path = models.CharField(max_length=255, blank=True, null=True)
    backdrop_path = models.CharField(max_length=255, blank=True, null=True)
    release_date = models.DateField(blank=True, null=True)
    vote_average = models.FloatField(default=0)
    vote_count = models.IntegerField(default=0)
    genres = models.ManyToManyField(Genre, related_name='movies')
    
    def __str__(self):
        return self.title

class UserProfile(models.Model):
    """Extended user profile for movie preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    favorite_genres = models.ManyToManyField(Genre, related_name='favorited_by', blank=True)
    favorite_movies = models.ManyToManyField(Movie, related_name='favorited_by', blank=True)
    watched_movies = models.ManyToManyField(Movie, through='WatchHistory', related_name='watched_by')
    
    def __str__(self):
        return f"Profile for {self.user.username}"

class WatchHistory(models.Model):
    """Model to track user watch history with timestamps and ratings"""
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    watched_date = models.DateTimeField(auto_now_add=True)
    user_rating = models.IntegerField(blank=True, null=True)
    
    class Meta:
        unique_together = ('user_profile', 'movie')
        ordering = ['-watched_date']
    
    def __str__(self):
        return f"{self.user_profile.user.username} - {self.movie.title}"

class MovieTrivia(models.Model):
    """Model to store AI-generated movie trivia"""
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='trivia')
    question = models.TextField()
    answers_json = models.TextField()  # Store answers as JSON string
    correct_answer_index = models.IntegerField()
    explanation = models.TextField()
    
    def __str__(self):
        return f"Trivia for {self.movie.title}"
        
    @property
    def answers(self):
        return json.loads(self.answers_json) if self.answers_json else []
        
    def set_answers(self, answers_list):
        self.answers_json = json.dumps(answers_list)
