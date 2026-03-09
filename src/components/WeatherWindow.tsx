import React, { useState, useMemo } from 'react';
import type { HourlyItem } from '@/hooks/useWeather';
import { getTranslations } from '@/utils/translations';
import { toast } from '@/hooks/use-toast';

/* ── Activity criteria ── */
interface ActivityCriteria {
  id: string;
  icon: string;
  tempMin?: number;
  tempMax?: number;
  maxPrecip: number;
  maxWind?: number;
  maxCloud?: number;
  goldenHour?: boolean;
  noRain24h?: boolean;
}

const activityCriteria: ActivityCriteria[] = [
  { id: 'running',      icon: '🏃', tempMin: 15, tempMax: 22, maxPrecip: 0,  maxWind: 15 },
  { id: 'cycling',      icon: '🚴', tempMin: 12, tempMax: 28, maxPrecip: 0,  maxWind: 20 },
  { id: 'photography',  icon: '📸', maxPrecip: 10, maxCloud: 30, goldenHour: true },
  { id: 'carwash',      icon: '🚗', maxPrecip: 0,  noRain24h: true },
  { id: 'dogwalk',      icon: '🐕', tempMin: 5,  tempMax: 30, maxPrecip: 10, maxWind: 25 },
  { id: 'picnic',       icon: '🧺', tempMin: 18, tempMax: 30, maxPrecip: 0,  maxWind: 15, maxCloud: 50 },
];

const ACTIVITY_LABELS: Record<string, Record<string, string>> = {
  running:     { en: 'Running', es: 'Correr', fr: 'Course', de: 'Laufen', ja: 'ランニング', ko: '달리기', pt: 'Corrida', hi: 'दौड़ना', mr: 'धावणे', zh: '跑步', ar: 'الجري' },
  cycling:     { en: 'Cycling', es: 'Ciclismo', fr: 'Vélo', de: 'Radfahren', ja: 'サイクリング', ko: '자전거', pt: 'Ciclismo', hi: 'साइकिलिंग', mr: 'सायकलिंग', zh: '骑行', ar: 'ركوب الدراجة' },
  photography: { en: 'Photo', es: 'Foto', fr: 'Photo', de: 'Foto', ja: '写真', ko: '사진', pt: 'Foto', hi: 'फोटो', mr: 'फोटो', zh: '摄影', ar: 'تصوير' },
  carwash:     { en: 'Car Wash', es: 'Lavado', fr: 'Lavage', de: 'Autowäsche', ja: '洗車', ko: '세차', pt: 'Lavagem', hi: 'कार वॉश', mr: 'कार वॉश', zh: '洗车', ar: 'غسيل السيارة' },
  dogwalk:     { en: 'Dog Walk', es: 'Paseo', fr: 'Promenade', de: 'Gassi', ja: '散歩', ko: '산책', pt: 'Passeio', hi: 'टहलना', mr: 'फिरायला', zh: '遛狗', ar: 'تمشية الكلب' },
  picnic:      { en: 'Picnic', es: 'Picnic', fr: 'Pique-nique', de: 'Picknick', ja: 'ピクニック', ko: '피크닉', pt: 'Piquenique', hi: 'पिकनिक', mr: 'पिकनिक', zh: '野餐', ar: 'نزهة' },
};

const BEST_TIME_LABELS: Record<string, string> = {
  en: 'Best time for', es: 'Mejor hora para', fr: 'Meilleur moment pour', de: 'Beste Zeit für',
  ja: 'ベストタイム：', ko: '최적 시간:', pt: 'Melhor hora para', hi: 'सबसे अच्छा समय',
  mr: 'सर्वोत्तम वेळ', zh: '最佳时间', ar: 'أفضل وقت لـ',
};

const NO_WINDOW_LABELS: Record<string, string> = {
  en: 'No ideal window in the next hours', es: 'Sin ventana ideal próximas horas', fr: 'Pas de créneau idéal',
  de: 'Kein ideales Fenster', ja: '適した時間帯なし', ko: '적합한 시간 없음', pt: 'Sem janela ideal',
  hi: 'कोई आदर्श समय नहीं', mr: 'आदर्श वेळ नाही', zh: '没有理想时间', ar: 'لا يوجد وقت مثالي',
};

const SCORE_LABEL: Record<string, string> = {
  en: 'Conditions score', es: 'Puntuación', fr: 'Score', de: 'Bewertung',
  ja: 'スコア', ko: '점수', pt: 'Pontuação', hi: 'स्कोर', mr: 'स्कोर', zh: '评分', ar: 'النتيجة',
};

