import { useState } from 'react';
import { api } from '../api/client';

const SOURCES = [
  { id: 'instagram',  label: 'Инстаграм',              emoji: '📸' },
  { id: 'vk',        label: 'ВКонтакте',               emoji: '💙' },
  { id: 'telegram',  label: 'Телеграм',                emoji: '✈️' },
  { id: 'tiktok',    label: 'TikTok',                  emoji: '🎵' },
  { id: 'youtube',   label: 'YouTube',                 emoji: '▶️' },
  { id: 'friends',   label: 'От друзей / знакомых',    emoji: '🤝' },
  { id: 'search',    label: 'Поисковик (Google, Яндекс)', emoji: '🔍' },
  { id: 'other',     label: 'Другое',                  emoji: '💬' },
];

const LS_KEY = 'referralSourceDone';

export function markReferralDone() {
  localStorage.setItem(LS_KEY, '1');
}

export function isReferralDone() {
  return !!localStorage.getItem(LS_KEY);
}

interface Props {
  onClose: () => void;
}

export default function ReferralSourceModal({ onClose }: Props) {
  const [selected, setSelected] = useState('');
  const [customText, setCustomText] = useState('');
  const [saving, setSaving] = useState(false);

  const canSubmit = selected && (selected !== 'other' || customText.trim().length > 0);

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    const source = selected === 'other' ? `Другое: ${customText.trim()}` : SOURCES.find(s => s.id === selected)!.label;
    try {
      await api.users.saveReferralSource(source);
    } catch { /* fail silently */ }
    markReferralDone();
    onClose();
  }

  function handleSkip() {
    markReferralDone();
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(45,43,61,0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 env(safe-area-inset-bottom, 0px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'var(--bg-surface)',
        borderRadius: '24px 24px 0 0',
        padding: '24px 20px 32px',
        boxShadow: '0 -8px 40px rgba(45,43,61,0.18)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img
            src="/assets/mascot/mascot-joy.png"
            alt=""
            style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 10 }}
          />
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 18, color: 'var(--text-primary)', margin: '0 0 6px',
          }}>
            Откуда вы узнали о нас?
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Это поможет нам стать лучше — займёт 5 секунд
          </p>
        </div>

        {/* Options grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {SOURCES.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px',
                borderRadius: 12,
                border: selected === s.id
                  ? '2px solid var(--accent-primary)'
                  : '1.5px solid var(--border-default)',
                background: selected === s.id
                  ? 'var(--accent-primary-50)'
                  : 'var(--bg-primary)',
                color: selected === s.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: selected === s.id ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Custom text for "Другое" */}
        {selected === 'other' && (
          <input
            type="text"
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            placeholder="Напишите откуда…"
            autoFocus
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '11px 14px', marginBottom: 12,
              fontSize: 14, fontFamily: 'var(--font-body)',
              color: 'var(--text-primary)',
              background: 'var(--bg-primary)',
              border: '1.5px solid var(--accent-primary-200)',
              borderRadius: 12, outline: 'none',
            }}
          />
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
          style={{
            width: '100%', padding: '14px 0',
            background: canSubmit ? 'var(--gradient-button)' : 'var(--bg-subtle)',
            color: canSubmit ? '#fff' : 'var(--text-muted)',
            border: 'none', borderRadius: 14,
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
            marginBottom: 10,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {saving ? 'Сохраняем…' : 'Отправить'}
        </button>

        <button
          onClick={handleSkip}
          style={{
            width: '100%', padding: '10px 0',
            background: 'none', border: 'none',
            fontSize: 13, color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Пропустить
        </button>
      </div>
    </div>
  );
}
