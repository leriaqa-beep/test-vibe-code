"""
Financial Model Generator — Семейное сторителлинг-приложение (B2C)
Generates a fully-formula-linked Excel workbook with:
  Sheet 1: Параметры       — input parameters (yellow)
  Sheet 2: Воронка продаж  — marketing funnel (Instagram / Influencers / Offline / Organic)
  Sheet 3: Расходы         — fixed & variable cost breakdown
  Sheet 4: P&L 24 месяца   — month-by-month P&L with users, revenue, COGS, OpEx, EBITDA
  Sheet 5: Unit Economics  — ARPU, CAC, LTV, LTV/CAC, payback, unit COGS
  Sheet 6: KPI Dashboard   — summary KPI cards + 24-month table
  Sheet 7: Сценарии        — bear / base / bull scenarios + assumptions
"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.formatting.rule import CellIsRule

wb = openpyxl.Workbook()

# ── colours ──────────────────────────────────────────────────────────────────
C = {
    'hdr_bg':    '4472C4',
    'hdr_fg':    'FFFFFF',
    'input_bg':  'FFF2CC',
    'calc_bg':   'DEEAF1',
    'sec_bg':    'D9E1F2',
    'total_bg':  'BDD7EE',
    'green':     'E2EFDA',
    'red':       'FCE4D6',
    'purple':    '7C6BC4',
    'purple_lt': 'EDE7F6',
    'gray_lt':   'F2F2F2',
    'gray':      '595959',
    'dark':      '1F1F1F',
    'dark_blue': '1F4E79',
    'deep_green':'375623',
}

# ── helpers ──────────────────────────────────────────────────────────────────
def hdr(cell, text=None, size=10):
    if text is not None:
        cell.value = text
    cell.font = Font(name='Calibri', bold=True, size=size, color=C['hdr_fg'])
    cell.fill = PatternFill(fill_type='solid', fgColor=C['hdr_bg'])
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)

def sec(cell, text=None, size=10):
    if text is not None:
        cell.value = text
    cell.font = Font(name='Calibri', bold=True, size=size, color=C['dark'])
    cell.fill = PatternFill(fill_type='solid', fgColor=C['sec_bg'])
    cell.alignment = Alignment(horizontal='left', vertical='center')

def inp(cell, value=None):
    if value is not None:
        cell.value = value
    cell.fill = PatternFill(fill_type='solid', fgColor=C['input_bg'])
    cell.font = Font(name='Calibri', size=10, color=C['dark_blue'])
    cell.alignment = Alignment(horizontal='right', vertical='center')

def calc(cell):
    cell.fill = PatternFill(fill_type='solid', fgColor=C['calc_bg'])
    cell.font = Font(name='Calibri', size=10)
    cell.alignment = Alignment(horizontal='right', vertical='center')

def lbl(cell, text=None, bold=False):
    if text is not None:
        cell.value = text
    cell.font = Font(name='Calibri', size=10, bold=bold, color=C['dark'])
    cell.alignment = Alignment(horizontal='left', vertical='center')

def tot(cell, bold=True):
    cell.fill = PatternFill(fill_type='solid', fgColor=C['total_bg'])
    cell.font = Font(name='Calibri', bold=bold, size=10)
    cell.alignment = Alignment(horizontal='right', vertical='center')

def cw(ws, col, width):
    ws.column_dimensions[get_column_letter(col)].width = width

def rh(ws, row, h=20):
    ws.row_dimensions[row].height = h

def merge(ws, r1, c1, r2, c2):
    ws.merge_cells(start_row=r1, start_column=c1, end_row=r2, end_column=c2)

def title_row(ws, text, cols=8, color='4472C4'):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=cols)
    c = ws.cell(1, 1, text)
    c.font = Font(name='Calibri', bold=True, size=14, color='FFFFFF')
    c.fill = PatternFill(fill_type='solid', fgColor=color)
    c.alignment = Alignment(horizontal='center', vertical='center')
    rh(ws, 1, 35)

# thin border helper
def thin():
    s = Side(style='thin', color='BFBFBF')
    return Border(left=s, right=s, top=s, bottom=s)

def fmt_pct(cell):  cell.number_format = '0.0%'
def fmt_num(cell):  cell.number_format = '#,##0'
def fmt_rub(cell):  cell.number_format = '#,##0 ₽'
def fmt_usd(cell):  cell.number_format = '$#,##0.000'
def fmt_dec(cell):  cell.number_format = '#,##0.00'

# ═══════════════════════════════════════════════════════════════════════════════
# SHEET 1 — ПАРАМЕТРЫ
# ═══════════════════════════════════════════════════════════════════════════════
ws1 = wb.active
ws1.title = '📊 Параметры'
title_row(ws1, '🚀  ФИНАНСОВАЯ МОДЕЛЬ — Семейное сторителлинг-приложение  |  B2C', cols=9)

ws1['A2'] = '⚠  Жёлтые ячейки — вводные данные (редактируйте).  Синие — расчётные (не трогайте).'
merge(ws1, 2, 1, 2, 9)
ws1['A2'].font = Font(name='Calibri', italic=True, size=9, color='595959')
rh(ws1, 2, 16)

# ── 1A. Pricing ───────────────────────────────────────────────────────────────
merge(ws1, 4, 1, 4, 5);  sec(ws1['A4'], '💰  ТАРИФНЫЕ ПЛАНЫ',  11)
for i, h in enumerate(['Параметр','Free','Премиум','Семейный','Примечание'], 1):
    hdr(ws1.cell(5, i), h)
rh(ws1, 4, 22); rh(ws1, 5, 20)

pricing_rows = [
    ('Цена, руб/мес',         0,    499,  799,  'Месячная подписка'),
    ('Цена, руб/год',         0,   3990, 6390,  'Годовая (-33 %)'),
    ('Историй в месяц',       3,   9999, 9999,  '9999 = безлимит'),
    ('Профилей детей',        1,      1,    5,  'Одновременных'),
    ('Иллюстрации',           'Нет','Да','Да',  ''),
    ('PDF-книги',             'Нет','Да','Да',  ''),
    ('Обработка личных фото', 'Нет','Нет','Да', 'Только Семейный'),
    ('Голосовая озвучка',     'Нет','Нет','Да*','*В разработке'),
]
for ri, (label, f, p, fam, note) in enumerate(pricing_rows, 6):
    lbl(ws1.cell(ri, 1), label)
    for ci, val in [(2, f),(3, p),(4, fam)]:
        c = ws1.cell(ri, ci)
        c.value = val
        if isinstance(val, (int, float)) and ci > 1:
            inp(c); fmt_num(c)
        else:
            c.font = Font(name='Calibri', size=10)
            c.alignment = Alignment(horizontal='center', vertical='center')
    ws1.cell(ri, 5).value = note
    ws1.cell(ri, 5).font = Font(name='Calibri', size=9, italic=True, color='595959')
    rh(ws1, ri, 20)

# ── 1B. Growth & Conversion ──────────────────────────────────────────────────
merge(ws1, 4, 7, 4, 9); sec(ws1['G4'], '📈  РОСТ И КОНВЕРСИЯ', 11)
for i, h in enumerate(['Параметр','Значение','Ед.'], 7):
    hdr(ws1.cell(5, i), h)

conv_rows = [
    ('Посещений сайта в М1 (план)',   500,   'шт'),
    ('Рост трафика в мес (%)',         0.15,  '%'),
    ('Посещение → Регистрация',        0.30,  '%'),
    ('Free → Премиум (conv %)',        0.06,  '%'),
    ('Free → Семейный (conv %)',      0.02,  '%'),
    ('Премиум → Семейный (upgrade %)',0.10,  '%'),
    ('Churn Премиум (мес %)',         0.05,  '%'),
    ('Churn Семейный (мес %)',        0.03,  '%'),
    ('Доля годовых подписок',         0.30,  '%'),
]
# Store row numbers for later cross-sheet references
# G8=reg_rate row, etc.  Rows 6..15 in column H (=col 8)
CONV_START = 6   # first data row
for ri, (label, val, unit) in enumerate(conv_rows, CONV_START):
    lbl(ws1.cell(ri, 7), label)
    c = ws1.cell(ri, 8)
    inp(c, val)
    if unit == '%': fmt_pct(c)
    else:           fmt_num(c)
    ws1.cell(ri, 9).value = unit
    ws1.cell(ri, 9).font = Font(name='Calibri', size=9, color='595959')
    rh(ws1, ri, 20)

# Named convenience refs  (row => sheet-formula reference)
# H6=visits_m1, H7=growth, H8=visit→reg conv, H9=free→prem, H10=free→fam
# H11=prem→fam, H12=churn_prem, H13=churn_fam, H14=annual_share
P = {
    'price_prem_m': 'C6',   # monthly premium price
    'price_fam_m':  'D6',   # monthly family price
    'price_prem_y': 'C7',   # annual premium price
    'price_fam_y':  'D7',   # annual family price
    'installs_m1':  'H6',   # visits M1
    'growth':       'H7',
    'reg_rate':     'H8',   # visit → registration
    'f2p':          'H9',
    'f2f':          'H10',
    'p2f':          'H11',
    'churn_p':      'H12',
    'churn_f':      'H13',
    'annual_sh':    'H14',
}

# ── 1C. AI variable costs ─────────────────────────────────────────────────────
AI_START = 18
merge(ws1, AI_START, 1, AI_START, 5)
sec(ws1[f'A{AI_START}'], '🤖  ПЕРЕМЕННАЯ СЕБЕСТОИМОСТЬ AI (на пользователя/мес)', 11)
for i, h in enumerate(['Операция','Цена (USD)','Кол-во/мес','Итого USD','Итого RUB'], 1):
    hdr(ws1.cell(AI_START+1, i), h)
rh(ws1, AI_START, 22); rh(ws1, AI_START+1, 20)

ai_rows = [
    ('Генерация истории (LLM Groq)',   0.005, 15),
    ('Иллюстрация AI (Pollinations)',  0.040,  5),
    ('Обработка фото AI',              0.080,  3),
    ('Голосовая озвучка TTS',          0.015,  8),
    ('Storage / CDN на польз.',        0.020,  1),
]
USD_RATE_ROW = AI_START + 2 + len(ai_rows) + 1   # will be defined below

for ri, (op, price, qty) in enumerate(ai_rows, AI_START+2):
    lbl(ws1.cell(ri, 1), op)
    c_p = ws1.cell(ri, 2); inp(c_p, price); fmt_usd(c_p)
    c_q = ws1.cell(ri, 3); inp(c_q, qty);   fmt_num(c_q)
    c_t = ws1.cell(ri, 4)
    c_t.value = f'=B{ri}*C{ri}'; calc(c_t); fmt_usd(c_t)
    rh(ws1, ri, 20)

ai_sum_row = AI_START + 2 + len(ai_rows)
lbl(ws1.cell(ai_sum_row, 1), 'ИТОГО AI / польз. / мес (USD)', bold=True)
c = ws1.cell(ai_sum_row, 4)
c.value = f'=SUM(D{AI_START+2}:D{ai_sum_row-1})'
tot(c); fmt_usd(c)
rh(ws1, ai_sum_row, 20)

# USD rate row
usd_row = ai_sum_row + 1
lbl(ws1.cell(usd_row, 1), 'Курс USD / RUB')
c_rate = ws1.cell(usd_row, 2); inp(c_rate, 95); fmt_num(c_rate)
lbl(ws1.cell(usd_row, 3), 'AI себест. / польз. / мес (RUB)', bold=True)
c_rub = ws1.cell(usd_row, 4)
c_rub.value = f'=D{ai_sum_row}*B{usd_row}'
calc(c_rub); fmt_dec(c_rub); c_rub.font = Font(name='Calibri', bold=True, size=10)
rh(ws1, usd_row, 20)
P['usd_rate'] = f'B{usd_row}'
P['ai_cost_rub'] = f'D{usd_row}'

# Fill in RUB column for each ai row
for ri in range(AI_START+2, AI_START+2+len(ai_rows)):
    c = ws1.cell(ri, 5)
    c.value = f'=D{ri}*{P["usd_rate"]}'
    calc(c); fmt_dec(c)
ws1.cell(ai_sum_row, 5).value = f'=D{ai_sum_row}*{P["usd_rate"]}'
calc(ws1.cell(ai_sum_row, 5)); fmt_dec(ws1.cell(ai_sum_row, 5))
ws1.cell(ai_sum_row, 5).font = Font(bold=True)

# column widths
for ci, w in enumerate([38,13,14,14,14,3,38,13,8], 1):
    cw(ws1, ci, w)

# ═══════════════════════════════════════════════════════════════════════════════
# SHEET 2 — ВОРОНКА ПРОДАЖ
# ═══════════════════════════════════════════════════════════════════════════════
ws2 = wb.create_sheet('🔽 Воронка продаж')
title_row(ws2, 'ВОРОНКА ПРОДАЖ — КАНАЛЫ ПРИВЛЕЧЕНИЯ', cols=9, color='ED7D31')

# ── 2A. Channel parameters ───────────────────────────────────────────────────
merge(ws2, 3, 1, 3, 9); sec(ws2['A3'], '📡  ПАРАМЕТРЫ КАНАЛОВ (редактируемые)', 11)
rh(ws2, 3, 22)
ch_hdrs = ['Канал','Бюджет руб/мес','CPM руб','CTR / CPC','CR Рег.%','Охват/клики','Регистрации/мес','CPR руб','Примечание']
for i, h in enumerate(ch_hdrs, 1): hdr(ws2.cell(4, i), h)
rh(ws2, 4, 20)

channels = [
    #  name                     budget  cpm   ctr     cr_inst   note               model
    ('Instagram (таргет)',      50000,  600,  0.015,  0.025,    'CPM-модель',       'cpm'),
    ('Инфлюенс-маркетинг',     40000,  None, 17,     None,     'CPI≈17₽/устан. Блогеры: мамы, семья', 'cpi'),
    ('Офлайн (плакаты/листовки)', 25000, None, 100,  None,     'CPI≈100₽. Сады, школы, педиатрия',    'cpi'),
    ('Органика / реферал',          0,  None, None,   None,     '20% от платных',   'organic'),
]
CH_ROWS = {}
for ri, (name, bgt, cpm, ctr_or_cpc, cr, note, model) in enumerate(channels, 5):
    CH_ROWS[name] = ri
    lbl(ws2.cell(ri, 1), name)
    c_bgt = ws2.cell(ri, 2); inp(c_bgt, bgt); fmt_num(c_bgt)

    if model == 'organic':
        ws2.cell(ri, 6).value = '—'
        paid_rows = [r for r in range(5, ri)]
        paid = '+'.join([f'G{r}' for r in paid_rows])
        ws2.cell(ri, 7).value = f'=ROUND(({paid})*0.20,0)'
        calc(ws2.cell(ri, 7)); fmt_num(ws2.cell(ri, 7))
        ws2.cell(ri, 8).value = '—'
    elif model == 'cpm':
        c_cpm = ws2.cell(ri, 3); inp(c_cpm, cpm); fmt_num(c_cpm)
        c_ctr = ws2.cell(ri, 4); inp(c_ctr, ctr_or_cpc); fmt_pct(c_ctr)
        c_cr  = ws2.cell(ri, 5); inp(c_cr,  cr);          fmt_pct(c_cr)
        c_reach = ws2.cell(ri, 6)
        c_reach.value = f'=ROUND(B{ri}/C{ri}*1000,0)'; calc(c_reach); fmt_num(c_reach)
        c_inst = ws2.cell(ri, 7)
        c_inst.value = f'=ROUND(F{ri}*D{ri}*E{ri},0)'; calc(c_inst); fmt_num(c_inst)
        c_cpi = ws2.cell(ri, 8)
        c_cpi.value = f'=IFERROR(B{ri}/G{ri},0)'; calc(c_cpi); fmt_dec(c_cpi)
    elif model == 'cpc':
        ws2.cell(ri, 3).value = 'CPC'
        ws2.cell(ri, 3).font = Font(name='Calibri', size=9, italic=True, color='595959')
        c_cpc = ws2.cell(ri, 4); inp(c_cpc, ctr_or_cpc); fmt_num(c_cpc)
        c_cr  = ws2.cell(ri, 5); inp(c_cr, cr);           fmt_pct(c_cr)
        c_clicks = ws2.cell(ri, 6)
        c_clicks.value = f'=ROUND(B{ri}/D{ri},0)'; calc(c_clicks); fmt_num(c_clicks)
        c_inst = ws2.cell(ri, 7)
        c_inst.value = f'=ROUND(F{ri}*E{ri},0)'; calc(c_inst); fmt_num(c_inst)
        c_cpi = ws2.cell(ri, 8)
        c_cpi.value = f'=IFERROR(B{ri}/G{ri},0)'; calc(c_cpi); fmt_dec(c_cpi)
    elif model == 'cpi':
        # Fixed CPI model: budget / CPI = installs
        ws2.cell(ri, 3).value = 'CPI'
        ws2.cell(ri, 3).font = Font(name='Calibri', size=9, italic=True, color='595959')
        c_cpi_in = ws2.cell(ri, 4); inp(c_cpi_in, ctr_or_cpc); fmt_num(c_cpi_in)
        ws2.cell(ri, 5).value = '—'
        ws2.cell(ri, 6).value = '—'
        c_inst = ws2.cell(ri, 7)
        c_inst.value = f'=ROUND(IFERROR(B{ri}/D{ri},0),0)'; calc(c_inst); fmt_num(c_inst)
        c_cpi = ws2.cell(ri, 8)
        c_cpi.value = f'=D{ri}'; calc(c_cpi); fmt_dec(c_cpi)

    ws2.cell(ri, 9).value = note
    ws2.cell(ri, 9).font = Font(name='Calibri', size=9, italic=True, color='595959')
    rh(ws2, ri, 20)

# Totals row
TOT_CH_ROW = 5 + len(channels)
lbl(ws2.cell(TOT_CH_ROW, 1), 'ИТОГО / мес', bold=True)
ws2.cell(TOT_CH_ROW, 1).fill = PatternFill(fill_type='solid', fgColor=C['total_bg'])
for col in [2, 7]:
    c = ws2.cell(TOT_CH_ROW, col)
    c.value = f'=SUM({get_column_letter(col)}5:{get_column_letter(col)}{TOT_CH_ROW-1})'
    tot(c); fmt_num(c)
rh(ws2, TOT_CH_ROW, 20)

# CAC
cac_row = TOT_CH_ROW + 1
lbl(ws2.cell(cac_row, 1), 'CAC (стоимость 1 регистрации, руб)', bold=True)
c_cac = ws2.cell(cac_row, 2)
c_cac.value = f'=IFERROR(B{TOT_CH_ROW}/G{TOT_CH_ROW},0)'
c_cac.fill = PatternFill(fill_type='solid', fgColor=C['red'])
c_cac.font = Font(name='Calibri', bold=True, size=11, color='C00000')
fmt_dec(c_cac); rh(ws2, cac_row, 22)

CAC_CELL = f"'🔽 Воронка продаж'!B{cac_row}"
TOTAL_INSTALLS_CELL = f"'🔽 Воронка продаж'!G{TOT_CH_ROW}"
TOTAL_BUDGET_CELL   = f"'🔽 Воронка продаж'!B{TOT_CH_ROW}"

# ── 2B. Funnel conversion waterfall ──────────────────────────────────────────
FW_START = cac_row + 3
merge(ws2, FW_START, 1, FW_START, 6)
sec(ws2[f'A{FW_START}'], '🌊  ВОРОНКА КОНВЕРСИИ (Месяц 1)', 11); rh(ws2, FW_START, 22)
fw_hdrs = ['Этап','Кол-во','Конверсия','Потеря','Стоимость этапа (руб)','Комментарий']
for i, h in enumerate(fw_hdrs, 1): hdr(ws2.cell(FW_START+1, i), h)

f = FW_START + 2
funnel_steps = [
    ('1. Посещения сайта',        f"=G{TOT_CH_ROW}",                                     None,                    None, f"=B{TOT_CH_ROW}",        'Все каналы'),
    ('2. Регистрации (Free)',     f"=ROUND(B{f}*'📊 Параметры'!H8,0)",                   f"='📊 Параметры'!H8",   f"=B{f}-B{f+1}", '—',           'Посещение→Регистрация; регистрация = Free доступ'),
    ('3. Новые Премиум',         f"=ROUND(B{f+1}*'📊 Параметры'!H9,0)",                 f"='📊 Параметры'!H9",   f"=B{f+1}-B{f+2}", '—',         'Free→Prem'),
    ('4. Новые Семейный',        f"=ROUND(B{f+1}*'📊 Параметры'!H10,0)",                f"='📊 Параметры'!H10",  '—',               '—',          'Free→Fam'),
    ('5. Апгрейд Prem→Fam',      f"=ROUND(B{f+2}*'📊 Параметры'!H11,0)",               f"='📊 Параметры'!H11",  '—',               '—',          'Upgrade'),
]
for si, (label, qty_f, conv_f, loss_f, cost_f, comment) in enumerate(funnel_steps):
    r = f + si
    lbl(ws2.cell(r, 1), label)
    ws2.cell(r, 2).value = qty_f;  calc(ws2.cell(r, 2)); fmt_num(ws2.cell(r, 2))
    if conv_f: ws2.cell(r, 3).value = conv_f; calc(ws2.cell(r, 3)); fmt_pct(ws2.cell(r, 3))
    else: ws2.cell(r, 3).value = '—'
    if loss_f and loss_f != '—': ws2.cell(r, 4).value = loss_f; calc(ws2.cell(r, 4)); fmt_num(ws2.cell(r, 4))
    else: ws2.cell(r, 4).value = '—'
    if cost_f and cost_f != '—': ws2.cell(r, 5).value = cost_f; calc(ws2.cell(r, 5)); fmt_num(ws2.cell(r, 5))
    else: ws2.cell(r, 5).value = '—'
    ws2.cell(r, 6).value = comment
    ws2.cell(r, 6).font = Font(name='Calibri', size=9, italic=True, color='595959')
    rh(ws2, r, 20)

for ci, w in enumerate([30,14,12,12,22,20,12,10,25], 1):
    cw(ws2, ci, w)

# ═══════════════════════════════════════════════════════════════════════════════
# SHEET 3 — РАСХОДЫ
# ═══════════════════════════════════════════════════════════════════════════════
ws3 = wb.create_sheet('💸 Расходы')
title_row(ws3, 'СТРУКТУРА РАСХОДОВ — ЕЖЕМЕСЯЧНЫЕ ЗАТРАТЫ', cols=5, color='C00000')

# ── 3A. Team ─────────────────────────────────────────────────────────────────
merge(ws3, 3, 1, 3, 5); sec(ws3['A3'], '👥  КОМАНДА  (ФОТ с налогами — коэффициент 1.35)', 11); rh(ws3, 3, 22)
for i, h in enumerate(['Роль','Оклад руб/мес','Кол-во','С налогами (×1.35)','Примечание'], 1):
    hdr(ws3.cell(4, i), h)
rh(ws3, 4, 20)

team = [
    ('CEO / Product Manager',         130000, 1, 'Продукт, стратегия'),
    ('Lead Backend Developer',         160000, 1, 'Node.js, Supabase'),
    ('Frontend Developer',             130000, 1, 'React, Vite'),
    ('UI/UX Designer',                 100000, 1, 'Figma, иллюстрации'),
    ('Маркетолог / SMM',                90000, 1, 'Instagram, Telegram'),
    ('DevOps (part-time)',              60000, 1, 'Render.com, CI/CD'),
    ('Контент-менеджер',                70000, 1, 'Тексты, коммьюнити'),
]
TEAM_START = 5
for ri, (role, salary, cnt, note) in enumerate(team, TEAM_START):
    lbl(ws3.cell(ri, 1), role)
    c_s = ws3.cell(ri, 2); inp(c_s, salary); fmt_num(c_s)
    c_c = ws3.cell(ri, 3); inp(c_c, cnt);    fmt_num(c_c)
    c_t = ws3.cell(ri, 4); c_t.value = f'=B{ri}*C{ri}*1.35'; calc(c_t); fmt_num(c_t)
    ws3.cell(ri, 5).value = note; ws3.cell(ri, 5).font = Font(name='Calibri', size=9, italic=True, color='595959')
    rh(ws3, ri, 20)

TEAM_TOT = TEAM_START + len(team)
lbl(ws3.cell(TEAM_TOT, 1), 'ИТОГО ФОТ (с налогами)', bold=True)
ws3.cell(TEAM_TOT, 1).fill = PatternFill(fill_type='solid', fgColor=C['total_bg'])
c = ws3.cell(TEAM_TOT, 4); c.value = f'=SUM(D{TEAM_START}:D{TEAM_TOT-1})'; tot(c); fmt_num(c)
rh(ws3, TEAM_TOT, 20)

# ── 3B. Infrastructure ───────────────────────────────────────────────────────
INFRA_SEC = TEAM_TOT + 2
merge(ws3, INFRA_SEC, 1, INFRA_SEC, 5); sec(ws3[f'A{INFRA_SEC}'], '🖥️  ИНФРАСТРУКТУРА И ИНСТРУМЕНТЫ', 11); rh(ws3, INFRA_SEC, 22)
for i, h in enumerate(['Сервис','USD/мес','Курс','RUB/мес','Назначение'], 1):
    hdr(ws3.cell(INFRA_SEC+1, i), h)
rh(ws3, INFRA_SEC+1, 20)

infra = [
    ('Render.com (Backend + Frontend)',  50, 'Хостинг'),
    ('Supabase Pro',                     25, 'БД + Auth + Storage'),
    ('Groq API (LLM истории)',           30, 'Генерация историй'),
    ('Pollinations / AI Images',         20, 'Иллюстрации'),
    ('Resend (Email транзакц.)',         10, 'Сброс пароля, нотиф.'),
    ('Cloudflare CDN',                   10, 'CDN + DDoS'),
    ('Sentry (мониторинг ошибок)',       15, 'Error tracking'),
    ('GitHub + CI/CD Actions',           10, 'Репозиторий'),
    ('Figma Team',                       15, 'Дизайн'),
    ('Notion / Linear',                  10, 'Управление проектом'),
    ('Stripe / ЮKassa (платёжный шлюз)',  15, 'Подписка + разовые оплаты'),
    ('Прочие SaaS / аналитика',         20, 'Amplitude, Hotjar'),
]
INFRA_START = INFRA_SEC + 2
for ri, (svc, usd, note) in enumerate(infra, INFRA_START):
    lbl(ws3.cell(ri, 1), svc)
    c_u = ws3.cell(ri, 2); inp(c_u, usd); c_u.number_format = '$#,##0'
    c_r = ws3.cell(ri, 3); c_r.value = f"='📊 Параметры'!{P['usd_rate']}"; calc(c_r); fmt_num(c_r)
    c_rub = ws3.cell(ri, 4); c_rub.value = f'=B{ri}*C{ri}'; calc(c_rub); fmt_num(c_rub)
    ws3.cell(ri, 5).value = note; ws3.cell(ri, 5).font = Font(name='Calibri', size=9, italic=True, color='595959')
    rh(ws3, ri, 20)

INFRA_TOT = INFRA_START + len(infra)
lbl(ws3.cell(INFRA_TOT, 1), 'ИТОГО Инфраструктура', bold=True)
ws3.cell(INFRA_TOT, 1).fill = PatternFill(fill_type='solid', fgColor=C['total_bg'])
c = ws3.cell(INFRA_TOT, 4); c.value = f'=SUM(D{INFRA_START}:D{INFRA_TOT-1})'; tot(c); fmt_num(c)
rh(ws3, INFRA_TOT, 20)

# ── 3C. Admin / Legal ────────────────────────────────────────────────────────
ADM_SEC = INFRA_TOT + 2
merge(ws3, ADM_SEC, 1, ADM_SEC, 5); sec(ws3[f'A{ADM_SEC}'], '📋  АДМИНИСТРАТИВНЫЕ И ЮРИДИЧЕСКИЕ РАСХОДЫ', 11); rh(ws3, ADM_SEC, 22)
for i, h in enumerate(['Статья','RUB/мес','','','Примечание'], 1):
    if h: hdr(ws3.cell(ADM_SEC+1, i), h)

admin = [
    ('ИП/ООО — аутсорс-бухгалтерия',    10000, 'Ежемесячно'),
    ('Юридические услуги',                5000, 'Договоры, оферта'),
    ('Банковское обслуживание + эквайринг',3000, 'Комиссии'),
    ('Офис / коворкинг',                 15000, 'Рабочее пространство'),
    ('Корпоративная связь',               3000, 'Телефония, интернет'),
    ('Прочие адм. расходы',               5000, 'Командировки, канцелярия'),
]
ADM_START = ADM_SEC + 2
for ri, (item, cost, note) in enumerate(admin, ADM_START):
    lbl(ws3.cell(ri, 1), item)
    c = ws3.cell(ri, 2); inp(c, cost); fmt_num(c)
    ws3.cell(ri, 5).value = note; ws3.cell(ri, 5).font = Font(name='Calibri', size=9, italic=True, color='595959')
    rh(ws3, ri, 20)

ADM_TOT = ADM_START + len(admin)
lbl(ws3.cell(ADM_TOT, 1), 'ИТОГО Административные', bold=True)
ws3.cell(ADM_TOT, 1).fill = PatternFill(fill_type='solid', fgColor=C['total_bg'])
c = ws3.cell(ADM_TOT, 2); c.value = f'=SUM(B{ADM_START}:B{ADM_TOT-1})'; tot(c); fmt_num(c)
rh(ws3, ADM_TOT, 20)

# ── Grand fixed costs total ───────────────────────────────────────────────────
GFC_ROW = ADM_TOT + 2
merge(ws3, GFC_ROW, 1, GFC_ROW, 3)
ws3[f'A{GFC_ROW}'] = '📌  ИТОГО ПОСТОЯННЫЕ РАСХОДЫ (без маркетинга и AI)'
ws3[f'A{GFC_ROW}'].font = Font(name='Calibri', bold=True, size=11, color='FFFFFF')
ws3[f'A{GFC_ROW}'].fill = PatternFill(fill_type='solid', fgColor=C['deep_green'])
ws3[f'A{GFC_ROW}'].alignment = Alignment(horizontal='left', vertical='center')
c = ws3.cell(GFC_ROW, 4)
c.value = f"=D{TEAM_TOT}+D{INFRA_TOT}+B{ADM_TOT}"
c.font = Font(name='Calibri', bold=True, size=11, color='FFFFFF')
c.fill = PatternFill(fill_type='solid', fgColor=C['deep_green'])
fmt_num(c); rh(ws3, GFC_ROW, 28)

for ci, w in enumerate([40,14,12,18,35], 1): cw(ws3, ci, w)

# ═══════════════════════════════════════════════════════════════════════════════
# SHEET 4 — P&L 24 МЕСЯЦА
# ═══════════════════════════════════════════════════════════════════════════════
ws4 = wb.create_sheet('📈 P&L 24 месяца')
ws4.merge_cells(f'A1:{get_column_letter(25)}1')
ws4['A1'] = 'ОТЧЁТ О ПРИБЫЛЯХ И УБЫТКАХ — 24 МЕСЯЦА'
ws4['A1'].font = Font(name='Calibri', bold=True, size=14, color='FFFFFF')
ws4['A1'].fill = PatternFill(fill_type='solid', fgColor=C['deep_green'])
ws4['A1'].alignment = Alignment(horizontal='center', vertical='center')
rh(ws4, 1, 35)

# Header row
for i, h in enumerate(['Показатель'] + [f'М{m}' for m in range(1, 25)], 1):
    c = ws4.cell(2, i)
    if i == 1:
        c.value = h; c.font = Font(name='Calibri', bold=True, size=10)
        c.alignment = Alignment(horizontal='left', vertical='center')
        c.fill = PatternFill(fill_type='solid', fgColor=C['sec_bg'])
    else:
        hdr(c, h, 9)
rh(ws4, 2, 22)

# helpers
def pl_sec(ws, row, text, cols=25):
    merge(ws, row, 1, row, cols)
    c = ws.cell(row, 1)
    c.value = text
    c.font = Font(name='Calibri', bold=True, size=10, color='FFFFFF')
    c.fill = PatternFill(fill_type='solid', fgColor=C['gray'])
    c.alignment = Alignment(horizontal='left', vertical='center')
    rh(ws, row, 20)

def pl_row_data(ws, row, label, formulas_list, fmt_fn=fmt_num, bold=False, bg=None):
    c = ws.cell(row, 1)
    c.value = label; c.font = Font(name='Calibri', size=10, bold=bold)
    c.alignment = Alignment(horizontal='left', vertical='center')
    if bg: c.fill = PatternFill(fill_type='solid', fgColor=bg)
    for m, formula in enumerate(formulas_list, 2):
        cell = ws.cell(row, m)
        cell.value = formula
        cell.font = Font(name='Calibri', size=9, bold=bold)
        cell.alignment = Alignment(horizontal='right', vertical='center')
        if bg: cell.fill = PatternFill(fill_type='solid', fgColor=bg)
        else:  cell.fill = PatternFill(fill_type='solid', fgColor=C['calc_bg'])
        fmt_fn(cell)
    rh(ws4, row, 18)

row = 3  # current row pointer

# ── USERS ────────────────────────────────────────────────────────────────────
pl_sec(ws4, row, '👥  ПОЛЬЗОВАТЕЛИ'); row += 1

# New installs
INST_ROW = row
formulas = []
for m in range(1, 25):
    col = get_column_letter(m + 1)
    if m == 1:
        formulas.append(f"='📊 Параметры'!{P['installs_m1']}")
    else:
        prev = get_column_letter(m)
        formulas.append(f"=ROUND({prev}{INST_ROW}*(1+'📊 Параметры'!{P['growth']}),0)")
pl_row_data(ws4, row, 'Посещений сайта', formulas); row += 1

# New registrations = new free users (registration gives instant free access)
REG_ROW = row
FREE_ROW = row  # registration = free access, no separate activation step
formulas = [f"=ROUND({get_column_letter(m+1)}{INST_ROW}*'📊 Параметры'!{P['reg_rate']},0)" for m in range(1, 25)]
pl_row_data(ws4, row, 'Новые регистрации (= Free)', formulas); row += 1

# New Premium
NPREM_ROW = row
formulas = [f"=ROUND({get_column_letter(m+1)}{FREE_ROW}*'📊 Параметры'!{P['f2p']},0)" for m in range(1, 25)]
pl_row_data(ws4, row, 'Новые Премиум (мес)', formulas); row += 1

# New Family
NFAM_ROW = row
formulas = [f"=ROUND({get_column_letter(m+1)}{FREE_ROW}*'📊 Параметры'!{P['f2f']},0)" for m in range(1, 25)]
pl_row_data(ws4, row, 'Новые Семейный (мес)', formulas); row += 1

# Cumulative Premium (with churn & upgrades)
CPREM_ROW = row
formulas = []
for m in range(1, 25):
    col  = get_column_letter(m + 1)
    prev = get_column_letter(m)
    if m == 1:
        formulas.append(f"={col}{NPREM_ROW}")
    else:
        formulas.append(
            f"=ROUND(MAX(0,{prev}{CPREM_ROW}*(1-'📊 Параметры'!{P['churn_p']}-'📊 Параметры'!{P['p2f']})+{col}{NPREM_ROW}),0)"
        )
pl_row_data(ws4, row, 'Активные Премиум (база)', formulas, bold=True, bg=C['green']); row += 1

# Cumulative Family (with churn & upgrades from premium)
CFAM_ROW = row
formulas = []
for m in range(1, 25):
    col  = get_column_letter(m + 1)
    prev = get_column_letter(m)
    if m == 1:
        formulas.append(f"={col}{NFAM_ROW}")
    else:
        formulas.append(
            f"=ROUND(MAX(0,{prev}{CFAM_ROW}*(1-'📊 Параметры'!{P['churn_f']})+{col}{NFAM_ROW}+{prev}{CPREM_ROW}*'📊 Параметры'!{P['p2f']}),0)"
        )
pl_row_data(ws4, row, 'Активные Семейный (база)', formulas, bold=True, bg=C['calc_bg']); row += 1

# Total paying
TPAY_ROW = row
formulas = [f"={get_column_letter(m+1)}{CPREM_ROW}+{get_column_letter(m+1)}{CFAM_ROW}" for m in range(1, 25)]
pl_row_data(ws4, row, 'Всего платящих', formulas, bold=True, bg=C['total_bg']); row += 1

# ── REVENUE ──────────────────────────────────────────────────────────────────
pl_sec(ws4, row, '💰  ВЫРУЧКА'); row += 1

# Premium revenue (mix monthly/annual)
PREV_ROW = row
formulas = []
for m in range(1, 25):
    col = get_column_letter(m+1)
    formulas.append(
        f"=ROUND({col}{CPREM_ROW}*(1-'📊 Параметры'!{P['annual_sh']})*'📊 Параметры'!{P['price_prem_m']}"
        f"+{col}{CPREM_ROW}*'📊 Параметры'!{P['annual_sh']}*'📊 Параметры'!{P['price_prem_y']}/12,0)"
    )
pl_row_data(ws4, row, 'Выручка Премиум (руб)', formulas); row += 1

# Family revenue
FREV_ROW = row
formulas = []
for m in range(1, 25):
    col = get_column_letter(m+1)
    formulas.append(
        f"=ROUND({col}{CFAM_ROW}*(1-'📊 Параметры'!{P['annual_sh']})*'📊 Параметры'!{P['price_fam_m']}"
        f"+{col}{CFAM_ROW}*'📊 Параметры'!{P['annual_sh']}*'📊 Параметры'!{P['price_fam_y']}/12,0)"
    )
pl_row_data(ws4, row, 'Выручка Семейный (руб)', formulas); row += 1

# Total revenue (MRR)
TREV_ROW = row
formulas = [f"={get_column_letter(m+1)}{PREV_ROW}+{get_column_letter(m+1)}{FREV_ROW}" for m in range(1, 25)]
pl_row_data(ws4, row, 'MRR — ИТОГО ВЫРУЧКА (руб)', formulas, bold=True, bg=C['total_bg']); row += 1

# ── COGS ─────────────────────────────────────────────────────────────────────
pl_sec(ws4, row, '⚙️  COGS — ПРЯМЫЕ ПЕРЕМЕННЫЕ РАСХОДЫ'); row += 1

# AI costs
AICOST_ROW = row
formulas = [f"=ROUND({get_column_letter(m+1)}{TPAY_ROW}*'📊 Параметры'!{P['ai_cost_rub']},0)" for m in range(1, 25)]
pl_row_data(ws4, row, 'AI-расходы (переменные)', formulas); row += 1

# Web платёжная комиссия (вместо App Store)
APP_ROW = row
formulas = [f"=ROUND({get_column_letter(m+1)}{TREV_ROW}*0.035,0)" for m in range(1, 25)]
pl_row_data(ws4, row, 'Комиссия платёжного шлюза (3.5% — Stripe/ЮKassa)', formulas); row += 1

# Payment processing 2.5%
PAY_ROW = row
formulas = [f"=ROUND({get_column_letter(m+1)}{TREV_ROW}*0.025,0)" for m in range(1, 25)]
pl_row_data(ws4, row, 'Эквайринг / платёжная комиссия (2.5%)', formulas); row += 1

# Total COGS
TCOGS_ROW = row
formulas = [
    f"={get_column_letter(m+1)}{AICOST_ROW}+{get_column_letter(m+1)}{APP_ROW}+{get_column_letter(m+1)}{PAY_ROW}"
    for m in range(1, 25)
]
pl_row_data(ws4, row, 'ИТОГО COGS', formulas, bold=True, bg=C['red']); row += 1

# Gross Profit
GP_ROW = row
formulas = [f"={get_column_letter(m+1)}{TREV_ROW}-{get_column_letter(m+1)}{TCOGS_ROW}" for m in range(1, 25)]
pl_row_data(ws4, row, 'ВАЛОВАЯ ПРИБЫЛЬ', formulas, bold=True, bg=C['green']); row += 1

# Gross Margin %
GM_ROW = row
formulas = [f"=IFERROR({get_column_letter(m+1)}{GP_ROW}/{get_column_letter(m+1)}{TREV_ROW},0)" for m in range(1, 25)]
pl_row_data(ws4, row, 'Gross Margin %', formulas, fmt_fn=fmt_pct, bg=C['green']); row += 1

# ── OpEx ─────────────────────────────────────────────────────────────────────
pl_sec(ws4, row, '📊  ОПЕРАЦИОННЫЕ РАСХОДЫ (OpEx)'); row += 1

# Team
TEAM_ROW = row
formulas = [f"='💸 Расходы'!D{TEAM_TOT}" for _ in range(24)]
pl_row_data(ws4, row, 'ФОТ команды (с налогами)', formulas); row += 1

# Infrastructure (base + scale)
INFRA_ROW = row
formulas = [
    f"=ROUND('💸 Расходы'!D{INFRA_TOT}*(1+{get_column_letter(m+1)}{TPAY_ROW}/2000*0.10),0)"
    for m in range(1, 25)
]
pl_row_data(ws4, row, 'Инфраструктура (масштабируемая)', formulas); row += 1

# Admin
ADM_ROW = row
formulas = [f"='💸 Расходы'!B{ADM_TOT}" for _ in range(24)]
pl_row_data(ws4, row, 'Административные расходы', formulas); row += 1

# Marketing budget (grows with installs)
MKT_ROW = row
formulas = []
for m in range(1, 25):
    col = get_column_letter(m+1)
    if m == 1:
        formulas.append(f"={TOTAL_BUDGET_CELL}")
    else:
        formulas.append(f"=ROUND({TOTAL_BUDGET_CELL}*POWER(1+'📊 Параметры'!{P['growth']},{m-1}),0)")
pl_row_data(ws4, row, 'Маркетинговый бюджет', formulas); row += 1

# Total OpEx
TOPEX_ROW = row
formulas = [
    f"={get_column_letter(m+1)}{TEAM_ROW}+{get_column_letter(m+1)}{INFRA_ROW}+{get_column_letter(m+1)}{ADM_ROW}+{get_column_letter(m+1)}{MKT_ROW}"
    for m in range(1, 25)
]
pl_row_data(ws4, row, 'ИТОГО OpEx', formulas, bold=True, bg=C['red']); row += 1

# EBITDA
EBITDA_ROW = row
formulas = [f"={get_column_letter(m+1)}{GP_ROW}-{get_column_letter(m+1)}{TOPEX_ROW}" for m in range(1, 25)]
pl_row_data(ws4, row, 'EBITDA', formulas, bold=True, bg=C['total_bg']); row += 1

# EBITDA Margin
EBITDAM_ROW = row
formulas = [f"=IFERROR({get_column_letter(m+1)}{EBITDA_ROW}/{get_column_letter(m+1)}{TREV_ROW},0)" for m in range(1, 25)]
pl_row_data(ws4, row, 'EBITDA Margin %', formulas, fmt_fn=fmt_pct, bg=C['total_bg']); row += 1

# Cumulative CF
CUMCF_ROW = row
formulas = []
for m in range(1, 25):
    col = get_column_letter(m+1)
    if m == 1:
        formulas.append(f"={col}{EBITDA_ROW}")
    else:
        prev = get_column_letter(m)
        formulas.append(f"={prev}{CUMCF_ROW}+{col}{EBITDA_ROW}")
pl_row_data(ws4, row, 'Накопленный денежный поток (CF)', formulas, bold=True, bg='BDD7EE'); row += 1

# Conditional formatting for EBITDA and CumCF
green_fill = PatternFill(fill_type='solid', fgColor=C['green'])
red_fill   = PatternFill(fill_type='solid', fgColor=C['red'])
for r in [EBITDA_ROW, CUMCF_ROW]:
    rng = f'B{r}:{get_column_letter(25)}{r}'
    ws4.conditional_formatting.add(rng, CellIsRule(operator='greaterThanOrEqual', formula=['0'], fill=green_fill))
    ws4.conditional_formatting.add(rng, CellIsRule(operator='lessThan',           formula=['0'], fill=red_fill))

cw(ws4, 1, 40)
for col in range(2, 26): cw(ws4, col, 11)
ws4.freeze_panes = 'B3'

# ═══════════════════════════════════════════════════════════════════════════════
# SHEET 5 — UNIT ECONOMICS
# ═══════════════════════════════════════════════════════════════════════════════
ws5 = wb.create_sheet('🎯 Unit Economics')
title_row(ws5, 'ЮНИТ-ЭКОНОМИКА — КЛЮЧЕВЫЕ МЕТРИКИ', cols=6, color=C['purple'])

M12 = get_column_letter(13)   # Column for Month 12 in P&L (B=M1 → M12=col13=N... wait)
# B=col2=M1, C=col3=M2 ... N=col14=M13? No: B=2 → M1, col=2+m-1 → col=2+12-1=13=M → M=col13
# Actually: get_column_letter(13) = 'M'. Let's verify: A=1,B=2,...M=13. Yes M=col13=M12. Correct.

def ue_row(ws, row, label, formula_or_val, fmt_fn, desc='', benchmark=''):
    lbl(ws.cell(row, 1), label)
    c = ws.cell(row, 2); c.value = formula_or_val; calc(c); fmt_fn(c)
    ws.cell(row, 3).value = desc
    ws.cell(row, 3).font = Font(name='Calibri', size=9, italic=True, color='595959')
    ws.cell(row, 3).alignment = Alignment(horizontal='left')
    ws.cell(row, 4).value = benchmark
    ws.cell(row, 4).font = Font(name='Calibri', size=9, italic=True, color='595959')
    rh(ws5, row, 20)

# ── ARPU ─────────────────────────────────────────────────────────────────────
merge(ws5, 3, 1, 3, 5); sec(ws5['A3'], '💵  ARPU — СРЕДНИЙ ДОХОД НА ПОЛЬЗОВАТЕЛЯ', 11); rh(ws5, 3, 22)
for i, h in enumerate(['Метрика','Значение','Формула / Источник','Бенчмарк'], 1): hdr(ws5.cell(4, i), h)

ue_row(ws5, 5, 'ARPU Премиум (ежемес.)',     f"='📊 Параметры'!{P['price_prem_m']}", fmt_dec, 'Цена Премиум/мес', '300–600 ₽')
ue_row(ws5, 6, 'ARPU Семейный (ежемес.)',    f"='📊 Параметры'!{P['price_fam_m']}",  fmt_dec, 'Цена Семейный/мес','600–1 000 ₽')
ue_row(ws5, 7, 'Blended ARPU (М12)',
       f"=IFERROR('📈 P&L 24 месяца'!{M12}{TREV_ROW}/'📈 P&L 24 месяца'!{M12}{TPAY_ROW},0)",
       fmt_dec, 'MRR M12 / Платящих M12', '450–650 ₽')
ARPU_CELL = 'B7'  # blended ARPU

# ── CAC ──────────────────────────────────────────────────────────────────────
merge(ws5, 9, 1, 9, 5); sec(ws5['A9'], '🎯  CAC — СТОИМОСТЬ ПРИВЛЕЧЕНИЯ', 11); rh(ws5, 9, 22)

ue_row(ws5, 10, 'Маркетинговый бюджет М1',    f"={TOTAL_BUDGET_CELL}", fmt_num, 'Из воронки продаж', '')
ue_row(ws5, 11, 'Регистраций М1',              f"={TOTAL_INSTALLS_CELL}", fmt_num, 'Из воронки продаж', '')
ue_row(ws5, 12, 'CAC (стоимость привлечения)', f'=IFERROR(B10/B11,0)',  fmt_dec, 'Бюджет / Регистрации', '80–300 ₽')
ue_row(ws5, 13, 'Конверсия Регистрация → Платящий',
       f"='📊 Параметры'!{P['f2p']}+'📊 Параметры'!{P['f2f']}", fmt_pct, 'Free→Prem + Free→Fam', '5–12%')
ue_row(ws5, 14, 'CAC на платящего пользователя', '=IFERROR(B12/B13,0)', fmt_dec, 'CAC / Conv rate', '700–3 000 ₽')
CAC_PAY_CELL = 'B14'

# ── LTV ──────────────────────────────────────────────────────────────────────
merge(ws5, 16, 1, 16, 5); sec(ws5['A16'], '📊  LTV — LIFETIME VALUE', 11); rh(ws5, 16, 22)

ue_row(ws5, 17, 'Avg ARPU (blended)',          f'={ARPU_CELL}', fmt_dec, 'Blended ARPU', '')
ue_row(ws5, 18, 'Avg Churn (blended, мес %)',
       f"=('📊 Параметры'!{P['churn_p']}+'📊 Параметры'!{P['churn_f']})/2", fmt_pct, 'Среднее Prem/Fam', '<5%')
ue_row(ws5, 19, 'Avg Lifetime (мес)',          '=IFERROR(1/B18,0)', fmt_dec, '1 / Churn', '12–30 мес')
ue_row(ws5, 20, 'Gross Margin (М12)',
       f"='📈 P&L 24 месяца'!{M12}{GM_ROW}", fmt_pct, 'Gross Margin на М12', '>50%')
ue_row(ws5, 21, 'LTV = ARPU × Lifetime × GM', '=B17*B19*B20', fmt_dec, 'Lifetime Value', '')

LTV_ROW = 21

ue_row(ws5, 22, 'LTV / CAC  ★',               f'=IFERROR(B{LTV_ROW}/{CAC_PAY_CELL},0)', fmt_dec, 'Ключевой показатель', '>3 — хорошо, >5 — отлично')
ue_row(ws5, 23, 'Payback Period (мес)  ★',    f'=IFERROR({CAC_PAY_CELL}/(B17*B20),0)',  fmt_dec, 'CAC / (ARPU × GM)',   '<12 мес')
LTV_CAC_CELL   = 'B22'
PAYBACK_CELL   = 'B23'

# Highlight these key rows
for r in [22, 23]:
    for col in [1, 2]:
        ws5.cell(r, col).fill = PatternFill(fill_type='solid', fgColor=C['total_bg'])
        ws5.cell(r, col).font = Font(name='Calibri', bold=True, size=11)

# ── UNIT COGS ────────────────────────────────────────────────────────────────
UCS = 25
merge(ws5, UCS, 1, UCS, 6); sec(ws5[f'A{UCS}'], '💲  СЕБЕСТОИМОСТЬ ПАКЕТА НА 1 ПОЛЬЗОВАТЕЛЯ В МЕСЯЦ', 11); rh(ws5, UCS, 22)
for i, h in enumerate(['Статья затрат','Free','Премиум','Семейный','Расчёт'], 1):
    hdr(ws5.cell(UCS+1, i), h)

r_ = f"'📊 Параметры'!{P['usd_rate']}"   # USD rate ref
cogs_items = [
    #  label                           free_f                   prem_f                   fam_f
    ('Генерация историй (LLM)',   f'=0.005*3*{r_}',        f'=0.005*15*{r_}',       f'=0.005*20*{r_}'),
    ('Иллюстрации AI',            f'=0',                    f'=0.040*5*{r_}',        f'=0.040*8*{r_}'),
    ('Обработка личных фото AI',  f'=0',                    f'=0',                    f'=0.080*3*{r_}'),
    ('Голосовая озвучка (TTS)',   f'=0',                    f'=0',                    f'=0.015*8*{r_}'),
    ('Storage / CDN',             f'=0.005*{r_}',          f'=0.020*{r_}',          f'=0.040*{r_}'),
    (f"Инфраструктура (на польз.)", f"='💸 Расходы'!D{INFRA_TOT}/500", f"='💸 Расходы'!D{INFRA_TOT}/500", f"='💸 Расходы'!D{INFRA_TOT}/500"),
    ('Поддержка (пропорц.)',      f'=0',                    f'=10000/200',           f'=15000/100'),
    ('Платёжная комиссия (2.5%)',f'=0',                    f"='📊 Параметры'!{P['price_prem_m']}*0.025", f"='📊 Параметры'!{P['price_fam_m']}*0.025"),
    ('Комиссия шлюза (3.5%)',      f'=0',                  f"='📊 Параметры'!{P['price_prem_m']}*0.035", f"='📊 Параметры'!{P['price_fam_m']}*0.035"),
]
for ri, (label, ff, pf, famf) in enumerate(cogs_items, UCS+2):
    lbl(ws5.cell(ri, 1), label)
    for ci, formula in [(2, ff), (3, pf), (4, famf)]:
        c = ws5.cell(ri, ci); c.value = formula; calc(c); fmt_dec(c)
    rh(ws5, ri, 20)

COGS_TOT_ROW = UCS + 2 + len(cogs_items)
lbl(ws5.cell(COGS_TOT_ROW, 1), 'ИТОГО СЕБЕСТОИМОСТЬ (руб/польз./мес)', bold=True)
ws5.cell(COGS_TOT_ROW, 1).fill = PatternFill(fill_type='solid', fgColor=C['total_bg'])
for ci, col_ltr in [(2, 'B'), (3, 'C'), (4, 'D')]:
    c = ws5.cell(COGS_TOT_ROW, ci)
    c.value = f'=SUM({col_ltr}{UCS+2}:{col_ltr}{COGS_TOT_ROW-1})'
    tot(c); fmt_dec(c)
rh(ws5, COGS_TOT_ROW, 22)

# Margin per user
MGN_ROW = COGS_TOT_ROW + 1
lbl(ws5.cell(MGN_ROW, 1), 'Маржа на пользователя (руб/мес)', bold=True)
ws5.cell(MGN_ROW, 2).value = f'=0-B{COGS_TOT_ROW}'
ws5.cell(MGN_ROW, 3).value = f"='📊 Параметры'!{P['price_prem_m']}-C{COGS_TOT_ROW}"
ws5.cell(MGN_ROW, 4).value = f"='📊 Параметры'!{P['price_fam_m']}-D{COGS_TOT_ROW}"
for ci in [2, 3, 4]: calc(ws5.cell(MGN_ROW, ci)); fmt_dec(ws5.cell(MGN_ROW, ci))
ws5.cell(MGN_ROW, 2).font = Font(bold=True); ws5.cell(MGN_ROW, 3).font = Font(bold=True); ws5.cell(MGN_ROW, 4).font = Font(bold=True)
rh(ws5, MGN_ROW, 20)

# Margin %
MGNP_ROW = MGN_ROW + 1
lbl(ws5.cell(MGNP_ROW, 1), 'Маржинальность (%)', bold=True)
ws5.cell(MGNP_ROW, 2).value = '—'
ws5.cell(MGNP_ROW, 3).value = f"=IFERROR(C{MGN_ROW}/'📊 Параметры'!{P['price_prem_m']},0)"
ws5.cell(MGNP_ROW, 4).value = f"=IFERROR(D{MGN_ROW}/'📊 Параметры'!{P['price_fam_m']},0)"
for ci in [3, 4]: calc(ws5.cell(MGNP_ROW, ci)); fmt_pct(ws5.cell(MGNP_ROW, ci))
ws5.cell(MGNP_ROW, 3).font = Font(bold=True); ws5.cell(MGNP_ROW, 4).font = Font(bold=True)
rh(ws5, MGNP_ROW, 20)

# Average Check summary
ACS = MGNP_ROW + 3
merge(ws5, ACS, 1, ACS, 5); sec(ws5[f'A{ACS}'], '🧾  СРЕДНИЙ ЧЕК', 11); rh(ws5, ACS, 22)
avg_check_data = [
    ('Ср. чек Премиум, ежемес.',   f"='📊 Параметры'!{P['price_prem_m']}"),
    ('Ср. чек Семейный, ежемес.',  f"='📊 Параметры'!{P['price_fam_m']}"),
    ('Ср. чек Премиум, годовой',   f"='📊 Параметры'!{P['price_prem_y']}"),
    ('Ср. чек Семейный, годовой',  f"='📊 Параметры'!{P['price_fam_y']}"),
    ('Blended ср. чек (М12)',
     f"=IFERROR('📈 P&L 24 месяца'!{M12}{TREV_ROW}/('📈 P&L 24 месяца'!{M12}{CPREM_ROW}+'📈 P&L 24 месяца'!{M12}{CFAM_ROW}),0)"),
]
for ri, (label, formula) in enumerate(avg_check_data, ACS+1):
    lbl(ws5.cell(ri, 1), label)
    c = ws5.cell(ri, 2); c.value = formula; calc(c); fmt_dec(c)
    rh(ws5, ri, 20)

for ci, w in enumerate([38, 14, 14, 14, 38], 1): cw(ws5, ci, w)

# ═══════════════════════════════════════════════════════════════════════════════
# SHEET 6 — KPI DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════
ws6 = wb.create_sheet('🏆 KPI Dashboard')
ws6.merge_cells('A1:H1')
ws6['A1'] = 'KPI DASHBOARD — КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ'
ws6['A1'].font = Font(name='Calibri', bold=True, size=14, color='FFFFFF')
ws6['A1'].fill = PatternFill(fill_type='solid', fgColor=C['purple'])
ws6['A1'].alignment = Alignment(horizontal='center', vertical='center')
rh(ws6, 1, 35)

ws6['A2'] = '  Данные приведены на Месяц 12 (эталонный период)'
merge(ws6, 2, 1, 2, 8)
ws6['A2'].font = Font(name='Calibri', bold=True, size=10)
ws6['A2'].fill = PatternFill(fill_type='solid', fgColor=C['purple_lt'])
rh(ws6, 2, 20)

def kpi_card(ws, row, col, title, formula, fmt_fn, target):
    # title
    merge(ws, row,   col, row,   col+1)
    c = ws.cell(row, col, title)
    c.font = Font(name='Calibri', bold=True, size=10, color=C['purple'])
    c.fill = PatternFill(fill_type='solid', fgColor=C['purple_lt'])
    c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    rh(ws, row, 30)
    # value
    merge(ws, row+1, col, row+1, col+1)
    v = ws.cell(row+1, col, formula)
    v.font = Font(name='Calibri', bold=True, size=18, color=C['dark_blue'])
    v.fill = PatternFill(fill_type='solid', fgColor='FFFFFF')
    v.alignment = Alignment(horizontal='center', vertical='center')
    fmt_fn(v); rh(ws, row+1, 38)
    # target
    merge(ws, row+2, col, row+2, col+1)
    t = ws.cell(row+2, col, f'Цель: {target}')
    t.font = Font(name='Calibri', size=9, italic=True, color=C['gray'])
    t.fill = PatternFill(fill_type='solid', fgColor=C['gray_lt'])
    t.alignment = Alignment(horizontal='center', vertical='center')
    rh(ws, row+2, 18)

kpi_items = [
    # (row, col, title, formula, fmt_fn, target)
    (4,  1, 'MRR (М12)\nМесячная выручка',       f"='📈 P&L 24 месяца'!{M12}{TREV_ROW}",    fmt_rub, '1 000 000 ₽'),
    (4,  3, 'Платящих (М12)',                     f"='📈 P&L 24 месяца'!{M12}{TPAY_ROW}",    fmt_num, '500+'),
    (4,  5, 'Регистраций (М12)',                   f"='📈 P&L 24 месяца'!{M12}{REG_ROW}",     fmt_num, '2 000+'),
    (4,  7, 'EBITDA (М12)',                       f"='📈 P&L 24 месяца'!{M12}{EBITDA_ROW}",  fmt_rub, '> 0 ₽'),
    (9,  1, 'LTV / CAC ★',                       f"='🎯 Unit Economics'!{LTV_CAC_CELL}",     lambda c: setattr(c, 'number_format', '0.00x'), '>3x'),
    (9,  3, 'CAC на платящего',                   f"='🎯 Unit Economics'!{CAC_PAY_CELL}",     fmt_rub, '< 2 000 ₽'),
    (9,  5, 'Payback Period (мес)',               f"='🎯 Unit Economics'!{PAYBACK_CELL}",     fmt_dec, '< 12 мес'),
    (9,  7, 'Gross Margin (М12)',                 f"='📈 P&L 24 месяца'!{M12}{GM_ROW}",      fmt_pct, '> 50%'),
    (14, 1, 'Blended ARPU (М12)',                 f"='🎯 Unit Economics'!B7",                  fmt_rub, '450+ ₽'),
    (14, 3, 'Конверсия Free→Pay',                 f"='📊 Параметры'!{P['f2p']}+'📊 Параметры'!{P['f2f']}", fmt_pct, '> 8%'),
    (14, 5, 'Avg Churn (мес)',                    f"=('📊 Параметры'!{P['churn_p']}+'📊 Параметры'!{P['churn_f']})/2", fmt_pct, '< 5%'),
    (14, 7, 'ARR (М12 × 12)',                     f"='📈 P&L 24 месяца'!{M12}{TREV_ROW}*12", fmt_rub, '12 000 000 ₽'),
]
for r, col, title, formula, fmt_fn, target in kpi_items:
    kpi_card(ws6, r, col, title, formula, fmt_fn, target)

# 24-month summary table
SUM_ROW = 19
merge(ws6, SUM_ROW, 1, SUM_ROW, 8)
ws6[f'A{SUM_ROW}'] = '📊  СВОДНАЯ ТАБЛИЦА ПО МЕСЯЦАМ (М1–М24)'
ws6[f'A{SUM_ROW}'].font = Font(name='Calibri', bold=True, size=12, color='FFFFFF')
ws6[f'A{SUM_ROW}'].fill = PatternFill(fill_type='solid', fgColor=C['hdr_bg'])
ws6[f'A{SUM_ROW}'].alignment = Alignment(horizontal='center', vertical='center')
rh(ws6, SUM_ROW, 25)

sum_hdrs = ['Месяц','Установки','Платящих','MRR (руб)','OpEx (руб)','EBITDA (руб)','EBITDA %','Накопл. CF']
for i, h in enumerate(sum_hdrs, 1): hdr(ws6.cell(SUM_ROW+1, i), h)
rh(ws6, SUM_ROW+1, 20)

for m in range(1, 25):
    row = SUM_ROW + 1 + m
    mc  = get_column_letter(m + 1)   # month column in P&L
    ws6.cell(row, 1).value = f'М{m}'
    ws6.cell(row, 1).font  = Font(name='Calibri', bold=True, size=9)
    ws6.cell(row, 1).alignment = Alignment(horizontal='center')
    bg = C['gray_lt'] if m % 2 == 0 else 'FFFFFF'
    data = [
        (2, f"='📈 P&L 24 месяца'!{mc}{INST_ROW}",   fmt_num),
        (3, f"='📈 P&L 24 месяца'!{mc}{TPAY_ROW}",   fmt_num),
        (4, f"='📈 P&L 24 месяца'!{mc}{TREV_ROW}",   fmt_num),
        (5, f"='📈 P&L 24 месяца'!{mc}{TOPEX_ROW}",  fmt_num),
        (6, f"='📈 P&L 24 месяца'!{mc}{EBITDA_ROW}", fmt_num),
        (7, f"='📈 P&L 24 месяца'!{mc}{EBITDAM_ROW}",fmt_pct),
        (8, f"='📈 P&L 24 месяца'!{mc}{CUMCF_ROW}",  fmt_num),
    ]
    for col, formula, fmt_fn in data:
        c = ws6.cell(row, col)
        c.value = formula; fmt_fn(c)
        c.font = Font(name='Calibri', size=9)
        c.alignment = Alignment(horizontal='right', vertical='center')
        c.fill = PatternFill(fill_type='solid', fgColor=bg)
    rh(ws6, row, 18)

# Conditional formatting on EBITDA column in table
ebitda_rng = f'F{SUM_ROW+2}:F{SUM_ROW+25}'
ws6.conditional_formatting.add(ebitda_rng, CellIsRule(operator='greaterThanOrEqual', formula=['0'], fill=PatternFill(fill_type='solid', fgColor=C['green'])))
ws6.conditional_formatting.add(ebitda_rng, CellIsRule(operator='lessThan',           formula=['0'], fill=PatternFill(fill_type='solid', fgColor=C['red'])))

for i, w in enumerate([8, 12, 12, 14, 14, 15, 10, 16], 1): cw(ws6, i, w)

# ═══════════════════════════════════════════════════════════════════════════════
# SHEET 7 — СЦЕНАРИИ
# ═══════════════════════════════════════════════════════════════════════════════
ws7 = wb.create_sheet('🎲 Сценарии')
title_row(ws7, 'АНАЛИЗ СЦЕНАРИЕВ — ЧУВСТВИТЕЛЬНОСТЬ МОДЕЛИ', cols=7, color=C['gray'])

for i, h in enumerate(['Параметр','Пессимист.','Базовый (модель)','Оптимист.','Ед.','Описание'], 1):
    hdr(ws7.cell(3, i), h)
rh(ws7, 3, 20)

scenarios = [
    ('Конверсия Free→Premium (%)',   0.03, f"='📊 Параметры'!{P['f2p']}",  0.10, '%', 'Ключевой драйвер выручки'),
    ('Рост трафика/мес (%)',          0.08, f"='📊 Параметры'!{P['growth']}",0.25, '%', 'Эффект маркетинга'),
    ('Churn Премиум (%/мес)',         0.08, f"='📊 Параметры'!{P['churn_p']}",0.03,'%', 'Качество продукта'),
    ('ARPU Premium (руб/мес)',         399, f"='📊 Параметры'!{P['price_prem_m']}", 599, 'руб', 'Ценовая эластичность'),
    ('CAC (руб/регистрацию)',           250, f"={CAC_CELL}", 80, 'руб', 'Эффективность каналов'),
    ('Доля годовых подписок',        0.15, f"='📊 Параметры'!{P['annual_sh']}",0.45,'%','Дисконт vs cash flow'),
    ('Органика (% от платных)',       0.10,  '20%',                         0.35,'%', 'Виральность'),
    ('Маркетинг М1 (руб)',          80000, f"={TOTAL_BUDGET_CELL}",       200000,'руб','Стартовый бюджет'),
]
for ri, (param, pess, base, opt, unit, desc) in enumerate(scenarios, 4):
    lbl(ws7.cell(ri, 1), param)
    for ci, val, bg in [(2, pess, C['red']), (4, opt, C['green'])]:
        c = ws7.cell(ri, ci); c.value = val
        c.fill = PatternFill(fill_type='solid', fgColor=bg)
        c.font = Font(name='Calibri', size=10)
        c.alignment = Alignment(horizontal='right', vertical='center')
        if unit == '%' and isinstance(val, float): fmt_pct(c)
        else: fmt_num(c)
    c_b = ws7.cell(ri, 3); c_b.value = base
    c_b.fill = PatternFill(fill_type='solid', fgColor=C['input_bg'])
    c_b.font = Font(name='Calibri', bold=True, size=10)
    c_b.alignment = Alignment(horizontal='right', vertical='center')
    if isinstance(base, str): fmt_num(c_b)  # formula
    else:
        if unit == '%' and isinstance(base, float): fmt_pct(c_b)
        else: fmt_num(c_b)
    ws7.cell(ri, 5).value = unit; ws7.cell(ri, 5).font = Font(name='Calibri', size=9, color=C['gray'])
    ws7.cell(ri, 6).value = desc; ws7.cell(ri, 6).font = Font(name='Calibri', size=9, italic=True, color=C['gray'])
    rh(ws7, ri, 20)

# Scenario outcome summary
SCS = len(scenarios) + 6
merge(ws7, SCS, 1, SCS, 6); ws7.cell(SCS, 1).value = '📊  ОЖИДАЕМЫЕ ИТОГИ ПО СЦЕНАРИЯМ (М12)'
ws7.cell(SCS, 1).font = Font(name='Calibri', bold=True, size=12, color='FFFFFF')
ws7.cell(SCS, 1).fill = PatternFill(fill_type='solid', fgColor=C['gray'])
ws7.cell(SCS, 1).alignment = Alignment(horizontal='center', vertical='center')
rh(ws7, SCS, 25)
for i, h in enumerate(['Метрика','Пессимист.','Базовый (формула)','Оптимист.','Ед.'], 1):
    hdr(ws7.cell(SCS+1, i), h)

outcomes = [
    ('MRR к М12 (руб)',         300000,  f"='📈 P&L 24 месяца'!{M12}{TREV_ROW}",   2500000, 'руб'),
    ('Платящих к М12',              300,  f"='📈 P&L 24 месяца'!{M12}{TPAY_ROW}",      2500, 'польз.'),
    ('EBITDA М12 (руб)',        -300000,  f"='📈 P&L 24 месяца'!{M12}{EBITDA_ROW}",  900000, 'руб'),
    ('Break-even (мес)',              20,  '~14–16',                                        8, 'мес'),
    ('LTV/CAC',                     1.5,  f"='🎯 Unit Economics'!{LTV_CAC_CELL}",       8.0, 'x'),
    ('Payback Period (мес)',          22,  f"='🎯 Unit Economics'!{PAYBACK_CELL}",         5, 'мес'),
]
for ri, (metric, pess, base, opt, unit) in enumerate(outcomes, SCS+2):
    lbl(ws7.cell(ri, 1), metric)
    for ci, val, bg in [(2, pess, C['red']), (4, opt, C['green'])]:
        c = ws7.cell(ri, ci); c.value = val
        c.fill = PatternFill(fill_type='solid', fgColor=bg)
        c.font = Font(name='Calibri', size=10)
        c.alignment = Alignment(horizontal='right', vertical='center')
        fmt_num(c)
    c_b = ws7.cell(ri, 3); c_b.value = base
    c_b.fill = PatternFill(fill_type='solid', fgColor=C['input_bg'])
    c_b.font = Font(name='Calibri', bold=True, size=10)
    c_b.alignment = Alignment(horizontal='right', vertical='center')
    if isinstance(base, str) and base.startswith('='): fmt_num(c_b)
    ws7.cell(ri, 5).value = unit; ws7.cell(ri, 5).font = Font(name='Calibri', size=9, color=C['gray'])
    rh(ws7, ri, 20)

# Assumptions
notes_start = SCS + len(outcomes) + 4
merge(ws7, notes_start, 1, notes_start, 6)
ws7.cell(notes_start, 1).value = '📝  КЛЮЧЕВЫЕ ДОПУЩЕНИЯ МОДЕЛИ'
ws7.cell(notes_start, 1).font = Font(name='Calibri', bold=True, size=11)
ws7.cell(notes_start, 1).fill = PatternFill(fill_type='solid', fgColor=C['sec_bg'])
rh(ws7, notes_start, 22)

assumptions = [
    '1.  Стоимость AI — публичные тарифы: Groq $0.005/запрос, Pollinations ~$0.04/изображение',
    '2.  Приложение — веб-сайт (браузер), без App Store / Google Play. Комиссия платёжного шлюза (Stripe/ЮKassa) — 3.5 %',
    '3.  Органика = 20 % от платных регистраций (сарафанное радио, рефералы)',
    '4.  Churn включает добровольные отписки и неуспешные платежи',
    '5.  ФОТ × 1.35: НДФЛ 13 % + страховые взносы ~22 %',
    '6.  Курс USD/RUB = 95 (изменяемый параметр на листе «Параметры»)',
    '7.  Маркетинговый бюджет масштабируется пропорционально росту трафика на сайт',
    '8.  Модель — органический рост без внешних инвестиций',
    '9.  Break-even при базовом сценарии ожидается на 14–16 месяц',
    '10. Голосовая озвучка (*) — функция в разработке; стоимость TTS оценочная',
    '11. Все подписки через веб — нет комиссии магазинов приложений. Платёжный шлюз 3.5 % с оборота',
    '12. Инфраструктурные расходы масштабируются +10 % каждые 2 000 платящих пользователей',
]
for ri, text in enumerate(assumptions, notes_start+1):
    merge(ws7, ri, 1, ri, 6)
    ws7.cell(ri, 1).value = text
    ws7.cell(ri, 1).font = Font(name='Calibri', size=9, color='404040')
    ws7.cell(ri, 1).alignment = Alignment(horizontal='left', wrap_text=True)
    rh(ws7, ri, 18)

for ci, w in enumerate([38, 14, 20, 14, 8, 35], 1): cw(ws7, ci, w)

# ═══════════════════════════════════════════════════════════════════════════════
# SHEET 8 — B2B МОДЕЛЬ (Частные сады и школы)
# ═══════════════════════════════════════════════════════════════════════════════
ws8 = wb.create_sheet('🏫 B2B Модель')
title_row(ws8, 'B2B МОДЕЛЬ — ЧАСТНЫЕ САДЫ И ШКОЛЫ', cols=10, color='375623')

# ── 8A. Тарифные планы B2B ────────────────────────────────────────────────────
merge(ws8, 3, 1, 3, 10)
sec(ws8['A3'], '📋  ТАРИФНЫЕ ПЛАНЫ B2B (редактируемые)', 11); rh(ws8, 3, 22)

b2b_plan_hdrs = ['Тариф','Кол-во детей/профилей','Цена руб/мес','Цена руб/год','Скидка год%',
                 'Функции','Себест-ть/мес','Маржа/мес','Маржа %','Примечание']
for i, h in enumerate(b2b_plan_hdrs, 1): hdr(ws8.cell(4, i), h)
rh(ws8, 4, 20)

b2b_plans = [
    # name,               children, price_mo, disc_ann, features, cogs_est, note
    ('Мини-сад',          30,       4900,     0.20, 'До 30 детей, все Premium-функции, без фото', 1200, 'Небольшой частный сад'),
    ('Стандарт-сад',      60,       8900,     0.20, 'До 60 детей, Premium + обработка фото',       2000, 'Средний сад / развивашка'),
    ('Школа Базовая',    150,      14900,     0.15, 'До 150 учеников, классы/группы, кабинет учит.', 4000, 'Начальная школа'),
    ('Школа Расширенная',300,      24900,     0.15, 'До 300 учен., ВСЕ функции + аналитика',        7000, 'Средняя/крупная школа'),
    ('Корпоративный',    999,      49900,     0.10, 'Безлимит, white-label, API, SLA',             15000, 'Сеть садов/школ'),
]
B2B_PLAN_ROWS = {}
for ri, (name, children, price_mo, disc_ann, features, cogs_est, note) in enumerate(b2b_plans, 5):
    B2B_PLAN_ROWS[name] = ri
    lbl(ws8.cell(ri, 1), name)
    c_ch = ws8.cell(ri, 2); inp(c_ch, children); fmt_num(c_ch)
    c_pm = ws8.cell(ri, 3); inp(c_pm, price_mo); fmt_num(c_pm)
    c_disc = ws8.cell(ri, 5); inp(c_disc, disc_ann); fmt_pct(c_disc)
    # Цена год = price_mo * 12 * (1 - disc)
    c_py = ws8.cell(ri, 4)
    c_py.value = f'=ROUND(C{ri}*12*(1-E{ri}),0)'; calc(c_py); fmt_num(c_py)
    ws8.cell(ri, 6).value = features
    ws8.cell(ri, 6).font = Font(name='Calibri', size=9, color='404040')
    ws8.cell(ri, 6).alignment = Alignment(wrap_text=True)
    c_cogs = ws8.cell(ri, 7); inp(c_cogs, cogs_est); fmt_num(c_cogs)
    c_margin = ws8.cell(ri, 8)
    c_margin.value = f'=C{ri}-G{ri}'; calc(c_margin); fmt_num(c_margin)
    c_mpct = ws8.cell(ri, 9)
    c_mpct.value = f'=IFERROR((C{ri}-G{ri})/C{ri},0)'; calc(c_mpct); fmt_pct(c_mpct)
    ws8.cell(ri, 10).value = note
    ws8.cell(ri, 10).font = Font(name='Calibri', size=9, italic=True, color='595959')
    rh(ws8, ri, 30)

# ── 8B. Прогноз продаж B2B ────────────────────────────────────────────────────
B2B_PROJ_START = 5 + len(b2b_plans) + 2
merge(ws8, B2B_PROJ_START, 1, B2B_PROJ_START, 10)
sec(ws8[f'A{B2B_PROJ_START}'], '📈  ПРОГНОЗ ПРОДАЖ B2B — 24 МЕСЯЦА', 11); rh(ws8, B2B_PROJ_START, 22)

# Headers: Показатель + M1..M12 + M24
proj_hdrs = ['Показатель'] + [f'М{m}' for m in range(1, 13)] + ['М18', 'М24']
for i, h in enumerate(proj_hdrs, 1):
    hdr(ws8.cell(B2B_PROJ_START+1, i), h)
rh(ws8, B2B_PROJ_START+1, 20)

# Rows: Новые клиенты, Накопл. клиенты, MRR, OpEx B2B, EBITDA B2B
b2b_metrics = [
    ('Новые клиентов/мес (план)',    [0,0,1,1,2,2,3,3,4,4,5,5, 7, 10], 'inp'),
    ('Накопл. клиентов',             None,                               'calc'),
    ('Средний чек B2B (руб/мес)',    [None]*14,                          'inp_avg'),
    ('MRR B2B (руб)',                None,                               'calc'),
    ('Годовые контракты (руб)',      None,                               'calc'),
    ('Себест-ть B2B итого (руб)',    None,                               'calc'),
    ('Валовая прибыль B2B (руб)',    None,                               'calc'),
    ('Маржинальность B2B',          None,                               'calc'),
]

# Default new clients per period (14 values: M1-M12, M18, M24)
new_clients_defaults = [0,0,1,1,2,2,3,3,4,4,5,5, 7, 10]
avg_check_default = 12000  # weighted average across plans

pr = B2B_PROJ_START + 2  # first data row
row_new  = pr
row_cum  = pr + 1
row_avg  = pr + 2
row_mrr  = pr + 3
row_ann  = pr + 4
row_cogs = pr + 5
row_gp   = pr + 6
row_gm   = pr + 7

col_periods = list(range(1, 13)) + [18, 24]   # M1-M12, M18, M24

# Row labels
for row_i, (label, _, _) in enumerate(b2b_metrics):
    lbl(ws8.cell(pr + row_i, 1), label)
    rh(ws8, pr + row_i, 20)

# Fill new clients (input)
for ci, val in enumerate(new_clients_defaults, 2):
    c = ws8.cell(row_new, ci); inp(c, val); fmt_num(c)

# Avg check (input, same for all periods)
lbl(ws8.cell(row_avg, 1), 'Средний чек B2B (руб/мес)')
for ci in range(2, 16):
    c = ws8.cell(row_avg, ci); inp(c, avg_check_default); fmt_num(c)

# Cumulative clients (calc)
for ci in range(2, 16):
    c = ws8.cell(row_cum, ci)
    if ci == 2:
        c.value = f'=B{row_new}'
    else:
        c.value = f'={get_column_letter(ci-1)}{row_cum}+{get_column_letter(ci)}{row_new}'
    calc(c); fmt_num(c)

# MRR B2B = cum_clients * avg_check
for ci in range(2, 16):
    col = get_column_letter(ci)
    c = ws8.cell(row_mrr, ci)
    c.value = f'={col}{row_cum}*{col}{row_avg}'
    calc(c); fmt_num(c)

# Annual contracts = MRR * 12 * 0.3 (30% choose annual, get -15% disc)
for ci in range(2, 16):
    col = get_column_letter(ci)
    c = ws8.cell(row_ann, ci)
    c.value = f'=ROUND({col}{row_mrr}*12*0.3*0.85,0)'
    calc(c); fmt_num(c)

# COGS B2B = cum_clients * weighted_avg_cogs (≈4000₽ avg)
B2B_AVG_COGS = 4000
for ci in range(2, 16):
    col = get_column_letter(ci)
    c = ws8.cell(row_cogs, ci)
    c.value = f'={col}{row_cum}*{B2B_AVG_COGS}'
    calc(c); fmt_num(c)

# Gross profit
for ci in range(2, 16):
    col = get_column_letter(ci)
    c = ws8.cell(row_gp, ci)
    c.value = f'={col}{row_mrr}-{col}{row_cogs}'
    calc(c); fmt_num(c)

# Gross margin %
for ci in range(2, 16):
    col = get_column_letter(ci)
    c = ws8.cell(row_gm, ci)
    c.value = f'=IFERROR({col}{row_gp}/{col}{row_mrr},0)'
    calc(c); fmt_pct(c)

# ── 8C. CAC B2B ───────────────────────────────────────────────────────────────
b2b_cac_row = row_gm + 3
merge(ws8, b2b_cac_row, 1, b2b_cac_row, 10)
sec(ws8[f'A{b2b_cac_row}'], '💰  UNIT ECONOMICS B2B', 11); rh(ws8, b2b_cac_row, 22)

b2b_ue = [
    ('Бюджет привлечения B2B / мес (руб)',      80000,  'inp'),
    ('Кол-во лидов от продаж/мес',              15,     'inp'),
    ('CR лид → клиент (%)',                      0.20,   'inp_pct'),
    ('CAC B2B (руб)',                            None,   'calc'),
    ('Ср. чек/мес B2B (руб)',                   12000,  'inp'),
    ('Средний срок контракта (мес)',             18,     'inp'),
    ('LTV B2B (руб)',                            None,   'calc'),
    ('LTV / CAC B2B',                           None,   'calc'),
    ('Payback Period B2B (мес)',                 None,   'calc'),
]

ue_r = b2b_cac_row + 1
for label, val, typ in b2b_ue:
    lbl(ws8.cell(ue_r, 1), label)
    c = ws8.cell(ue_r, 3)
    if typ == 'inp':
        inp(c, val); fmt_num(c)
    elif typ == 'inp_pct':
        inp(c, val); fmt_pct(c)
    ue_r += 1

# Now fill calc rows (CAC, LTV, LTV/CAC, Payback)
bud_r   = b2b_cac_row + 1
leads_r = b2b_cac_row + 2
cr_r    = b2b_cac_row + 3
cac_r   = b2b_cac_row + 4
chk_r   = b2b_cac_row + 5
dur_r   = b2b_cac_row + 6
ltv_r   = b2b_cac_row + 7
ratio_r = b2b_cac_row + 8
pay_r   = b2b_cac_row + 9

c_cac_b2b = ws8.cell(cac_r, 3)
c_cac_b2b.value = f'=IFERROR(C{bud_r}/(C{leads_r}*C{cr_r}),0)'
calc(c_cac_b2b); fmt_num(c_cac_b2b)
c_cac_b2b.fill = PatternFill(fill_type='solid', fgColor=C['red'])
c_cac_b2b.font = Font(name='Calibri', bold=True, size=11, color='C00000')

c_ltv_b2b = ws8.cell(ltv_r, 3)
c_ltv_b2b.value = f'=C{chk_r}*C{dur_r}'
calc(c_ltv_b2b); fmt_num(c_ltv_b2b)

c_ratio = ws8.cell(ratio_r, 3)
c_ratio.value = f'=IFERROR(C{ltv_r}/C{cac_r},0)'
calc(c_ratio); fmt_dec(c_ratio)
c_ratio.fill = PatternFill(fill_type='solid', fgColor=C['green'])
c_ratio.font = Font(name='Calibri', bold=True, size=11, color=C['deep_green'])

c_pay = ws8.cell(pay_r, 3)
c_pay.value = f'=IFERROR(C{cac_r}/C{chk_r},0)'
calc(c_pay); fmt_dec(c_pay)

# ── 8D. Каналы привлечения B2B ────────────────────────────────────────────────
b2b_ch_row = pay_r + 3
merge(ws8, b2b_ch_row, 1, b2b_ch_row, 10)
sec(ws8[f'A{b2b_ch_row}'], '📡  КАНАЛЫ ПРИВЛЕЧЕНИЯ B2B', 11); rh(ws8, b2b_ch_row, 22)

b2b_ch_hdrs = ['Канал','Бюджет руб/мес','Лидов/мес','CR лид→клиент','Клиентов/мес','CAC руб','Комментарий']
for i, h in enumerate(b2b_ch_hdrs, 1): hdr(ws8.cell(b2b_ch_row+1, i), h)
rh(ws8, b2b_ch_row+1, 20)

b2b_channels = [
    ('Прямые продажи (звонки/встречи)', 30000, 10, 0.30, 'Менеджер по B2B-продажам'),
    ('Офлайн: конференции/выставки',    20000,  5, 0.25, 'EdTech-мероприятия, ярмарки'),
    ('LinkedIn / деловые соцсети',      10000,  4, 0.15, 'HR и директора учреждений'),
    ('Email-рассылка директорам',        5000,  3, 0.20, 'База из открытых реестров'),
    ('Партнёрства (агентства EdTech)',   15000,  3, 0.35, 'Реферальное вознаграждение 10%'),
]
b2b_ch_data_start = b2b_ch_row + 2
for rci, (chname, bgt, leads, cr_val, note) in enumerate(b2b_channels, b2b_ch_data_start):
    lbl(ws8.cell(rci, 1), chname)
    c_b = ws8.cell(rci, 2); inp(c_b, bgt); fmt_num(c_b)
    c_l = ws8.cell(rci, 3); inp(c_l, leads); fmt_num(c_l)
    c_cr = ws8.cell(rci, 4); inp(c_cr, cr_val); fmt_pct(c_cr)
    c_cl = ws8.cell(rci, 5)
    c_cl.value = f'=ROUND(C{rci}*D{rci},1)'; calc(c_cl); fmt_dec(c_cl)
    c_cac_ch = ws8.cell(rci, 6)
    c_cac_ch.value = f'=IFERROR(B{rci}/(C{rci}*D{rci}),0)'; calc(c_cac_ch); fmt_num(c_cac_ch)
    ws8.cell(rci, 7).value = note
    ws8.cell(rci, 7).font = Font(name='Calibri', size=9, italic=True, color='595959')
    rh(ws8, rci, 20)

# B2B totals
b2b_tot_row = b2b_ch_data_start + len(b2b_channels)
lbl(ws8.cell(b2b_tot_row, 1), 'ИТОГО B2B', bold=True)
ws8.cell(b2b_tot_row, 1).fill = PatternFill(fill_type='solid', fgColor=C['total_bg'])
for col in [2, 3, 5]:
    c = ws8.cell(b2b_tot_row, col)
    c.value = f'=SUM({get_column_letter(col)}{b2b_ch_data_start}:{get_column_letter(col)}{b2b_tot_row-1})'
    tot(c); fmt_num(c)
rh(ws8, b2b_tot_row, 20)

# Combined CAC B2B total
b2b_cac_total_row = b2b_tot_row + 1
lbl(ws8.cell(b2b_cac_total_row, 1), 'Взвешенный CAC B2B (бюджет / клиентов)', bold=True)
c_cact = ws8.cell(b2b_cac_total_row, 2)
c_cact.value = f'=IFERROR(B{b2b_tot_row}/E{b2b_tot_row},0)'
c_cact.fill = PatternFill(fill_type='solid', fgColor=C['red'])
c_cact.font = Font(name='Calibri', bold=True, size=11, color='C00000')
fmt_num(c_cact); rh(ws8, b2b_cac_total_row, 22)

# ── 8E. Совокупный Revenue B2B + B2C ─────────────────────────────────────────
combined_row = b2b_cac_total_row + 3
merge(ws8, combined_row, 1, combined_row, 10)
sec(ws8[f'A{combined_row}'], '📊  СОВОКУПНЫЙ ИТОГ (B2C + B2B) — 12 МЕСЯЦ', 11)
rh(ws8, combined_row, 22)

combined_items = [
    ('MRR B2C (руб) — из листа P&L',       "='📈 P&L 24 месяца'!N6",   'calc'),
    ('MRR B2B (руб) — текущий лист',        f'=N{row_mrr}',              'calc'),
    ('Итого MRR (руб)',                      None,                        'total'),
    ('Платящих B2C пользователей',          "='📈 P&L 24 месяца'!N8",    'calc'),
    ('Клиентов B2B',                         f'=N{row_cum}',              'calc'),
    ('Итого выручка ARR (руб)',              None,                        'total'),
]
cmb_r = combined_row + 1
mrr_b2c_row = cmb_r
mrr_b2b_row = cmb_r + 1
mrr_tot_row = cmb_r + 2
arr_row     = cmb_r + 5

for i, (label, formula, typ) in enumerate(combined_items):
    r = cmb_r + i
    lbl(ws8.cell(r, 1), label)
    c = ws8.cell(r, 3)
    if typ == 'calc':
        c.value = formula; calc(c); fmt_num(c)
    elif typ == 'total':
        if i == 2:  # MRR total
            c.value = f'=C{mrr_b2c_row}+C{mrr_b2b_row}'
        else:       # ARR
            c.value = f'=C{mrr_tot_row}*12'
        tot(c); fmt_num(c)
    rh(ws8, r, 20)

# Column widths B2B sheet
for ci, w in enumerate([35, 14, 14, 14, 14, 14, 35], 1):
    cw(ws8, ci, w)

# ═══════════════════════════════════════════════════════════════════════════════
# TAB COLORS & ACTIVE SHEET
# ═══════════════════════════════════════════════════════════════════════════════
ws1.sheet_properties.tabColor = '4472C4'
ws2.sheet_properties.tabColor = 'ED7D31'
ws3.sheet_properties.tabColor = 'C00000'
ws4.sheet_properties.tabColor = '375623'
ws5.sheet_properties.tabColor = C['purple']
ws6.sheet_properties.tabColor = 'BF8F00'
ws7.sheet_properties.tabColor = C['gray']
ws8.sheet_properties.tabColor = '375623'
wb.active = ws6   # open on dashboard

# Save
OUT = r'c:\Users\Aplerics\Desktop\Новая папка\test-vibe-code\Financial_Model_Pochemu4ki.xlsx'
wb.save(OUT)
print(f'OK  Saved to: {OUT}')
