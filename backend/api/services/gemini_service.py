import json
from google import genai
from urllib.parse import urljoin


class GeminiService:
    """Service for interacting with Google's Gemini API"""
    
    def __init__(self, api_key):
        
        self.api_key = api_key
        self.client = genai.Client(api_key=self.api_key)
        
         
        
    def guess_movie_from_plot(self, plot_description):
        """
        Use Gemini AI to guess a movie based on plot description
        
        Args:
            plot_description (str): User's description of a movie plot
            
        Returns:
            dict: Movie guess information including title, confidence, explanation
        """
        # Create prompt for Gemini AI
        prompt = f"""
        As a film expert, your task is to identify a movie from the following plot description:

        "{plot_description}"

        Analyze the plot details and provide your best guess for the movie title, along with your confidence level (0-100%).
        Also explain your reasoning for why you think this is the correct movie.

        Return the information in the following JSON format:
        {{
            "movie_title": "Title of the movie",
            "release_year": "Year the movie was released (if you can determine)",
            "confidence": confidence percentage as integer between 0 and 100,
            "explanation": "Your explanation for why this is the movie",
            "movie_image": "URL to the movie poster if available (or empty string)",
            "alternative_guesses": [
                {{
                    "title": "Alternative movie title",
                    "year": "Year",
                    "confidence": confidence percentage as integer
                }}
            ]
        }}

        Be precise and creative with your movie identification!
        """
        
        # Generate response from Gemini
   
        response = self.client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        
        try:
            # Extract JSON from response
            response_text = response.text
            
            # If response has markdown code blocks, extract the JSON
            if '```json' in response_text:
                json_part = response_text.split('```json')[1].split('```')[0].strip()
                return json.loads(json_part)
            
            # If the response is just JSON
            return json.loads(response_text)
        except Exception as e:
            # Fallback if JSON parsing fails
            return {
                "movie_title": "Unable to identify the movie",
                "confidence": 0,
                "explanation": f"I couldn't determine the movie from your description. Please provide more details about the plot, characters, or setting. Error: {str(e)}",
                "alternative_guesses": []
            }
    
    def generate_movie_trivia(self, movie_title):
        """
        Generate movie trivia questions using Gemini AI
        
        Args:
            movie_title (str): Title of the movie
            
        Returns:
            dict: Movie trivia with questions, answers, and explanations
        """
         
        prompt = f"""
        As a film trivia expert, generate 5 challenging but fair multiple-choice trivia questions about the movie "{movie_title}".

        For each question:
        1. Create an interesting, specific question about the movie
        2. Provide 4 possible answers, with only 1 correct answer
        3. Indicate which answer is correct (by index 0-3)
        4. Include a brief explanation of why the answer is correct

        Return the information in the following JSON format:
        {{
            "movie_title": "{movie_title}",
            "questions": [
                {{
                    "question": "Question text here",
                    "answers": ["Answer A", "Answer B", "Answer C", "Answer D"],
                    "correct_answer_index": correct answer index (0-3),
                    "explanation": "Explanation of the correct answer"
                }},
                ...more questions...
            ]
        }}

        Ensure questions cover different aspects of the movie such as plot, characters, actors, production, interesting facts, etc.
        Make sure your information is accurate and factual about "{movie_title}".
        """
        
        # Generate response from Gemini
        response = self.client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        
        try:
            # Extract JSON from response
            response_text = response.text
            
            # If response has markdown code blocks, extract the JSON
            if '```json' in response_text:
                json_part = response_text.split('```json')[1].split('```')[0].strip()
                return json.loads(json_part)
            
            # If the response is just JSON
            return json.loads(response_text)
        except Exception as e:
            # Fallback if JSON parsing fails
            return {
                "movie_title": movie_title,
                "questions": [
                    {
                        "question": f"Sorry, I couldn't generate trivia questions for '{movie_title}'.",
                        "answers": ["Try again", "Choose a different movie", "Provide the full movie title", "Ensure the movie exists"],
                        "correct_answer_index": 2,
                        "explanation": f"Error generating trivia: {str(e)}"
                    }
                ]
            }
