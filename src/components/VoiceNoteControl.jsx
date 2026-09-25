import React, { useState } from 'react'
import { Mic, MicOff, Clock, Radio, AlertCircle } from 'lucide-react'
import { useVoiceDictation } from '../hooks/useVoiceDictation'

/**
 * Componente de Campo de Nota com Ditado por Voz Express e Minuto da Partida
 * Otimizado com botões de toque mínimo de 48px para uso em beira de campo
 */
export default function VoiceNoteControl({
  value = '',
  onChange,
  placeholder = 'Observação rápida de campo (ou use o microfone para ditar)...',
  rows = 2,
  className = '',
  textareaClassName = '',
  showMinuteButton = true
}) {
  const [selectedMinute, setSelectedMinute] = useState('')
  const [isMinutePickerOpen, setIsMinutePickerOpen] = useState(false)
  const [localError, setLocalError] = useState(null)

  // Callback de transcrição recebido do microfone
  const handleTranscript = (transcriptChunk) => {
    if (!transcriptChunk) return
    const currentText = (value || '').trim()
    const separator = currentText ? ' ' : ''
    const updated = currentText + separator + transcriptChunk
    if (onChange) {
      onChange(updated)
    }
  }

  const { isListening, isSupported, errorMessage, toggleListening } = useVoiceDictation({
    onTranscript: handleTranscript,
    onError: (msg) => setLocalError(msg)
  })

  // Inserir marcação do Minuto Atual no início ou final do texto
  const handleInsertMinute = (minuteValue) => {
    const minStr = String(minuteValue || '').replace(/[^\d+]/g, '')
    if (!minStr) return

    const minuteTag = `[${minStr}']`
    const currentText = (value || '').trim()

    // Se o texto já começar com uma tag de minuto, adiciona quebra de linha ou anexa
    let updated = ''
    if (!currentText) {
      updated = `${minuteTag} `
    } else {
      updated = `${currentText}\n${minuteTag} `
    }

    if (onChange) {
      onChange(updated)
    }
    setIsMinutePickerOpen(false)
    setSelectedMinute('')
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Barra de Ações Rápidas (Beira de Campo) */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Botão Principal: 🎙️ Ditar Nota (Área de toque >= 48px) */}
          <button
            type="button"
            onClick={toggleListening}
            title={
              !isSupported
                ? 'Navegador sem suporte a fala'
                : isListening
                ? 'Clique para parar a gravação'
                : 'Clique para ditar a nota por voz'
            }
            className={`min-h-[48px] px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-[0.98] border shadow-sm ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 shadow-rose-500/30 ring-2 ring-rose-400/50 animate-pulse'
                : 'bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border-emerald-500/50 hover:border-emerald-400'
            }`}
          >
            {isListening ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
                <Mic className="w-4 h-4 shrink-0 animate-bounce" />
                <span className="font-extrabold tracking-wide">Ouvindo... (Toque p/ Pausar)</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>🎙️ Ditar Nota</span>
              </>
            )}
          </button>

          {/* Botão Rápido: [ Minuto Atual ] (Área de toque >= 48px) */}
          {showMinuteButton && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMinutePickerOpen(!isMinutePickerOpen)}
                className="min-h-[48px] px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
                title="Inserir minuto da jogada (ex: [42'])"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Minuto</span>
              </button>

              {/* Seletor Rápido de Minuto Suspenso */}
              {isMinutePickerOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#0a111e] border border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Selecionar Minuto da Jogada
                  </div>

                  {/* Atalhos de minutos comuns */}
                  <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                    {['10', '25', '40', '45', '55', '70', '85', '90+'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleInsertMinute(m)}
                        className="py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-black border border-slate-800 transition cursor-pointer text-center"
                      >
                        {m}'
                      </button>
                    ))}
                  </div>

                  {/* Input manual de minuto */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Ex: 42"
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleInsertMinute(selectedMinute)
                        }
                      }}
                      className="flex-1 bg-[#131d2e] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold"
                    />
                    <button
                      type="button"
                      disabled={!selectedMinute}
                      onClick={() => handleInsertMinute(selectedMinute)}
                      className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-bold transition cursor-pointer"
                    >
                      Inserir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Indicador de Status da Fala */}
        {isListening && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300 animate-pulse bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-500/30">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-spin" />
            <span>Fale normalmente em português...</span>
          </div>
        )}
      </div>

      {/* Alerta de Erro de Microfone se houver */}
      {(errorMessage || localError) && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{errorMessage || localError}</span>
        </div>
      )}

      {/* Textarea de Observação */}
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`w-full bg-[#18263e] border border-slate-700 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed transition-colors ${
          isListening ? 'ring-2 ring-emerald-500/40 border-emerald-500/70 bg-[#162a3f]' : ''
        } ${textareaClassName}`}
      />
    </div>
  )
}
