#!/usr/bin/env python3
"""Membuat diagram basis data (.drawio) dari skema yang BENAR-BENAR ada di
Postgres - bukan dari berkas entity, supaya kolom hasil migrasi ikut terbaca."""
import html, sys, os
from collections import OrderedDict, defaultdict

# Berkas masukan (cols.txt, fks.txt) diambil dari basis data yang SEDANG
# berjalan, bukan dari berkas entity - dengan begitu kolom hasil migrasi ikut
# terbaca. Perintah pembuatnya ada di docs/database-diagram.md.
S = os.environ.get('SCHEMA_DIR', 'docs/schema')

# Pengelompokan tabel menjadi halaman. Tabel baru yang belum terdaftar di sini
# akan dilaporkan sebagai UNASSIGNED oleh pemeriksaan di bagian bawah.
DOMAINS = {
 'Learning': ['course','weeks','session','material','assignments','answer_task','attendance','logbook',
              'session_progresses','week_progresses','quiz','questions','answers','scores',
              'quiz_progresses','user_answers','mentor_logbook','certificates'],
 'Users': ['user','biodata','user_courses','registrations','participants','mentors','mentoring',
           'mentor_biodata','portofolios','comments','activity_log','user_activity','web_sessions'],
 'Payments': ['payments','installment','installment_payments','invoice','voucher','voucher_programs'],
 'Catalog': ['category','course_type','category_course_types','technologies','course_technologies',
             'mentor_technologies','course_flow','flow_category','program_benefits','benefit',
             'benefit_category','course_questions','alumni','faqs'],
 'CMS': ['about','award','background','collaborations','commitment','experience','faq','gallery',
         'header','image_benefit','info','mission','our_experience','paragraph','partner',
         'category_partner','social','story','superiority','team','team_leads','value','visions'],
 # Jalur belajar non-bootcamp (SPL). Sengaja kelompok sendiri, bukan digabung
 # ke Learning: seluruh pohonnya terpisah dari session/weeks dan hanya bertemu
 # lagi di course dan user. Lihat docs/syllabus-table-plan.md.
 'Syllabus': ['syllabus','syllabus_material','syllabus_assignment',
              'syllabus_answer_task','syllabus_comment','syllabus_logbook',
              'syllabus_progress'],
 'Ops': ['migrations','_uuid_migration_meta'],
}

# ---------------------------------------------------------------- data
cols = OrderedDict()
for line in open(f'{S}/cols.txt'):
    line = line.rstrip('\n')
    if not line:
        continue
    t, c, typ, nullable, pk, uq = line.split('|')
    cols.setdefault(t, []).append(
        {'name': c, 'type': typ, 'null': nullable == 'YES', 'pk': pk == 'PK', 'uq': uq == 'UQ'})

fks = []
for line in open(f'{S}/fks.txt'):
    line = line.rstrip('\n')
    if not line:
        continue
    st, sc, tt, tc, rule = line.split('|')
    fks.append({'src': st, 'scol': sc, 'tgt': tt, 'tcol': tc, 'rule': rule})

fkcols = defaultdict(dict)          # table -> col -> (target, rule)
for f in fks:
    fkcols[f['src']][f['scol']] = (f['tgt'], f['rule'])

SHORT = {
    'character varying': 'varchar', 'timestamp without time zone': 'timestamp',
    'time without time zone': 'time', 'USER-DEFINED': 'enum', 'integer': 'int',
    'boolean': 'bool', 'double precision': 'float', 'character': 'char',
    'timestamp with time zone': 'timestamptz', 'ARRAY': 'array',
}

# ---------------------------------------------------------------- layout
HEADER_H, ROW_H, W = 32, 24, 290
GAP_X, GAP_Y, MARGIN = 80, 60, 40

