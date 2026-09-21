import React, { useState, useEffect } from 'react'
import { X, UserCheck, Trophy, Award, Plus, Minus } from 'lucide-react'

const NIVEIS = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D']

const ESTILOS_JOGO = [
  'Jogo Apoiado',
  'Jogo Vertical',
  'Ofensivo',
  'Defensivo',
  'Equilibrado',
  'Bola Parada'
]

const OPCOES_ACESSOS = [
  { key: 'dParaC', id: 'D para C', label: 'D para C' },
  { key: 'cParaB', id: 'C para B', label: 'C para B' },
  { key: 'bParaA', id: 'B para A', label: 'B para A' }
]

export default function CoachModal({
  isOpen,
  onClose,
  onSave,
  coachToEdit = null
}) {
  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    clubeAtual: '',
    nivelAtual: 'B',
    experiencia: '',
    exAtleta: false,
    acessos: {
      bParaA: 0,
      cParaB: 0,
      dParaC: 0
    },
    titulos: {
      nacionais: 0,
      estaduais: 0,
      internacionais: 0,
      base: 0
    },
    titulosTexto: '',
    caracteristicas: [],
    observacao: ''
  })

  useEffect(() => {
    if (coachToEdit) {
      // Normalização de acessos legados (array de strings ou objeto)
      let parsedAcessos = { bParaA: 0, cParaB: 0, dParaC: 0 }
      if (coachToEdit.acessos) {
        if (Array.isArray(coachToEdit.acessos)) {
          coachToEdit.acessos.forEach(ac => {
            if (typeof ac === 'string') {
              const lower = ac.toLowerCase()
              if (lower.includes('b para a') || lower.includes('b_para_a') || lower === 'bparaa') parsedAcessos.bParaA = Math.max(parsedAcessos.bParaA, 1)
              else if (lower.includes('c para b') || lower.includes('c_para_b') || lower === 'cparab') parsedAcessos.cParaB = Math.max(parsedAcessos.cParaB, 1)
              else if (lower.includes('d para c') || lower.includes('d_para_c') || lower === 'dparac') parsedAcessos.dParaC = Math.max(parsedAcessos.dParaC, 1)
            } else if (typeof ac === 'object' && ac !== null) {
              parsedAcessos = { ...parsedAcessos, ...ac }
            }
          })
        } else if (typeof coachToEdit.acessos === 'object') {
          parsedAcessos = {
            bParaA: Number(coachToEdit.acessos.bParaA) || 0,
            cParaB: Number(coachToEdit.acessos.cParaB) || 0,
            dParaC: Number(coachToEdit.acessos.dParaC) || 0
          }
        }
      }

      // Normalização de titulos (objeto ou texto legado)
      let parsedTitulos = { nacionais: 0, estaduais: 0, internacionais: 0, base: 0 }
      let rawTitulosTexto = ''
      if (coachToEdit.titulos) {
        if (typeof coachToEdit.titulos === 'object') {
          parsedTitulos = {
            nacionais: Number(coachToEdit.titulos.nacionais) || 0,
            estaduais: Number(coachToEdit.titulos.estaduais) || 0,
            internacionais: Number(coachToEdit.titulos.internacionais) || 0,
            base: Number(coachToEdit.titulos.base) || 0
          }
          rawTitulosTexto = coachToEdit.titulosTexto || coachToEdit.titulos.detalhes || ''
        } else if (typeof coachToEdit.titulos === 'string') {
          rawTitulosTexto = coachToEdit.titulos
          // Tenta estimar contagem básica se for legado
          const tLower = coachToEdit.titulos.toLowerCase()
          if (tLower.includes('brasileir') || tLower.includes('copa do brasil') || tLower.includes('série b') || tLower.includes('supercopa')) {
            parsedTitulos.nacionais = 1
          }
          if (tLower.includes('paulista') || tLower.includes('estadual') || tLower.includes('nordeste') || tLower.includes('mineiro') || tLower.includes('gaúcho') || tLower.includes('carioca')) {
            parsedTitulos.estaduais = 1
          }
          if (tLower.includes('sul-americana') || tLower.includes('libertadores') || tLower.includes('recopa')) {
            parsedTitulos.internacionais = 1
          }
          if (tLower.includes('copinha') || tLower.includes('sub-20') || tLower.includes('sub 20')) {
            parsedTitulos.base = 1
          }
        }
      }

      setFormData({
        nome: coachToEdit.nome || '',
        idade: coachToEdit.idade || '',
        clubeAtual: coachToEdit.clubeAtual || '',
        nivelAtual: coachToEdit.nivelAtual || 'B',
        experiencia: coachToEdit.experiencia || '',
        exAtleta: Boolean(coachToEdit.exAtleta),
        acessos: parsedAcessos,
        titulos: parsedTitulos,
        titulosTexto: rawTitulosTexto,
        caracteristicas: Array.isArray(coachToEdit.caracteristicas) ? [...coachToEdit.caracteristicas] : [],
        observacao: coachToEdit.observacao || ''
      })
    } else {
      setFormData({
        nome: '',
        idade: '',
        clubeAtual: '',
        nivelAtual: 'B',
        experiencia: '',
        exAtleta: false,
        acessos: {
          bParaA: 0,
          cParaB: 0,
          dParaC: 0
        },
        titulos: {
          nacionais: 0,
          estaduais: 0,
          internacionais: 0,
          base: 0
        },
        titulosTexto: '',
        caracteristicas: [],
        observacao: ''
      })
    }
  }, [coachToEdit, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const updateTituloCount = (cat, delta) => {
    setFormData(prev => {
      const current = prev.titulos?.[cat] || 0
      const next = Math.max(0, current + delta)
      return {
        ...prev,
        titulos: {
          ...prev.titulos,
          [cat]: next
        }
      }
    })
  }

  const setTituloCount = (cat, value) => {
    const val = Math.max(0, parseInt(value, 10) || 0)
    setFormData(prev => ({
      ...prev,
      titulos: {
        ...prev.titulos,
        [cat]: val
      }
    }))
  }

  const updateAcessoCount = (key, delta) => {
    setFormData(prev => {
      const current = prev.acessos?.[key] || 0
      const next = Math.max(0, current + delta)
      return {
        ...prev,
        acessos: {
          ...prev.acessos,
          [key]: next
        }
      }
    })
  }

  const setAcessoCount = (key, value) => {
    const val = Math.max(0, parseInt(value, 10) || 0)
    setFormData(prev => ({
      ...prev,
      acessos: {
        ...prev.acessos,
        [key]: val
      }
    }))
  }

  const toggleCaracteristica = (tag) => {
    setFormData(prev => {
      const exists = prev.caracteristicas.includes(tag)
      return {
        ...prev,
        caracteristicas: exists
          ? prev.caracteristicas.filter(c => c !== tag)
          : [...prev.caracteristicas, tag]
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
      alert('O campo Nome é obrigatório.')
      return
    }

    const payload = {
      ...formData,
      id: coachToEdit ? coachToEdit.id : Date.now().toString(),
      idade: formData.idade ? parseInt(formData.idade, 10) : '',
      isProvisorio: false
    }

    if (onSave) {
      onSave(payload)
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b1322] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#090f1c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                {coachToEdit ? 'Editar Treinador' : 'Cadastrar Novo Treinador'}
              </h2>
              <p className="text-xs text-slate-400">
                Preencha os dados e características do perfil tático
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Linha 1: Nome e Idade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Nome do Treinador <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Rogério Ceni"
                className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Idade</label>
              <input
                type="number"
                name="idade"
                value={formData.idade}
                onChange={handleChange}
                placeholder="Ex: 51"
                className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Linha 2: Clube Atual e Nível */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Clube Atual</label>
              <input
                type="text"
                name="clubeAtual"
                value={formData.clubeAtual}
                onChange={handleChange}
                placeholder="Ex: Bahia (ou Livre no Mercado)"
                className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Nível Atual</label>
              <select
                name="nivelAtual"
                value={formData.nivelAtual}
                onChange={handleChange}
                className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {NIVEIS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 3: Experiência e Ex-Atleta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Experiência / Nível Competitivo</label>
              <input
                type="text"
                name="experiencia"
                value={formData.experiencia}
                onChange={handleChange}
                placeholder="Ex: Série A / Internacional"
                className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Ex-Atleta Profissional?</label>
              <div className="flex items-center gap-4 pt-1.5">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="exAtleta"
                    checked={formData.exAtleta === true}
                    onChange={() => setFormData(prev => ({ ...prev, exAtleta: true }))}
                    className="accent-emerald-500"
                  />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="exAtleta"
                    checked={formData.exAtleta === false}
                    onChange={() => setFormData(prev => ({ ...prev, exAtleta: false }))}
                    className="accent-emerald-500"
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>
          </div>

          {/* Linha 4: TÍTULOS & CONQUISTAS (Contadores Numéricos) */}
          <div className="space-y-2.5 p-3.5 bg-[#0e1726] border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Títulos & Conquistas
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Quantidade multiplicadora por categoria
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Nacionais */}
              <div className="bg-[#121d30] border border-slate-700/80 rounded-lg p-2.5 flex flex-col items-center justify-between gap-2 shadow-xs">
                <span className="text-[11px] font-bold text-amber-400">Nacionais</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateTituloCount('nacionais', -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={formData.titulos?.nacionais || 0}
                    onChange={(e) => setTituloCount('nacionais', e.target.value)}
                    className="w-10 text-center font-bold text-xs bg-slate-900 border border-slate-700 rounded py-0.5 text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => updateTituloCount('nacionais', 1)}
                    className="w-6 h-6 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Estaduais */}
              <div className="bg-[#121d30] border border-slate-700/80 rounded-lg p-2.5 flex flex-col items-center justify-between gap-2 shadow-xs">
                <span className="text-[11px] font-bold text-sky-400">Estaduais</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateTituloCount('estaduais', -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={formData.titulos?.estaduais || 0}
                    onChange={(e) => setTituloCount('estaduais', e.target.value)}
                    className="w-10 text-center font-bold text-xs bg-slate-900 border border-slate-700 rounded py-0.5 text-white focus:outline-none focus:border-sky-400"
                  />
                  <button
                    type="button"
                    onClick={() => updateTituloCount('estaduais', 1)}
                    className="w-6 h-6 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Internacionais */}
              <div className="bg-[#121d30] border border-slate-700/80 rounded-lg p-2.5 flex flex-col items-center justify-between gap-2 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-400">Internacionais</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateTituloCount('internacionais', -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={formData.titulos?.internacionais || 0}
                    onChange={(e) => setTituloCount('internacionais', e.target.value)}
                    className="w-10 text-center font-bold text-xs bg-slate-900 border border-slate-700 rounded py-0.5 text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => updateTituloCount('internacionais', 1)}
                    className="w-6 h-6 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Base */}
              <div className="bg-[#121d30] border border-slate-700/80 rounded-lg p-2.5 flex flex-col items-center justify-between gap-2 shadow-xs">
                <span className="text-[11px] font-bold text-purple-400">Base</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateTituloCount('base', -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={formData.titulos?.base || 0}
                    onChange={(e) => setTituloCount('base', e.target.value)}
                    className="w-10 text-center font-bold text-xs bg-slate-900 border border-slate-700 rounded py-0.5 text-white focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="button"
                    onClick={() => updateTituloCount('base', 1)}
                    className="w-6 h-6 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Detalhamento opcional dos títulos */}
            <div className="pt-1">
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Detalhamento dos Títulos (Opcional)
              </label>
              <input
                type="text"
                name="titulosTexto"
                value={formData.titulosTexto}
                onChange={handleChange}
                placeholder="Ex: Brasileirão 2020 (Flamengo), Copa do Nordeste 2024 (Fortaleza)"
                className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Linha 5: ACESSOS CONQUISTADOS (Contadores Numéricos) */}
          <div className="space-y-2.5 p-3.5 bg-[#0e1726] border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Acessos Conquistados
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Quantidade de acessos por divisão
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* D para C */}
              <div className="bg-[#121d30] border border-slate-700/80 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">D para C</span>
                  <span className="text-[10px] text-slate-500">Série D &rarr; Série C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateAcessoCount('dParaC', -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={formData.acessos?.dParaC || 0}
                    onChange={(e) => setAcessoCount('dParaC', e.target.value)}
                    className="w-10 text-center font-bold text-xs bg-slate-900 border border-slate-700 rounded py-0.5 text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => updateAcessoCount('dParaC', 1)}
                    className="w-6 h-6 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* C para B */}
              <div className="bg-[#121d30] border border-slate-700/80 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">C para B</span>
                  <span className="text-[10px] text-slate-500">Série C &rarr; Série B</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateAcessoCount('cParaB', -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={formData.acessos?.cParaB || 0}
                    onChange={(e) => setAcessoCount('cParaB', e.target.value)}
                    className="w-10 text-center font-bold text-xs bg-slate-900 border border-slate-700 rounded py-0.5 text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => updateAcessoCount('cParaB', 1)}
                    className="w-6 h-6 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* B para A */}
              <div className="bg-[#121d30] border border-slate-700/80 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">B para A</span>
                  <span className="text-[10px] text-slate-500">Série B &rarr; Série A</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateAcessoCount('bParaA', -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={formData.acessos?.bParaA || 0}
                    onChange={(e) => setAcessoCount('bParaA', e.target.value)}
                    className="w-10 text-center font-bold text-xs bg-slate-900 border border-slate-700 rounded py-0.5 text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => updateAcessoCount('bParaA', 1)}
                    className="w-6 h-6 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Linha 6: Características de Jogo (Pills clicáveis) */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-300">
              Estilo & Características de Jogo
            </label>
            <div className="flex flex-wrap gap-2">
              {ESTILOS_JOGO.map((tag) => {
                const isSelected = formData.caracteristicas.includes(tag)
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleCaracteristica(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm'
                        : 'bg-[#121d30] text-slate-400 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Linha 7: Observações do Treinador */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Observações do Scout</label>
            <textarea
              name="observacao"
              rows={3}
              value={formData.observacao}
              onChange={handleChange}
              placeholder="Modelo de jogo, gestão de grupo, intensidade, postura tática..."
              className="w-full bg-[#121d30] border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Rodapé do Modal */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
            >
              Salvar Treinador
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
