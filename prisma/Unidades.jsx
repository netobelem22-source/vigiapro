import { useState, useEffect } from 'react'
import api from '../services/api'

const Modal = ({ unidade, onClose, onSaved }) => {
  const [form, setForm] = useState(unidade || { nome: '', cnpj: '', endereco: '', cidade: '', estado: 'SC', latitude: '', longitude: '', raioGps: 200, empresaId: '' })
  const [empresas, setEmpresas] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.get('/empresas').then(r => {
      setEmpresas(r.data)
      if (!form.empresaId && r.data.length > 0) setForm(f => ({ ...f, empresaId: r.data[0].id }))
    }).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const data = { ...form, latitude: parseFloat(form.latitude) || null, longitude: parseFloat(form.longitude) || null, raioGps: parseInt(form.raioGps) || 200 }
      if (unidade?.id) await api.put(`/unidades/${unidade.id}`, data)
      else await api.post('/unidades', data)
      onSaved()
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  const inp = (label, campo, tipo = 'text', props = {}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>{label}</label>
      <input type={tipo} value={form[campo] ?? ''} onChange={e => set(campo, e.target.value)}
        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} {...props} />
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.8rem', width: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>{unidade?.id ? 'Editar unidade' : 'Nova unidade'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>{inp('Nome da unidade', 'nome', 'text', { required: true, placeholder: 'Ex: Supermercado Centro' })}</div>
            <div style={{ gridColumn: '1/-1' }}>{inp('Endereço', 'endereco', 'text', { placeholder: 'Rua, número' })}</div>
            <div style={{ gridColumn: '1/-1' }}>{inp('CNPJ', 'cnpj', 'text', { placeholder: '00.000.000/0001-00' })}</div>
            {inp('Cidade', 'cidade', 'text', { required: true })}
            {inp('Estado', 'estado', 'text', { maxLength: 2, placeholder: 'SC' })}
            {inp('Latitude', 'latitude', 'text', { placeholder: '-27.5954' })}
            {inp('Longitude', 'longitude', 'text', { placeholder: '-48.5480' })}
            {inp('Raio GPS (metros)', 'raioGps', 'number', { min: 50 })}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>Empresa</label>
              <select value={form.empresaId} onChange={e => set('empresaId', e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
          </div>
          {erro && <div style={{ background: '#FCEBEB', color: '#501313', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 10 }}>{erro}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={salvando} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#0F6E56', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Unidades() {
  const [unidades, setUnidades] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null)

  const carregar = () => {
    setCarregando(true)
    api.get('/unidades').then(r => setUnidades(r.data)).catch(console.error).finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const filtradas = unidades.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.cidade.toLowerCase().includes(busca.toLowerCase())
  )

  const cidades = [...new Set(unidades.map(u => u.cidade))].sort()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>Unidades</h1>
          <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{unidades.length} unidades em {cidades.length} cidades</div>
        </div>
        <button onClick={() => setModal('novo')}
          style={{ background: '#0F6E56', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Nova unidade
        </button>
      </div>

      <div style={{ marginBottom: 16, maxWidth: 320 }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou cidade..."
          style={{ width: '100%', padding: '9px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' }} />
      </div>

      {carregando ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>Carregando...</div>
      ) : filtradas.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999', background: '#fff', borderRadius: 12, border: '1px solid #eee' }}>
          {busca ? 'Nenhuma unidade encontrada.' : <>Nenhuma unidade cadastrada.{' '}<span style={{ color: '#0F6E56', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setModal('novo')}>Cadastrar agora</span></>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtradas.map(u => (
            <div key={u.id}
              onClick={() => setModal(u)}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              style={{ background: '#fff', border: '1px solid #EAECF0', borderRadius: 12, padding: '1.1rem', cursor: 'pointer', transition: 'box-shadow 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, background: '#E8F5F1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <span style={{ background: u.ativo ? '#E8F5F1' : '#FCEBEB', color: u.ativo ? '#085041' : '#501313', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                  {u.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 3 }}>{u.nome}</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{u.endereco}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{u.cidade} — {u.estado}</div>
              {u.latitude && <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>GPS configurado · Raio {u.raioGps}m</div>}
              {u.empresa && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{u.empresa.nome}</div>}
            </div>
          ))}
        </div>
      )}

      {modal && <Modal unidade={modal === 'novo' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); carregar() }} />}
    </div>
  )
}