/* ── Scoring logic ── */
function scoreHour(criteria: ActivityCriteria, h: HourlyItem): number {
  let score = 100;
  const temp = h.temp;
  const wind = h.windSpeed ?? 10;
  const precip = h.precipChance ?? 0;
  const cloud = h.cloudCover ?? 50;

  // Precipitation
  if (precip > criteria.maxPrecip) score -= Math.min(50, (precip - criteria.maxPrecip) * 2);

  // Temperature
  if (criteria.tempMin !== undefined && temp < criteria.tempMin) score -= (criteria.tempMin - temp) * 5;
  if (criteria.tempMax !== undefined && temp > criteria.tempMax) score -= (temp - criteria.tempMax) * 5;

  // Wind
  if (criteria.maxWind !== undefined && wind > criteria.maxWind) score -= (wind - criteria.maxWind) * 3;

  // Cloud cover
  if (criteria.maxCloud !== undefined && cloud > criteria.maxCloud) score -= (cloud - criteria.maxCloud) * 1.5;

  // Golden hour bonus (around hour 17-18 or 6-7)
  if (criteria.goldenHour && h.hour !== undefined) {
    const isGolden = (h.hour >= 17 && h.hour <= 18) || (h.hour >= 6 && h.hour <= 7);
    if (isGolden) score += 15;
    else score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function findBestWindow(activityId: string, hourlyData: HourlyItem[]): { bestIndex: number; bestScore: number; scores: number[] } {
  const criteria = activityCriteria.find(a => a.id === activityId)!;
  const scores = hourlyData.map(h => scoreHour(criteria, h));

  // No-rain-24h check for car wash
  if (criteria.noRain24h) {
    const hasRain = hourlyData.some(h => (h.precipChance ?? 0) > 5);
    if (hasRain) return { bestIndex: -1, bestScore: 0, scores: scores.map(() => 0) };
  }

  let bestIndex = 0;
  let bestScore = scores[0];
  scores.forEach((s, i) => {
    if (s > bestScore) { bestScore = s; bestIndex = i; }
  });

  return { bestIndex, bestScore, scores };
}

/* ── Component ── */
interface WeatherWindowProps {
  hourly: HourlyItem[];
  language: string;
  onHaptic?: () => void;
}

const WeatherWindow: React.FC<WeatherWindowProps> = ({ hourly, language, onHaptic }) => {
  const [selectedActivity, setSelectedActivity] = useState('running');
  const [notifiedActivities, setNotifiedActivities] = useState<Set<string>>(new Set());
  const lang = language || 'en';

  const result = useMemo(() => findBestWindow(selectedActivity, hourly), [selectedActivity, hourly]);

  const currentScore = result.scores[0] ?? 0;
  const bestHour = result.bestIndex >= 0 ? hourly[result.bestIndex] : null;

  const getScoreColor = (s: number) => {
    if (s >= 75) return '#22c55e';
    if (s >= 50) return '#eab308';
    if (s >= 25) return '#f97316';
    return '#ef4444';
  };

  const handleNotify = () => {
    onHaptic?.();
    const label = ACTIVITY_LABELS[selectedActivity]?.[lang] || selectedActivity;
    setNotifiedActivities(prev => {
      const next = new Set(prev);
      if (next.has(selectedActivity)) {
        next.delete(selectedActivity);
        toast({ title: `🔕 ${label}`, description: lang === 'en' ? 'Notification cancelled' : '✓' });
      } else {
        next.add(selectedActivity);
        toast({ title: `🔔 ${label}`, description: lang === 'en' ? 'We\'ll notify you when conditions are perfect!' : '✓' });
      }
      return next;
    });
  };

  return (
    <div className="px-4 pb-4">
      <div className="glass-card rounded-2xl p-4 space-y-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="text-white font-semibold text-sm">
            {lang === 'en' ? 'Weather Window' : lang === 'es' ? 'Ventana del Clima' : lang === 'fr' ? 'Fenêtre Météo' : lang === 'de' ? 'Wetterfenster' : lang === 'ja' ? 'ウェザーウィンドウ' : lang === 'ko' ? '날씨 윈도우' : lang === 'pt' ? 'Janela do Tempo' : lang === 'hi' ? 'मौसम विंडो' : lang === 'mr' ? 'हवामान विंडो' : lang === 'zh' ? '天气窗口' : lang === 'ar' ? 'نافذة الطقس' : 'Weather Window'}
          </h3>
        </div>

        {/* Activity pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {activityCriteria.map(a => {
            const isActive = selectedActivity === a.id;
            return (
              <button
                key={a.id}
                onClick={() => { onHaptic?.(); setSelectedActivity(a.id); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium whitespace-nowrap transition-all duration-300 min-h-[44px] backdrop-blur-md border ${
                  isActive
                    ? 'bg-white/20 text-white shadow-[0_8px_32px_rgba(255,255,255,0.15)] scale-105 border-white/30'
                    : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.12] hover:text-white/80 border-white/[0.08] hover:border-white/20 hover:shadow-[0_4px_16px_rgba(255,255,255,0.06)]'
                }`}
              >
                <span className="text-base">{a.icon}</span>
                <span>{ACTIVITY_LABELS[a.id]?.[lang] || a.id}</span>
              </button>
            );
          })}
        </div>

        {/* Best Window Card */}
        <div className="rounded-2xl p-4 space-y-3 bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]">
          {bestHour && result.bestScore > 20 ? (
            <>
              <p className="text-white/50 text-xs uppercase tracking-wider">
                {BEST_TIME_LABELS[lang] || BEST_TIME_LABELS.en} {ACTIVITY_LABELS[selectedActivity]?.[lang] || selectedActivity}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 backdrop-blur-sm border border-emerald-400/20 flex items-center justify-center text-2xl shadow-[0_4px_12px_rgba(16,185,129,0.15)]">
                  {activityCriteria.find(a => a.id === selectedActivity)?.icon}
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">{bestHour.time === 'Now' ? '✨ Now!' : bestHour.time}</p>
                  <p className="text-white/60 text-xs">{bestHour.temp}° · {bestHour.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: getScoreColor(result.bestScore) }}>
                    {result.bestScore}%
                  </p>
                  <p className="text-white/40 text-[10px]">{lang === 'en' ? 'match' : '✓'}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-white/50 text-sm text-center py-2">
              {NO_WINDOW_LABELS[lang] || NO_WINDOW_LABELS.en}
            </p>
          )}
        </div>

        {/* Current conditions score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-white/50 text-xs">{SCORE_LABEL[lang] || SCORE_LABEL.en}</p>
            <p className="text-white text-xs font-semibold">{currentScore}%</p>
          </div>
          <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden backdrop-blur-sm border border-white/[0.08]">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,0,0,0.2)]"
              style={{
                width: `${currentScore}%`,
                background: `linear-gradient(90deg, ${getScoreColor(currentScore)}, ${getScoreColor(Math.min(100, currentScore + 20))})`,
                boxShadow: `0 0 12px ${getScoreColor(currentScore)}40`,
              }}
            />
          </div>
        </div>

        {/* Hourly score timeline */}
        <div className="flex items-end gap-1.5 h-12 px-1 py-2 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06]">
          {result.scores.map((score, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm transition-all duration-500"
                style={{
                  height: `${Math.max(4, (score / 100) * 32)}px`,
                  backgroundColor: i === result.bestIndex ? getScoreColor(score) : `rgba(255,255,255,${0.08 + score / 400})`,
                  boxShadow: i === result.bestIndex ? `0 0 8px ${getScoreColor(score)}50` : 'none',
                }}
              />
              <span className="text-[9px] text-white/40">{hourly[i]?.time?.replace('+', '')}</span>
            </div>
          ))}
        </div>

        {/* Notify Me button */}
        <button
          onClick={handleNotify}
          className={`w-full py-3 rounded-2xl text-sm font-medium transition-all duration-300 min-h-[44px] backdrop-blur-md border ${
            notifiedActivities.has(selectedActivity)
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25 shadow-[0_4px_20px_rgba(16,185,129,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]'
              : 'bg-white/[0.07] text-white/80 hover:bg-white/[0.12] border-white/[0.1] hover:border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.06)]'
          }`}
        >
          {notifiedActivities.has(selectedActivity) ? '🔔 ' : '🔕 '}
          {lang === 'en' ? (notifiedActivities.has(selectedActivity) ? 'Notification Set' : 'Notify Me') :
           lang === 'es' ? (notifiedActivities.has(selectedActivity) ? 'Notificación activa' : 'Notificarme') :
           lang === 'fr' ? (notifiedActivities.has(selectedActivity) ? 'Notification activée' : 'Me notifier') :
           lang === 'de' ? (notifiedActivities.has(selectedActivity) ? 'Benachrichtigung aktiv' : 'Benachrichtigen') :
           lang === 'ja' ? (notifiedActivities.has(selectedActivity) ? '通知設定済み' : '通知する') :
           lang === 'ko' ? (notifiedActivities.has(selectedActivity) ? '알림 설정됨' : '알림 받기') :
           lang === 'hi' ? (notifiedActivities.has(selectedActivity) ? 'सूचना सेट' : 'सूचित करें') :
           (notifiedActivities.has(selectedActivity) ? '✓' : '🔔')}
        </button>
      </div>
    </div>
  );
};

export default WeatherWindow;
