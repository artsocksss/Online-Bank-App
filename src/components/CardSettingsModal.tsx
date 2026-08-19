import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CreditCard,
  Globe,
  KeyRound,
  Lock,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Unlock,
  Wifi,
  X,
} from 'lucide-react';
import { CardSecuritySettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  settings: CardSecuritySettings;
  onUpdateSettings: (newSettings: CardSecuritySettings) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CardSettingsModal: React.FC<CardSettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  settings,
  onUpdateSettings,
  onShowToast,
}) => {
  const [localSettings, setLocalSettings] = useState<CardSecuritySettings>({ ...settings });
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handleToggleFreeze = () => {
    const next = !localSettings.isFrozen;
    const updated = { ...localSettings, isFrozen: next };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    onShowToast(next ? 'Картку тимчасово заблоковано' : 'Картку успішно розблоковано', next ? 'info' : 'success');
  };

  const handleToggleNfc = () => {
    const updated = { ...localSettings, isNfcEnabled: !localSettings.isNfcEnabled };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    onShowToast(`Безконтактні платежі NFC: ${updated.isNfcEnabled ? 'Увімкнено' : 'Вимкнено'}`, 'info');
  };

  const handleToggleAtm = () => {
    const updated = { ...localSettings, isAtmWithdrawalEnabled: !localSettings.isAtmWithdrawalEnabled };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    onShowToast(`Зняття готівки в банкоматах: ${updated.isAtmWithdrawalEnabled ? 'Дозволено' : 'Заблоковано'}`, 'info');
  };

  const handleToggleDcc = () => {
    const updated = { ...localSettings, isDoubleConversionProtected: !localSettings.isDoubleConversionProtected };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    onShowToast(`Захист від подвійної конвертації (DCC): ${updated.isDoubleConversionProtected ? 'Активний' : 'Вимкнено'}`, 'info');
  };

  const handleInternetLimitChange = (val: number) => {
    const updated = { ...localSettings, internetLimit: val };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('PIN-код повинен складатися рівно з 4 цифр');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Введені PIN-коди не співпадають');
      return;
    }

    const updated = { ...localSettings, pinCode: newPin };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    setShowPinModal(false);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    onShowToast('PIN-код картки успішно змінено в системі банку', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EEAA00] text-black font-black flex items-center justify-center text-sm shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Керування карткою & Безпека</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Захист коштів, ліміти інтернет-оплат та налаштування картки
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Card Freeze Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between transition ${
              localSettings.isFrozen
                ? 'bg-red-500/10 border-red-500/30'
                : isDarkMode
                ? 'bg-neutral-950 border-neutral-800'
                : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  localSettings.isFrozen ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 text-emerald-400'
                }`}
              >
                {localSettings.isFrozen ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold">
                  {localSettings.isFrozen ? 'Картка заблокована' : 'Статус картки: Активна'}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {localSettings.isFrozen
                    ? 'Тимчасове блокування зупиняє всі операції'
                    : 'Миттєве блокування у разі підозри на шахрайство'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleFreeze}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                localSettings.isFrozen
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
              }`}
            >
              {localSettings.isFrozen ? 'Розблокувати' : 'Заблокувати'}
            </button>
          </div>

          {/* Internet Daily Limit Slider */}
          <div className={`p-4.5 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#EEAA00]" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Добовий ліміт на оплати в інтернеті
                </span>
              </div>
              <span className="text-sm font-black text-[#EEAA00] font-mono">
                {formatCurrency(localSettings.internetLimit, 'UAH')}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Максимальна сума операцій в онлайн-магазинах на добу без додаткового підтвердження
            </p>
            <input
              type="range"
              min={0}
              max={localSettings.internetLimitMax}
              step={1000}
              value={localSettings.internetLimit}
              onChange={(e) => handleInternetLimitChange(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#EEAA00]"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
              <span>0 ₴ (Вимкнено)</span>
              <span>50 000 ₴</span>
              <span>100 000 ₴</span>
            </div>
          </div>

          {/* Security Switches */}
          <div className="space-y-2.5">
            {/* NFC Contactless */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wifi className="w-4 h-4 text-neutral-400 rotate-90" />
                <div>
                  <p className="text-xs font-bold">Безконтактна оплата (NFC / Apple Pay)</p>
                  <p className="text-[11px] text-neutral-400">Оплата смартфонами та годинниками через термінали</p>
                </div>
              </div>
              <button
                onClick={handleToggleNfc}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  localSettings.isNfcEnabled ? 'bg-[#EEAA00]' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                    localSettings.isNfcEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* ATM Withdrawals */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-xs font-bold">Зняття готівки в банкоматах (ATM)</p>
                  <p className="text-[11px] text-neutral-400">Дозвіл на видачу готівки в терміналах України та за кордоном</p>
                </div>
              </div>
              <button
                onClick={handleToggleAtm}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  localSettings.isAtmWithdrawalEnabled ? 'bg-[#EEAA00]' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                    localSettings.isAtmWithdrawalEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Double Conversion Protection (DCC) */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-[#EEAA00]" />
                <div>
                  <p className="text-xs font-bold">Захист від подвійної конвертації (DCC)</p>
                  <p className="text-[11px] text-neutral-400">Блокує невигідний курс іноземних терміналів</p>
                </div>
              </div>
              <button
                onClick={handleToggleDcc}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  localSettings.isDoubleConversionProtected ? 'bg-[#EEAA00]' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                    localSettings.isDoubleConversionProtected ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Change PIN Action */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-800 text-[#EEAA00] flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">PIN-код картки</p>
                <p className="text-[11px] text-neutral-400">Встановлений та активний • Останнє оновлення 2026</p>
              </div>
            </div>
            <button
              onClick={() => setShowPinModal(true)}
              className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 transition cursor-pointer"
            >
              Змінити PIN
            </button>
          </div>
        </div>
      </div>

      {/* CHANGE PIN SUB-MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl relative ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#EEAA00]/15 text-[#EEAA00] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base">Зміна PIN-коду</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Введіть новий 4-значний PIN-код для картки</p>
            </div>

            <form onSubmit={handleSavePin} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Новий PIN-код
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-xl font-mono tracking-widest font-black py-2.5 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Підтвердіть PIN-код
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-xl font-mono tracking-widest font-black py-2.5 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                  required
                />
              </div>

              {pinError && <p className="text-red-400 text-xs font-medium text-center">{pinError}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-semibold border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 transition cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl text-xs font-bold bg-[#EEAA00] text-black hover:bg-[#ffb700] transition cursor-pointer shadow-md"
                >
                  Зберегти PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
