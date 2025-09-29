interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// Optional: declare types for SpeechRecognition events if needed
interface SpeechRecognition extends EventTarget {
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onend: () => void;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: any;
}