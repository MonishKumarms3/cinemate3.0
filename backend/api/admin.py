from django.contrib import admin
from .models import Genre, Movie, UserProfile, WatchHistory, MovieTrivia

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name', 'tmdb_id')
    search_fields = ('name',)

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'release_date', 'vote_average', 'tmdb_id')
    list_filter = ('genres',)
    search_fields = ('title', 'overview')
    date_hierarchy = 'release_date'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_favorite_genres', 'get_watched_count')
    filter_horizontal = ('favorite_genres', 'favorite_movies')
    
    def get_favorite_genres(self, obj):
        return ", ".join([genre.name for genre in obj.favorite_genres.all()[:3]])
    get_favorite_genres.short_description = 'Favorite Genres'
    
    def get_watched_count(self, obj):
        return obj.watched_movies.count()
    get_watched_count.short_description = 'Movies Watched'

@admin.register(WatchHistory)
class WatchHistoryAdmin(admin.ModelAdmin):
    list_display = ('user_profile', 'movie', 'watched_date', 'user_rating')
    list_filter = ('watched_date', 'user_rating')
    date_hierarchy = 'watched_date'
    raw_id_fields = ('movie',)

@admin.register(MovieTrivia)
class MovieTriviaAdmin(admin.ModelAdmin):
    list_display = ('movie', 'question', 'correct_answer_index')
    search_fields = ('movie__title', 'question')
