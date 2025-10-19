import { useState, useEffect, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false; // Changed to false for better reliability
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        recognitionInstance.maxAlternatives = 1;

        recognitionInstance.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update with interim results for better UX
          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
          } else if (interimTranscript) {
            setTranscript(prev => {
              const lastSpace = prev.lastIndexOf(' ');
              const base = lastSpace >= 0 ? prev.substring(0, lastSpace + 1) : '';
              return base + interimTranscript;
            });
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          // Notify parent component of error
          if (event.error === 'network') {
            window.dispatchEvent(new CustomEvent('speech-error', { 
              detail: 'Network connection required for speech recognition. Please check your internet connection.' 
            }));
          } else if (event.error === 'not-allowed') {
            window.dispatchEvent(new CustomEvent('speech-error', { 
              detail: 'Microphone access denied. Please allow microphone permissions in your browser.' 
            }));
          } else if (event.error === 'no-speech') {
            window.dispatchEvent(new CustomEvent('speech-error', { 
              detail: 'No speech detected. Please try again.' 
            }));
          } else {
            window.dispatchEvent(new CustomEvent('speech-error', { 
              detail: `Speech recognition error: ${event.error}` 
            }));
          }
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
      try {
        setTranscript('');
        recognition.start();
        setIsListening(true);
      } catch (error: any) {
        console.error('Failed to start recognition:', error);
        if (error.message?.includes('already started')) {
          // Recognition already running, just update state
          setIsListening(true);
        } else {
          window.dispatchEvent(new CustomEvent('speech-error', { 
            detail: 'Failed to start speech recognition. Please try again.' 
          }));
        }
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: !!recognition,
  };
};
