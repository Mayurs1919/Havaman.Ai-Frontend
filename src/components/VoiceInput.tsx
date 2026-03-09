import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getTranslations, LANGUAGES } from '@/utils/translations';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  onHaptic?: () => void;
  language: string;
}

const VoiceInput = ({ onTranscript, isActive, setIsActive, onHaptic, language }: VoiceInputProps) => {
  const [recognition, setRecognition] = useState<any>(null);
  const t = getTranslations(language);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const instance = new SpeechRecognition();
      instance.continuous = false;
      instance.interimResults = false;
      
      // Set language based on user preference
      const languageConfig = LANGUAGES.find(l => l.code === language);
      instance.lang = languageConfig?.voiceCodes[0] || 'en-US';

      instance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsActive(false);
        toast({
          title: t.voiceReceived,
          description: `${t.searchingFor}: ${transcript}`,
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
  }, [onTranscript, setIsActive, language, t]);

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
        title: `🎙️ ${t.listening}`,
        description: t.speakLocation,
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
