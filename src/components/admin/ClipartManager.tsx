import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useConfig } from '../../context/ConfigContext'
import { uploadClipart } from '../../lib/clipartUpload'

type Tab = 'skin' | 'hairColor' | 'hairStyle'

interface SkinRow { id: string; label: string; hex: string; sort_order: number }
interface HairColorRow { id: string; label: string; hex: string; sort_order: number }
interface HairStyleRow { id: string; label: string; sort_order: number }
interface HairLayerRow { id: number; hair_style_id: string; layer_id: string; position: string; src: string; tintable: boolean; sort_order: number }

export default function ClipartManager() {
  const { reload } = useConfig()
  const [tab, setTab] = useState<Tab>('skin')
  const [skinColors, setSkinColors] = useState<SkinRow[]>([])
  const [hairColors, setHairColors] = useState<HairColorRow[]>([])
  const [hairStyles, setHairStyles] = useState<HairStyleRow[]>([])
  const [hairLayers, setHairLayers] = useState<HairLayerRow[]>([])

  async function loadAll() {
    const [s, hc, hs, hl] = await Promise.all([
      supabase.from('clipart_skin_colors').select('*').order('sort_order'),
      supabase.from('clipart_hair_colors').select('*').order('sort_order'),
      supabase.from('clipart_hair_styles').select('*').order('sort_order'),
      supabase.from('clipart_hair_layers').select('*').order('sort_order'),
    ])
    setSkinColors((s.data ?? []) as SkinRow[])
    setHairColors((hc.data ?? []) as HairColorRow[])
    setHairStyles((hs.data ?? []) as HairStyleRow[])
    setHairLayers((hl.data ?? []) as HairLayerRow[])
  }

  useEffect(() => { void loadAll() }, [])

  async function saveSkin(row: SkinRow) {
    await supabase.from('clipart_skin_colors').upsert(row)
    void loadAll(); void reload()
  }
  async function deleteSkin(id: string) {
    await supabase.from('clipart_skin_colors').delete().eq('id', id)
    void loadAll(); void reload()
  }
  async function saveHairColor(row: HairColorRow) {
    await supabase.from('clipart_hair_colors').upsert(row)
    void loadAll(); void reload()
  }
  async function deleteHairColor(id: string) {
    await supabase.from('clipart_hair_colors').delete().eq('id', id)
    void loadAll(); void reload()
  }
  async function saveHairStyle(row: HairStyleRow) {
    await supabase.from('clipart_hair_styles').upsert(row)
    void loadAll(); void reload()
  }
  async function deleteHairStyle(id: string) {
    if (!confirm(`Kapsel "${id}" verwijderen? Dit verwijdert ook alle bijbehorende lagen.`)) return
    await supabase.from('clipart_hair_styles').delete().eq('id', id)
    void loadAll(); void reload()
  }
  async function saveLayer(row: HairLayerRow) {
    if (row.id) {
      await supabase.from('clipart_hair_layers').update({ layer_id: row.layer_id, position: row.position, src: row.src, tintable: row.tintable }).eq('id', row.id)
    } else {
      await supabase.from('clipart_hair_layers').insert({ hair_style_id: row.hair_style_id, layer_id: row.layer_id, position: row.position, src: row.src, tintable: row.tintable })
    }
    void loadAll(); void reload()
  }
  async function deleteLayer(id: number) {
    await supabase.from('clipart_hair_layers').delete().eq('id', id)
    void loadAll(); void reload()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700 }}>Clipart</h1>
        <p style={{ margin: '8px 0 0', fontSize: '16px', color: 'var(--color-body)' }}>Beheer huidskleuren, haarkleuren en kapsels.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderRadius: '99px', background: 'var(--color-sand)', padding: '4px', width: 'fit-content' }}>
        {([['skin', 'Huidskleuren'], ['hairColor', 'Haarkleuren'], ['hairStyle', 'Kapsels']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            height: '40px', padding: '0 20px', borderRadius: '99px', border: 0,
            background: tab === id ? '#fff' : 'transparent', fontWeight: 700, fontSize: '14px', color: 'var(--color-ink)',
            boxShadow: tab === id ? '0 2px 8px -2px rgba(42,28,20,.15)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'skin' && (
        <ColorManager
          title="Huidskleuren"
          rows={skinColors}
          onSave={saveSkin}
          onDelete={deleteSkin}
          newIdPlaceholder="bv. 6"
          defaultHex="#D9A27E"
        />
      )}

      {tab === 'hairColor' && (
        <ColorManager
          title="Haarkleuren"
          rows={hairColors}
          onSave={saveHairColor}
          onDelete={deleteHairColor}
          newIdPlaceholder="bv. rood"
          defaultHex="#B5532A"
        />
      )}

      {tab === 'hairStyle' && (
        <HairStyleManager
          styles={hairStyles}
          layers={hairLayers}
          onSaveStyle={saveHairStyle}
          onDeleteStyle={deleteHairStyle}
          onSaveLayer={saveLayer}
          onDeleteLayer={deleteLayer}
        />
      )}
    </div>
  )
}

