"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    if (name.trim() === "") {
      setError("ユーザー名を入力してください");              // エラーメッセージを入れる
      return;
    }

    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const user = await res.json();

    localStorage.setItem("userId", String(user.id));
    localStorage.setItem("userName", String(user.name));
    router.push("/chat");
  }

  return (
    <main className="login">
      <h1>Simple Chat</h1>
      <input
        type="text"
        placeholder="ユーザー名"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleLogin}>入室する</button>
      {error !== "" && <p className="error">{error}</p>}
    </main>
  );
}