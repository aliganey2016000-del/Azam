import React, { useState } from 'react';
import { MessageSquare, Send, User, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Dr. Amina Farah (Dean of Clinical Affairs)',
      role: 'SUPER_ADMIN',
      text: 'Final review on the 2026 Mogadishu Surgery Attachment batch is complete. Ready for official placements.',
      time: '10:45 AM',
      isMe: false,
    },
    {
      id: '2',
      sender: 'You',
      role: 'ADMIN',
      text: 'Noted. 18 students cleared for placement in Ward B and General Emergency.',
      time: '11:02 AM',
      isMe: true,
    },
  ]);
  const [newMsg, setNewMsg] = useState('');
  const { success } = useToast();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'You',
        role: 'ADMIN',
        text: newMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      },
    ]);
    setNewMsg('');
    success('Message dispatched to AZAAM Staff Channel.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Staff Operational Coordination
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Direct, encrypted internal channel for AZAAM administrative coordinators and clinical directors.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-800">#general-operations</span>
          <span className="text-[10px] text-slate-400 font-mono">End-to-End Staff Workspace</span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.isMe ? 'justify-end' : 'justify-start'}`}>
              {!m.isMe && (
                <div className="w-8 h-8 rounded-lg bg-[#102f38] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  AF
                </div>
              )}
              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                  m.isMe
                    ? 'bg-[#102f38] text-white rounded-tr-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className={`font-bold ${m.isMe ? 'text-white' : 'text-slate-900'}`}>
                    {m.sender}
                  </span>
                  <span className={`text-[10px] font-mono ${m.isMe ? 'text-white/60' : 'text-slate-400'}`}>
                    {m.time}
                  </span>
                </div>
                <p className="leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input form */}
        <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your message to AZAAM staff..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38] transition-colors"
          />
          <button
            type="submit"
            disabled={!newMsg.trim()}
            className="px-4 py-2.5 bg-[#e26342] hover:bg-[#d55332] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