PALETTE = {
    'Learning': ('#003060', '#E4F1F7'),
    'Users':    ('#15803D', '#F0FDF4'),
    'Payments': ('#B45309', '#FFFBEB'),
    'Catalog':  ('#6D28D9', '#F5F3FF'),
    'CMS':      ('#BE185D', '#FDF2F8'),
    'Syllabus': ('#0E7490', '#ECFEFF'),
    'Ops':      ('#525252', '#F5F5F5'),
}
HUBS = {'user': 'Users', 'course': 'Learning', 'category': 'Catalog'}

# Tabel rujukan dipilih supaya SETIAP foreign key punya kedua ujungnya di
# salah satu halaman - kalau tidak, ada relasi yang tidak pernah tergambar.
PAGES = [
    ('Learning core', 'Learning', ['user', 'course']),
    ('Users & enrolment', 'Users', ['course', 'answer_task']),
    ('Payments', 'Payments', ['user', 'course']),
    ('Catalog & taxonomy', 'Catalog', ['course', 'user', 'mentors']),
    ('Syllabus (non-bootcamp)', 'Syllabus', ['course', 'user']),
    ('Marketing CMS', 'CMS', ['category']),
    ('Ops', 'Ops', []),
]
domain_of = {t: d for d, ts in DOMAINS.items() for t in ts}

def esc(s):
    """Untuk data yang disisipkan ke dalam label."""
    return html.escape(str(s), quote=True)

def attr(label_html):
    """Label drawio adalah HTML, tetapi tempatnya di dalam atribut XML.
    Seluruh stringnya harus jadi entity - kalau tidak, `<b>` pertama
    sudah membuat berkasnya bukan XML yang sah."""
    return html.escape(label_html, quote=True)

def table_height(t):
    return HEADER_H + ROW_H * len(cols.get(t, []))

def render_table(out, tid, t, x, y, domain, is_ref):
    stroke, fill = PALETTE[domain]
    title = esc(t) + ('  (ref)' if is_ref else '')
    dash = 'dashed=1;dashPattern=6 4;' if is_ref else ''
    out.append(
        f'<mxCell id="{tid}" value="{attr(title)}" style="swimlane;html=1;childLayout=stackLayout;'
        f'horizontal=1;startSize={HEADER_H};horizontalStack=0;resizeParent=1;resizeParentMax=0;'
        f'resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;fontStyle=1;fontSize=13;'
        f'fillColor={fill};strokeColor={stroke};fontColor={stroke};swimlaneFillColor=#FFFFFF;'
        f'{dash}" vertex="1" parent="1">'
        f'<mxGeometry x="{x}" y="{y}" width="{W}" height="{table_height(t)}" as="geometry"/></mxCell>')
    rowids = {}
    for i, c in enumerate(cols.get(t, [])):
        rid = f'{tid}-{i}'
        rowids[c['name']] = rid
        marks = []
        if c['pk']:
            marks.append('PK')
        if c['name'] in fkcols.get(t, {}):
            marks.append('FK')
        if c['uq'] and not c['pk']:
            marks.append('UQ')
        prefix = ('<b>' + ' '.join(marks) + '</b> ') if marks else ''
        typ = SHORT.get(c['type'], c['type'])
        nn = '' if c['null'] else ' <i>NN</i>'
        ref = ''
        if c['name'] in fkcols.get(t, {}):
            tgt, rule = fkcols[t][c['name']]
            ref = f' &#8594; {esc(tgt)}'
        label = f'{prefix}{esc(c["name"])} : {esc(typ)}{nn}{ref}'
        weight = 'fontStyle=1;' if c['pk'] else ''
        out.append(
            f'<mxCell id="{rid}" value="{attr(label)}" style="text;html=1;strokeColor=none;fillColor=none;'
            f'align=left;verticalAlign=middle;spacingLeft=6;spacingRight=6;overflow=hidden;'
            f'points=[[0,0.5],[1,0.5]];portConstraint=eastwest;rotatable=0;whiteSpace=wrap;'
            f'fontSize=11;{weight}" vertex="1" parent="{tid}">'
            f'<mxGeometry y="{HEADER_H + i * ROW_H}" width="{W}" height="{ROW_H}" as="geometry"/></mxCell>')
    return rowids

