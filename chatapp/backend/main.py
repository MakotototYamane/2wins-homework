from pydantic import BaseModel
import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageRequest(BaseModel):
    user_id: int
    content: str

class LoginRequest(BaseModel):
    name: str


def get_db():
    conn = sqlite3.connect("chat.db")
    conn.row_factory = sqlite3.Row

    return conn

def init_db():
    conn = get_db()
    conn.execute("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)")
    conn.execute("CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), content TEXT NOT NULL)")
    conn.commit()
    conn.close()

init_db()

@app.post("/api/login")
def login(req: LoginRequest):
    conn = get_db()
    user = conn.execute("SELECT id, name FROM users WHERE name = ?", (req.name, )).fetchone()
    if user is None:
        conn.execute("INSERT INTO users (name) VALUES (?)", (req.name,))
        conn.commit()
        user = conn.execute("SELECT id, name FROM users WHERE name = ?", (req.name,)).fetchone()

    conn.close()
    return{"id":user["id"],"name":user["name"]}

@app.post("/api/messages")
def post_messages(req: MessageRequest):
    conn = get_db()
    user = conn.execute("SELECT id FROM users WHERE id = ?", (req.user_id, )).fetchone()
    if user is None:
        conn.close()
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
    conn.execute("INSERT INTO messages (user_id, content) VALUES (?, ?)", (req.user_id, req.content))
    conn.commit()
    conn.close()
    return {"result": "ok"}

@app.get("/api/messages")
def get_messages():
    conn = get_db()
    rows = conn.execute("SELECT messages.id, messages.content, users.id AS user_id, users.name AS user_name FROM messages JOIN users ON messages.user_id = users.id ORDER BY messages.id").fetchall()
    conn.close()
    return [dict(row) for row in rows]

