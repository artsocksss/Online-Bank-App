import React, { Suspense as ReactSuspense, ReactNode } from 'react';

/**
 * Компонент завантаження для ленивих компонентів
 */
export const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin">
      <div className="w-8 h-8 border-4 border-[#EEAA00]/20 border-t-[#EEAA00] rounded-full" />
    </div>
  </div>
);

/**
 * Обгортка для ленивих компонентів з fallback UI
 */
interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback = <LoadingFallback />,
}) => (
  <ReactSuspense fallback={fallback}>
    {children}
  </ReactSuspense>
);

/**
 * Приклад використання:
 * 
 * <SuspenseWrapper>
 *   <LazyTransferModal {...props} />
 * </SuspenseWrapper>
 */