import React, { useState, useRef, useEffect } from 'react';
import { Heart, Sparkles, Send, RefreshCw, ArrowRight, User, Gift, Star } from 'lucide-react';
// CORRECTION IMPORT : Utilisation du SDK officiel
import { GoogleGenerativeAI } from '@google/generative-ai';
import confetti from 'canvas-confetti';

type Step = 'name-entry' | 'question' | 'accepted';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('name-entry');
  const [crushName, setCrushName] = useState('');
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [yesButtonScale, setYesButtonScale] = useState(1);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [celebrationText, setCelebrationText] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [hearts, setHearts] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Générer des cœurs animés en arrière-plan
  useEffect(() => {
    const newHearts = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 7,
    }));
    setHearts(newHearts);
  }, []);

  // IA : Générer un message de persuasion (CORRIGÉ)
  const generatePersuasion = async () => {
    setIsLoadingAi(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        setAiMessage("💕 Allez, dis oui ! Je promets que ce sera magique ! ✨");
        setIsLoadingAi(false);
        return;
      }

      // NOUVELLE LOGIQUE GEMINI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(
        `Génère un message très court (max 2 phrases), mignon et un peu drôle pour convaincre ${crushName || 'mon crush'} d'accepter d'être ma Valentine. Sois romantique mais pas trop cucul.`
      );
      
      const response = result.response;
      setAiMessage(response.text().trim() || "Dis oui, promis ce sera magique ! ✨");
    } catch (error) {
      console.error('Erreur Gemini:', error);
      setAiMessage("💕 Mon cœur bat si fort pour toi ! Dis oui ! 💕");
    } finally {
      setIsLoadingAi(false);
    }
  };

  // IA : Générer le texte final de célébration (CORRIGÉ)
  const generateCelebration = async (name: string) => {
    setIsLoadingAi(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        setCelebrationText(`${name}, tu as dit OUI ! Mon cœur déborde de joie ! C'est le plus beau jour de ma vie. Je te promets une Saint-Valentin inoubliable. 💕✨`);
        setIsLoadingAi(false);
        return;
      }

      // NOUVELLE LOGIQUE GEMINI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(
        `Génère un texte court (3-4 phrases max), magnifique et touchant pour célébrer le fait que ${name} a accepté d'être ma Valentine. Le texte doit exprimer une immense joie et être très romantique. Utilise des émojis avec parcimonie.`
      );
      
      const response = result.response;
      setCelebrationText(response.text().trim() || `${name}, c'est officiel ! Mon cœur est le plus heureux du monde. 💕`);
    } catch (error) {
      console.error('Erreur Gemini:', error);
      setCelebrationText(`C'est le plus beau jour de ma vie car tu as dit oui, ${name} ! Notre histoire commence maintenant. 💕`);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleNoHover = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = Math.random() * (rect.width - 150);
      const newY = Math.random() * (rect.height - 100);
      setNoButtonPos({ x: newX, y: newY });
      
      // Augmenter le bouton OUI à chaque fois que "Non" fuit
      setYesButtonScale(prev => Math.min(prev + 0.1, 1.5));
    }
  };

  const handleYesClick = () => {
    // Confetti explosion
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#ff69b4', '#ffffff', '#ffc0cb', '#ff1493']
    });
    
    // Confetti continu
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);

    setStep('accepted');
    generateCelebration(crushName || "ma Valentine");
  };

  const startDemande = (e: React.FormEvent) => {
    e.preventDefault();
    if (crushName.trim()) {
      setStep('question');
    }
  };

  const resetApp = () => {
    setStep('name-entry');
    setCrushName('');
    setNoButtonPos({ x: 0, y: 0 });
    setYesButtonScale(1);
    setAiMessage('');
    setCelebrationText('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-linear-to-br from-pink-100 via-red-50 to-rose-100" ref={containerRef}>
      
      {/* Background Hearts Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute text-pink-300 opacity-20"
            style={{
              left: `${heart.left}%`,
              animation: `float ${heart.duration}s ease-in-out ${heart.delay}s infinite`,
              fontSize: `${20 + Math.random() * 20}px`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      {/* Étoiles décoratives */}
      <div className="absolute top-10 left-10 animate-float">
        <Star size={40} className="text-yellow-300 opacity-40" fill="currentColor" />
      </div>
      <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
        <Star size={32} className="text-yellow-300 opacity-40" fill="currentColor" />
      </div>

      {/* ÉTAPE 1 : Saisie du nom */}
      {step === 'name-entry' && (
        <div className="max-w-md w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 text-center border-2 border-pink-200 z-10 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-linear-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Heart className="text-white" size={48} fill="currentColor" />
          </div>
          
          <h1 className="text-4xl font-romantic text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-rose-600 mb-3">
            Une question importante...
          </h1>
          
          <p className="text-slate-600 mb-8 text-base">
            Entrez le prénom de la personne qui fait battre votre cœur 💕
          </p>
          
          <form onSubmit={startDemande} className="space-y-6">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 group-focus-within:text-pink-600 transition-colors" size={22} />
              <input 
                type="text" 
                value={crushName}
                onChange={(e) => setCrushName(e.target.value)}
                placeholder="Son prénom..."
                className="w-full pl-14 pr-4 py-4 bg-pink-50/50 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500 focus:bg-white text-pink-800 placeholder:text-pink-300 text-lg transition-all font-medium"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-4 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg transform transition-all active:scale-95 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2 group text-lg"
            >
              Continuer 
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-pink-100">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              Propulsé par <Sparkles size={14} className="text-pink-400" /> Mim's Technologie
            </p>
          </div>
        </div>
      )}

      {/* ÉTAPE 2 : La Demande */}
      {step === 'question' && (
        <div className="max-w-xl w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center border-2 border-pink-200 z-10 animate-in slide-in-from-right duration-500">
          
          {/* Image romantique */}
          <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&h=400&auto=format&fit=crop" 
              alt="Love" 
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-romantic text-transparent bg-clip-text bg-linear-to-r from-pink-600 via-rose-600 to-red-600 mb-8 px-2 leading-tight animate-pulse-slow">
            {crushName}, veux-tu être ma Valentine ?
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 mb-12 min-h-30">
            <button
              onClick={handleYesClick}
              style={{ transform: `scale(${yesButtonScale})` }}
              className="px-12 py-5 bg-linear-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold rounded-full text-2xl shadow-xl transform transition-all active:scale-95 hover:shadow-2xl flex items-center gap-2 z-20"
            >
              OUI ! <Heart fill="currentColor" size={24} className="animate-pulse" />
            </button>

            <button
              onMouseEnter={handleNoHover}
              onTouchStart={handleNoHover}
              onClick={handleNoHover}
              style={{
                position: noButtonPos.x || noButtonPos.y ? 'absolute' : 'relative',
                left: noButtonPos.x ? `${noButtonPos.x}px` : 'auto',
                top: noButtonPos.y ? `${noButtonPos.y}px` : 'auto',
                transition: 'all 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }}
              className="px-10 py-4 bg-slate-300 text-slate-700 font-bold rounded-full text-lg shadow-md hover:bg-slate-400 whitespace-nowrap"
            >
              Non...
            </button>
          </div>

          {/* Section IA */}
          <div className="mt-10 border-t-2 border-pink-100 pt-8">
            <button 
              onClick={generatePersuasion}
              disabled={isLoadingAi}
              className="text-pink-600 font-semibold hover:text-pink-700 hover:underline flex items-center gap-2 mx-auto disabled:opacity-50 transition-all group"
            >
              {isLoadingAi ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
              )}
              {isLoadingAi ? "un moment..." : "Besoin d'aide pour convaincre "}
            </button>

            {aiMessage && (
              <div className="mt-6 p-5 bg-linear-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl text-pink-900 italic animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-inner">
                <Send className="inline mr-2 text-pink-500" size={18} />
                "{aiMessage}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* ÉTAPE 3 : L'Acceptation */}
      {step === 'accepted' && (
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center border-4 border-pink-500 animate-in zoom-in duration-700 z-10 relative overflow-hidden">
          
          {/* Badge "C'est Oui" */}
          <div className="absolute -top-4 -right-4 transform rotate-12 bg-linear-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl text-lg animate-bounce-slow">
            C'EST OUI ! 
          </div>
          
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <Heart size={120} className="text-pink-500 animate-pulse" fill="#ec4899" />
              <Gift className="absolute -bottom-2 -right-2 text-red-500 bg-white rounded-full p-2" size={40} />
            </div>
          </div>
          
          <h2 className="text-6xl font-romantic text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-rose-600 mb-8">
            Merveilleux !
          </h2>
          
          {/* Texte IA */}
          <div className="bg-linear-to-br from-pink-50 via-rose-50 to-red-50 p-8 rounded-3xl border-2 border-dashed border-pink-300 mb-10 relative shadow-inner">
            <Sparkles className="absolute -top-4 -right-4 text-yellow-400 bg-white rounded-full p-2 shadow-lg" size={32} />
            
            {isLoadingAi ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <RefreshCw className="animate-spin text-pink-500" size={40} />
                <p className="text-pink-500 text-base font-medium">un moment...</p>
              </div>
            ) : (
              <p className="text-2xl text-pink-900 leading-relaxed font-serif italic">
                {celebrationText}
              </p>
            )}
          </div>

          {/* Rendez-vous */}
          <div className="space-y-6">
            <div className="p-6 bg-linear-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-bold shadow-xl transform -rotate-1 hover:rotate-0 transition-transform text-xl">
               Rendez-vous le 14 Février, {crushName} ! 🌹
            </div>
            
            <button 
              onClick={resetApp}
              className="text-slate-400 text-sm hover:text-pink-500 hover:underline transition-colors font-medium"
            >
              ← Refaire une demande
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-pink-400 text-sm font-medium z-10 flex items-center gap-2">
        Fait avec <Heart size={16} fill="currentColor" /> & <Sparkles size={16} /> Mim's Technologie
      </footer>
    </div>
  );
};

export default App;