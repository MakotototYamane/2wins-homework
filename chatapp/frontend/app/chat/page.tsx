"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

type Message = {
  id: number;
  content: string;
  user_id: number;
  user_name: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(0);
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  // サーバーからメッセージ一覧を取ってくる
  async function loadMessages() {
    const res = await fetch(`${API_URL}/api/messages`);    // GET は method を省略できる
    const data = await res.json();
    setMessages(data);                                             // 画面に反映する
  }

  // 画面を開いたときに1回だけ実行される
  useEffect(() => {
    const savedId = localStorage.getItem("userId");
    const savedName = localStorage.getItem("userName");
    if (savedId === null || savedName === null) {
      router.push("/");        // ログインしていなければログイン画面へ戻す
      return;
    }
    setUserId(Number(savedId));   // 文字列で保存したので、数字に戻す
    setUserName(savedName);

    loadMessages();
    const timer = setInterval(loadMessages, 2000);    // 2秒ごとに取り直す
    return () => clearInterval(timer);
  }, []);

  async function handleSend() {
    if (text.trim() === "") return;

    await fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, content: text.trim() }),
    });
    setText("");          // 送ったら入力欄を空にする
    loadMessages();        // すぐに自分のメッセージを表示する
  }

  function handleLogout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    router.push("/");
  }

  return (
    <main className="chat">
      <header>
        <span>{userName} さん</span>
        <button onClick={handleLogout}>退室</button>
      </header>

      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={m.user_id === userId ? "message mine" : "message"}>
            {m.user_id !== userId && <div className="name">{m.user_name}</div>}
            <div className="bubble">{m.content}</div>
          </div>
        ))}
      </div>

      <footer>
        <input
          type="text"
          placeholder="メッセージを入力"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={handleSend}>送信</button>
      </footer>
    </main>
  );
}