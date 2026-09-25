import React, { useState } from 'react'
import { Mic, Radio, Clock } from 'lucide-react'
import { useVoiceDictation } from '../hooks/useVoiceDictation'

/**
 * Botão autônomo de Ditado por Voz para anexar ao lado de qualquer input ou textarea
 * Área de toque mínima de 48px otimizada para beira de campo
 */
export default function VoiceDictationButton({
  onTranscript,
  onInsertMinute,
  className = '',
  size = 'default'
}) {
  const [isMinutePickerOpen, setIsMinutePickerOpen] = useState(false)
  const [selectedMinute, setSelectedMinute] = useState('')

  const { isListening, isSupported, toggleListening } = useVoiceDictation({
    onTranscript: (chunk) => {
      if (onTranscript && chunk) {
        onTranscript(chunk)
      }
    }
  })

  const handleMinuteClick = (m) => {
    if (onInsertMinute) {
      onInsertMinute(m)
    }
    setIsMinutePickerOpen(false)
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Botão de Microfone (min 48px touch area) */}
      <button
        type="button"
        onClick={toggleListening}
        title={
          !isSupported
            ? 'Navegador sem suporte a fala'
            : isListening
            ? 'Gravando... Toque para parar'
            : 'Toque para ditar por voz'
        }
        className={`min-h-[48px] min-w-[48px] px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 border ${
          isListening
            ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-500/30 ring-2 ring-rose-400 animate-pulse'
            : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50 hover:border-emerald-400'
        }`}
      >
        <Mic className={`w-4 h-4 shrink-0 ${isListening ? 'animate-bounce text-white' : 'text-emerald-400'}`} />
        <span className="hidden sm:inline">
          {isListening ? 'Ouvindo...' : 'Ditar'}
        </span>
      </button>

      {/* Botão Opcional de Inserir Minuto */}
      {onInsertMinute && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMinutePickerOpen(!isMinutePickerOpen)}
            className="min-h-[48px] min-w-[48px] px-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer select-none"
            title="Inserir minuto da jogada"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Minuto</span>
          </button>

          {isMinutePickerOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#0a111e] border border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-2 px-1">
                Minuto da Jogada
              </div>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {['15', '30', '45', '60', '75', '85', '90', '90+'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinuteClick(m)}
                    className="py-1 rounded bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold border border-slate-800 transition cursor-pointer"
                  >
                    {m}'
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Minuto"
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleMinuteClick(selectedMinute)
                    }
                  }}
                  className="flex-1 bg-[#131d2e] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => handleMinuteClick(selectedMinute)}
                  className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
