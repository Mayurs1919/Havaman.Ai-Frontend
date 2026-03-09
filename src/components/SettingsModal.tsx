import React, { useState } from 'react';
import { X, Settings, Globe, Key, Sun, Moon, Volume2 } from 'lucide-react';
import { LANGUAGES, detectBrowserLanguage, Language } from '@/utils/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  temperatureUnit: 'C' | 'F';
  setTemperatureUnit: (unit: 'C' | 'F') => void;
  enableHaptics: boolean;
  setEnableHaptics: (enable: boolean) => void;
  enableTTS: boolean;
  setEnableTTS: (enable: boolean) => void;
}

const SettingsModal = ({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  language,
  setLanguage,
  temperatureUnit,
  setTemperatureUnit,
  enableHaptics,
  setEnableHaptics,
  enableTTS,
  setEnableTTS,
}: SettingsModalProps) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempApiKey);
    onClose();
  };

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
  };

  const selectedLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* API Key Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-400" />
              <h3 className="font-semibold">OpenWeatherMap API Key</h3>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="Enter your API key..."
                  value={tempApiKey}
                  onChange={e => setTempApiKey(e.target.value)}
                  className="w-full h-11 px-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none text-sm"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-white/60 text-xs">
                Get your free API key from{' '}
                <a
                  href="https://openweathermap.org/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 underline"
                >
                  openweathermap.org
                </a>
              </p>
            </div>
          </div>

          {/* Language Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold">Language</h3>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                    language === lang.code
                      ? 'bg-white/20 border border-white/30'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{lang.nativeName}</p>
                    <p className="text-white/60 text-xs">{lang.name}</p>
                  </div>
                  {language === lang.code && (
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Unit */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              <h3 className="font-semibold">Temperature Unit</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTemperatureUnit('C')}
                className={`flex-1 h-11 rounded-xl font-medium transition-colors ${
                  temperatureUnit === 'C'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                onClick={() => setTemperatureUnit('F')}
                className={`flex-1 h-11 rounded-xl font-medium transition-colors ${
                  temperatureUnit === 'F'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <h3 className="font-semibold">Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Haptic Feedback</span>
                <button
                  onClick={() => setEnableHaptics(!enableHaptics)}
                  className={`w-11 h-6 rounded-full transition-colors ${
                    enableHaptics ? 'bg-green-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      enableHaptics ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Text-to-Speech</span>
                <button
                  onClick={() => setEnableTTS(!enableTTS)}
                  className={`w-11 h-6 rounded-full transition-colors ${
                    enableTTS ? 'bg-green-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      enableTTS ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 h-11 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-11 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;