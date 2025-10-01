'use client';
import { useState, useRef } from 'react';

export default function Home() {
  const [userText, setUserText] = useState('');
  const [krishnaReply, setKrishnaReply] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listeningRef = useRef(false);
  const lastSentTextRef = useRef(''); // store last sent text

  const startListening = () => {
    if (loading) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0]?.transcript ?? '';
      }
      setUserText(transcript);

      if (loading) return; // block sending if Krishna is responding

      // Only send if text changed and not empty
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (transcript.trim() && transcript.trim() !== lastSentTextRef.current) {
          lastSentTextRef.current = transcript.trim();
          sendToKrishna(transcript.trim());
        }
      }, 1500);
    };

    recognition.onend = () => {
      if (listeningRef.current && !loading) recognition.start();
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
    listeningRef.current = true;
    setListening(true);
  };

  const stopListening = () => {
    listeningRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
  };

  const sendToKrishna = async (text: string) => {
    if (!text) return;

    stopListening();
    setLoading(true);
    setKrishnaReply('');

    try {
      const res = await fetch('http://localhost:5000/ask_krishna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      const reply = data.reply;
      setKrishnaReply(reply);
//krishna voice
      const utterance = new SpeechSynthesisUtterance(reply);
const voices = speechSynthesis.getVoices();

// Pick a known male English voice
utterance.voice = voices.find(v => 
  v.lang.includes("en") && 
  ["google uk english male","microsoft david desktop"].includes(v.name.toLowerCase())
) || voices.find(v => v.lang.includes("en")) || null;

utterance.rate = 0.9; // calm
utterance.pitch = 1.0; // soft boyish
utterance.volume = 1.0;



      utterance.onend = () => {
        setLoading(false);
        setUserText('');
        lastSentTextRef.current = ''; // reset last sent text
        startListening(); // resume listening
      };

      speechSynthesis.speak(utterance);

    } catch (err) {
      console.error('Error sending to API:', err);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: 'url(/krishna_avatar.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '20px' }}>
        Talk to Krishna
      </h1>

      <button
        onClick={listening ? stopListening : startListening}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: 'clamp(14px, 2vw, 16px)',
          cursor: loading ? 'not-allowed' : 'pointer',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: listening ? 'red' : 'rgba(0,0,0,0.6)',
          color: 'white',
          marginBottom: '10px',
        }}
      >
        {loading ? 'Krishna is thinking...' : listening ? 'Listening...' : 'Hold to Speak'}
      </button>

      <textarea
        rows={3}
        value={userText}
        onChange={e => setUserText(e.target.value)}
        placeholder="Your speech will appear here..."
        disabled={loading}
        style={{
          padding: '10px',
          fontSize: 'clamp(14px, 2vw, 16px)',
          borderRadius: '8px',
          border: 'none',
          marginBottom: '10px',
          width: '90%',
          maxWidth: '600px',
          resize: 'vertical',
        }}
      />

      <div
        style={{
          marginTop: '20px',
          fontStyle: 'italic',
          whiteSpace: 'pre-line',
          maxWidth: '600px',
          textAlign: 'center',
          fontSize: 'clamp(14px, 2vw, 16px)',
        }}
      >
        {krishnaReply}
      </div>
    </div>
  );
}
