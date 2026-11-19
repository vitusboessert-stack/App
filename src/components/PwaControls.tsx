import { useEffect, useState } from 'react';
import { Check, Download, Share, WifiOff } from 'lucide-react';
import type { AppLanguage } from '../types/arcana';
import { getT } from '../i18n/translations';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return online;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
    );
  });
  const [isIOS] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  });

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    return outcome === 'accepted';
  };

  return {
    canPromptInstall: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    promptInstall,
  };
}

export function OfflineIndicator({ lang = 'en' }: { lang?: AppLanguage }) {
  const online = useOnlineStatus();
  const t = getT(lang);
  if (online) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b border-white/[0.08] bg-[#241f14] px-3 py-1.5 text-[11px] font-semibold text-[#fbbf24]"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>{t.offlineBanner}</span>
    </div>
  );
}

export function PWAInstallButton({
  lang = 'en',
  variant = 'settings',
}: {
  lang?: AppLanguage;
  variant?: 'settings' | 'compact';
}) {
  const { canPromptInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);
  const t = getT(lang);

  if (isInstalled) {
    if (variant === 'compact') return null;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#192f22] px-3.5 py-1.5 text-xs font-semibold text-[#30d158]">
        <Check className="h-3.5 w-3.5" />
        {t.pwaInstalledBadge}
      </span>
    );
  }

  // In compact header/banner mode, only render when native prompt OR iOS is available
  if (variant === 'compact' && !canPromptInstall && !isIOS) {
    return null;
  }

  const handleClick = () => {
    if (canPromptInstall) {
      void promptInstall();
    } else if (isIOS) {
      setShowIosGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={!canPromptInstall && !isIOS}
        className={
          variant === 'compact'
            ? 'inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#202024] px-3 py-1 text-[11px] font-semibold text-[#f5f5f7] transition-colors hover:bg-[#2a2a30]'
            : 'inline-flex min-h-[38px] items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-1.5 text-xs font-semibold text-[#111114] transition-colors hover:bg-white disabled:bg-[#27272c] disabled:text-[#636369]'
        }
      >
        {isIOS && !canPromptInstall ? <Share className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
        <span>{t.pwaInstallBtn}</span>
      </button>

      {showIosGuide && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/[0.12] bg-[#18181b] p-5 text-left shadow-2xl"
          >
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#242429] text-[#f5f5f7]">
                <Share className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-[#f5f5f7]">{t.pwaIosGuideTitle}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">{t.pwaIosGuideSteps}</p>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="mt-4 min-h-[40px] w-full rounded-full bg-[#f5f5f7] px-4 py-2 text-xs font-semibold text-[#111114] hover:bg-white"
            >
              {t.pwaGotIt}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
