'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Upload, Trash2, Edit, Eye, EyeOff, Star, FolderPlus, Image as ImageIcon } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { imageUrl } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/admin/card';
import { Button, Input, Select, Modal, Label, Textarea, Badge } from '@/components/admin/ui-primitives';

export default function GaleriaAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [creatingCat, setCreatingCat] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const [its, cats] = await Promise.all([
        apiFetch<any[]>(`/gallery${filter ? `?category=${filter}` : ''}`),
        apiFetch<any[]>('/gallery-categories'),
      ]);
      setItems(its);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, [filter]);

  async function toggleVisible(item: any) {
    await apiFetch(`/gallery/${item.id}`, { method: 'PATCH', body: { visible: !item.visible } });
    refresh();
  }
  async function toggleFeatured(item: any) {
    await apiFetch(`/gallery/${item.id}`, { method: 'PATCH', body: { featured: !item.featured } });
    refresh();
  }
  async function removeItem(item: any) {
    if (!confirm('¿Eliminar imagen?')) return;
    await apiFetch(`/gallery/${item.id}`, { method: 'DELETE' });
    refresh();
  }

  return (
    <>
      <PageHeader
        title="Galería"
        subtitle="Sube fotos de trabajos terminados para mostrar en la landing pública"
        actions={
          <>
            <Button variant="outline" onClick={() => setCreatingCat(true)}><FolderPlus size={16} /> Categoría</Button>
            <Button onClick={() => setCreating(true)}><Plus size={16} /> Subir imagen</Button>
          </>
        }
      />

      <div className="px-6 lg:px-10 pb-10 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs transition ${!filter ? 'bg-brand-500 text-white' : ''}`}
            style={!filter ? undefined : { background: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' }}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.slug)}
              className={`px-3 py-1.5 rounded-full text-xs transition flex items-center gap-2 ${filter === c.slug ? 'bg-brand-500 text-white' : ''}`}
              style={filter !== c.slug ? { background: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' } : undefined}
            >
              {c.name} <span className="opacity-60">{c._count?.items ?? 0}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setEditingCat(c); }}
                className="opacity-50 hover:opacity-100"
              >
                <Edit size={10} />
              </button>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-sm text-[color:var(--text-muted)]">Cargando...</div>
        ) : items.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <ImageIcon size={36} className="mx-auto text-[color:var(--text-muted)] mb-3" />
              <div className="text-sm text-[color:var(--text-muted)]">Sin imágenes en esta categoría</div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((it) => (
              <Card key={it.id} className="overflow-hidden p-0">
                <div className="relative aspect-square">
                  <img src={imageUrl(it.imageUrl)} alt={it.title ?? ''} className="w-full h-full object-cover" />
                  {!it.visible && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs">
                      Oculta
                    </div>
                  )}
                  {it.featured && (
                    <div className="absolute top-2 left-2">
                      <Badge color="yellow">Principal del inicio</Badge>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <div className="text-xs uppercase tracking-widest text-brand-500">{it.category?.name}</div>
                  {it.title && <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{it.title}</div>}
                  <div className="flex justify-between gap-1">
                    <button onClick={() => toggleFeatured(it)} className="p-1.5 rounded hover:bg-[color:var(--bg-surface-hover)] text-amber-500" title={it.featured ? 'Imagen principal del inicio (actual)' : 'Establecer como imagen principal del inicio'}>
                      <Star size={14} fill={it.featured ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={() => toggleVisible(it)} className="p-1.5 rounded hover:bg-[color:var(--bg-surface-hover)]" title={it.visible ? 'Ocultar' : 'Mostrar'} style={{ color: 'var(--text-secondary)' }}>
                      {it.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => setEditing(it)} className="p-1.5 rounded hover:bg-[color:var(--bg-surface-hover)]" title="Editar" style={{ color: 'var(--text-secondary)' }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => removeItem(it)} className="p-1.5 rounded hover:bg-red-500/10 text-red-500" title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {creating && <UploadForm categories={categories} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); refresh(); }} />}
      {editing && <EditImageForm item={editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
      {creatingCat && <CategoryForm onClose={() => setCreatingCat(false)} onSaved={() => { setCreatingCat(false); refresh(); }} />}
      {editingCat && <CategoryForm initial={editingCat} onClose={() => setEditingCat(null)} onSaved={() => { setEditingCat(null); refresh(); }} />}
    </>
  );
}

function EditImageForm({
  item,
  categories,
  onClose,
  onSaved,
}: {
  item: any;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [title, setTitle] = useState(item.title ?? '');
  const [description, setDescription] = useState(item.description ?? '');
  const [order, setOrder] = useState<number>(item.order ?? 0);
  const [visible, setVisible] = useState<boolean>(item.visible);
  const [featured, setFeatured] = useState<boolean>(item.featured);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      await apiFetch(`/gallery/${item.id}`, {
        method: 'PATCH',
        body: {
          categoryId,
          title: title || null,
          description: description || null,
          order: Number(order),
          visible,
          featured,
        },
      });
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Editar imagen" size="lg">
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <img src={imageUrl(item.imageUrl)} alt="" className="w-full max-h-72 object-contain bg-black" />
        </div>

        <div>
          <Label>Categoría</Label>
          <Select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Título</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Cocina blanca con isla central" />
        </div>

        <div>
          <Label>Descripción</Label>
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Materiales, dimensiones, ubicación, fecha..." />
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Label>Orden</Label>
            <Input type="number" value={order || ''} onChange={(e) => setOrder(e.target.value === '' ? 0 : Number(e.target.value))} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer pt-7">
            <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="rounded" />
            <span style={{ color: 'var(--text-secondary)' }}>Visible en landing</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer pt-7">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
            <span style={{ color: 'var(--text-secondary)' }}>Imagen principal del inicio</span>
          </label>
        </div>
        {featured && (
          <div className="text-xs rounded-lg p-3" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
            Al guardar, esta imagen reemplazará a la actual en la sección <em>Trabajo reciente · Diseño exclusivo a medida</em> del home.
          </div>
        )}

        {err && <div className="text-sm text-red-500">{err}</div>}
        <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function UploadForm({ categories, onClose, onSaved }: { categories: any[]; onClose: () => void; onSaved: () => void }) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setErr('Selecciona una imagen');
    setErr(null);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploaded = await apiFetch<{ url: string }>('/uploads/gallery', { method: 'POST', body: fd });
      await apiFetch('/gallery', {
        method: 'POST',
        body: {
          categoryId,
          imageUrl: uploaded.url,
          title: title || undefined,
          description: description || undefined,
          featured,
          visible: true,
        },
      });
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Subir imagen">
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <Label>Categoría *</Label>
          <Select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Selecciona...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>

        <div>
          <Label>Imagen *</Label>
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-[color:var(--bg-surface-hover)] transition"
            style={{ borderColor: 'var(--border-strong)' }}
          >
            {file ? (
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{file.name}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            ) : (
              <div className="text-sm text-[color:var(--text-muted)]">
                <Upload size={20} className="mx-auto mb-2" />
                Click para seleccionar (JPG, PNG, WebP — máx 10MB)
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        <div>
          <Label>Título (opcional)</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Cocina blanca con isla central" />
        </div>
        <div>
          <Label>Descripción (opcional)</Label>
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
          <span style={{ color: 'var(--text-secondary)' }}>Usar como imagen principal del inicio (reemplaza la actual)</span>
        </label>

        {err && <div className="text-sm text-red-500">{err}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving || !file}>{saving ? 'Subiendo...' : 'Subir y guardar'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function CategoryForm({ initial, onClose, onSaved }: { initial?: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    order: initial?.order ?? 0,
    visible: initial?.visible ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      if (initial) {
        const { slug, ...rest } = form;
        await apiFetch(`/gallery-categories/${initial.id}`, { method: 'PATCH', body: rest });
      } else {
        await apiFetch('/gallery-categories', { method: 'POST', body: form });
      }
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function onDelete() {
    if (!confirm('¿Eliminar categoría? Si tiene imágenes no se podrá eliminar.')) return;
    try {
      await apiFetch(`/gallery-categories/${initial.id}`, { method: 'DELETE' });
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <Modal open onClose={onClose} title={initial ? 'Editar categoría' : 'Nueva categoría'}>
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <Label>Nombre *</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        {!initial && (
          <div>
            <Label>Slug (URL) *</Label>
            <Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })} placeholder="ej: cocinas-modernas" />
          </div>
        )}
        <div>
          <Label>Descripción</Label>
          <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Orden</Label>
            <Input type="number" value={form.order || ''} onChange={(e) => setForm({ ...form, order: e.target.value === '' ? 0 : Number(e.target.value) })} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer pt-7">
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
            <span>Visible en la landing</span>
          </label>
        </div>
        {err && <div className="text-sm text-red-500">{err}</div>}
        <div className="flex justify-between gap-2 pt-2">
          {initial && <Button type="button" variant="danger" onClick={onDelete}>Eliminar</Button>}
          <div className="flex gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
