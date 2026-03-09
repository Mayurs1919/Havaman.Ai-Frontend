import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  onHaptic?: () => void;
}

const VoiceInput = ({ onTranscript, isActive, setIsActive, onHaptic }: VoiceInputProps) => {
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const instance = new SpeechRecognition();
      instance.continuous = false;
      instance.interimResults = false;
      instance.lang = 'en-US';

      instance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsActive(false);
        toast({
          title: 'Voice input received',
          description: `Searching for: ${transcript}`,
        });
      };

      instance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsActive(false);
        toast({
          title: 'Voice input error',
          description: 'Please try again or use text input',
          variant: 'destructive',
        });
      };

      instance.onend = () => {
        setIsActive(false);
      };

      setRecognition(instance);
    }
  }, [onTranscript, setIsActive]);

  const toggle = () => {
    onHaptic?.();
    if (!recognition) {
      toast({
        title: 'Voice input not supported',
        description: 'Please use text input instead',
        variant: 'destructive',
      });
      return;
    }

    if (isActive) {
      recognition.stop();
      setIsActive(false);
    } else {
      recognition.start();
      setIsActive(true);
      toast({
        title: '🎙️ Listening...',
        description: 'Speak your location',
      });
    }
  };

  return (
    <button
      onClick={toggle}
      className={`h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
        isActive
          ? 'bg-red-500/60 text-white animate-pulse'
          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
      }`}
    >
      {isActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
};

export default VoiceInput;