function ColorManager({ title, rows, onSave, onDelete, newIdPlaceholder, defaultHex }: {
  title: string
  rows: { id: string; label: string; hex: string; sort_order: number }[]
  onSave: (row: { id: string; label: string; hex: string; sort_order: number }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  newIdPlaceholder: string
  defaultHex: string
}) {
  const [newId, setNewId] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newHex, setNewHex] = useState(defaultHex)

  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--color-line)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>{title}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rows.map((row) => (
          <ColorRow key={row.id} row={row} onSave={onSave} onDelete={onDelete} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid var(--color-line)', paddingTop: '16px' }}>
        <input type="color" value={newHex} onChange={(e) => setNewHex(e.target.value)} style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1px solid var(--color-line)', cursor: 'pointer' }} />
        <input value={newId} onChange={(e) => setNewId(e.target.value)} placeholder={newIdPlaceholder} style={{ ...inputStyle, width: '120px' }} />
        <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => { if (newId && newLabel) { void onSave({ id: newId, label: newLabel, hex: newHex, sort_order: rows.length }); setNewId(''); setNewLabel(''); setNewHex(defaultHex) } }} disabled={!newId || !newLabel} style={{ height: '44px', padding: '0 20px', borderRadius: '12px', border: 0, background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: '14px', opacity: !newId || !newLabel ? 0.4 : 1 }}>Toevoegen</button>
      </div>
    </div>
  )
}

function ColorRow({ row, onSave, onDelete }: {
  row: { id: string; label: string; hex: string; sort_order: number }
  onSave: (row: { id: string; label: string; hex: string; sort_order: number }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [label, setLabel] = useState(row.label)
  const [hex, setHex] = useState(row.hex)

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid var(--color-line)', cursor: 'pointer' }} />
      <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'ui-monospace, monospace', width: '80px' }}>{row.id}</span>
      <input value={label} onChange={(e) => setLabel(e.target.value)} style={{ ...inputStyle, flex: 1, height: '36px', fontSize: '14px' }} />
      <button onClick={() => void onSave({ id: row.id, label, hex, sort_order: row.sort_order })} style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--color-field-border)', background: '#fff', fontWeight: 600, fontSize: '13px' }}>Opslaan</button>
      <button onClick={() => void onDelete(row.id)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--color-peach)', background: 'var(--color-peach)', color: 'var(--color-accent-hover)', fontWeight: 700 }}>×</button>
    </div>
  )
}

function HairStyleManager({ styles, layers, onSaveStyle, onDeleteStyle, onSaveLayer, onDeleteLayer }: {
  styles: HairStyleRow[]
  layers: HairLayerRow[]
  onSaveStyle: (row: HairStyleRow) => Promise<void>
  onDeleteStyle: (id: string) => Promise<void>
  onSaveLayer: (row: HairLayerRow) => Promise<void>
  onDeleteLayer: (id: number) => Promise<void>
}) {
  const [newId, setNewId] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {styles.map((style) => {
        const styleLayers = layers.filter((l) => l.hair_style_id === style.id)
        const isOpen = expanded === style.id
        return (
          <div key={style.id} style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--color-line)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px' }}>
              <button onClick={() => setExpanded(isOpen ? null : style.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--color-field-border)', background: '#fff', fontSize: '16px' }}>{isOpen ? '−' : '+'}</button>
              <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>{style.id}</span>
              <strong style={{ flex: 1, fontSize: '16px' }}>{style.label}</strong>
              <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>{styleLayers.length} lagen</span>
              <button onClick={() => void onDeleteStyle(style.id)} style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--color-peach)', background: 'var(--color-peach)', color: 'var(--color-accent-hover)', fontWeight: 600, fontSize: '13px' }}>Verwijder</button>
            </div>

            {isOpen && (
              <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--color-line)', paddingTop: '16px' }}>
                {styleLayers.map((layer) => (
                  <LayerRow key={layer.id} layer={layer} onSave={onSaveLayer} onDelete={onDeleteLayer} />
                ))}
                <NewLayerRow hairStyleId={style.id} onSave={onSaveLayer} />
              </div>
            )}
          </div>
        )
      })}

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', borderRadius: '20px', border: '1px solid var(--color-line)', padding: '16px 24px' }}>
        <input value={newId} onChange={(e) => setNewId(e.target.value.replace(/[^a-z0-9-]/g, '-'))} placeholder="id (bv. vlecht)" style={{ ...inputStyle, width: '140px' }} />
        <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label (bv. Vlecht)" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => { if (newId && newLabel) { void onSaveStyle({ id: newId, label: newLabel, sort_order: styles.length }); setNewId(''); setNewLabel('') } }} disabled={!newId || !newLabel} style={{ height: '44px', padding: '0 20px', borderRadius: '12px', border: 0, background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: '14px', opacity: !newId || !newLabel ? 0.4 : 1 }}>+ Kapsel</button>
      </div>
    </div>
  )
}

