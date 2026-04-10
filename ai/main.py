import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pipeline import analyse_claim

load_dotenv()

app = FastAPI(title="Heirs Structural-Link AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyseRequest(BaseModel):
    frame_urls: list[str]
    car_model: str


class AnalyseResponse(BaseModel):
    predictions: list[dict]
    total_payout_ngn: int
    fraud_flagged: bool
    zones_detected: list[str]
    car_model: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "heirs-ai"}


@app.post("/analyse", response_model=AnalyseResponse)
async def analyse(req: AnalyseRequest):
    if not req.frame_urls:
        raise HTTPException(status_code=400, detail="No frame URLs provided")
    if req.car_model not in ["Toyota Camry", "Honda Accord", "Lexus RX"]:
        raise HTTPException(status_code=400, detail="Unsupported car model")

    try:
        result = analyse_claim(req.frame_urls, req.car_model)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
