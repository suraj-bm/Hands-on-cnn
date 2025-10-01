import google.generativeai as genai
# Configure your API key first, e.g., genai.configure(api_key="YOUR_API_KEY")

for model in genai.list_models():
    # You can filter to only show models that support generating content (text/chat)
    if 'generateContent' in model.supported_generation_methods:
        print(model.name)