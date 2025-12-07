'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, CheckCircle, Heart, Calendar, MapPin, Users, X, Lock, Plus, Trash2, AlertCircle } from 'lucide-react';
import { getGifts, addGift, deleteGift, markGiftAsTaken } from './actions';

const CONFIG = {
  babyName: "Bernardo", 
  parentsNames: "Giovanny e Vitória",
  eventDate: "15 de Novembro às 15h",
  eventLocation: "Salão de Festas - Rua das Flores, 123",
  pixKey: "000.000.000-00", 
  whatsappNumber: "5511999999999",
  googleFormLink: "https://docs.google.com/forms/d/e/SEU_LINK_AQUI/viewform?embedded=true",
  adminPassword: "vasco da gama"
};

export default function Home() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    getGifts().then((data) => setGifts(data));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CONFIG.adminPassword) {
      setIsAdmin(true);
      setShowLogin(false);
    } else {
      alert("Senha incorreta");
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(CONFIG.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Função que registra a compra e manda pro WhatsApp
  const handleConfirmPayment = async () => {
    if (!selectedGift) return;
    
    // 1. Atualiza o banco de dados (baixa no estoque)
    await markGiftAsTaken(selectedGift.id);
    
    // 2. Atualiza a tela localmente
    const newData = await getGifts();
    setGifts(newData);

    // 3. Redireciona pro WhatsApp
    const message = `Olá! Escolhi presentear o ${CONFIG.babyName} com: ${selectedGift.name}. Já fiz o Pix, segue o comprovante!`;
    const link = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
    
    // 4. Fecha modal
    setSelectedGift(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 relative">
      
      {isAdmin && (
        <div className="bg-amber-100 p-2 text-center text-amber-800 text-sm font-bold border-b border-amber-300 sticky top-0 z-50 flex justify-between px-4 items-center">
          <span>🔓 MODO EDIÇÃO ATIVADO</span>
          <button onClick={() => setIsAdmin(false)} className="underline">Sair</button>
        </div>
      )}

      {/* HERO */}
      <section className="relative bg-blue-600 text-white py-20 px-4 text-center">
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-block p-3 rounded-full bg-white/20 backdrop-blur-md mb-2">
            <Heart className="w-8 h-8 fill-white text-transparent" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Chá do {CONFIG.babyName}</h1>
          <p className="text-xl text-blue-100">Lista de Presentes Virtual</p>
          <div className="pt-4">
            <button onClick={() => setShowRSVP(true)} className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 mx-auto">
              <Users className="w-4 h-4" /> Confirmar Presença
            </button>
          </div>
        </div>
      </section>

      {/* LISTA DE PRESENTES */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Escolha um Mimo</h2>
        
        {isAdmin && (
          <form action={async (formData) => {
            await addGift(formData);
            const newData = await getGifts();
            setGifts(newData);
            alert("Adicionado!");
          }} className="bg-slate-200 p-6 rounded-xl mb-8 border-2 border-dashed border-slate-400 max-w-lg mx-auto">
             <h3 className="font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5"/> Novo Presente</h3>
             <div className="grid gap-3">
               <input name="name" placeholder="Nome (Ex: Pacote Fralda P)" required className="p-3 rounded border" />
               <div className="flex gap-3">
                 <input name="price" type="number" step="0.01" placeholder="Valor" required className="p-3 rounded border flex-1" />
                 <input name="icon" placeholder="Emoji" className="p-3 rounded border w-16 text-center" />
               </div>
               <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold ml-1">Quantidade Máxima:</label>
                  <input name="max_quantity" type="number" defaultValue="1" min="1" className="p-3 rounded border" />
               </div>
               <button type="submit" className="bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700">Salvar Presente</button>
             </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gifts.map((item) => {
            const percent = Math.min((item.used_quantity / item.max_quantity) * 100, 100);
            const isSoldOut = item.used_quantity >= item.max_quantity;

            return (
              <div key={item.id} className={`bg-white p-6 rounded-3xl shadow-sm transition-all border border-slate-100 text-center relative group ${isSoldOut ? 'opacity-60 grayscale' : 'hover:shadow-lg'}`}>
                
                {isAdmin && (
                  <button onClick={async () => { if(confirm("Apagar?")) { await deleteGift(item.id); setGifts(await getGifts()); }}} 
                    className="absolute top-2 right-2 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 z-10">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                )}

                <div className="text-4xl mb-4 bg-slate-50 w-20 h-20 mx-auto flex items-center justify-center rounded-full">
                  {item.icon}
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 mb-1">{item.name}</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">R$ {Number(item.price).toFixed(2).replace('.', ',')}</div>

                {/* BARRA DE PROGRESSO */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                    <span>{isSoldOut ? 'ESGOTADO' : 'Disponível'}</span>
                    <span>{item.used_quantity}/{item.max_quantity}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full ${isSoldOut ? 'bg-slate-400' : 'bg-green-500'}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>

                <button
                  disabled={isSoldOut}
                  onClick={() => setSelectedGift(item)}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors
                    ${isSoldOut ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  {isSoldOut ? 'Já Compraram' : 'Presentear'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER & LOCK */}
      <footer className="mt-20 py-8 text-center text-slate-400 text-sm"><p>Com carinho, {CONFIG.parentsNames}.</p></footer>
      <button onClick={() => setShowLogin(true)} className="fixed bottom-4 left-4 text-slate-200 hover:text-slate-400 p-2 z-40"><Lock className="w-4 h-4" /></button>

      {/* MODAL DE LOGIN */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 relative">
            <button onClick={() => setShowLogin(false)} className="absolute top-2 right-2 text-slate-400"><X/></button>
            <h3 className="font-bold text-lg mb-4">Acesso Restrito</h3>
            <form onSubmit={handleLogin} className="space-y-3">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" className="w-full border p-2 rounded" />
              <button className="w-full bg-slate-900 text-white py-2 rounded font-bold">Entrar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RSVP */}
      {showRSVP && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl h-[80vh] rounded-2xl overflow-hidden relative flex flex-col">
             <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2"><Users className="w-5 h-5"/> Confirmar Presença</h3>
                <button onClick={() => setShowRSVP(false)} className="hover:bg-blue-700 p-1 rounded transition"><X/></button>
             </div>
             <iframe src={CONFIG.googleFormLink} className="w-full h-full border-0">Carregando…</iframe>
          </div>
        </div>
      )}

      {/* MODAL PIX COM CONFIRMAÇÃO */}
      {selectedGift && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in duration-300">
            <button onClick={() => { setSelectedGift(null); setCopied(false); }} className="absolute top-4 right-4 text-slate-400 text-xl">✕</button>
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-1">{selectedGift.name}</h3>
                <p className="text-slate-500">Valor: <strong className="text-blue-600">R$ {Number(selectedGift.price).toFixed(2).replace('.', ',')}</strong></p>
                <div className="mt-2 text-xs bg-yellow-50 text-yellow-700 p-2 rounded border border-yellow-200 flex items-center justify-center gap-2">
                   <AlertCircle className="w-4 h-4"/> 
                   Ao clicar em enviar comprovante, esse item será abatido do estoque.
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border text-left">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Chave Pix</p>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                  <code className="flex-1 text-sm font-mono truncate text-slate-700">{CONFIG.pixKey}</code>
                  <button onClick={handleCopyPix} className="p-2 bg-slate-100 rounded hover:bg-slate-200">
                    {copied ? <CheckCircle className="w-5 h-5 text-green-600"/> : <Copy className="w-5 h-5 text-slate-600"/>}
                  </button>
                </div>
              </div>
              
              {/* BOTÃO QUE EFETIVA A COMPRA */}
              <button 
                onClick={handleConfirmPayment}
                className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-100"
              >
                Enviar Comprovante (WhatsApp)
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}