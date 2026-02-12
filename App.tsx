import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toPng } from "html-to-image";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { GoogleGenAI } from "@google/genai";
import { AppScreen, UserProgress, DayNote, CheckIn, DevotionalDay, Volume, QuickNote, Entitlements } from './types';
import { VOLUMES, STATUS_GRADIENTS } from './constants';
import { requestNotificationPermission, checkNotificationStatus } from './notifications';




// --- Constants ---
const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/IkqCQlm4gfo1KJWlJaZFch";
const API_BASE_URL = "https://southamerica-east1-luz-da-palavra-app.cloudfunctions.net";




const PRODUCT_DATA: Record<string, { price: number; label: string }> = {
  volume_2: { price: 9.90, label: "Volume 2" },
  volume_3: { price: 9.90, label: "Volume 3" },
  volume_4: { price: 9.90, label: "Volume 4" },
  combo_4: { price: 27.90, label: "Combo Especial (Todos os Volumes)" },
};




// --- Utils ---
function openExternal(url: string) {
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.location.href = url;
  } catch {
    window.location.href = url;
  }
}




const getOrCreateDeviceId = (): string => {
  let id = localStorage.getItem('ldp_device_id');
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 7);
    localStorage.setItem('ldp_device_id', id);
  }
  return id;
};




const isIos = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};




const isStandalone = () => {
  return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator as any).standalone;
};




// --- Assets ---
const QuoteMark = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M28 16H10v18h12c0 8-6 14-14 14v8c14 0 20-10 20-26V16Zm26 0H36v18h12c0 8-6 14-14 14v8c14 0 20-10 20-26V16Z" fill="currentColor" />
  </svg>
);




// --- Components ---




const Button: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, variant = 'primary', className = '', disabled = false }) => {
  const base = "px-6 py-3.5 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm";
  const variants = {
    primary: "bg-soul-accent text-white shadow-sm hover:bg-soul-accent-dark",
    secondary: "bg-white text-soul-text border border-soul-border hover:bg-soul-cream shadow-sm",
    ghost: "bg-transparent text-soul-muted hover:bg-soul-cream",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    accent: "bg-soul-green-deep text-white shadow-sm hover:opacity-90"
  };
  return <button onClick={onClick} className={`${base} ${variants[variant as keyof typeof variants]} ${className}`} disabled={disabled}>{children}</button>;
};




