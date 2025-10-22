import os
import requests
from dotenv import load_dotenv


load_dotenv()
API_KEY = os.getenv("GOOGLE_CIVIC_API_KEY")

BASE_URL = "https://civicinfo.googleapis.com/civicinfo/v2"

