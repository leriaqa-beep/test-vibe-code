import { useState } from 'react';
import { MessageSquare, X, Send, Star } from 'lucide-react';
import { api } from '../api/client';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.users.sendFeedback(text, rating || undefined, window.location.pathname);
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setText('');
        setRating(0);
      }, 2000);
    } catch {
      // fail silently — feedback should never block the user
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Оставить отзыв"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 20,
          zIndex: 1000,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--gradient-button)',
          boxShadow: '0 4px 20px rgba(124,107,196,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open
          ? <X className="w-5 h-5 text-white" />
          : <MessageSquare className="w-5 h-5 text-white" />}
      </button>

      {/* Modal */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 84,
            right: 20,
            zIndex: 999,
            width: 300,
            background: 'var(--bg-surface)',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(45,43,61,0.18)',
            border: '1px solid var(--border-muted)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg,#f3f0ff,#fce7f3)',
              padding: '14px 16px 12px',
              borderBottom: '1px solid var(--border-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/assets/mascot/mascot-think.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>
                  Ваш отзыв важен!
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                  Помогите нам стать лучше
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '14px 16px 16px' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p style={{ fontSize: 28, marginBottom: 6 }}>🎉</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Спасибо!</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ваш отзыв получен</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Star rating */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 10, justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                    >
                      <Star
                        className="w-6 h-6"
                        style={{
                          fill: n <= (hovered || rating) ? '#F9D56E' : 'none',
                          stroke: n <= (hovered || rating) ? '#F9D56E' : 'var(--border-default)',
                          transition: 'all 0.1s',
                        }}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Что понравилось? Что улучшить?"
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    background: 'var(--bg-primary)',
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    marginBottom: 10,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                />

                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  style={{
                    width: '100%',
                    background: 'var(--gradient-button)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 0',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: sending || !text.trim() ? 'not-allowed' : 'pointer',
                    opacity: sending || !text.trim() ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Отправляем...' : 'Отправить'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
