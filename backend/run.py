"""
Start the SoriaFlow API server.

Default (classic):
  python run.py
  → Uses app.db.

Demo mode (prefilled demo data):
  python run.py --demo
  → Uses demo.db.
"""
import os
import sys
import uvicorn


def main():
    use_demo = "--demo" in sys.argv

    if use_demo:
        os.environ["DATABASE_URL"] = "sqlite:///./demo.db"
    else:
        os.environ["DATABASE_URL"] = "sqlite:///./app.db"

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == "__main__":
    main()
