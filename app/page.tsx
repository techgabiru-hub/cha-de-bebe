'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, CheckCircle, Heart, Calendar, MapPin, Users, X, Lock, Plus, Trash2, AlertCircle, Edit, Save, Settings } from 'lucide-react';
import { getGifts, saveGift, deleteGift, markGiftAsTaken, getSettings, updateSettings, toggleGiftLock } from './actions';

// Valores padrão caso o banco esteja vazio
const DEFAULT_CONFIG = {
  babyName: "Nome do Bebê", 
  parentsNames: "Papai e Mamãe",
  eventDate: "Data do Evento",
  eventLocation: "Local do Evento",
  pixKey: "Chave Pix", 
  whatsappNumber: "5500000000000",
  googleFormLink: "", 
};

export default function Home() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // Estados de UI
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  
  // Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [editingGift, setEditingGift] = useState<any>(null); // Presente sendo editado
  const [showSettings, setShowSettings] = useState(false);   // Mostrar painel de config

  // Carregar tudo ao iniciar
  useEffect(() => {
    Promise.all([getGifts(), getSettings()]).then(([giftsData, settingsData]) => {
      setGifts(giftsData);
      // Mescla as configurações do banco com o padrão (para não quebrar se faltar algo)
      setConfig({ ...DEFAULT_CONFIG, ...settingsData });
      setLoading(false);
    });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "vascodagamaeomelhortimedomundo123456789#$") { // SENHA FIXA
      setIsAdmin(true);
      setShowLogin(false);
    } else {
      alert("Senha incorreta");
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(config.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!selectedGift) return;
    await markGiftAsTaken(selectedGift.id);
    const newData = await getGifts();
    setGifts(newData);

    const message = `Olá! Escolhi presentear o ${config.babyName} com: ${selectedGift.name}. Já fiz o Pix, segue o comprovante!`;
    const link = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
    setSelectedGift(null);
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 relative">
      
      {/* BARRA DE ADMIN */}
      {isAdmin && (
        <div className="bg-amber-100 p-2 border-b border-amber-300 sticky top-0 z-50 flex justify-between px-4 items-center shadow-sm">
          <div className="flex gap-4">
             <span className="font-bold text-amber-900 flex items-center gap-2">🔓 MODO ADMIN</span>
             <button onClick={() => setShowSettings(!showSettings)} className="text-amber-800 underline text-sm flex items-center gap-1 hover:text-amber-950">
               <Settings className="w-4 h-4"/> {showSettings ? 'Ocultar Configs' : 'Editar Configs'}
             </button>
          </div>
          <button onClick={() => setIsAdmin(false)} className="text-amber-900 underline text-sm">Sair</button>
        </div>
      )}

      {/* PAINEL DE CONFIGURAÇÕES GERAIS (DATA, LOCAL, ETC) */}
      {isAdmin && showSettings && (
        <section className="bg-white border-b-4 border-amber-200 p-6 animate-in slide-in-from-top-10">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700"><Settings className="w-5 h-5"/> Configurações do Site</h3>
            <form action={async (formData) => {
               await updateSettings(formData);
               const newSettings = await getSettings();
               setConfig({ ...DEFAULT_CONFIG, ...newSettings });
               alert("Configurações salvas!");
               setShowSettings(false);
            }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input name="babyName" defaultValue={config.babyName} placeholder="Nome do Bebê" className="border p-2 rounded" />
               <input name="parentsNames" defaultValue={config.parentsNames} placeholder="Nome dos Pais" className="border p-2 rounded" />
               <input name="eventDate" defaultValue={config.eventDate} placeholder="Data (ex: 15 de Nov)" className="border p-2 rounded" />
               <input name="eventLocation" defaultValue={config.eventLocation} placeholder="Endereço" className="border p-2 rounded" />
               <input name="pixKey" defaultValue={config.pixKey} placeholder="Chave Pix" className="border p-2 rounded" />
               <input name="whatsappNumber" defaultValue={config.whatsappNumber} placeholder="WhatsApp (apenas números)" className="border p-2 rounded" />
               <input name="googleFormLink" defaultValue={config.googleFormLink} placeholder="Link Embed do Google Forms" className="border p-2 rounded col-span-2" />
               <button className="col-span-2 bg-slate-900 text-white p-3 rounded font-bold hover:bg-slate-700">Salvar Alterações</button>
            </form>
          </div>
        </section>
      )}

      {/* HERO */}
      <section className="relative bg-blue-600 text-white py-20 px-4 text-center">
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-block p-3 rounded-full bg-white/20 backdrop-blur-md mb-2">
            <Heart className="w-8 h-8 fill-white text-transparent" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Chá do {config.babyName}</h1>
          <p className="text-xl text-blue-100">Lista de Presentes Virtual</p>
          <div className="pt-4">
            <button onClick={() => setShowRSVP(true)} className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 mx-auto hover:scale-105 transition-transform">
              <Users className="w-4 h-4" /> Confirmar Presença
            </button>
          </div>
        </div>
      </section>

      {/* DATA E LOCAL */}
      <section className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 mb-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Calendar className="w-6 h-6" /></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase">Data</p><p className="font-semibold">{config.eventDate}</p></div>
          </div>
          <div className="hidden md:block w-px h-10 bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><MapPin className="w-6 h-6" /></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase">Local</p><p className="font-semibold">{config.eventLocation}</p></div>
          </div>
        </div>
      </section>

      {/* LISTA DE PRESENTES */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Escolha um Mimo</h2>
        
        {/* FORMULÁRIO DE ADICIONAR / EDITAR (SÓ ADMIN) */}
        {isAdmin && (
          <form action={async (formData) => {
            await saveGift(formData);
            const newData = await getGifts();
            setGifts(newData);
            setEditingGift(null); // Limpa edição
            alert(editingGift ? "Atualizado!" : "Adicionado!");
          }} className="bg-slate-200 p-6 rounded-xl mb-8 border-2 border-dashed border-slate-400 max-w-lg mx-auto relative">
             
             {editingGift && (
               <button type="button" onClick={() => setEditingGift(null)} className="absolute top-2 right-2 text-slate-500 hover:text-red-500 text-sm">Cancelar Edição</button>
             )}

             <h3 className="font-bold mb-4 flex items-center gap-2">
               {editingGift ? <Edit className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} 
               {editingGift ? 'Editar Presente' : 'Novo Item na Lista'}
             </h3>
             
             <input type="hidden" name="id" value={editingGift?.id || ''} />

             <div className="grid gap-3">
               <input name="name" defaultValue={editingGift?.name} placeholder="Nome (Ex: Fraldas P)" required className="p-3 rounded border" />
               <div className="flex gap-3">
                 <input name="price" defaultValue={editingGift?.price} type="number" step="0.01" placeholder="Valor" required className="p-3 rounded border flex-1" />
                 <input name="icon" defaultValue={editingGift?.icon} placeholder="Emoji" className="p-3 rounded border w-20 text-center" />
               </div>
               <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold ml-1 mb-1">Quantidade Necessária:</label>
                  <input name="max_quantity" defaultValue={editingGift?.max_quantity || 1} type="number" min="1" className="p-3 rounded border" />
               </div>
               <button type="submit" className="bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700">
                 {editingGift ? 'Atualizar Presente' : 'Salvar Presente'}
               </button>
             </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gifts.map((item) => {
            const percent = Math.min((item.used_quantity / item.max_quantity) * 100, 100);
            const isSoldOut = item.used_quantity >= item.max_quantity;
            const isLocked = item.is_locked; // Novo status de bloqueado
            const isDisabled = isSoldOut || isLocked;

            return (
              <div key={item.id} className={`bg-white p-6 rounded-3xl shadow-sm transition-all border border-slate-100 text-center relative group 
                 ${isDisabled ? 'opacity-70 grayscale bg-slate-50' : 'hover:shadow-lg'}`}>
                
                {/* BOTÕES DE ADMIN NO CARD */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button onClick={() => setEditingGift(item)} className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200" title="Editar">
                      <Edit className="w-4 h-4"/>
                    </button>
                    <button onClick={async () => { await toggleGiftLock(item.id, item.is_locked); setGifts(await getGifts()); }} 
                      className={`p-2 rounded-full hover:opacity-80 ${item.is_locked ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`} title="Travar/Destravar">
                      {item.is_locked ? <Lock className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                    </button>
                    <button onClick={async () => { if(confirm("Apagar item?")) { await deleteGift(item.id); setGifts(await getGifts()); }}} 
                      className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200" title="Excluir">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                )}

                <div className="text-4xl mb-4 bg-slate-50 w-20 h-20 mx-auto flex items-center justify-center rounded-full relative">
                  {item.icon}
                  {isLocked && <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full"><Lock className="w-3 h-3"/></div>}
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 mb-1">{item.name}</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">R$ {Number(item.price).toFixed(2).replace('.', ',')}</div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                    <span>{isLocked ? 'PAUSADO' : (isSoldOut ? 'ESGOTADO' : 'Disponível')}</span>
                    <span>{item.used_quantity}/{item.max_quantity}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full transition-all duration-500 ${isSoldOut ? 'bg-slate-500' : (isLocked ? 'bg-amber-400' : 'bg-green-500')}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>

                <button
                  disabled={isDisabled}
                  onClick={() => setSelectedGift(item)}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors
                    ${isDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  {isLocked ? 'Indisponível' : (isSoldOut ? 'Já Compraram' : 'Presentear')}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="mt-20 py-8 text-center text-slate-400 text-sm"><p>Com carinho, {config.parentsNames}.</p></footer>
      <button onClick={() => setShowLogin(true)} className="fixed bottom-4 left-4 text-slate-300 hover:text-slate-500 p-2 z-40 transition-colors"><Lock className="w-4 h-4" /></button>

      {/* MODAL LOGIN ADMIN */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 relative">
            <button onClick={() => setShowLogin(false)} className="absolute top-2 right-2 text-slate-400"><X/></button>
            <h3 className="font-bold text-lg mb-4">Acesso Restrito</h3>
            <form onSubmit={handleLogin} className="space-y-3">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" className="w-full border p-2 rounded outline-none" />
              <button className="w-full bg-slate-900 text-white py-2 rounded font-bold">Entrar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PIX */}
      {selectedGift && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in duration-300">
            <button onClick={() => { setSelectedGift(null); setCopied(false); }} className="absolute top-4 right-4 text-slate-400 text-xl">✕</button>
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-1">{selectedGift.name}</h3>
                <p className="text-slate-500">Valor: <strong className="text-blue-600">R$ {Number(selectedGift.price).toFixed(2).replace('.', ',')}</strong></p>
                <div className="mt-4 bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-200 flex items-start gap-2 text-left">
                   <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/> 
                   <span>Ao enviar comprovante, <strong>1 unidade</strong> será descontada.</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border text-left">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Chave Pix</p>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                  <code className="flex-1 text-sm font-mono truncate text-slate-700 select-all">{config.pixKey}</code>
                  <button onClick={handleCopyPix} className="p-2 bg-slate-100 rounded hover:bg-slate-200">
                    {copied ? <CheckCircle className="w-5 h-5 text-green-600"/> : <Copy className="w-5 h-5 text-slate-600"/>}
                  </button>
                </div>
              </div>
              
              <button onClick={handleConfirmPayment} className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-100">
                Enviar Comprovante (WhatsApp)
              </button>
            </div>
          </div>
        </div>
      )}

      {showRSVP && config.googleFormLink && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl h-[80vh] rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
             <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2"><Users className="w-5 h-5"/> Confirmar Presença</h3>
                <button onClick={() => setShowRSVP(false)} className="hover:bg-blue-700 p-1 rounded transition"><X/></button>
             </div>
             <iframe src={config.googleFormLink} className="w-full h-full border-0">Carregando…</iframe>
          </div>
        </div>
      )}
    </main>
  );
}