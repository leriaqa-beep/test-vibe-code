import { useNavigate, useLocation } from 'react-router-dom';

/* ── Иконки SVG — не Lucide, чтобы контролировать filled/outlined ── */
function IconHome({ active }: { active: boolean }) {
  return active ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="var(--accent-primary)" />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconLibrary({ active }: { active: boolean }) {
  return active ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="18" rx="1.5" fill="var(--accent-primary)" />
      <rect x="12" y="3" width="4" height="18" rx="1.5" fill="var(--accent-primary)" opacity="0.6" />
      <rect x="18" y="6" width="3" height="15" rx="1.5" fill="var(--accent-primary)" opacity="0.4" />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="18" rx="1.5" stroke="var(--text-muted)" strokeWidth="1.8" />
      <rect x="12" y="3" width="4" height="18" rx="1.5" stroke="var(--text-muted)" strokeWidth="1.8" />
      <rect x="18" y="6" width="3" height="15" rx="1.5" stroke="var(--text-muted)" strokeWidth="1.8" />
    </svg>
  );
}

function IconBook({ active }: { active: boolean }) {
  return active ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 4C4 4 8 3 12 5C16 3 20 4 20 4V20C20 20 16 19 12 21C8 19 4 20 4 20V4Z" fill="var(--accent-primary)" />
      <line x1="12" y1="5" x2="12" y2="21" stroke="white" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 4C4 4 8 3 12 5C16 3 20 4 20 4V20C20 20 16 19 12 21C8 19 4 20 4 20V4Z" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="12" y1="5" x2="12" y2="21" stroke="var(--text-muted)" strokeWidth="1.5" />
    </svg>
  );
}

function IconSettings({ active }: { active: boolean }) {
  return active ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" fill="white" />
      <path d="M12 1L13.5 5H10.5L12 1ZM12 23L10.5 19H13.5L12 23ZM1 12L5 10.5V13.5L1 12ZM23 12L19 13.5V10.5L23 12ZM4.22 4.22L7.05 7.05L4.93 9.17L2.1 6.34L4.22 4.22ZM19.78 19.78L16.95 16.95L19.07 14.83L21.9 17.66L19.78 19.78ZM4.22 19.78L2.1 17.66L4.93 14.83L7.05 16.95L4.22 19.78ZM19.78 4.22L21.9 6.34L19.07 9.17L16.95 7.05L19.78 4.22Z" fill="var(--accent-primary)" />
      <circle cx="12" cy="12" r="3.5" stroke="var(--accent-primary)" strokeWidth="2" fill="none" />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="var(--text-muted)" strokeWidth="1.8" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="var(--text-muted)" strokeWidth="1.8" />
    </svg>
  );
}

/* ── Маршруты, на которых показывается Bottom Nav ─────────────── */
const VISIBLE_PATHS = ['/app', '/app/library', '/app/book/create', '/app/settings', '/app/pricing'];

const NAV_ITEMS = [
  { path: '/app',              label: 'Главная',    Icon: IconHome,     exact: true  },
  { path: '/app/library',      label: 'Библиотека', Icon: IconLibrary,  exact: false },
  { path: '/app/book/create',  label: 'Сборник',    Icon: IconBook,     exact: false },
  { path: '/app/settings',     label: 'Профиль',    Icon: IconSettings, exact: false },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!VISIBLE_PATHS.includes(pathname)) return null;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'var(--bg-surface)',
        borderTop: '1px solid rgba(124,107,196,0.12)',
        boxShadow: '0 -4px 24px rgba(45,43,61,0.09)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {NAV_ITEMS.map(({ path, label, Icon, exact }) => {
        const active = exact ? pathname === path : pathname.startsWith(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '8px 4px 10px',
              minHeight: 60,
              color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
              transition: 'color 0.15s',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              position: 'relative',
            }}
          >
            {/* Active pill highlight */}
            <span style={{
              position: 'absolute',
              top: 6,
              width: 44,
              height: 28,
              borderRadius: 10,
              background: active ? 'var(--accent-primary-50)' : 'transparent',
              transition: 'background 0.2s',
            }} />
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 24 }}>
              <Icon active={active} />
            </span>
            <span style={{
              fontSize: 11,
              fontFamily: 'var(--font-display)',
              fontWeight: active ? 700 : 400,
              letterSpacing: active ? '0.01em' : 0,
              lineHeight: 1,
              color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
              position: 'relative',
              zIndex: 1,
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
