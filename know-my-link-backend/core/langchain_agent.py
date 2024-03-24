from langchain.llms import BasicLM


class LangchainAgent:
    def __init__(self, model_name="gpt-3.5-turbo"):
        self.model = BasicLM(model_name=model_name)  # Replace with your preferred model

    def handle_message(self, message):
        prompt = f"You: {message}\nAgent:"  # Basic prompt format
        response = self.model.generate_text(prompt, temperature=0.7)  # Generate response
        return response.strip()  # Remove leading/trailing whitespace
