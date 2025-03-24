import os
import re
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_pinecone import PineconeVectorStore
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms import HuggingFacePipeline
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Set Pinecone API Key
os.environ["PINECONE_API_KEY"] = "pcsk_79y6Vi_A4sB4Go5AYEm8eXRkTKh2uA2PkRfCQVZ592YyKSrEr64BxWEpMMXtHePWEvtHZ5"
print("✅ Pinecone API Key set successfully")

# Load embeddings (Runs once)
def load_embeddings():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

embeddings = load_embeddings()
print("✅ Embeddings loaded successfully")

# Load Pinecone Index (Runs once)
index_name = "virtual-clinician"
docsearch = PineconeVectorStore.from_existing_index(index_name=index_name, embedding=embeddings)
retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})
print("✅ Pinecone Index and Retriever loaded successfully")

# Load AI Model (Runs once)
model_name = "deepseek-ai/deepseek-llm-7b-chat"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",
    offload_folder="offload_weights"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Wrap model in LangChain-compatible pipeline (Runs once)
hf_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer, max_new_tokens=200)
llm = HuggingFacePipeline(pipeline=hf_pipeline)
print("✅ Model and LLM pipeline loaded successfully")

# Define Prompt Template
prompt_template = """You are an assistant for answering medical queries. 
Use the retrieved context to provide concise, medically accurate responses. 
Ask for more details if the query is very simple and contains no specific information. 
Your answer must search the given context and provide the remedy for it in the answer if symptoms or precautions are not explicitly asked. 
Answer in two sentences or less.
Context: {context}
Question: {question}
Answer:
"""

prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

# Define QA Chain (Runs once)
qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever, chain_type_kwargs={"prompt": prompt})
print("✅ QA Chain loaded successfully")

# Define FastAPI request model
class QueryRequest(BaseModel):
    query: str

# API Endpoint for Chat
@app.post("/chat")
async def chat(request: QueryRequest):
    user_query = request.query

    # Retrieve context from Pinecone
    context_docs = retriever.get_relevant_documents(user_query)
    context_text = "\n".join([doc.page_content for doc in context_docs])

    # Generate response using QA Chain
    response = qa_chain.invoke({"context": context_text, "question": user_query})

    # Extract answer from response
    def extract_answer(response_text):
        match = re.search(r'Answer:\n(.*?)(\n\n|\Z)', response_text, re.DOTALL)
        return match.group(1).strip() if match else "I'm not sure. Please consult a medical professional."

    response_text = response["result"]
    answer = extract_answer(response_text)

    return {"response": answer}

# Run FastAPI server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
