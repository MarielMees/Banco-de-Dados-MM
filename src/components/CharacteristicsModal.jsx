import React from 'react'
import { X, BookOpen } from 'lucide-react'
import { POSITION_CHARACTERISTICS } from '../constants/scoutCharacteristics'

export default function CharacteristicsModal({ isOpen, onClose, positionKey = 'goleiro' }) {
  if (!isOpen) return null

  const positionData = POSITION_CHARACTERISTICS[positionKey] || {
    name: positionKey.toUpperCase(),
    items: []
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      {/* Container do Modal */}
      <div 
        className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-[#080d16]">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📖</span>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              Características <span className="text-slate-500">—</span> <span className="text-emerald-400">{positionData.name}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo da Lista */}
        <div className="p-5 overflow-y-auto space-y-4 divide-y divide-slate-800/50">
          {positionData.items.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              Nenhuma característica cadastrada para esta posição.
            </p>
          ) : (
            positionData.items.map((item, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-3.5' : ''}>
                <div className="mb-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold tracking-wide">
                    {item.name}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-1">
                  {item.desc}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-[#080d16] flex justify-between items-center text-[11px] text-slate-400">
          <span>{positionData.items.length} características mapeadas</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
