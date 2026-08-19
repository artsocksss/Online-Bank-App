import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Phone,
  Scan,
  ScanFace,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { formatPhone } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface AuthScreenProps {
  onLoginSuccess: () => void;
  isDarkMode: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, isDarkMode }) => {
  const [phone, setPhone] = useState('+380 (67) 890-44-22');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Biometric state & simulation
  const [biometricType, setBiometricType] = useState<'FaceID' | 'TouchID'>('FaceID');
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState(false);
  const [biometricScanningState, setBiometricScanningState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [autoBiometricEnabled, setAutoBiometricEnabled] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length >= 10 && password.length >= 4) {
        onLoginSuccess();
      } else {
        setError('Перевірте правильність введеного номера телефону та пароля.');
      }
      setIsLoading(false);
    }, 450);
  };

  const triggerBiometricScan = (type: 'FaceID' | 'TouchID' = biometricType) => {
    setBiometricType(type);
    setIsBiometricPromptOpen(true);
    setBiometricScanningState('scanning');

    // Simulate scanning duration with realistic fintech transition
    setTimeout(() => {
      setBiometricScanningState('success');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.55 },
      });

      setTimeout(() => {
        setIsBiometricPromptOpen(false);
        onLoginSuccess();
      }, 700);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950 text-white relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#EEAA00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95">
        {/* Bank Brand Identity */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-[#EEAA00] text-black font-black text-3xl flex items-center justify-center rounded-2xl mb-4 shadow-xl shadow-[#EEAA00]/20 select-none">
            R
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">Raiffeisen</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#EEAA00]/15 text-[#EEAA00] border border-[#EEAA00]/30 uppercase">
              Premier
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Офіційний цифровий веб-банкінг</p>
        </div>

        {/* Biometric Quick-Selector Toggle */}
        <div className="mb-6 p-1.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setBiometricType('FaceID')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
              biometricType === 'FaceID'
                ? 'bg-[#EEAA00] text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <ScanFace className="w-4 h-4" />
            <span>Face ID</span>
          </button>
          <button
            type="button"
            onClick={() => setBiometricType('TouchID')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
              biometricType === 'TouchID'
                ? 'bg-[#EEAA00] text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Touch ID / Відбиток</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Phone input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Номер телефону (Логін)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+380 (__) ___-__-__"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white font-mono text-sm focus:outline-none focus:border-[#EEAA00] transition"
                required
              />
              <Phone className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Пароль до кабінету
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введіть пароль"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#EEAA00] transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}

          {/* Main Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#EEAA00] text-black font-bold py-4 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span>Авторизація...</span>
            ) : (
              <>
                <span>Увійти з паролем</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Biometrics Simulator Button */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => triggerBiometricScan(biometricType)}
              className="flex-1 py-3.5 px-3 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-800/90 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer group shadow-sm hover:border-[#EEAA00]/50"
            >
              {biometricType === 'FaceID' ? (
                <ScanFace className="w-4 h-4 text-[#EEAA00] group-hover:scale-110 transition transform" />
              ) : (
                <Fingerprint className="w-4 h-4 text-[#EEAA00] group-hover:scale-110 transition transform" />
              )}
              <span>Вхід за {biometricType}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPhone('+380 (67) 890-44-22');
                setPassword('password123');
                onLoginSuccess();
              }}
              className="px-4 py-3.5 rounded-xl border border-[#EEAA00]/40 bg-[#EEAA00]/10 hover:bg-[#EEAA00]/20 text-[#EEAA00] text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Швидкий демо-вхід</span>
            </button>
          </div>
        </form>

        {/* Security Badges */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Ліцензія НБУ №10
            </span>
            <span>•</span>
            <span>PCI-DSS Level 1</span>
            <span>•</span>
            <span>256-bit SSL</span>
          </div>
          <p className="text-[9px] text-neutral-500">
            АТ «Райффайзен Банк» • Учасник Фонду гарантування вкладів фізичних осіб
          </p>
        </div>
      </div>

      {/* BIOMETRIC SCANNING MODAL OVERLAY */}
      {isBiometricPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95">
            <button
              onClick={() => setIsBiometricPromptOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Animation Icon Area */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center mb-6">
                {biometricScanningState === 'scanning' && (
                  <div className="w-24 h-24 rounded-full border-2 border-[#EEAA00]/50 animate-ping absolute" />
                )}

                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    biometricScanningState === 'success'
                      ? 'bg-emerald-500 text-black scale-110 shadow-lg shadow-emerald-500/30'
                      : 'bg-neutral-950 border border-[#EEAA00]/50 text-[#EEAA00] shadow-lg shadow-[#EEAA00]/10'
                  }`}
                >
                  {biometricScanningState === 'success' ? (
                    <CheckCircle2 className="w-10 h-10 animate-in zoom-in text-black stroke-[2.5]" />
                  ) : biometricType === 'FaceID' ? (
                    <ScanFace className="w-10 h-10 animate-pulse stroke-[1.75]" />
                  ) : (
                    <Fingerprint className="w-10 h-10 animate-pulse stroke-[1.75]" />
                  )}
                </div>
              </div>

              {/* Title & Status */}
              <h3 className="font-extrabold text-lg text-white mb-1">
                {biometricScanningState === 'success'
                  ? 'Особу підтверджено!'
                  : biometricType === 'FaceID'
                  ? 'Сканування Face ID...'
                  : 'Сканування Touch ID...'}
              </h3>

              <p className="text-xs text-neutral-400 max-w-xs mt-1">
                {biometricScanningState === 'success'
                  ? 'Вхід до персонального кабінету Raiffeisen Premier'
                  : biometricType === 'FaceID'
                  ? 'Дивіться у камеру пристрою для біометричної верифікації'
                  : 'Прикладіть зареєстрований палець до датчика відбитка'}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsBiometricPromptOpen(false)}
                className="w-full py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                Скасувати та використати пароль
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
