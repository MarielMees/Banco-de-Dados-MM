import React, { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Exclusão",
  message,
  itemName
}) {
  const cancelBtnRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (cancelBtnRef.current) {
          cancelBtnRef.current.focus()
        }
      }, 50)

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#0b1220] border border-rose-500/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-rose-950/30 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com botão fechar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {title}
              </h3>
              <span className="text-[11px] text-rose-400/90 font-semibold tracking-wider uppercase">
                Ação Irreversível
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo com a mensagem de confirmação */}
        <div className="px-6 py-4">
          <p className="text-sm text-slate-200 leading-relaxed">
            {message ? (
              message
            ) : (
              <>
                Tem certeza que deseja excluir{' '}
                <strong className="text-white font-bold">{itemName || 'este registro'}</strong>?{' '}
                Esta ação não poderá ser desfeita.
              </>
            )}
          </p>
        </div>

        {/* Rodapé com botões de ação */}
        <div className="bg-[#080d18] px-6 py-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-slate-500"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          >
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
