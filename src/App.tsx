import React, { useState, useRef, useEffect } from 'react';
import { Heart, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
// Correction de l'import : le package officiel est @google/generative-ai
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

  // Génération des cœurs en arrière-plan
  useEffect(() => {
    const newHearts = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 7,
    }));
    setHearts(newHearts);
  }, []);

  // ─── FONCTION GEMINI CORRIGÉE ───
  const callGemini = async (prompt: string): Promise<string | null> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ VITE_GEMINI_API_KEY est introuvable. Vérifie ton fichier .env et redémarre le serveur.');
      return null;
    }

    try {
      // Nouvelle syntaxe officielle Google Generative AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Utilisation de 1.5-flash (stable et rapide)

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Erreur API Gemini:', error);
      return null;
    }
  };

  const generatePersuasion = async () => {
    setIsLoadingAi(true);
    try {
      const result = await callGemini(
        `Génère un message très court (max 2 phrases), mignon et drôle pour convaincre ${crushName || 'mon crush'} d'accepter d'être ma Valentine. Sois romantique mais pas trop cucul.`
      );
      setAiMessage(result || "💕 Allez, dis oui ! Je promets que ce sera magique ! ");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const generateCelebration = async (name: string) => {
    setIsLoadingAi(true);
    try {
      const result = await callGemini(
        `Génère un texte court (3 phrases max), magnifique et touchant pour célébrer le fait que ${name} a accepté d'être ma Valentine. Le texte doit exprimer une immense joie.`
      );
      setCelebrationText(result || `${name}, c'est officiel ! Mon cœur est le plus heureux du monde. 💕`);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleNoHover = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // On s'assure que le bouton reste dans la zone visible
      const newX = Math.random() * (rect.width - 100);
      const newY = Math.random() * (rect.height - 50);
      setNoButtonPos({ x: newX, y: newY });
      setYesButtonScale(prev => Math.min(prev + 0.15, 2.5)); // Le bouton OUI grossit !
    }
  };

  const handleYesClick = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#ff69b4', '#ffffff']
    });
    setStep('accepted');
    generateCelebration(crushName || "ma Valentine");
  };

  const startDemande = (e: React.FormEvent) => {
    e.preventDefault();
    if (crushName.trim()) setStep('question');
  };

  const resetApp = () => {
    setStep('name-entry');
    setCrushName('');
    setNoButtonPos({ x: 0, y: 0 });
    setYesButtonScale(1);
    setAiMessage('');
    setCelebrationText('');
  };

  // Bannière visuelle
  const RomanticBanner = () => (
    <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg h-50 w-full bg-slate-900">
      <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice">
        <rect width="600" height="200" fill="#1a1a2e" />
        <circle cx="500" cy="50" r="30" fill="#ffe066" opacity="0.8" />
        <path d="M250 150 Q300 100 350 150" stroke="#e91e63" strokeWidth="4" fill="none" />
        <text x="300" y="180" textAnchor="middle" fill="white" fontSize="12" opacity="0.5" fontStyle="italic">Sous les étoiles avec toi...</text>
        {/* Ajout simplifié de deux silhouettes */}
        <circle cx="280" cy="140" r="10" fill="#c2185b" />
        <circle cx="320" cy="140" r="10" fill="#1565c0" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-linear-to-br from-pink-100 via-red-50 to-rose-100" ref={containerRef}>
      
      {/* Background Hearts */}
      <div className="absolute inset-0 pointer-events-none">
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

      {/* ÉTAPE 1 : NOM */}
      {step === 'name-entry' && (
        <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center border border-pink-200 z-10">
          <Heart className="text-pink-500 mx-auto mb-4 animate-bounce" size={48} fill="currentColor" />
          <h1 className="text-3xl font-bold text-pink-600 mb-6">Prêt pour le grand saut ?</h1>
          <form onSubmit={startDemande} className="space-y-4">
            <input 
              type="text" 
              value={crushName}
              onChange={(e) => setCrushName(e.target.value)}
              placeholder="Le nom de ton crush..."
              className="w-full px-6 py-4 rounded-2xl border-2 border-pink-100 focus:border-pink-400 outline-none text-center text-lg"
              required
            />
            <button type="submit" className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
              Continuer <ArrowRight size={20} />
            </button>
          </form>
        </div>
      )}

      {/* ÉTAPE 2 : LA QUESTION */}
      {step === 'question' && (
        <div className="max-w-xl w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center border border-pink-200 z-10 relative">
          <RomanticBanner />
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            {crushName}, veux-tu être ma Valentine ?
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 min-h-25">
            <button
              onClick={handleYesClick}
              style={{ transform: `scale(${yesButtonScale})` }}
              className="px-10 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full text-xl shadow-lg transition-transform"
            >
              OUI ! 💖
            </button>

            <button
              onMouseEnter={handleNoHover}
              onClick={handleNoHover}
              style={{
                position: noButtonPos.x ? 'absolute' : 'relative',
                left: noButtonPos.x ? `${noButtonPos.x}px` : 'auto',
                top: noButtonPos.y ? `${noButtonPos.y}px` : 'auto',
                transition: 'all 0.2s ease-out'
              }}
              className="px-8 py-3 bg-gray-200 text-gray-600 font-semibold rounded-full"
            >
              Non
            </button>
          </div>

          <div className="border-t pt-6">
            <button 
              onClick={generatePersuasion}
              disabled={isLoadingAi}
              className="text-pink-500 hover:text-pink-600 text-sm font-medium flex items-center gap-2 mx-auto"
            >
              {isLoadingAi ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
              Besoin d'un argument magique ?
            </button>
            {aiMessage && (
              <p className="mt-4 p-4 bg-pink-50 rounded-xl text-pink-800 italic text-sm animate-in fade-in slide-in-from-bottom-2">
                "{aiMessage}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* ÉTAPE 3 : ACCEPTÉ */}
      {step === 'accepted' && (
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border-4 border-pink-500 z-10 animate-in zoom-in duration-500">
          <div className="mb-6 flex justify-center">
            <Heart size={80} className="text-pink-500 animate-pulse" fill="currentColor" />
          </div>
          <h2 className="text-4xl font-bold text-pink-600 mb-6">Incroyable ! 😍</h2>
          
          <div className="bg-rose-50 p-6 rounded-2xl mb-8 border border-pink-100">
            {isLoadingAi ? (
              <RefreshCw className="animate-spin mx-auto text-pink-400" />
            ) : (
              <p className="text-gray-800 text-lg leading-relaxed font-serif italic">
                {celebrationText}
              </p>
            )}
          </div>

          <p className="text-2xl font-bold text-gray-700 mb-8">Rendez-vous le 14 Février ! 🌹</p>
          
          <button onClick={resetApp} className="text-gray-400 text-xs hover:underline">
            Recommencer
          </button>
        </div>
      )}

      <footer className="mt-8 text-pink-400 text-xs flex items-center gap-1 z-10">
        Fait avec <Heart size={12} fill="currentColor" /> Mim's Technologie
      </footer>

      <style>{`
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); }
          100% { transform: translateY(-100px) rotate(360deg); }
        }
        .animate-bounce-slow { animation: bounce 3s infinite; }
      `}</style>
    </div>
  );
};

export default App;