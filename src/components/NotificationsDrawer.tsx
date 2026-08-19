import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'security' | 'transaction' | 'promo' | 'system';
  isRead: boolean;
  actionUrl?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Успішне зарахування кешбеку',
    message: 'Вам нараховано 480.00 ₴ за категорією «Кафе та ресторани». Кошти вже доступні на балансі.',
    time: '5 хв тому',
    type: 'transaction',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Захист 3D-Secure 2.0 активовано',
    message: 'Система протидії кіберзагрозам Raiffeisen Shield оновила алгоритми захисту ваших карток.',
    time: '2 години тому',
    type: 'security',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Виплата дивідендів за Облігаціями ЗСУ',
    message: 'Отримано купонний дохід 16.5% за військовою облігацією «Фортеця Бахмут». Дякуємо за підтримку!',
    time: 'Сьогодні, 10:15',
    type: 'promo',
    isRead: true,
  },
  {
    id: 'notif-4',
    title: 'Авторизація через Дія.Підпис',
    message: 'Ваші персональні дані успішно підтверджено у Державному реєстрі України.',
    time: 'Учора, 18:40',
    type: 'system',
    isRead: true,
  },
];

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onShowToast,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    onShowToast('Сповіщення видалено', 'info');
  };

  const handleClearAll = () => {
    setNotifications([]);
    onShowToast('Усі сповіщення очищено', 'info');
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onShowToast('Усі сповіщення позначено як прочитані', 'success');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in font-sans">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`w-full max-w-md h-full border-l shadow-2xl flex flex-col ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EEAA00]/20 text-[#EEAA00] flex items-center justify-center font-bold relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base">Центр сповіщень</h3>
              <p className="text-[11px] text-neutral-400">Свайпайте картку вліво/вправо для видалення</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action controls */}
        {notifications.length > 0 && (
          <div className="px-5 py-3 border-b border-neutral-800/60 bg-neutral-950/50 flex items-center justify-between text-xs">
            <button
              onClick={handleMarkAllRead}
              className="text-[#EEAA00] hover:underline font-bold cursor-pointer"
            >
              Прочитати все
            </button>
            <button
              onClick={handleClearAll}
              className="text-neutral-400 hover:text-red-400 font-semibold cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистити все</span>
            </button>
          </div>
        )}

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-20 text-center space-y-3 text-neutral-500">
              <Bell className="w-12 h-12 mx-auto opacity-30 text-[#EEAA00]" />
              <p className="text-sm font-bold">Сповіщень немає</p>
              <p className="text-xs max-w-xs mx-auto">
                Усі оперативні фінансові сповіщення та безпекові перевірки відображатимуться тут.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
                  className="relative overflow-hidden rounded-2xl group"
                >
                  {/* Swipe background indicator */}
                  <div className="absolute inset-0 bg-red-600 text-white flex items-center justify-between px-5 font-black text-xs rounded-2xl shadow-inner">
                    <span className="flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4" /> Видалити
                    </span>
                    <span className="flex items-center gap-1.5">
                      Видалити <Trash2 className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Foreground swipeable card */}
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.6}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) {
                        handleDelete(item.id);
                      }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-2xl border transition-colors cursor-grab active:cursor-grabbing select-none ${
                      item.isRead
                        ? 'bg-neutral-950/95 border-neutral-800 text-neutral-300'
                        : 'bg-neutral-900 border-neutral-700/80 text-white shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            item.type === 'security'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : item.type === 'transaction'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : item.type === 'promo'
                              ? 'bg-amber-500/20 text-[#EEAA00] border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {item.type === 'security' ? (
                            <ShieldAlert className="w-4 h-4" />
                          ) : item.type === 'transaction' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : item.type === 'promo' ? (
                            <Sparkles className="w-4 h-4" />
                          ) : (
                            <Info className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-xs text-white truncate">{item.title}</h4>
                            {!item.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#EEAA00] shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                            {item.message}
                          </p>
                          <span className="text-[10px] text-neutral-500 block mt-2 font-mono">
                            {item.time}
                          </span>
                        </div>
                      </div>

                      {/* Quick Delete button fallback */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0 cursor-pointer"
                        title="Видалити сповіщення"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};
