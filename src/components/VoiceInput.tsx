
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

const VoiceInput = ({ onTranscript, isActive, setIsActive }: VoiceInputProps) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new (window as any).webkitSpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsActive(false);
        toast({
          title: "Voice input received",
          description: `Searching for weather in: ${transcript}`,
        });
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsActive(false);
        toast({
          title: "Voice input error",
          description: "Please try again or use text input",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        setIsActive(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onTranscript, setIsActive]);

  const toggleVoiceInput = () => {
    if (!recognition) {
      toast({
        title: "Voice input not supported",
        description: "Please use text input instead",
        variant: "destructive",
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
        title: "Listening...",
        description: "Speak your location now",
      });
    }
  };

  return (
    <Button
      onClick={toggleVoiceInput}
      variant={isActive ? "destructive" : "outline"}
      size="lg"
      className={`h-12 w-12 p-0 transition-all duration-300 ${
        isActive ? 'animate-pulse' : ''
      }`}
    >
      {isActive ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};

export default VoiceInput;
