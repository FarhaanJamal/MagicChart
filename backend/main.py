from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import bcrypt
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from typing import List
from prediction import get_prediction

load_dotenv()
client = MongoClient(os.getenv("MONGO_URL"))
MagicChartDB = client.MagicChartDB
user_collection = MagicChartDB.user_collection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("BASE_URL1"), os.getenv("BASE_URL2")],
    #allow_origins=["*"],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"],
)

def find_user_data(name):
    user_data = user_collection.find_one({
        "name": name
    })
    return user_data

class LoginRequest(BaseModel):
    name: str
    password: str

@app.post("/api/login")
async def login(login_request: LoginRequest):
    user_data = find_user_data(login_request.name)
    if login_request.name != "" and user_data != None:
        if login_request.name == user_data["name"]:
            if bcrypt.checkpw(login_request.password.encode("utf-8"), user_data["password"].encode("utf-8")):
                return JSONResponse(status_code=200, content={"message": "Login Successful!"})
            else:
                raise HTTPException(status_code=401, detail="Incorrect Password")
        else:
            raise HTTPException(status_code=401, detail="UserName does not exist.")
    else:
        raise HTTPException(status_code=401, detail="Invalid UserName")

class PlotData(BaseModel):
    plotData: str

@app.get("/api/predict/{interval}", response_model=PlotData)
def get_plot_data(interval: str):
    plotData = get_prediction(interval)
    return {"plotData": plotData}
