import requests
from django.conf import settings
from urllib.parse import urljoin
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class MovieService:
    """Service for interacting with The Movie Database (TMDB) API"""
    
    def __init__(self, api_key, base_url):
         
        self.api_key = api_key
        self.base_url = base_url
        self.session = self._create_robust_session()
    
    def _create_robust_session(self) -> requests.Session:
        
        session = requests.Session()
        retry_strategy = Retry(
            total=3,  # Total number of retries
            status_forcelist=[429, 500, 502, 503, 504],  # HTTP status codes to retry
            allowed_methods=["GET"],  # Use allowed_methods instead of method_whitelist
            backoff_factor=1  # Exponential backoff
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        return session
    
    def _make_request(self, endpoint: str, timeout: int = 10)  :
        
         
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json;charset=utf-8'
        }
        
        url = self.base_url + endpoint
        
        print("Making request to URL:", url)
        print("Headers:", headers)
        response = self.session.get(
            url, 
            headers=headers, 
            timeout=timeout
        )
        
        # Comprehensive error handling
        response.raise_for_status()
        
        data = response.json()
        
        return data
        
         
        
        
             
         
    
    def get_popular_movies(self, page=1):
         
        endpoint = f'/movie/popular?language=en-US&page={page}'
        print("Endpoint:", endpoint)
        print("Fetching popular movies from TMDB API...")
        data = self._make_request(endpoint)
        return data.get('results', [])
    
    def search_movies(self, query, page=1):
         
        endpoint = f'/search/movie?query={query}&page={page}&language=en-US&include_adult=false'
        data = self._make_request(endpoint)
        return data.get('results', [])
    
    def get_movie_details(self, movie_id):
         
        endpoint = f'/movie/{movie_id}?language=en-US'
        return self._make_request(endpoint)
    
    def get_movie_credits(self, movie_id):
         
        endpoint = f'/movie/{movie_id}/credits?language=en-US'
        return self._make_request(endpoint)
    
    def get_similar_movies(self, movie_id, page=1):
         
        endpoint = f'/movie/{movie_id}/similar?language=en-US&page={page}'
        data = self._make_request(endpoint)
        return data.get('results', [])
    
    def get_genres(self):
         
        endpoint= '/genre/movie/list?language=en-US'
        data = self._make_request(endpoint)
        return data.get('genres', [])
    
    def discover_movies_by_genre(self, genre_ids, page=1):
         
        genres_string = ','.join(map(str, genre_ids))
        endpoint = f'/discover/movie?with_genres={genres_string}&page={page}&language=en-US&sort_by=popularity.desc'
        data = self._make_request(endpoint)
        return data.get('results', [])
    
    def get_movie_recommendations(self, movie_id, page=1):
        
        endpoint = f'/movie/{movie_id}/recommendations?language=en-US&page={page}'
        data = self._make_request(endpoint)
        return data.get('results', [])
