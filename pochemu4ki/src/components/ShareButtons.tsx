import { useState } from 'react';
import { Share2, X, Copy, Check, Mail } from 'lucide-react';

function InstagramIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-grad)" />
      <circle cx="12" cy="12" r="4.5" stroke="#fff" strokeWidth="1.8" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="#fff" />
    </svg>
  );
}

interface ShareButtonsProps {
  storyId: string;
  storyTitle: string;
  childName?: string;
  /** If true, renders only the trigger button (no separate toggle) */
  inlinePanel?: boolean;
}

function WhatsAppIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="#fff">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="#fff">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export default function ShareButtons({ storyId, storyTitle, childName }: ShareButtonsProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [igCopied, setIgCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${storyId}`;
  const shareText = childName
    ? `📖 Почему-Ка! — «${storyTitle}»\nВолшебная сказка для ${childName}`
    : `📖 Почему-Ка! — «${storyTitle}»`;
  const fullText = `${shareText}\n${shareUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Сказка «${storyTitle}» — Почему-Ка!`)}&body=${encodeURIComponent(`${shareText}\n\nЧитать сказку: ${shareUrl}\n\nСоздайте свою историю на pochemu4ki-app.onrender.com`)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstagram = async () => {
    // Instagram has no web share URL — copy link first, then open Instagram
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setIgCopied(true);
    setTimeout(() => setIgCopied(false), 3000);
    setTimeout(() => window.open('https://www.instagram.com', '_blank'), 400);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: `Почему-Ка! — «${storyTitle}»`, text: shareText, url: shareUrl });
    } catch {
      // user cancelled or not supported
    }
  };

  return (
    <>
      {/* Share trigger */}
      <button
        onClick={() => setOpen(true)}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(76,29,149,0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}
        aria-label="Поделиться"
      >
        <Share2 size={17} />
      </button>

      {/* Bottom sheet */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
          />

          {/* Panel */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 301,
            background: 'linear-gradient(180deg, rgba(40,10,90,0.98) 0%, rgba(30,5,70,0.99) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px 20px 0 0',
            padding: '12px 20px 32px',
            boxShadow: '0 -8px 40px rgba(76,29,149,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderBottom: 'none',
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)', margin: '0 auto 16px' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <p style={{ color: '#fff', fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 16, margin: 0 }}>
                Поделиться сказкой
              </p>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }}
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            {/* Story title preview */}
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 20,
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Comfortaa, sans-serif', margin: '0 0 4px' }}>
                Сказка
              </p>
              <p style={{ color: '#fff', fontSize: 14, fontFamily: 'Literata, Georgia, serif', fontStyle: 'italic', margin: 0 }}>
                «{storyTitle}»
              </p>
            </div>

            {/* Share icons grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: igCopied ? 8 : 16 }}>
              {/* WhatsApp */}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={iconLinkStyle}>
                <div style={{ ...iconCircle, background: '#25D366' }}>
                  <WhatsAppIcon />
                </div>
                <span style={iconLabelStyle}>WhatsApp</span>
              </a>

              {/* Telegram */}
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" style={iconLinkStyle}>
                <div style={{ ...iconCircle, background: '#229ED9' }}>
                  <TelegramIcon />
                </div>
                <span style={iconLabelStyle}>Telegram</span>
              </a>

              {/* Instagram */}
              <button onClick={handleInstagram} style={{ ...iconLinkStyle, background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ ...iconCircle, background: igCopied ? '#4ADE80' : 'transparent', transition: 'background 0.25s' }}>
                  {igCopied ? <Check size={22} color="#fff" /> : <InstagramIcon />}
                </div>
                <span style={iconLabelStyle}>Instagram</span>
              </button>

              {/* Email */}
              <a href={emailUrl} style={iconLinkStyle}>
                <div style={{ ...iconCircle, background: 'rgba(255,255,255,0.12)' }}>
                  <Mail size={22} color="#fff" />
                </div>
                <span style={iconLabelStyle}>Email</span>
              </a>

              {/* Copy link */}
              <button onClick={handleCopy} style={{ ...iconLinkStyle, background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ ...iconCircle, background: copied ? '#4ADE80' : 'rgba(255,255,255,0.12)', transition: 'background 0.25s' }}>
                  {copied ? <Check size={22} color="#fff" /> : <Copy size={22} color="#fff" />}
                </div>
                <span style={iconLabelStyle}>{copied ? 'Скопировано' : 'Ссылка'}</span>
              </button>
            </div>

            {/* Instagram hint */}
            {igCopied && (
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '8px 12px',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>📋</span>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: 'Comfortaa, sans-serif', margin: 0, lineHeight: 1.4 }}>
                  Ссылка скопирована! Вставь её в Instagram Stories или описание профиля
                </p>
              </div>
            )}

            {/* Web Share API — "More" button (mobile) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button onClick={handleNativeShare} style={{
                width: '100%',
                padding: '13px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                fontFamily: 'Comfortaa, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
                <Share2 size={16} />
                Ещё способы поделиться
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}

const iconLinkStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
};

const iconCircle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const iconLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(255,255,255,0.7)',
  fontFamily: 'Comfortaa, sans-serif',
  textAlign: 'center',
};
