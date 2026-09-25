import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook para gerenciar ditado por voz via Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 * com suporte completo a português brasileiro (pt-BR)
 */
export function useVoiceDictation({ onTranscript, onError } = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const recognitionRef = useRef(null)
  const isManuallyStoppedRef = useRef(false)

  // Verifica suporte no navegador
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(Boolean(SpeechRecognition))
    }
  }, [])

  // Inicializa o reconhecimento de fala
  const startListening = useCallback(() => {
    setErrorMessage(null)

    if (typeof window === 'undefined') return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      const msg = 'Seu navegador não possui suporte à API de Reconhecimento de Voz.'
      setErrorMessage(msg)
      if (onError) onError(msg)
      return
    }

    try {
      // Se já houver uma instância rodando, para antes de recomeçar
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (_) {}
      }

      const recognition = new SpeechRecognition()
      recognition.lang = 'pt-BR'
      recognition.continuous = true
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        isManuallyStoppedRef.current = false
        setIsListening(true)
        setErrorMessage(null)
      }

      recognition.onresult = (event) => {
        let finalChunk = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalChunk += result[0].transcript
          }
        }

        if (finalChunk && onTranscript) {
          onTranscript(finalChunk.trim())
        }
      }

      recognition.onerror = (event) => {
        console.warn('[WebSpeech] Erro no reconhecimento de voz:', event.error)
        let humanMsg = ''

        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            humanMsg = 'Permissão de microfone negada. Autorize o microfone nas permissões do site.'
            break
          case 'no-speech':
            humanMsg = 'Nenhuma fala detectada. Tente falar mais próximo ao microfone.'
            break
          case 'audio-capture':
            humanMsg = 'Nenhum microfone encontrado neste dispositivo.'
            break
          case 'network':
            humanMsg = 'Erro de rede no serviço de transcrição.'
            break
          default:
            humanMsg = `Erro na transcrição de áudio (${event.error}).`
        }

        setErrorMessage(humanMsg)
        setIsListening(false)
        if (onError) onError(humanMsg)
      }

      recognition.onend = () => {
        // Se parou sem ter sido cancelado manualmente, reinicia suavemente caso o usuário ainda queira continuar falando
        if (!isManuallyStoppedRef.current && isListening) {
          try {
            recognition.start()
            return
          } catch (_) {}
        }
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error('[WebSpeech] Erro ao iniciar:', err)
      const msg = 'Falha ao ativar o microfone.'
      setErrorMessage(msg)
      setIsListening(false)
      if (onError) onError(msg)
    }
  }, [isListening, onTranscript, onError])

  // Parar a gravação
  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (_) {}
    }
    setIsListening(false)
  }, [])

  // Alternar gravação
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Limpeza ao desmontar componente
  useEffect(() => {
    return () => {
      isManuallyStoppedRef.current = true
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (_) {}
      }
    }
  }, [])

  return {
    isListening,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    toggleListening
  }
}