const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl border border-soul-border p-6 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} shadow-sm ${className}`}>{children}</div>
);




const Toast: React.FC<{ message: string; visible: boolean }> = ({ message, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-soul-text text-white px-6 py-3.5 rounded-full shadow-2xl animate-slide-up flex items-center gap-2 whitespace-nowrap">
      <span className="material-symbols-outlined text-soul-accent text-lg">verified</span>
      <span className="text-xs font-semibold">{message}</span>
    </div>
  );
};




// --- App Root ---




export default function App() {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.HOME);
  const deviceId = useMemo(() => getOrCreateDeviceId(), []);
 
  const [selectedVolumeId, setSelectedVolumeId] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>(() => (localStorage.getItem('lp_font_scale') as any) || 'base');




  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);




  // Email Gate State
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('lp_user_email'));
  const [emailInput, setEmailInput] = useState('');
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [postEmailAction, setPostEmailAction] = useState<null | { type: 'community' } | { type: 'purchase'; sku: string }>(null);





  // Notifications State
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('lp_notif_enabled') === 'true');




  // Entitlements State
  const [entitlements, setEntitlements] = useState<Entitlements>(() => {
    const saved = localStorage.getItem('lp_entitlements');
    return saved ? JSON.parse(saved) : { volume_1: true, volume_2: false, volume_3: false, volume_4: false, combo_4: false };
  });




  const [ttsState, setTtsState] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [ttsActiveText, setTtsActiveText] = useState<string | null>(null);
  const [toast, setToast] = useState({ message: '', visible: false });




  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2200);
  };




  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('soul_progress');
    return saved ? JSON.parse(saved) : { currentVolumeId: 1, completedDays: {}, favorites: {}, streak: 0, lastVisitDate: null };
  });




  const [notes, setNotes] = useState<Record<string, DayNote>>(() => JSON.parse(localStorage.getItem('soul_notes') || '{}'));
  const [checkins, setCheckins] = useState<CheckIn[]>(() => JSON.parse(localStorage.getItem('ldp_checkins') || '[]'));
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>(() => JSON.parse(localStorage.getItem('lp_quick_notes') || '[]'));




  useEffect(() => {
    localStorage.setItem('soul_progress', JSON.stringify(userProgress));
    localStorage.setItem('soul_notes', JSON.stringify(notes));
    localStorage.setItem('ldp_checkins', JSON.stringify(checkins));
    localStorage.setItem('lp_quick_notes', JSON.stringify(quickNotes));
    localStorage.setItem('lp_entitlements', JSON.stringify(entitlements));
    localStorage.setItem('lp_font_scale', fontSize);
    localStorage.setItem('lp_notif_enabled', notificationsEnabled.toString());
   
    const root = document.documentElement;
    const fsMap = { sm: '15.2px', base: '16px', lg: '18.4px' };
    root.style.setProperty('--app-fs', fsMap[fontSize]);
  }, [userProgress, notes, checkins, quickNotes, entitlements, fontSize, notificationsEnabled]);




  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);




    // Notification Logic
    if (localStorage.getItem('lp_user_email') && !localStorage.getItem('lp_notif_prompted')) {
      setTimeout(() => setShowNotificationPrompt(true), 3000);
    }




    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);




  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (!userEmail) {
        showToast("Cadastre seu e-mail primeiro");
        return;
      }
      const granted = await requestNotificationPermission(userEmail);
      if (granted) {
        setNotificationsEnabled(true);
        showToast("Notificações ativas! 🙏");
      } else {
        showToast("Permissão negada no navegador.");
      }
    } else {
      setNotificationsEnabled(false);
      showToast("Notificações desativadas.");
    }
  };




  const refreshAccess = async () => {
    if (!userEmail) return;
    setIsRefreshing(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/getAcesso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail.toLowerCase().trim() })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.entitlements) {
          setEntitlements({ ...data.entitlements, volume_1: true });
          showToast("Acessos atualizados! ✨");
        } else {
          showToast("Nenhum novo acesso encontrado.");
        }
      }
    } catch (err) {
      showToast("Erro ao conectar com servidor.");
    } finally {
      setIsRefreshing(false);
    }
  };




  const handlePayment = async (sku: string) => {
    if (!userEmail) {
      setPostEmailAction({ type: 'purchase', sku });
      setShowEmailGate(true);
      return;
    }
    const product = PRODUCT_DATA[sku];
    if (!product) return;




    showToast("Iniciando checkout...");
    try {
      const resp = await fetch(`${API_BASE_URL}/criarPagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail.toLowerCase().trim(),
          produto: sku,
          valor: product.price
        })
      });
      const data = await resp.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        showToast("Erro ao criar preferência.");
      }
    } catch (err) {
      showToast("Falha na conexão.");
    }
  };




  const handleEmailSubmit = () => {
    const email = emailInput.trim();
    if (!email || !email.includes('@')) {
      showToast("Email inválido.");
      return;
    }
    localStorage.setItem('lp_user_email', email);
    setUserEmail(email);
    setShowEmailGate(false);
    showToast("Bem-vindo(a)!");

    const action = postEmailAction;
    setPostEmailAction(null);
    if (action?.type === 'community') {
      setScreen(AppScreen.COMMUNITY);
    } else if (action?.type === 'purchase') {
      setTimeout(() => handlePayment(action.sku), 0);
    }

    // Prompt notification after email
    setTimeout(() => setShowNotificationPrompt(true), 1500);
  };




  const isVolumeUnlocked = (volId: number) => {
    if (volId === 1) return true;
    if (entitlements.combo_4) return true;
    const key = `volume_${volId}` as keyof Entitlements;
    return !!entitlements[key];
  };




  const handleInstall = async () => {
    // Não dá para "forçar" reinstalação se já estiver instalado.
    // Nessa situação, mostramos um guia para ajudar (especialmente idosos).
    if (isStandalone()) {
      setShowInstallHelp(true);
      showToast("O app já está instalado. Veja as instruções 👇");
      return;
    }

    // iOS não dispara beforeinstallprompt. Sempre mostramos o guia.
    if (isIos()) {
      setShowInstallHelp(true);
      return;
    }

    // Android/desktop: se temos o evento, usamos o prompt nativo.
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") showToast("Instalação iniciada ✅");
        else showToast("Instalação cancelada.");
      } catch (e) {
        console.warn("Falha ao chamar prompt de instalação", e);
        setShowInstallHelp(true);
      } finally {
        setDeferredPrompt(null);
      }
      return;
    }

    // Sem evento disponível (ex.: navegador não suporta, usuário já recusou, etc.)
    setShowInstallHelp(true);
  };



  // ===========================
  // Text-to-Speech (TTS) — seguro para Android WebView/Capacitor
  // ===========================
  const hasTTS =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.speechSynthesis?.cancel === "function";


  const ttsStop = () => {
    try {
      if (hasTTS) window.speechSynthesis.cancel();
    } catch (err) {
      console.warn("TTS cancel falhou:", err);
    } finally {
      setTtsState("idle");
      setTtsActiveText(null);
    }
  };


  const ttsPause = () => {
    try {
      if (hasTTS) window.speechSynthesis.pause();
      setTtsState("paused");
    } catch (err) {
      console.warn("TTS pause falhou:", err);
      setTtsState("idle");
      setTtsActiveText(null);
    }
  };


  const ttsResume = () => {
  try {
    window.speechSynthesis.resume();
    setTtsState("speaking");

    // Workaround: em alguns aparelhos, resume() não retoma.
    // Se não estiver falando após um pequeno delay, reinicia o áudio do trecho.
    setTimeout(() => {
      try {
        if (!window.speechSynthesis.speaking && ttsActiveText) {
          startNewSpeech(ttsActiveText);
        }
      } catch (_) {}
    }, 200);
  } catch {
    // Se der ruim, reinicia
    if (ttsActiveText) startNewSpeech(ttsActiveText);
  }
};


  const startNewSpeech = (text: string) => {
    if (!hasTTS) {
      showToast("Leitura em voz alta (TTS) não disponível neste dispositivo.");
      return;
    }


    try {
      // Cancela qualquer fala anterior
      window.speechSynthesis.cancel();


      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.95;


      utterance.onstart = () => {
        setTtsState("speaking");
        setTtsActiveText(text);
      };
      utterance.onend = () => {
        setTtsState("idle");
        setTtsActiveText(null);
      };
      utterance.onerror = () => {
        setTtsState("idle");
        setTtsActiveText(null);
      };


      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Falha ao iniciar TTS:", err);
      setTtsState("idle");
      setTtsActiveText(null);
      showToast("Falha ao iniciar a leitura em voz alta.");
    }
  };


  const ttsToggle = (text: string) => {
    if (!hasTTS) {
      showToast("Leitura em voz alta (TTS) não disponível neste dispositivo.");
      return;
    }


    // Se clicou no mesmo texto, alterna entre falar/pausar/retomar
    if (ttsActiveText === text) {
      if (ttsState === "speaking") ttsPause();
      else if (ttsState === "paused") ttsResume();
      else startNewSpeech(text);
      return;
    }


    // Se é um novo texto, começa de novo
    startNewSpeech(text);
  };










  useEffect(() => { if (screen !== AppScreen.READER) ttsStop(); }, [screen]);




  const currentVolume = VOLUMES.find(v => v.id === selectedVolumeId) || VOLUMES[0];
  const currentDayData = currentVolume.days.find(d => d.dia === selectedDay) || null;




  const handleAddQuickNote = (text: string) => {
    const newNote = { date: new Date().toISOString(), text };
    setQuickNotes(prev => [...prev.slice(-29), newNote]);
    showToast("Nota salva ✨");
  };




  const renderContent = () => {
    switch (screen) {
      case AppScreen.HOME: return (
        <div className="animate-fade-in p-6">
          <header className="mb-10 flex justify-between items-start pt-4">
            <div className="flex-1">
              <h2 className="text-[10px] font-bold text-soul-accent tracking-widest uppercase mb-2">Luz da Palavra</h2>
              <h1 className="font-serif text-[2.4rem] italic text-soul-text leading-tight tracking-tight">Cuidado espiritual para sua alma</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleInstall} className="p-3 bg-soul-cream rounded-full text-soul-text active:scale-90 transition-transform" aria-label="Instalar app" title="Instalar app"><span className="material-symbols-outlined text-lg">install_mobile</span></button>

              <button
                onClick={() => setScreen(AppScreen.SETTINGS)}
                className="p-3 bg-soul-cream rounded-full text-soul-text active:scale-90 transition-transform"
                aria-label="Ajustes"
                title="Ajustes"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
              </button>
            </div>
          </header>

          {/* Instalação (PWA) — CTA visível no início */}
          {!isStandalone() && (
            <div className="mt-6">
              <Card className="bg-soul-accent/5 border-soul-accent/20">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-soul-accent text-2xl">download</span>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-soul-muted mb-1">Instalação</p>
                    <h3 className="font-serif text-xl font-semibold italic mb-1">Baixe o app no seu celular</h3>
                    <p className="text-sm text-soul-muted leading-relaxed">
                      Instale para abrir mais rápido (sem precisar do navegador).
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <Button onClick={handleInstall} variant="secondary" className="w-full h-12">
                    Baixar / Instalar
                  </Button>
                </div>
              </Card>
            </div>
          )}





          {/* CTA de instalação removido (botão fica no topo) */}




          <section className="mb-10">
            <h3 className="text-soul-text text-xs font-bold mb-5 uppercase tracking-widest">Suas trilhas</h3>
            <div className="space-y-6">
              {/* Render Volumes 1, 2, 3, 4 first */}
              {VOLUMES.map((vol) => {
                const isUnlocked = isVolumeUnlocked(vol.id);
                // Volume 1 and Unlocked Volumes
                if (vol.id === 1 || isUnlocked) {
                   return (
                      <div key={vol.id} onClick={() => { setSelectedVolumeId(vol.id); setScreen(AppScreen.DAY_LIST); }} className={`relative h-56 rounded-3xl overflow-hidden cursor-pointer shadow-sm transition-all active:scale-[0.99]`}>
                        <img src={vol.imageUrl} className={`absolute inset-0 w-full h-full object-cover`} alt={vol.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                          <h4 className="text-white font-serif text-2xl font-semibold leading-tight">{vol.title}</h4>
                          <p className="text-white/70 text-xs font-medium mt-1">{vol.subtitle}</p>
                        </div>
                      </div>
                   )
                }
               
                // Locked Volumes
                return (
                  <div key={vol.id} className="group relative">
                    <div onClick={() => { }} className={`relative h-56 rounded-3xl overflow-hidden shadow-sm transition-all brightness-[0.6]`}>
                      <img src={vol.imageUrl} className={`absolute inset-0 w-full h-full object-cover`} alt={vol.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                        <h4 className="text-white font-serif text-2xl font-semibold leading-tight">{vol.title}</h4>
                        <p className="text-white/70 text-xs font-medium mt-1">{vol.subtitle}</p>
                      </div>
                    </div>
                   
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                         <span className="material-symbols-outlined text-white text-3xl mb-3">lock</span>
                         <Button onClick={() => handlePayment(`volume_${vol.id}`)} variant="primary" className="h-10 px-4 pointer-events-auto shadow-xl">
                           Liberar • R$ 9,90
                         </Button>
                    </div>
                  </div>
                );
              })}




              {/* COMBO FULL — PREMIUM DISCRETE DESIGN — ALWAYS AT THE END */}
              {!entitlements.combo_4 && (
                <div className="group relative">
                   <div
                      onClick={() => handlePayment('combo_4')}
                      className="relative h-56 rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all active:scale-[0.98] border-2 border-[#D4AF37]/25"
                   >
                     {/* Soft premium spiritual background */}
                     <img
                        src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
  className="absolute inset-0 w-full h-full object-cover"
  alt="Combo Completo"
                     />
                     
                     {/* Elegant dark gradient overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-between p-6">
                        <div className="flex justify-start">
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-white rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/20 shadow-sm">
                              🔥 Melhor valor
                           </span>
                        </div>
                       
                        <div className="flex flex-col gap-1">
                           <h4 className="text-white font-serif text-3xl font-bold leading-tight italic tracking-tight">Combo completo</h4>
                           <p className="text-white/70 text-xs font-medium">Todos os devocionais liberados</p>
                           
                           <div className="mt-4">
                              <Button
                                 onClick={() => handlePayment('combo_4')}
                                 variant="primary"
                                 className="w-full h-14 bg-soul-accent hover:bg-soul-accent-dark border-none shadow-lg text-sm"
                              >
                                Desbloquear todos — R$ 27,90
                              </Button>
                           </div>
                        </div>
                     </div>
                   </div>
                </div>
              )}
            </div>
          </section>
        </div>
      );
      case AppScreen.DAY_LIST: return <DayListScreen onNavigate={setScreen} currentVolume={currentVolume} completedDays={userProgress.completedDays[currentVolume.id] || []} onSelectDay={setSelectedDay} />;
      case AppScreen.READER:
        return currentDayData ? (
          <ReaderScreen onNavigate={setScreen} dayData={currentDayData} isFavorite={userProgress.favorites[currentVolume.id]?.includes(selectedDay) || false} onToggleFavorite={() => {
            let added = false;
            setUserProgress(prev => {
              const volFavs = prev.favorites[currentVolume.id] || [];
              const exists = volFavs.includes(selectedDay);
              added = !exists;
              const newFavs = exists ? volFavs.filter(d => d !== selectedDay) : [...volFavs, selectedDay];
              return { ...prev, favorites: { ...prev.favorites, [currentVolume.id]: newFavs } };
            });
            showToast(added ? "Favoritado ❤️" : "Removido 💔");
          }} onMarkAsRead={() => {
            setUserProgress(prev => {
              const volId = currentVolume.id;
              const volCompleted = prev.completedDays[volId] || [];
              if (volCompleted.includes(selectedDay)) return prev;
              const newCompleted = { ...prev.completedDays, [volId]: [...volCompleted, selectedDay] };
              const today = new Date().toDateString();
              let newStreak = prev.streak;
              if (prev.lastVisitDate !== today) newStreak += 1;
              return { ...prev, completedDays: newCompleted, streak: newStreak, lastVisitDate: today };
            });
            showToast("Leitura concluída ✅");
          }} isConcluded={userProgress.completedDays[currentVolume.id]?.includes(selectedDay) || false} tts={{ state: ttsState, activeText: ttsActiveText, toggle: ttsToggle, stop: ttsStop }} />
        ) : null;
      case AppScreen.STATUS_GEN: return <StatusGenerator dayData={currentDayData} volumeId={currentVolume.id} userProgress={userProgress} onClose={() => setScreen(AppScreen.READER)} onShowToast={showToast} />;
      case AppScreen.PROGRESS: return (
        <ProgressScreen userProgress={userProgress} checkins={checkins} quickNotes={quickNotes} onAddCheckIn={(emoji) => {
          const today = new Date().toISOString().split('T')[0];
          setCheckins(prev => {
            const exists = prev.findIndex(c => c.date === today);
            if (exists > -1) { const copy = [...prev]; copy[exists].emoji = emoji; return copy; }
            return [...prev, { date: today, emoji }];
          });
          showToast("Estado salvo ✨");
        }} onAddQuickNote={handleAddQuickNote} onNavigate={setScreen} />
      );
      case AppScreen.COMMUNITY: return (
        <CommunityScreen onShowToast={showToast} />
      );
      case AppScreen.SETTINGS: return (
        <div className="animate-fade-in p-6 pb-24">
          <h1 className="font-serif text-3xl font-semibold italic mb-10 pt-4">Ajustes</h1>
         
          <section className="mb-10">
             <h3 className="text-[10px] font-bold text-soul-muted uppercase tracking-widest mb-4">Notificações</h3>
             <Card className="flex items-center justify-between py-4">
                <div className="flex flex-col">
                   <p className="text-sm font-semibold">Devocional Diário</p>
                   <p className="text-[10px] text-soul-muted uppercase font-bold">Lembrete às 07:00</p>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-soul-green-deep' : 'bg-soul-border'}`}
                >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
                </button>
             </Card>
          </section>




          <section className="mb-10">
             <h3 className="text-[10px] font-bold text-soul-muted uppercase tracking-widest mb-4">Minha Conta</h3>
             <Card className="space-y-4">
                <div className="flex flex-col">
                   <p className="text-[10px] text-soul-muted font-bold uppercase mb-1">E-mail de acesso</p>
                   <p className="text-sm font-semibold">{userEmail || "Não cadastrado"}</p>
                </div>
                <div className="pt-4 border-t border-soul-border flex flex-col gap-3">
                   <Button onClick={refreshAccess} variant="accent" disabled={isRefreshing} className="w-full h-12">
                     <span className="material-symbols-outlined text-sm">{isRefreshing ? 'sync' : 'refresh'}</span>
                     {isRefreshing ? 'Atualizando...' : 'Já paguei / Atualizar acesso'}
                   </Button>
                </div>
             </Card>
          </section>




          <section className="mb-10">
            <h3 className="text-[10px] font-bold text-soul-muted uppercase tracking-widest mb-4">Visual</h3>
            <Card className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Tamanho da Fonte</span>
                <div className="flex bg-soul-cream rounded-xl p-1">
                  {['sm', 'base', 'lg'].map(s => (
                    <button key={s} onClick={() => setFontSize(s as any)} className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all ${fontSize === s ? 'bg-white shadow-sm text-soul-accent' : 'text-soul-muted'}`}>
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </section>




          <Button onClick={() => { if(confirm("Deseja apagar todos os dados locais?")){ localStorage.clear(); window.location.reload(); } }} variant="danger" className="w-full">Resetar Dados Locais</Button>
        </div>
      );
      case AppScreen.ACTIVATE_ACCESS: return (
        <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
          <span className="material-symbols-outlined text-soul-accent text-5xl mb-6">vpn_key</span>
          <h1 className="font-serif text-2xl font-semibold italic mb-4">Código de Acesso</h1>
          <p className="text-sm text-soul-muted mb-8">Se você recebeu um código promocional, insira-o abaixo.</p>
          <input className="w-full bg-soul-cream p-5 rounded-2xl border border-soul-border mb-6 text-center font-bold tracking-[0.4em] outline-none focus:border-soul-accent transition-colors" placeholder="CÓDIGO" />
          <div className="flex flex-col gap-3 w-full">
            <Button onClick={() => { setEntitlements(v => ({...v, volume_2: true, volume_3: true, volume_4: true})); showToast("Liberado! ✨"); setScreen(AppScreen.HOME); }} className="h-14">Ativar</Button>
            <Button onClick={() => setScreen(AppScreen.HOME)} variant="ghost">Voltar</Button>
          </div>
        </div>
      );
      case AppScreen.NOTES: return <NotesScreen dayData={currentDayData} note={notes[`${currentVolume.id}_${selectedDay}`] || { godSpoke: '', surrender: '', practicalStep: '' }} onSave={(f, v) => setNotes(p => ({ ...p, [`${currentVolume.id}_${selectedDay}`]: { ...(p[`${currentVolume.id}_${selectedDay}`] || {}), [f]: v }}))} onBack={() => setScreen(AppScreen.READER)} />;
      default: return null;
    }
  };




  return (
    <div className="min-h-screen max-w-md mx-auto bg-soul-beige flex flex-col hide-scrollbar overflow-x-hidden relative">
      <main className="flex-1 pb-24 overflow-y-auto hide-scrollbar">{renderContent()}</main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-md bg-white/95 backdrop-blur-xl border-t border-soul-border px-2 py-4 flex justify-between items-center z-[80] shadow-xl">
        {[
          { screen: AppScreen.HOME, icon: 'home', label: 'Início' },
          { screen: AppScreen.PROGRESS, icon: 'analytics', label: 'Progresso' },
          { screen: AppScreen.COMMUNITY, icon: 'diversity_3', label: 'Comu' },
          { screen: AppScreen.SETTINGS, icon: 'settings', label: 'Ajustes' }
        ].map((item) => (
          <button key={item.screen} onClick={() => {
                if (item.screen === AppScreen.COMMUNITY && !userEmail) {
                  setPostEmailAction({ type: 'community' });
                  setShowEmailGate(true);
                  return;
                }
                setScreen(item.screen);
              }} className={`flex flex-col items-center gap-1.5 flex-1 ${screen === item.screen ? 'text-soul-accent' : 'text-soul-muted'}`}>
            <span className={`material-symbols-outlined text-2xl ${screen === item.screen ? 'fill-1' : ''}`}>{item.icon}</span>
            <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
      <Toast message={toast.message} visible={toast.visible} />




      {/* Notification Modal */}
      {showNotificationPrompt && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
           <div className="w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl text-center">
              <span className="material-symbols-outlined text-soul-accent text-5xl mb-6">notifications_active</span>
              <h3 className="font-serif text-2xl font-semibold italic mb-4">Devocional Diário</h3>
              <p className="text-sm text-soul-muted mb-8 leading-relaxed">Deseja receber um lembrete todos os dias às 07:00 com sua palavra?</p>
              <div className="flex flex-col gap-3">
                 <Button onClick={() => { handleToggleNotifications(); setShowNotificationPrompt(false); localStorage.setItem('lp_notif_prompted', 'true'); }} className="h-14">Sim, receber 🙏</Button>
                 <Button onClick={() => { setShowNotificationPrompt(false); localStorage.setItem('lp_notif_prompted', 'true'); }} variant="ghost">Agora não</Button>
              </div>
           </div>
        </div>
      )}




      {/* Email Gate Modal */}
      {showEmailGate && !userEmail && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
           <div className="w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl">
              <div className="text-center mb-8">
                 <h3 className="font-serif text-3xl font-semibold italic mb-3">Bem-vindo(a)</h3>
                 <p className="text-sm text-soul-muted leading-relaxed">Informe seu e-mail para salvar seu progresso e sincronizar seus acessos.</p>
              </div>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-soul-cream p-5 rounded-2xl border border-soul-border mb-6 text-center outline-none focus:border-soul-accent transition-colors"
              />
              <Button onClick={handleEmailSubmit} className="w-full h-16">Continuar</Button>
           </div>
        </div>
      )}




      {/* iOS Install Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 p-6 animate-fade-in" onClick={() => setShowIosModal(false)}>
      {showInstallHelp && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 p-6 animate-fade-in" onClick={() => setShowInstallHelp(false)}>
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 pb-10 shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-soul-border rounded-full mx-auto mb-6" />
            <h3 className="font-serif text-2xl font-semibold italic mb-3">Adicionar à Tela Inicial</h3>
            <p className="text-sm text-soul-muted leading-relaxed mb-6">
              Por segurança, o navegador não permite “forçar” a instalação automaticamente. Mas é bem rápido:
            </p>

            {!isIos() ? (
              <div className="space-y-3 text-sm text-soul-text mb-6">
                <p className="font-semibold">Android (Chrome)</p>
                <ol className="list-decimal pl-5 space-y-2 text-soul-muted">
                  <li>Toque no menu <b>⋮</b> do navegador.</li>
                  <li>Toque em <b>“Instalar app”</b> ou <b>“Adicionar à tela inicial”</b>.</li>
                  <li>Confirme em <b>Adicionar</b>.</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-soul-text mb-6">
                <p className="font-semibold">iPhone (Safari)</p>
                <ol className="list-decimal pl-5 space-y-2 text-soul-muted">
                  <li>Toque no botão de <b>Compartilhar</b> (quadrado com seta para cima).</li>
                  <li>Role e toque em <b>“Adicionar à Tela de Início”</b>.</li>
                  <li>Confirme em <b>Adicionar</b>.</li>
                </ol>
              </div>
            )}

            <Button onClick={() => setShowInstallHelp(false)} className="w-full h-14 shadow-sm">
              Entendi
            </Button>

            <p className="text-[11px] text-soul-muted mt-4 leading-relaxed">
              Se você já instalou antes e não aparece o ícone, procure por <b>“Luz da Palavra”</b> na lista de apps
              ou use a busca do celular.
            </p>
          </div>
        </div>
      )}

           <div className="w-full bg-white rounded-[32px] p-8 pb-10 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1 bg-soul-border rounded-full mx-auto mb-6" />
              <div className="text-center mb-6">
                 <span className="material-symbols-outlined text-soul-accent text-5xl mb-4">install_mobile</span>
                 <h3 className="font-serif text-2xl font-semibold italic mb-2">Instalar no iPhone</h3>
                 <p className="text-sm text-soul-muted">Siga os passos abaixo para ter acesso rápido:</p>
              </div>
              <div className="space-y-6 mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-soul-cream flex items-center justify-center font-bold text-soul-accent">1</div>
                    <p className="text-sm">Toque no ícone de <span className="material-symbols-outlined text-[18px] align-middle">ios_share</span> Compartilhar</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-soul-cream flex items-center justify-center font-bold text-soul-accent">2</div>
                    <p className="text-sm">Role e selecione <span className="font-bold">"Adicionar à Tela de Início"</span></p>
                 </div>
              </div>
              <Button onClick={() => setShowIosModal(false)} className="w-full h-14">Entendido</Button>
           </div>
        </div>
      )}
    </div>
  );
}




// --- SubScreens ---




const ReaderScreen: React.FC<any> = ({ onNavigate, dayData, isFavorite, onToggleFavorite, onMarkAsRead, isConcluded, tts }) => {
  const fullText = `${dayData.titulo}. ${dayData.versiculo}. ${dayData.leitura}. Oração: ${dayData.oracao}`;
  const isCurrentlyPlaying = tts.activeText === fullText && tts.state === 'speaking';
 
  return (
    <div className="animate-fade-in p-6 pb-32 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-10 pt-4">
        <button onClick={() => onNavigate(AppScreen.HOME)} className="p-3 bg-soul-cream/50 rounded-full text-soul-text"><span className="material-symbols-outlined text-lg">close</span></button>
        <div className="flex gap-4 items-center">
          <div className="flex items-center bg-soul-cream rounded-full px-2 py-1">
            <button onClick={() => tts.toggle(fullText)} className="text-soul-accent p-2 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-xl">{isCurrentlyPlaying ? 'pause_circle' : 'play_circle'}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-1">{isCurrentlyPlaying ? 'Pausar' : tts.activeText === fullText ? 'Retomar' : 'Ouvir'}</span>
            </button>
            {tts.activeText === fullText && <button onClick={tts.stop} className="text-soul-muted p-2"><span className="material-symbols-outlined text-lg">stop</span></button>}
          </div>
          <button onClick={onToggleFavorite} className={`p-3 rounded-full ${isFavorite ? 'text-soul-accent bg-soul-accent/10' : 'text-soul-muted bg-soul-cream/50'}`}><span className={`material-symbols-outlined text-lg ${isFavorite ? 'fill-1' : ''}`}>favorite</span></button>
        </div>
      </div>
      <header className="mb-14 text-center max-w-sm mx-auto">
        <p className="text-soul-accent font-bold tracking-[0.2em] text-[10px] uppercase mb-3">Dia {dayData.dia}</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight mb-8 tracking-tight">{dayData.titulo}</h1>
        <div className="p-8 bg-soul-cream/30 rounded-[32px] italic text-soul-text text-lg leading-relaxed border border-soul-border/50 font-serif">“{dayData.versiculo}”<p className="mt-4 text-[10px] font-sans font-bold uppercase not-italic opacity-40 tracking-widest">— {dayData.referencia}</p></div>
      </header>
      <section className="space-y-12 text-soul-text mb-20">
        <div><h5 className="text-[10px] uppercase font-bold tracking-[0.3em] text-soul-muted mb-6 border-b border-soul-border pb-3">Leitura Diária</h5><p className="whitespace-pre-line text-lg leading-[1.8] font-light">{dayData.leitura}</p></div>
        <div className="bg-soul-green-soft p-8 rounded-[32px] border border-soul-border/40"><h5 className="text-[10px] uppercase font-bold tracking-[0.3em] text-soul-green-deep mb-5">Aplicação</h5><p className="italic text-soul-text whitespace-pre-line text-lg leading-relaxed">{dayData.aplicacao}</p></div>
        <div className="py-16 border-y border-soul-border text-center flex flex-col items-center"><QuoteMark className="h-10 w-10 text-soul-accent mb-6 opacity-30" /><h4 className="font-serif text-3xl italic font-semibold text-soul-text px-6 leading-tight">{dayData.fraseAncora}</h4></div>
      </section>
      <div className="space-y-4">
        <Button onClick={() => onNavigate(AppScreen.NOTES)} className="w-full"><span className="material-symbols-outlined text-sm">edit_note</span> Minhas Anotações</Button>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={onMarkAsRead} variant={isConcluded ? 'ghost' : 'secondary'} disabled={isConcluded}>{isConcluded ? 'Concluído' : 'Concluir'}</Button>
          <Button onClick={() => onNavigate(AppScreen.STATUS_GEN)} variant="secondary">Gerar Status</Button>
        </div>
      </div>
    </div>
  );
};




const StatusGenerator: React.FC<any> = ({ dayData, volumeId, userProgress, onClose, onShowToast }) => {
  const [selectedGradient, setSelectedGradient] = useState(STATUS_GRADIENTS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [aiLoadingMessage, setAiLoadingMessage] = useState("Preparando design espiritual...");
  const [isDownloading, setIsDownloading] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<'story' | 'feed'>('story');




  if (!dayData) return null;




  const handleGenerateAiBackground = async () => {
    setIsAiGenerating(true);
    setAiLoadingMessage("Inspirando a IA com sua jornada...");
   
    const loadingMessages = [
      "Ajustando a luz divina...",
      "Criando uma atmosfera de paz...",
      "Refinando os detalhes cinematográficos...",
      "Quase pronto para sua alma..."
    ];
    let msgIndex = 0;
    const interval = setInterval(() => {
       msgIndex = (msgIndex + 1) % loadingMessages.length;
       setAiLoadingMessage(loadingMessages[msgIndex]);
    }, 2500);




    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Prompt based on user requirements for premium devotional background
      const prompt = `A ultra-high quality, premium Christian devotional background image. Dark cinematic atmosphere with deep contrast. Soft, ethereal golden light rays shining from the top corner. Subtle bokeh effects and floating light particles. Modern, elegant, and spiritual vibe. Minimalist. Specifically designed as a backdrop for a faith-based app card. No text in the image. 1:1 aspect ratio. High resolution.`;
     
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
      });




      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setAiGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          onShowToast("Fundo Premium IA aplicado! ✨");
          break;
        }
      }
    } catch (err) {
      console.error(err);
      onShowToast("Erro ao gerar fundo IA. Usando gradiente.");
    } finally {
      clearInterval(interval);
      setIsAiGenerating(false);
    }
  };




  const copyToClipboard = async (text: string): Promise<boolean> => {
    // 1) Clipboard API
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}

    // 2) Fallback via textarea + execCommand
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.left = "0";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {}

    return false;
  };

  const handleCopyCaption = async () => {
    const caption = `📖 Luz da Palavra — Dia ${dayData.dia} (Vol ${volumeId})

"${dayData.fraseAncora}"
${dayData.referencia}

✅ Progresso: ${dayData.dia}/7

Baixe o app: luzdapalavra.app #LuzDaPalavra #Devocional #Fé`;

    const ok = await copyToClipboard(caption);

    if (ok) {
      onShowToast?.("Legenda copiada! ✨");
      return;
    }

    // Último fallback: abre um prompt com o texto para copiar manualmente
    try {
      window.prompt("Copie a legenda abaixo:", caption);
      onShowToast?.("Copie e cole no WhatsApp 🙏");
    } catch (_) {
      onShowToast?.("Não consegui copiar automaticamente 😕");
    }
  };




    const handleDownload = async () => {
    if (!statusRef.current) return;

    setIsDownloading(true);
    try {
      // Gera a imagem do status como PNG (base64)
      const exportW = 1080;
      const exportH = format === "story" ? 1920 : 1080;

      const dataUrl = await toPng(statusRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: exportW,
        height: exportH,
        // Remover o scale do preview para exportar em resolução cheia
        style: {
          transform: "none",
          transformOrigin: "top left",
        },
        skipFonts: true,
        backgroundColor: "#ffffff",
      });

      // No app (Capacitor), "download" via <a> não funciona bem.
      // Aqui a gente salva em cache e abre o compartilhamento do Android (WhatsApp/Stories/etc).
      if (Capacitor.isNativePlatform()) {
        const base64 = dataUrl.split(",")[1];
        const fileName = `luz-da-palavra-status-dia-${dayData.dia}.png`;

        await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Cache,
        });

        const { uri } = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Cache,
        });

        await Share.share({
          title: "Luz da Palavra",
          text: "Status • Luz da Palavra",
          url: uri,
          dialogTitle: "Compartilhar status",
        });

        onShowToast?.("Status pronto para compartilhar ✅");
        return;
      }

      // Web (fora do app) — baixa normalmente
      const link = document.createElement("a");
      link.download = `status-dia-${dayData.dia}.png`;
      link.href = dataUrl;
      link.click();
      onShowToast?.("Download iniciado ✅");
    } catch (error) {
      const msg = String((error as any)?.message ?? error ?? "");
      // Em alguns Androids o plugin pode retornar "Share canceled" mesmo após abrir o WhatsApp
      if (msg.toLowerCase().includes("share canceled")) {
        onShowToast?.("Compartilhamento cancelado.");
      } else {
        console.error("Erro ao gerar/baixar status", error);
        onShowToast?.("Erro ao gerar o status 😕");
      }
    } finally {
      setIsDownloading(false);
    }
  };




  const isDark = aiGeneratedImage ? true : selectedGradient.tone === 'dark';




  return (
    <div className="fixed inset-0 z-[150] bg-soul-beige overflow-y-auto animate-fade-in">
      <div className="p-6 pb-32 max-w-md mx-auto min-h-screen">
        <header className="flex justify-between items-center mb-8 pt-4">
          <button onClick={onClose} className="p-2 -ml-2 text-soul-muted"><span className="material-symbols-outlined">close</span></button>
          <h2 className="font-serif text-xl font-semibold italic">Gerar Status</h2>
          <div className="w-8" />
        </header>




        <div className="flex gap-2 mb-6 bg-soul-cream p-1 rounded-2xl">
          <button onClick={() => setFormat('story')} className={`flex-1 py-3 text-[10px] font-bold rounded-xl ${format === 'story' ? 'bg-white shadow-sm text-soul-accent' : 'text-soul-muted'}`}>STORY (9:16)</button>
          <button onClick={() => setFormat('feed')} className={`flex-1 py-3 text-[10px] font-bold rounded-xl ${format === 'feed' ? 'bg-white shadow-sm text-soul-accent' : 'text-soul-muted'}`}>FEED (1:1)</button>
        </div>




        <div className={`mb-10 shadow-2xl rounded-[32px] overflow-hidden relative mx-auto bg-white border-2 border-soul-border/30`} style={{ width: '300px', height: format === 'story' ? '533px' : '300px' }}>
          {isAiGenerating && (
             <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                <p className="text-white text-[10px] font-bold uppercase tracking-widest animate-pulse">{aiLoadingMessage}</p>
             </div>
          )}
          <div ref={statusRef} className={`flex flex-col justify-between items-center text-center p-20`} style={{ background: aiGeneratedImage ? `url(${aiGeneratedImage}) center/cover no-repeat` : selectedGradient.css, width: '1080px', height: format === 'story' ? '1920px' : '1080px', position: 'absolute', top: 0, left: 0, transform: `scale(${300/1080})`, transformOrigin: 'top left', zIndex: 1 }}>
            <div className="w-full mt-10">
              <p className={`text-[32px] font-bold uppercase tracking-[0.4em] mb-6 ${isDark ? 'text-white/40' : 'text-black/30'}`}>Luz da Palavra</p>
              <div className={`inline-flex items-center gap-4 px-10 py-4 rounded-full border-2 ${isDark ? 'border-white/20 bg-white/10 text-white' : 'border-black/5 bg-black/5 text-soul-text'} text-[32px] font-bold uppercase tracking-widest`}>
                <span>Dia {dayData.dia}/7</span>
                <span className="opacity-30">•</span>
                <span>Volume {volumeId}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-12 w-full max-w-[900px]">
              <QuoteMark className={`h-48 w-48 opacity-20 ${isDark ? 'text-white' : 'text-soul-accent'}`} />
              <h4 className={`font-serif ${format === 'story' ? 'text-[92px]' : 'text-[72px]'} italic font-medium leading-tight px-10 ${isDark ? 'text-white/90' : 'text-soul-text'}`}>“{dayData.fraseAncora}”</h4>
              <p className={`text-[36px] font-bold uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-soul-muted'}`}>📖 {dayData.referencia}</p>
            </div>
            <div className="w-full mb-10">
              <div className={`h-[3px] w-32 mx-auto mb-10 ${isDark ? 'bg-white/20' : 'bg-black/10'}`} />
              <p className={`text-[28px] font-bold uppercase tracking-[0.4em] ${isDark ? 'text-white/60' : 'text-soul-muted'}`}>luzdapalavra.app</p>
            </div>
          </div>
        </div>




        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-bold text-soul-muted uppercase tracking-widest">Estilo do Card</h3>
            <button onClick={handleGenerateAiBackground} disabled={isAiGenerating} className="flex items-center gap-1.5 text-[9px] font-bold text-soul-accent uppercase tracking-widest bg-soul-accent/5 px-3 py-1.5 rounded-full border border-soul-accent/20 active:scale-95 transition-all">
               <span className="material-symbols-outlined text-[14px]">{isAiGenerating ? 'sync' : 'auto_awesome'}</span>
               IA Premium
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {STATUS_GRADIENTS.map((grad) => (
              <button key={grad.id} onClick={() => { setAiGeneratedImage(null); setSelectedGradient(grad); }} className={`aspect-square rounded-xl border-2 transition-all ${!aiGeneratedImage && selectedGradient.id === grad.id ? 'border-soul-accent scale-105 shadow-md' : 'border-transparent'}`} style={{ background: grad.css }} />
            ))}
          </div>
        </section>




        <div className="space-y-4">
            <Button onClick={handleDownload} disabled={isDownloading || isAiGenerating} className="w-full h-16 shadow-xl">
                <span className="material-symbols-outlined">{isGenerating ? 'sync' : 'download'}</span>
                {isGenerating ? 'Baixando...' : 'Baixar Imagem (1080px)'}
            </Button>
            <Button onClick={handleCopyCaption} variant="ghost" className="w-full h-12">Copiar Legenda Ideal</Button>
        </div>
      </div>
    </div>
  );
};




const CommunityScreen: React.FC<any> = ({ onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);




  const handleSearch = (customQuery?: string) => {
    const baseQuery = customQuery || `Igreja Cristã ${searchQuery}`.trim();
    if (!baseQuery || baseQuery === 'Igreja Cristã') {
        onShowToast("Digite um local ou escolha uma categoria.");
        return;
    }
    openExternal(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(baseQuery)}`);
  };




  const handleUseLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      onShowToast("Geolocalização não suportada.");
      setIsLocating(false);
      return;
    }




    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        openExternal(`https://www.google.com/maps/search/?api=1&query=Igreja+perto+de+mim&ll=${latitude},${longitude}`);
      },
      (err) => {
        setIsLocating(false);
        onShowToast("Erro ao obter localização. Tente busca manual.");
      },
      { timeout: 8000 }
    );
  };




  return (
    <div className="animate-fade-in p-6 pb-24">
      <h1 className="font-serif text-3xl font-semibold italic mb-8 pt-4">Comunidade</h1>
     
      <section className="mb-10">
        <h3 className="text-[10px] font-bold text-soul-muted uppercase tracking-widest mb-4">Conexão</h3>
        <Card className="border-soul-accent/20 bg-soul-accent/5">
          <div className="flex flex-col gap-2 mb-6">
            <h4 className="font-serif text-2xl font-semibold italic">WhatsApp Oficial</h4>
            <p className="text-sm text-soul-muted leading-relaxed">Comunhão diária e avisos exclusivos para os alunos da trilha.</p>
          </div>
          <Button onClick={() => { onShowToast("Abrindo WhatsApp... ✨"); openExternal(WHATSAPP_COMMUNITY_URL); }} className="w-full h-14"> Entrar no Grupo </Button>
        </Card>
      </section>




      <section className="mb-10">
        <h3 className="text-[10px] font-bold text-soul-muted uppercase tracking-widest mb-4">Igrejas perto de mim</h3>
        <Card className="space-y-6">
            <div className="space-y-3">
                <div className="relative">
                   <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cidade, bairro ou CEP..." className="w-full bg-soul-cream p-4 pr-12 rounded-xl border border-soul-border text-sm outline-none focus:border-soul-accent transition-colors" />
                   <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-soul-muted">search</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => handleSearch()} variant="secondary" className="h-12 text-xs">Pesquisar</Button>
                    <Button onClick={handleUseLocation} disabled={isLocating} variant="ghost" className="h-12 text-xs border border-soul-border">
                        <span className="material-symbols-outlined text-sm">{isLocating ? 'sync' : 'my_location'}</span> Localizar
                    </Button>
                </div>
            </div>
            <div className="pt-4 border-t border-soul-border">
                <p className="text-[10px] font-bold text-soul-muted uppercase mb-4">Sugestões de busca</p>
                <div className="grid grid-cols-1 gap-2">
                    {[{ label: "Igrejas Evangélicas", icon: "church", query: "Igreja Evangélica" }, { label: "Assembleia de Deus", icon: "account_balance", query: "Assembleia de Deus" }, { label: "Igreja Batista", icon: "water_drop", query: "Igreja Batista" }, { label: "Igreja Presbiteriana", icon: "menu_book", query: "Igreja Presbiteriana" }].map((item, idx) => (
                        <button key={idx} onClick={() => handleSearch(`${item.query} ${searchQuery}`.trim())} className="flex items-center justify-between p-4 bg-soul-cream/30 hover:bg-soul-cream/60 rounded-xl group transition-all">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-soul-muted text-lg group-hover:text-soul-accent">{item.icon}</span>
                                <span className="text-sm font-semibold text-soul-text">{item.label}</span>
                            </div>
                            <span className="material-symbols-outlined text-soul-border group-hover:text-soul-accent group-hover:translate-x-1 transition-all">map</span>
                        </button>
                    ))}
                </div>
            </div>
        </Card>
      </section>
    </div>
  );
};




const ProgressScreen: React.FC<any> = ({ userProgress, checkins, quickNotes, onAddCheckIn, onAddQuickNote, onNavigate }) => {
  const [noteText, setNoteText] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckIn = checkins.find((c:any) => c.date === todayStr);




  return (
    <div className="animate-fade-in p-6 pb-24">
      <h1 className="font-serif text-3xl font-semibold italic mb-8 pt-4">Meu Progresso</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[ { label: "Concluídos", val: Object.values(userProgress.completedDays).flat().length, icon: "verified" }, { label: "Sequência", val: `${userProgress.streak}d`, icon: "local_fire_department" } ].map((s, i) => (
          <Card key={i} className="flex flex-col items-center py-8 bg-soul-cream/30 border-none">
            <span className="material-symbols-outlined text-soul-accent mb-2 text-2xl">{s.icon}</span>
            <span className="text-3xl font-serif italic font-bold text-soul-text mb-1">{s.val}</span>
            <span className="text-[9px] font-bold uppercase text-soul-muted tracking-widest">{s.label}</span>
          </Card>
        ))}
      </div>
      <section className="mb-10">
        <h3 className="text-[10px] font-bold text-soul-muted uppercase tracking-widest mb-4">Como está sua alma hoje?</h3>
        <Card className="flex justify-between items-center px-2">
          {['😞', '😐', '🙂', '😃', '🙌'].map(emoji => (
            <button key={emoji} onClick={() => onAddCheckIn(emoji)} className={`text-3xl w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${todayCheckIn?.emoji === emoji ? 'bg-soul-accent/10 border-2 border-soul-accent shadow-sm scale-110' : 'bg-soul-cream/50 grayscale opacity-60'}`}>{emoji}</button>
          ))}
        </Card>
      </section>
      <section className="mb-10">
        <h3 className="text-[10px] font-bold text-soul-muted uppercase tracking-widest mb-4">Diário Rápido</h3>
        <Card className="space-y-4">
           <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Como foi seu dia com Deus?" className="w-full h-24 p-4 rounded-xl bg-soul-cream/30 border border-soul-border text-sm outline-none focus:border-soul-accent resize-none" />
           <Button onClick={() => { if(noteText.trim()){ onAddQuickNote(noteText.trim()); setNoteText(''); } }} disabled={!noteText.trim()} className="w-full h-12">Salvar nota</Button>
           {quickNotes.length > 0 && (
             <div className="pt-6 space-y-4">
               {quickNotes.slice(-5).reverse().map((n:any, i:number) => (
                 <div key={i} className="border-l-2 border-soul-accent/30 pl-4 py-1">
                   <p className="text-[9px] font-bold text-soul-muted uppercase mb-1">{new Date(n.date).toLocaleDateString('pt-BR')}</p>
                   <p className="text-sm text-soul-text leading-relaxed italic">"{n.text}"</p>
                 </div>
               ))}
             </div>
           )}
        </Card>
      </section>
    </div>
  );
};




const DayListScreen: React.FC<any> = ({ onNavigate, currentVolume, completedDays, onSelectDay }) => (
  <div className="animate-fade-in p-6 pb-24">
    <button onClick={() => onNavigate(AppScreen.HOME)} className="mb-8 flex items-center text-soul-muted font-semibold text-sm"><span className="material-symbols-outlined mr-2 text-lg">arrow_back</span>Voltar</button>
    <h1 className="font-serif text-4xl italic mb-3 font-semibold leading-tight">{currentVolume.title}</h1>
    <p className="text-soul-muted font-medium mb-10">{currentVolume.subtitle}</p>
    <div className="space-y-4">
      {currentVolume.days.map((day:any) => {
        const isRead = completedDays?.includes(day.dia);
        return (
          <Card key={day.dia} onClick={() => { onSelectDay(day.dia); onNavigate(AppScreen.READER); }} className="flex items-center justify-between py-5 border-none bg-soul-cream/30">
            <div className="flex items-center gap-5"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif text-xl ${isRead ? 'bg-soul-accent text-white' : 'bg-white text-soul-muted border border-soul-border'}`}>{day.dia}</div><h4 className="font-bold text-soul-text text-sm">{day.titulo}</h4></div>
            <span className={`material-symbols-outlined ${isRead ? 'text-soul-accent' : 'text-soul-border'} text-xl`}>{isRead ? 'check_circle' : 'arrow_forward'}</span>
          </Card>
        );
      })}
    </div>
  </div>
);




const NotesScreen: React.FC<any> = ({ dayData, note, onSave, onBack }) => (
  <div className="animate-fade-in p-6 pb-24">
    <header className="flex justify-between items-center mb-8 pt-4">
      <button onClick={onBack} className="p-2 -ml-2 text-soul-muted"><span className="material-symbols-outlined">arrow_back</span></button>
      <h2 className="font-serif text-2xl font-semibold italic">Anotações do Dia</h2><div className="w-8" />
    </header>
    <div className="mb-8 p-4 bg-soul-cream/30 rounded-2xl border border-soul-border"><p className="text-[9px] font-bold text-soul-accent uppercase tracking-widest mb-1">Dia {dayData.dia}</p><h3 className="text-sm font-bold text-soul-text">{dayData.titulo}</h3></div>
    <div className="space-y-8">
      {[ { id: 'godSpoke', label: 'O que Deus falou comigo?' }, { id: 'surrender', label: 'O que eu preciso entregar?' }, { id: 'practicalStep', label: 'Passo prático de hoje' } ].map(field => (
        <div key={field.id}><label className="text-[10px] font-bold text-soul-muted uppercase tracking-widest block mb-3 ml-1">{field.label}</label><textarea value={note[field.id]} onChange={(e) => onSave(field.id as any, e.target.value)} className="w-full h-32 p-5 rounded-2xl bg-soul-cream/30 border border-soul-border outline-none focus:border-soul-accent resize-none" /></div>
      ))}
    </div>
    <Button onClick={onBack} className="w-full mt-10 h-16 shadow-lg">Salvar e Voltar</Button>
  </div>

);
