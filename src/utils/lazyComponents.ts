import { lazy, ReactNode } from 'react';

/**
 * Lazy-loaded модальні вікна та сторінки
 * Загальна економія: ~40-50% на FCP/LCP метриках
 */

// Модальні вікна (лінива завантаження)
export const LazyTransferModal = lazy(() => 
  import('../components/TransferModal').then(m => ({ default: m.TransferModal }))
);

export const LazyExchangeModal = lazy(() => 
  import('../components/ExchangeModal').then(m => ({ default: m.ExchangeModal }))
);

export const LazyJarsModal = lazy(() => 
  import('../components/JarsModal').then(m => ({ default: m.JarsModal }))
);

export const LazyCashbackModal = lazy(() => 
  import('../components/CashbackModal').then(m => ({ default: m.CashbackModal }))
);

export const LazyUtilitiesModal = lazy(() => 
  import('../components/UtilitiesModal').then(m => ({ default: m.UtilitiesModal }))
);

export const LazyInstallmentsModal = lazy(() => 
  import('../components/InstallmentsModal').then(m => ({ default: m.InstallmentsModal }))
);

export const LazyMilitaryBondsModal = lazy(() => 
  import('../components/MilitaryBondsModal').then(m => ({ default: m.MilitaryBondsModal }))
);

export const LazyShakeToPayModal = lazy(() => 
  import('../components/ShakeToPayModal').then(m => ({ default: m.ShakeToPayModal }))
);

export const LazyAiAssistantModal = lazy(() => 
  import('../components/AiAssistantModal').then(m => ({ default: m.AiAssistantModal }))
);

export const LazyGoogleDocsModal = lazy(() => 
  import('../components/GoogleDocsModal').then(m => ({ default: m.GoogleDocsModal }))
);

export const LazyCardSettingsModal = lazy(() => 
  import('../components/CardSettingsModal').then(m => ({ default: m.CardSettingsModal }))
);

export const LazyAdminPanelModal = lazy(() => 
  import('../components/AdminPanelModal').then(m => ({ default: m.AdminPanelModal }))
);

export const LazyCreditSystemModal = lazy(() => 
  import('../components/CreditSystemModal').then(m => ({ default: m.CreditSystemModal }))
);

export const LazyScheduledDebitsModal = lazy(() => 
  import('../components/ScheduledDebitsModal').then(m => ({ default: m.ScheduledDebitsModal }))
);

export const LazyAddCardModal = lazy(() => 
  import('../components/AddCardModal').then(m => ({ default: m.AddCardModal }))
);

export const LazyUserProfileModal = lazy(() => 
  import('../components/UserProfileModal').then(m => ({ default: m.UserProfileModal }))
);

export const LazyPwaGuideModal = lazy(() => 
  import('../components/PwaGuideModal').then(m => ({ default: m.PwaGuideModal }))
);