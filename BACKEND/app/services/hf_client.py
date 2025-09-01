import os
from typing import Tuple
from huggingface_hub import InferenceClient, InferenceTimeoutError

# Choose a solid emotion model with 7 labels (anger, disgust, fear, joy, neutral, sadness, surprise)
DEFAULT_EMOTION_MODEL = os.getenv('HF_EMOTION_MODEL', 'j-hartmann/emotion-english-distilroberta-base')


class EmotionService:
    def __init__(self, token: str | None = None, model_id: str | None = None):
        self.model_id = model_id or DEFAULT_EMOTION_MODEL
        # InferenceClient will pick up HF token if provided or from env
        token = token or os.getenv('HF_API_TOKEN') or os.getenv('HUGGINGFACEHUB_API_TOKEN')
        self.client = InferenceClient(token=token, timeout=30)

    def classify(self, text: str) -> Tuple[str, float]:
        # Using task-specific helper for text classification
        try:
            outputs = self.client.text_classification(text, model=self.model_id, top_k=7)
            # outputs: list of {label, score}
            best = max(outputs, key=lambda x: x.score)
            return best.label.lower(), float(best.score)
        except InferenceTimeoutError:
            # Fall back to neutral if HF is slow/unavailable
            return 'neutral', 0.0
        except Exception:
            return 'neutral', 0.0