def build_page(name, domain, extra_hubs):
    tables = [t for t in DOMAINS[domain] if t in cols]
    # `course` ada di DOMAINS['Learning'] DAN didaftarkan sebagai hub, jadi
    # tanpa penyaringan ini ia digambar dua kali dengan id yang sama.
    refs = [h for h in extra_hubs if h in cols and h not in tables]
    placed = tables + refs

    # kolom grid dihitung dari tinggi, supaya tabel tinggi tidak menumpuk
    ncols = 4 if len(placed) > 12 else (3 if len(placed) > 6 else 2)
    colh = [0] * ncols
    pos = {}
    for t in sorted(placed, key=lambda x: -table_height(x)):
        i = colh.index(min(colh))
        pos[t] = (MARGIN + i * (W + GAP_X), MARGIN + colh[i])
        colh[i] += table_height(t) + GAP_Y

    out, rowids = [], {}
    for t in placed:
        x, y = pos[t]
        tid = f'{domain}-{t}'
        rowids[t] = render_table(out, tid, t, x, y, domain_of[t], t in refs)

    drawn = 0
    for f in fks:
        if f['src'] not in rowids or f['tgt'] not in rowids:
            continue
        s = rowids[f['src']].get(f['scol'])
        d = rowids[f['tgt']].get(f['tcol'])
        if not s or not d:
            continue
        colr = '#B42318' if f['rule'] == 'CASCADE' else (
            '#15803D' if f['rule'] == 'SET NULL' else '#737373')
        out.append(
            f'<mxCell id="e-{domain}-{drawn}" value="{esc(f["rule"])}" '
            f'style="edgeStyle=entityRelationEdgeStyle;rounded=0;html=1;exitX=0;exitY=0.5;'
            f'entryX=1;entryY=0.5;fontSize=9;fontColor={colr};strokeColor={colr};'
            f'endArrow=ERmandatoryOne;startArrow=ERoneToMany;startFill=0;endFill=0;" '
            f'edge="1" parent="1" source="{s}" target="{d}">'
            f'<mxGeometry relative="1" as="geometry"/></mxCell>')
        drawn += 1

    legend = (
        f'<b>{esc(name)}</b><br/>{len(tables)} tabel'
        + (f' + {len(refs)} rujukan (garis putus-putus)' if refs else '')
        + f'<br/>{drawn} relasi digambar di halaman ini'
        '<br/><br/><b>PK</b> primary key &#183; <b>FK</b> foreign key &#183; '
        '<b>UQ</b> unique &#183; <i>NN</i> not null'
        '<br/>Warna garis = aturan ON DELETE:<br/>'
        '<font color="#B42318">merah CASCADE</font> &#183; '
        '<font color="#15803D">hijau SET NULL</font> &#183; '
        '<font color="#737373">abu NO ACTION</font>')
    out.append(
        f'<mxCell id="legend-{domain}" value="{attr(legend)}" '
        f'style="text;html=1;align=left;verticalAlign=top;whiteSpace=wrap;fontSize=11;'
        f'fillColor=#FFFFFF;strokeColor=#D4D4D4;spacing=8;" vertex="1" parent="1">'
        f'<mxGeometry x="{MARGIN}" y="{MARGIN - 10 - 150}" width="400" height="140" as="geometry"/></mxCell>')
    return out, len(tables), drawn

