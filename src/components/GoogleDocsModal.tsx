import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileCode,
  FilePlus,
  FileText,
  FolderOpen,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { googleSignIn, logoutGoogle, initAuth } from '../lib/googleAuth';
import {
  listGoogleDocs,
  getGoogleDoc,
  createGoogleDoc,
  deleteGoogleDoc,
  GoogleDocFile,
  GoogleDocContent,
} from '../lib/googleDocsService';
import { Transaction, UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';

interface GoogleDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  user: UserProfile;
  transactions: Transaction[];
  uahBalance: number;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const GoogleDocsModal: React.FC<GoogleDocsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  user,
  transactions,
  uahBalance,
  onShowToast,
}) => {
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [docsList, setDocsList] = useState<GoogleDocFile[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [selectedDocContent, setSelectedDocContent] = useState<GoogleDocContent | null>(null);
  const [isLoadingDocContent, setIsLoadingDocContent] = useState(false);

  // New Doc Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('Фінансова виписка Raiffeisen Premier');
  const [isCreating, setIsCreating] = useState(false);

  // Delete Confirmation
  const [docToDelete, setDocToDelete] = useState<GoogleDocFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search filter
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = initAuth(
      (u, token) => {
        setGoogleUser(u);
        setAccessToken(token);
        fetchDocs(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const fetchDocs = async (tokenToUse?: string) => {
    const token = tokenToUse || accessToken;
    if (!token) return;

    setIsLoadingDocs(true);
    try {
      const files = await listGoogleDocs(token);
      setDocsList(files);
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Помилка завантаження документів Google Docs', 'error');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        onShowToast(`Авторизовано через Google: ${res.user.email}`, 'success');
        fetchDocs(res.accessToken);
      }
    } catch (err: any) {
      if (
        err?.code !== 'auth/popup-closed-by-user' &&
        err?.code !== 'auth/cancelled-popup-request' &&
        !err?.message?.includes('popup-closed-by-user')
      ) {
        console.error(err);
        onShowToast('Не вдалося пройти авторизацію Google', 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setAccessToken(null);
    setDocsList([]);
    setSelectedDocContent(null);
    onShowToast('Успішно вийшли з акаунту Google', 'info');
  };

  const handleViewDoc = async (docFile: GoogleDocFile) => {
    if (!accessToken) return;
    setIsLoadingDocContent(true);
    try {
      const content = await getGoogleDoc(accessToken, docFile.id);
      setSelectedDocContent(content);
    } catch (err: any) {
      onShowToast(err.message || 'Помилка зчитування документу', 'error');
    } finally {
      setIsLoadingDocContent(false);
    }
  };

  const handleExportStatementToDoc = async () => {
    if (!accessToken) {
      onShowToast('Будь ласка, спочатку увійдіть у свій Google Акаунт', 'info');
      return;
    }

    setIsCreating(true);
    try {
      const title = `Виписка_Raiffeisen_${new Date().toLocaleDateString('uk-UA').replace(/\./g, '_')}`;

      let reportText = `ОФІЦІЙНА БАНКІВСЬКА ВИПИСКА\n`;
      reportText += `АКЦІОНЕРНЕ ТОВАРИСТВО «РАЙФФАЙЗЕН БАНК»\n`;
      reportText += `Дата створення: ${new Date().toLocaleString('uk-UA')}\n`;
      reportText += `Власник рахунку: ${user.name} (ІПН: ${user.taxNumber})\n`;
      reportText += `Рівень аккаунту: ${user.accountTier}\n`;
      reportText += `Залишок на гривневому рахунку: ${formatCurrency(uahBalance, 'UAH')}\n\n`;
      reportText += `======================================================\n`;
      reportText += `РЕЄСТР ТРАНЗАКЦІЙ ЗА ОСТАННІЙ ПЕРІОД:\n`;
      reportText += `======================================================\n\n`;

      transactions.slice(0, 15).forEach((tx, idx) => {
        reportText += `${idx + 1}. [${tx.date}] ${tx.title}\n`;
        reportText += `   Сума: ${formatCurrency(tx.amount, tx.currency, true)} | Категорія: ${tx.category}\n`;
        reportText += `   ID операції: ${tx.id} | Статус: ${tx.status}\n\n`;
      });

      reportText += `\nЗахищено електронним цифровим підписом СЕП НБУ.\n`;

      const created = await createGoogleDoc(accessToken, title, reportText);
      onShowToast(`Документ «${title}» успішно експортовано в Google Docs!`, 'success');
      setShowCreateModal(false);
      fetchDocs();
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Помилка експорту в Google Docs', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!accessToken || !docToDelete) return;
    setIsDeleting(true);
    try {
      await deleteGoogleDoc(accessToken, docToDelete.id);
      onShowToast(`Документ «${docToDelete.name}» успішно видалено z Google Drive`, 'success');
      setDocToDelete(null);
      if (selectedDocContent?.documentId === docToDelete.id) {
        setSelectedDocContent(null);
      }
      fetchDocs();
    } catch (err: any) {
      onShowToast(err.message || 'Не вдалося видалити документ', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocs = docsList.filter((d) =>
    d.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-sans">
      <div
        className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-none">Google Docs Інтеграція</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  Workspace API
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Експорт банківських виписок, звітів та зберігання у своєму Google Drive
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* AUTH STATUS & GOOGLE SIGN-IN BAR */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {googleUser ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {googleUser.photoURL ? (
                  <img src={googleUser.photoURL} alt="User" className="w-10 h-10 rounded-full border border-neutral-700" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                    {googleUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-white">{googleUser.displayName || googleUser.email}</p>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Авторизовано через Google OAuth
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-white">Увійдіть через Google Акаунт</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Для експорту виписок та роботи з документами Google Docs
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {googleUser ? (
                <>
                  <button
                    onClick={() => fetchDocs()}
                    disabled={isLoadingDocs}
                    className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs transition cursor-pointer"
                    title="Оновити список"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingDocs ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Вийти</span>
                  </button>
                </>
              ) : (
                /* OFFICIAL GOOGLE SIGN IN BUTTON */
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-neutral-800 hover:bg-neutral-100 font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2.5 border border-neutral-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isLoggingIn ? 'Авторизація...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* EXPORT ACTION BANNER */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-neutral-900 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#EEAA00]" />
                <span>Експорт банківської виписки в Google Doc</span>
              </div>
              <p className="text-xs text-neutral-300 mt-1">
                Створіть новий Google Документ з офіційним реєстром усіх останніх транзакцій та балансом
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#EEAA00] text-black font-extrabold text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <FilePlus className="w-4 h-4" />
              <span>Створити Google Doc</span>
            </button>
          </div>

          {/* MAIN DOCS LIST & PREVIEW SPLIT */}
          {googleUser && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Docs Files List (5 cols) */}
              <div className="md:col-span-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-neutral-400">
                    Ваші документи ({filteredDocs.length})
                  </span>
                  {isLoadingDocs && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#EEAA00]" />}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Пошук у Google Docs..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full text-xs py-2 pl-8 pr-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                  />
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
                </div>

                {isLoadingDocs ? (
                  <div className="py-12 text-center text-xs text-neutral-500">Завантаження із Google Drive...</div>
                ) : filteredDocs.length === 0 ? (
                  <div className="py-10 text-center text-xs text-neutral-500 border border-neutral-800 rounded-2xl p-4">
                    Документів Google Docs не знайдено.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {filteredDocs.map((docFile) => {
                      const isSelected = selectedDocContent?.documentId === docFile.id;
                      return (
                        <div
                          key={docFile.id}
                          onClick={() => handleViewDoc(docFile)}
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10 text-white'
                              : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800/80 text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate group-hover:text-blue-300 transition">
                                {docFile.name}
                              </p>
                              <p className="text-[10px] text-neutral-500">
                                {docFile.modifiedTime
                                  ? new Date(docFile.modifiedTime).toLocaleDateString('uk-UA')
                                  : 'Google Doc'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {docFile.webViewLink && (
                              <a
                                href={docFile.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
                                title="Відкрити в Google Docs"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocToDelete(docFile);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                              title="Видалити документ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Document Preview (7 cols) */}
              <div className="md:col-span-7">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 h-full min-h-[380px] flex flex-col">
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-800 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Перегляд вмісту документу
                    </span>
                    {selectedDocContent && (
                      <a
                        href={`https://docs.google.com/document/d/${selectedDocContent.documentId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        Редагувати в Google Docs <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {isLoadingDocContent ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-neutral-400 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#EEAA00]" />
                      <span>Зчитування тексту через Google Docs API...</span>
                    </div>
                  ) : selectedDocContent ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      <h4 className="font-bold text-sm text-white mb-2">{selectedDocContent.title}</h4>
                      <div className="flex-1 overflow-y-auto p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed">
                        {selectedDocContent.bodyText || '(Порожній документ)'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                      <FileText className="w-10 h-10 mb-2 opacity-30 text-blue-400" />
                      <p className="text-xs font-bold">Оберіть документ зі списку ліворуч</p>
                      <p className="text-[11px] text-neutral-600 mt-1">
                        для попереднього перегляду його тексту
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE DOC MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-[#EEAA00]" /> Експорт виписки в Google Doc
              </h4>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Назва нового документа
              </label>
              <input
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
              <p className="font-bold text-white">Включено до виписки:</p>
              <p>• Офіційний реквізит банківського рахунку Raiffeisen</p>
              <p>• {transactions.length} останніх транзакцій із сумами та категоріями</p>
              <p>• Поточний баланс: {formatCurrency(uahBalance, 'UAH')}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleExportStatementToDoc}
                disabled={isCreating}
                className="flex-1 py-2.5 rounded-xl bg-[#EEAA00] text-black font-extrabold text-xs hover:bg-[#ffb700] transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Створити Google Doc</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DESTRUCTION MODAL (MANDATORY REQUIREMENT) */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-neutral-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-extrabold text-base text-white">Видалити файл із Google Drive?</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Ви дійсно бажаєте видалити документ <strong className="text-white">«{docToDelete.name}»</strong>?
                Цю дію неможливо буде скасувати.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-extrabold text-xs hover:bg-red-500 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Видалити</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
