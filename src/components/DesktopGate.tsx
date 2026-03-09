import React, { useEffect, useState } from 'react';
import { Smartphone, QrCode } from 'lucide-react';

const APP_URL = 'https://id-preview--b28ae43e-61e9-488b-9b8b-111129eaf0f5.lovable.app';

const DesktopGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [bypass, setBypass] = useState(false);

  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent;
      const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isWide = window.innerWidth >= 768;
      setIsDesktop(isWide && !isMobileUA);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isDesktop || bypass) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-2xl">
              <Smartphone className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">
              📱
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">Weather Assistant</h1>
          <p className="text-blue-300 text-lg">This app is optimized for mobile devices.</p>
          <p className="text-slate-400">Scan the QR code below with your phone to get the best experience.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 inline-block shadow-2xl">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(APP_URL)}&color=1e3a5f&bgcolor=ffffff&qzone=2`}
            alt="QR Code"
            className="w-48 h-48"
          />
        </div>

        <div className="space-y-2">
          <p className="text-slate-400 text-sm">Point your phone camera at the QR code</p>
          <div className="flex items-center justify-center gap-2 text-blue-300 text-sm">
            <QrCode className="w-4 h-4" />
            <span>iOS & Android supported</span>
          </div>
        </div>
        
        <button
          onClick={() => setBypass(true)}
          className="text-slate-500 hover:text-slate-300 text-sm underline underline-offset-4 transition-colors"
        >
          Preview on desktop anyway →
        </button>
      </div>
    </div>
  );
};

export default DesktopGate;
