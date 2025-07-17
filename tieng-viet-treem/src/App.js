import React, { useState } from 'react';
import './App.css';

const topics = [
  {
    name: 'Bảng chữ cái',
    words: [
      { letter: 'A', example: 'Ăn', image: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg' },
      { letter: 'B', example: 'Bé', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Baby_infant.jpg' },
      { letter: 'C', example: 'Cá', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Goldfish3.jpg' },
      { letter: 'D', example: 'Đèn', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Light_bulb_icon.png' },
      { letter: 'E', example: 'Em', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Child_in_Vietnam.jpg' },
    ],
  },
  {
    name: 'Con vật',
    words: [
      { letter: 'Mèo', example: 'Mèo', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg' },
      { letter: 'Chó', example: 'Chó', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Golde33443.jpg' },
      { letter: 'Vịt', example: 'Vịt', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Duck_in_Vietnam.jpg' },
      { letter: 'Gà', example: 'Gà', image: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Chicken_in_Vietnam.jpg' },
      { letter: 'Cá', example: 'Cá', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Goldfish3.jpg' },
    ],
  },
  {
    name: 'Màu sắc',
    words: [
      { letter: 'Đỏ', example: 'Quả táo đỏ', image: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg' },
      { letter: 'Vàng', example: 'Hoa hướng dương', image: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Sunflower_sky_backdrop.jpg' },
      { letter: 'Xanh', example: 'Lá cây xanh', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Leaf_Green.jpg' },
      { letter: 'Tím', example: 'Hoa tím', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Purple_flower.jpg' },
      { letter: 'Cam', example: 'Quả cam', image: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg' },
    ],
  },
  {
    name: 'Số đếm',
    words: [
      { letter: 'Một', example: '1', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/1_number.png' },
      { letter: 'Hai', example: '2', image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/2_number.png' },
      { letter: 'Ba', example: '3', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/3_number.png' },
      { letter: 'Bốn', example: '4', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/4_number.png' },
      { letter: 'Năm', example: '5', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/5_number.png' },
    ],
  },
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
  const [topicIdx, setTopicIdx] = useState(0);
  const [selected, setSelected] = useState(topics[0].words[0]);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState('');
  const [recText, setRecText] = useState('');
  let recognition;

  const handleTopicChange = (idx) => {
    setTopicIdx(idx);
    setSelected(topics[idx].words[0]);
    setResult('');
    setRecText('');
  };

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
      if (
        text.trim().toLowerCase() === selected.letter.toLowerCase() ||
        text.trim().toLowerCase() === selected.example.toLowerCase()
      ) {
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
      <div className="topic-list">
        {topics.map((t, idx) => (
          <button
            key={t.name}
            className={topicIdx === idx ? 'selected' : ''}
            onClick={() => handleTopicChange(idx)}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div className="alphabet-list">
        {topics[topicIdx].words.map((item) => (
          <button
            key={item.letter}
            className={selected.letter === item.letter ? 'selected' : ''}
            onClick={() => setSelected(item)}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.letter}</span>
          </button>
        ))}
      </div>
      <div className="card">
        <div className="image">
          <img src={selected.image} alt={selected.letter} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12 }} />
        </div>
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