function LayerRow({ layer, onSave, onDelete }: {
  layer: HairLayerRow
  onSave: (row: HairLayerRow) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  const [layerId, setLayerId] = useState(layer.layer_id)
  const [position, setPosition] = useState(layer.position)
  const [src, setSrc] = useState(layer.src)
  const [tintable, setTintable] = useState(layer.tintable)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isUploadedImage = src.startsWith('http') || src.startsWith('data:')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    const { url, error } = await uploadClipart(file, `${layer.hair_style_id}/${layer.layer_id || 'layer'}`)
    if (error) {
      setUploadError(error)
    } else {
      setSrc(url)
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input value={layerId} onChange={(e) => setLayerId(e.target.value)} placeholder="layer id" style={{ ...inputStyle, width: '140px', height: '36px', fontSize: '13px' }} />
        <select value={position} onChange={(e) => setPosition(e.target.value)} style={{ ...inputStyle, width: '90px', height: '36px', fontSize: '13px' }}>
          <option value="back">Achter</option>
          <option value="front">Voor</option>
        </select>
        <input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="bestandspad of URL" style={{ ...inputStyle, flex: 1, height: '36px', fontSize: '13px' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
          <input type="checkbox" checked={tintable} onChange={(e) => setTintable(e.target.checked)} /> tint
        </label>
        <button onClick={() => void onSave({ ...layer, layer_id: layerId, position, src, tintable })} style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--color-field-border)', background: '#fff', fontWeight: 600, fontSize: '12px' }}>Opslaan</button>
        <button onClick={() => void onDelete(layer.id)} style={{ width: '32px', height: '36px', borderRadius: '8px', border: '1px solid var(--color-peach)', background: 'var(--color-peach)', color: 'var(--color-accent-hover)', fontWeight: 700 }}>×</button>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '4px' }}>
        {isUploadedImage && (
          <img src={src} alt="preview" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--color-line)', background: '#fff' }} />
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ height: '30px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--color-field-border)', background: '#fff', fontWeight: 600, fontSize: '12px', color: 'var(--color-accent)', opacity: uploading ? 0.5 : 1 }}>{uploading ? 'Uploaden…' : 'Upload afbeelding'}</button>
        {uploadError && <span style={{ fontSize: '12px', color: 'var(--color-accent-hover)' }}>{uploadError}</span>}
      </div>
    </div>
  )
}

function NewLayerRow({ hairStyleId, onSave }: { hairStyleId: string; onSave: (row: HairLayerRow) => Promise<void> }) {
  const [layerId, setLayerId] = useState('')
  const [position, setPosition] = useState('front')
  const [src, setSrc] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isUploadedImage = src.startsWith('http') || src.startsWith('data:')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    const { url, error } = await uploadClipart(file, `${hairStyleId}/${layerId || 'new-layer'}`)
    if (error) {
      setUploadError(error)
    } else {
      setSrc(url)
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px dashed var(--color-line)', paddingTop: '8px' }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input value={layerId} onChange={(e) => setLayerId(e.target.value)} placeholder="nieuwe layer id" style={{ ...inputStyle, width: '140px', height: '36px', fontSize: '13px' }} />
        <select value={position} onChange={(e) => setPosition(e.target.value)} style={{ ...inputStyle, width: '90px', height: '36px', fontSize: '13px' }}>
          <option value="back">Achter</option>
          <option value="front">Voor</option>
        </select>
        <input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="bestandspad of URL" style={{ ...inputStyle, flex: 1, height: '36px', fontSize: '13px' }} />
        <button onClick={() => { if (layerId) { void onSave({ id: 0, hair_style_id: hairStyleId, layer_id: layerId, position, src: src || 'placeholder', tintable: true, sort_order: 0 }); setLayerId(''); setSrc('') } }} disabled={!layerId} style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: 0, background: 'var(--color-accent)', color: '#fff', fontWeight: 600, fontSize: '12px', opacity: !layerId ? 0.4 : 1 }}>+ Laag</button>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '4px' }}>
        {isUploadedImage && (
          <img src={src} alt="preview" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--color-line)', background: '#fff' }} />
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ height: '30px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--color-field-border)', background: '#fff', fontWeight: 600, fontSize: '12px', color: 'var(--color-accent)', opacity: uploading ? 0.5 : 1 }}>{uploading ? 'Uploaden…' : 'Upload afbeelding'}</button>
        {uploadError && <span style={{ fontSize: '12px', color: 'var(--color-accent-hover)' }}>{uploadError}</span>}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { height: '44px', borderRadius: '10px', border: '1.5px solid var(--color-field-border)', background: '#fff', padding: '0 12px', fontWeight: 500, fontSize: '15px', color: 'var(--color-ink)' }
