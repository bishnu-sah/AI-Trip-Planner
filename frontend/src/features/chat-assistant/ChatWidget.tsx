import { useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

const ChatWidget = () => {
  const [history, setHistory] = useState<Message[]>([{ role: 'assistant', content: 'Hi! Ask me anything.' }]);
  const [text, setText] = useState('');

  const send = async () => {
    const res = await fetch('/api/chat/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...history, { role: 'user', content: text }] })
    });
    const reply = await res.json();
    setHistory((h) => [...h, { role: 'user', content: text }, reply]);
    setText('');
  };

  return (
    <div className="card">
      <h3>Chat assistant</h3>
      <div>
        {history.map((m, idx) => (
          <div key={idx}>
            <span className="pill">{m.role}</span> {m.content}
          </div>
        ))}
      </div>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask" />
      <button onClick={send}>Send</button>
    </div>
  );
};

export default ChatWidget;

