import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DecorationLayer from '../components/Decorations';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden page-enter"
      style={{ background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}
    >
      <DecorationLayer preset="minimal" />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px', position: 'relative' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-primary)', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: 'var(--text-primary)', margin: 0 }}>
              Политика конфиденциальности
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: '4px 0 0' }}>
              Последнее обновление: март 2026 года
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 24, padding: '40px 40px', boxShadow: 'var(--shadow-card)' }}>
          <Section title="1. Общие положения">
            <p>
              Настоящая Политика конфиденциальности регулирует порядок сбора, хранения и обработки
              персональных данных пользователей сервиса <strong>Почему-Ка!</strong> (далее — «Сервис»),
              доступного по адресу <strong>pochemu4ki-app.onrender.com</strong>.
            </p>
            <p>
              Политика разработана в соответствии с требованиями{' '}
              <strong>Закона Кыргызской Республики «Об информации персонального характера»
              № 58 от 14 апреля 2008 года</strong>.
            </p>
            <p>
              Используя Сервис, вы подтверждаете, что ознакомились с настоящей Политикой
              и согласны с условиями обработки ваших персональных данных.
            </p>
          </Section>

          <Section title="2. Какие данные мы собираем">
            <p>Мы собираем только те данные, которые необходимы для работы Сервиса:</p>
            <ul>
              <li><strong>Данные аккаунта:</strong> адрес электронной почты, хэш пароля (пароль не хранится в открытом виде).</li>
              <li><strong>Данные через Google OAuth:</strong> имя, email и идентификатор Google-аккаунта — при входе через Google.</li>
              <li><strong>Профили детей:</strong> имя, возраст, пол, имя любимого героя, названия игрушек, интересы. Эти данные вводятся родителем добровольно для персонализации историй.</li>
              <li><strong>Истории и вопросы:</strong> вопросы, которые вы вводите, и сгенерированные сказки.</li>
              <li><strong>Технические данные:</strong> тип устройства, браузер, IP-адрес — в рамках стандартных серверных логов для обеспечения безопасности.</li>
            </ul>
            <p>Мы <strong>не собираем</strong> платёжные данные, документы, удостоверяющие личность, геолокацию или биометрические данные.</p>
          </Section>

          <Section title="3. Цели обработки данных">
            <p>Ваши данные используются исключительно для:</p>
            <ul>
              <li>создания и управления вашим аккаунтом;</li>
              <li>генерации персонализированных историй для вашего ребёнка;</li>
              <li>хранения созданных историй в вашей библиотеке;</li>
              <li>обеспечения безопасности и работоспособности Сервиса;</li>
              <li>связи с вами по техническим вопросам (при необходимости).</li>
            </ul>
            <p>Мы <strong>не продаём, не передаём и не используем</strong> ваши данные для рекламы или маркетинга третьих лиц.</p>
          </Section>

          <Section title="4. Хранение и защита данных">
            <p>
              Данные хранятся в базе данных <strong>Supabase (PostgreSQL)</strong>,
              расположенной на защищённых серверах. Передача данных осуществляется
              по протоколу <strong>HTTPS</strong>. Пароли хранятся в виде хэша
              (алгоритм bcrypt) и никогда не передаются в открытом виде.
            </p>
            <p>
              Мы принимаем разумные технические и организационные меры для защиты ваших
              данных от несанкционированного доступа, изменения или удаления.
            </p>
          </Section>

          <Section title="5. Данные детей">
            <p>
              Сервис предназначен для использования <strong>родителями и законными представителями</strong>.
              Профили детей создаются и управляются исключительно взрослыми пользователями.
              Мы не собираем данные непосредственно от детей.
            </p>
            <p>
              Информация о детях (имя, возраст, интересы) используется только для создания
              персонализированных историй и не передаётся третьим лицам.
            </p>
          </Section>

          <Section title="6. Ваши права">
            <p>
              В соответствии с Законом КР «Об информации персонального характера» вы имеете право:
            </p>
            <ul>
              <li><strong>Доступ:</strong> запросить информацию о том, какие ваши данные хранятся в Сервисе.</li>
              <li><strong>Исправление:</strong> потребовать исправления неточных или устаревших данных.</li>
              <li><strong>Удаление:</strong> запросить полное удаление вашего аккаунта и всех связанных данных (включая профили детей и истории).</li>
              <li><strong>Блокирование:</strong> потребовать прекращения обработки ваших данных.</li>
            </ul>
            <p>
              Для реализации любого из этих прав обратитесь к нам по адресу:{' '}
              <strong>support@pochemu4ki.app</strong>. Мы ответим в течение 7 рабочих дней.
            </p>
          </Section>

          <Section title="7. Третьи стороны">
            <p>Для работы Сервиса мы используем следующие сторонние сервисы:</p>
            <ul>
              <li><strong>Supabase</strong> — хранение данных пользователей.</li>
              <li><strong>Groq / Meta Llama</strong> — генерация текста историй. В запросы передаются: имя ребёнка, возраст, пол, имя героя, интересы, вопрос.</li>
              <li><strong>Google OAuth</strong> — опциональный вход через Google-аккаунт.</li>
              <li><strong>Render.com</strong> — хостинг приложения.</li>
            </ul>
            <p>Каждый из этих сервисов имеет собственную политику конфиденциальности.</p>
          </Section>

          <Section title="8. Изменения в политике">
            <p>
              Мы можем обновлять настоящую Политику. При существенных изменениях мы уведомим
              вас через интерфейс Сервиса или по электронной почте. Дата последнего обновления
              указана в заголовке документа.
            </p>
          </Section>

          <Section title="9. Контакты" last>
            <p>
              По всем вопросам, связанным с обработкой персональных данных, обращайтесь:
            </p>
            <p>
              <strong>Email:</strong> support@pochemu4ki.app<br />
              <strong>Сервис:</strong> Почему-Ка! — AI-истории для детей<br />
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Уполномоченный орган по защите персональных данных в КР:{' '}
              <a href="https://dpa.gov.kg" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                Государственное агентство по защите персональных данных
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ── Вспомогательный компонент секции ── */
function Section({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 32, paddingBottom: last ? 0 : 32, borderBottom: last ? 'none' : '1px solid var(--border-muted)' }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 'var(--text-lg)',
        color: 'var(--accent-primary)',
        marginBottom: 12,
        marginTop: 0,
      }}>
        {title}
      </h2>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)' }}>
        {children}
      </div>
    </div>
  );
}
