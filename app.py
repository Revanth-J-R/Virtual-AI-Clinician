from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
import streamlit as st

# Load the model and processor from the local "results" directory
model_dir = "./results"  # Local model directory

processor = AutoImageProcessor.from_pretrained(model_dir)
model = AutoModelForImageClassification.from_pretrained(model_dir)

def classify_image(image):
    """Classify an image using the locally saved model."""
    image = Image.open(image).convert("RGB")
    
    # Preprocess image
    inputs = processor(images=image, return_tensors="pt")
    
    # Perform inference
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Get predictions
    logits = outputs.logits
    predicted_class = logits.argmax(-1).item()
    
    return predicted_class

# Streamlit UI
st.title("Image Classification App")
uploaded_file = st.file_uploader("Upload an Image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    st.image(uploaded_file, caption="Uploaded Image", use_column_width=True)
    result = classify_image(uploaded_file)
    st.write(f"Predicted class: {result}")