def build_overview():
    """Peta tingkat domain: berapa tabel per kelompok, dan ke mana saja
    kelompok itu menunjuk. Halaman detail ada di tab berikutnya."""
    order = ['Users', 'Learning', 'Catalog', 'Payments', 'CMS', 'Ops', 'Syllabus']
    spot = {'Users': (60, 320), 'Learning': (470, 320), 'Catalog': (880, 320),
            'Payments': (470, 40), 'CMS': (880, 40), 'Ops': (60, 40),
            'Syllabus': (470, 600)}
    BW, BH = 330, 200
    out = []
    for d in order:
        stroke, fill = PALETTE[d]
        ts = [t for t in DOMAINS[d] if t in cols]
        listing = ', '.join(sorted(ts))
        label = (f'<b style="font-size:16px">{esc(d)}</b><br/>'
                 f'<span style="color:#737373">{len(ts)} tabel</span><br/><br/>'
                 f'<span style="font-size:10px">{esc(listing)}</span>')
        x, y = spot[d]
        out.append(
            f'<mxCell id="ov-{d}" value="{attr(label)}" style="rounded=1;arcSize=6;html=1;'
            f'whiteSpace=wrap;align=left;verticalAlign=top;spacing=10;fillColor={fill};'
            f'strokeColor={stroke};fontColor=#171717;" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{BW}" height="{BH}" as="geometry"/></mxCell>')

    pair = defaultdict(int)
    for f in fks:
        a, b = domain_of[f['src']], domain_of[f['tgt']]
        if a != b:
            pair[(a, b)] += 1
    for i, ((a, b), n) in enumerate(sorted(pair.items(), key=lambda kv: -kv[1])):
        out.append(
            f'<mxCell id="ov-e{i}" value="{n} FK" style="edgeStyle=orthogonalEdgeStyle;'
            f'rounded=1;html=1;fontSize=10;fontColor=#525252;strokeColor=#A3A3A3;'
            f'endArrow=block;endFill=1;" edge="1" parent="1" '
            f'source="ov-{a}" target="ov-{b}"><mxGeometry relative="1" as="geometry"/></mxCell>')

    note = ('<b style="font-size:15px">Basis data e-learning-test</b><br/>'
            f'{len(cols)} tabel &#183; {len(fks)} foreign key &#183; Postgres<br/><br/>'
            'Panah menunjuk ke tabel yang DIRUJUK (anak &#8594; induk).<br/>'
            'Tiap kelompok punya tab sendiri dengan seluruh kolomnya.<br/>'
            'Tabel bergaris putus-putus pada tab detail adalah RUJUKAN ke '
            'kelompok lain, bukan tabel kedua.<br/><br/>'
            'Dibuat dari skema yang benar-benar ada di basis data '
            '(information_schema + pg_constraint), bukan dari berkas entity, '
            'supaya kolom hasil migrasi ikut terbaca.')
    out.append(
        f'<mxCell id="ov-note" value="{attr(note)}" style="text;html=1;align=left;'
        f'verticalAlign=top;whiteSpace=wrap;fontSize=11;fillColor=#FFFFFF;'
        f'strokeColor=#D4D4D4;spacing=10;" vertex="1" parent="1">'
        f'<mxGeometry x="60" y="620" width="380" height="180" as="geometry"/></mxCell>')
    return out

unassigned = [t for t in cols if t not in {x for v in DOMAINS.values() for x in v}]
if unassigned:
    raise SystemExit(
        'Tabel berikut belum punya kelompok di DOMAINS, jadi tidak akan '
        'tergambar di halaman mana pun: ' + ', '.join(sorted(unassigned)))

pages = []
total_drawn = 0
_ov = build_overview()
pages.append(
    '<diagram id="overview" name="Overview">'
    '<mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" '
    'connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200" '
    'math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>'
    + ''.join(_ov) + '</root></mxGraphModel></diagram>')
for name, domain, hubs in PAGES:
    cells, ntab, ndrawn = build_page(name, domain, hubs)
    total_drawn += ndrawn
    body = ''.join(cells)
    pages.append(
        f'<diagram id="{domain}" name="{esc(name)}">'
        f'<mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" '
        f'connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200" '
        f'math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>'
        f'{body}</root></mxGraphModel></diagram>')

xml = ('<mxfile host="app.diagrams.net" type="device" '
       'agent="e-learning-test schema export">' + ''.join(pages) + '</mxfile>')
open('docs/database-diagram.drawio', 'w', encoding='utf-8').write(xml)
print('tables:', len(cols), '| FKs:', len(fks), '| edges drawn across pages:', total_drawn)
print('bytes:', len(xml))
