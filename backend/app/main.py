from fastapi import FastAPI

app = FastAPI(title="SoriaFlow API")

@app.get("/health")
def health():
    return {"status": "ok"}