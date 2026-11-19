import sys
import uvicorn

if __name__ == "__main__":
    print("==================================================")
    print("🚀 Starting Stackly E-Commerce Backend Server")
    print("📍 URL: http://localhost:8000")
    print("📖 API Docs (Swagger): http://localhost:8000/docs")
    print("📖 ReDoc: http://localhost:8000/redoc")
    print("==================================================")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
