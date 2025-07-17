import React, { useState } from 'react';
import './App.css';

const alphabet = [
  { letter: 'A', example: 'Ăn', image: '🍎' },
  { letter: 'B', example: 'Bé', image: '👶' },
  { letter: 'C', example: 'Cá', image: '🐟' },
  { letter: 'D', example: 'Đèn', image: '💡' },
  { letter: 'E', example: 'Em', image: '🧒' },
  // ... có thể thêm các chữ cái khác
];

function speak(text) {
  if ('speechSynthesis' in window) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'vi-VN';
    window.speechSynthesis.speak(utter);
  } else {
    alert('Trình duyệt không hỗ trợ phát âm!');
  }
}

function App() {
  const [selected, setSelected] = useState(alphabet[0]);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState('');
  const [recText, setRecText] = useState('');
  let recognition;

  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Trình duyệt không hỗ trợ nhận diện giọng nói!');
      return;
    }
    setResult('');
    setRecText('');
    setRecording(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setRecText(text);
      if (text.trim().toLowerCase() === selected.letter.toLowerCase() || text.trim().toLowerCase() === selected.example.toLowerCase()) {
        setResult('Tuyệt vời! Bạn đã phát âm đúng! 🎉');
      } else {
        setResult('Bạn hãy thử lại nhé!');
      }
      setRecording(false);
    };
    recognition.onerror = () => {
      setResult('Có lỗi khi nhận diện giọng nói.');
      setRecording(false);
    };
    recognition.onend = () => {
      setRecording(false);
    };
    recognition.start();
  };

  return (
    <div className="App">
      <h1>Học tiếng Việt cho bé</h1>
      <div className="alphabet-list">
        {alphabet.map((item) => (
          <button
            key={item.letter}
            className={selected.letter === item.letter ? 'selected' : ''}
            onClick={() => setSelected(item)}
          >
            <span style={{ fontSize: '2rem' }}>{item.letter}</span>
          </button>
        ))}
      </div>
      <div className="card">
        <div className="image" style={{ fontSize: '4rem' }}>{selected.image}</div>
        <h2>{selected.letter}</h2>
        <p>Ví dụ: <b>{selected.example}</b></p>
        <button onClick={() => speak(selected.letter + ' - ' + selected.example)}>
          🔊 Nghe phát âm
        </button>
        <button onClick={startRecognition} disabled={recording} style={{ marginLeft: 10 }}>
          🎤 {recording ? 'Đang ghi...' : 'Luyện nói'}
        </button>
        {recText && <div style={{ marginTop: 10 }}>Bạn vừa nói: <b>{recText}</b></div>}
        {result && <div className="result">{result}</div>}
      </div>
      <footer style={{ marginTop: 40, color: '#888' }}>
        © 2024 Học tiếng Việt cho trẻ em
      </footer>
    </div>
  );
}

export default App;
