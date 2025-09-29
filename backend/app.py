from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Corrected Gemini API Configuration ---

try:
    # Configure the Gemini API key from environment variables
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    genai.configure(api_key=api_key)

    # Define the system prompt for the model
    SYSTEM_PROMPT = (
        "You are Krishna, the divine guide. Respond with wisdom, compassion, "
        "and a playful, approachable tone. Make your answers suitable for voice output."
    )

    # Initialize the Generative Model with the system instruction
    # Using a model name confirmed to be available from your list.
    model = genai.GenerativeModel(
        model_name='gemini-pro-latest', # Using an available model from your list
        system_instruction=SYSTEM_PROMPT
    )
    print("Gemini model initialized successfully.")

except Exception as e:
    print(f"Error during Gemini initialization: {e}")
    # Handle the case where the model fails to initialize
    model = None

# --- API Endpoint ---

@app.route("/ask_krishna", methods=["POST"])
def ask_krishna():
    """
    Receives a user's text, gets a response from the Gemini model,
    and returns it.
    """
    # Check if the model was initialized correctly
    if not model:
        return jsonify({"reply": "Sorry, the AI model is not available at the moment."}), 503

    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Invalid request: 'text' field is missing."}), 400

    user_text = data.get("text", "").strip()

    if not user_text:
        return jsonify({"reply": "I didn’t receive any text. What is on your mind?"})

    try:
        # --- Corrected way to call the Gemini API ---
        # The generate_content method is used for single-turn conversations.
        response = model.generate_content(user_text)

        # The response text is accessed directly via the .text attribute
        krishna_reply = response.text
        return jsonify({"reply": krishna_reply})

    # --- New: Specific error handling for common API issues ---
    except exceptions.ResourceExhausted as e:
        # This catches the 429 Quota Exceeded error
        print(f"Error during API call: {e}")
        return jsonify({"reply": "I am receiving many requests at the moment. Please try again in a minute."}), 429
    
    except exceptions.InternalServerError as e:
        # This catches the 500 Internal Server Error
        print(f"Error during API call: {e}")
        return jsonify({"reply": "It seems there's a temporary issue with my connection. Please try again shortly."}), 500

    except Exception as e:
        # Log the error for debugging purposes for any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return jsonify({"reply": "My apologies, I am having a little trouble connecting right now."}), 500

if __name__ == "__main__":
    # It's recommended to use a production-ready WSGI server instead of app.run in production
    app.run(debug=True, port=5000)

