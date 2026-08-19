/**
 * Динамічні імпорти для великих бібліотек
 * Завантажуються тільки коли потрібні
 */

/**
 * PDF генерування (тільки при скачуванні квитанції)
 * Економія: ~50KB на першому завантаженні
 */
export async function loadJsPDF() {
  const { jsPDF } = await import('jspdf');
  return jsPDF;
}

/**
 * Canvas Confetti (тільки при святкуванні успіху)
 * Економія: ~10KB на першому завантаженні
 */
export async function loadConfetti() {
  const confetti = await import('canvas-confetti');
  return confetti.default;
}

/**
 * Лаунч конфетті для спеціальних подій
 */
export async function celebrateSuccess() {
  try {
    const confetti = await loadConfetti();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (error) {
    console.error('Помилка при завантаженні конфетті:', error);
  }
}

/**
 * Приклад використання в компоненті:
 * 
 * const handleDownloadPDF = async () => {
 *   const jsPDF = await loadJsPDF();
 *   const doc = new jsPDF();
 *   // ... логіка
 * }
 */