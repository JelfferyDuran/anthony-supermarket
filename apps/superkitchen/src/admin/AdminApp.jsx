import { useEffect, useMemo, useState } from 'react';
import menuData from '../data/menu.json';
import {
  getAdminAudit,
  getAdminInsights,
  getAdminOverview,
  isManagerRole,
  listOrders,
  previewPricingReport,
  readStoredSession,
  refreshSession,
  sessionRole,
  signIn,
  signOut,
} from '../staff/staffAuth.js';
import './admin.css';

const BRAND = Object.freeze({
  name: "Anthony's Supermarket",
  kitchen: "Anthony's Super Kitchen",
  initials: 'AS',
});

const COPY = {
  en: {
    console: 'Manager Console', signIn: 'Protected manager access', email: 'Email', password: 'Password',
    enter: 'Sign in', signing: 'Signing in…', noAccess: 'Manager access required', noAccessBody: 'This account can use the kitchen, but it is not authorized for manager tools.',
    signOut: 'Sign out', kitchen: 'Kitchen board', customer: 'Customer menu', overview: 'Overview', orders: 'Orders', pricing: 'Pricing & Invoices',
    catalog: 'Catalog', operations: 'Operations', staff: 'Staff', audit: 'Audit', insights: 'Insights',
    today: 'Today', refresh: 'Refresh', loading: 'Loading protected data…', ordersToday: 'Orders today', sales: 'Order value',
    avgTicket: 'Average order', active: 'Active orders', avgPrep: 'Average prep', pageViews: 'Page views',
    recentOrders: 'Recent orders', noOrders: 'No orders in this view.', pricingTitle: 'Invoice pricing report',
    pricingBody: 'Enter reviewed invoice lines. The server calculates unit cost and a margin-safe retail ending in .49 or .99.',
    vendor: 'Vendor', invoiceNumber: 'Invoice / order number', invoiceDate: 'Invoice date', invoiceTotal: 'Invoice total', pages: 'Pages', noCharge: 'Sample / no-charge invoice',
    product: 'Product / brand name', upc: 'UPC', quantity: 'Case qty', caseCost: 'Cost / case', packQty: 'Units / case', lineAmount: 'Line amount', addLine: 'Add line',
    calculate: 'Generate report', calculating: 'Calculating…', remove: 'Remove', costUnit: 'Cost / unit', exactRetail: 'Exact × 1.70',
    suggested: 'Suggested label', export: 'Export CSV', print: 'Print labels', reviewRequired: 'Human approval required', noChargeStatus: 'No-charge sample — pricing blocked', invoicePrivacy: 'Invoice images stay private and are never committed to the public repository.',
    uploadSoon: 'Private scan upload and OCR are intentionally disabled until the protected storage bucket and extraction worker pass security review.',
    catalogTitle: 'Published kitchen catalog', catalogBody: 'Read-only in this slice. Price and availability publishing will use audited server validation.',
    open: 'Available', closed: 'Unavailable', operationsTitle: 'Store operations', operationsBody: 'Controls remain read-only until store-setting history and rollback are deployed.',
    staffTitle: 'Staff & roles', staffBody: 'Role changes are admin-only and must be performed through a trusted server operation.',
    role: 'Current role', auditTitle: 'Order audit trail', auditBody: 'Consequential state transitions recorded by the backend.',
    trafficTitle: 'Traffic insights', trafficBody: 'Privacy-minimized page activity. No names, phone numbers, addresses, or full IP addresses.',
    topPages: 'Top pages', sources: 'Sources', devices: 'Devices', languages: 'Languages', hourly: 'Activity by hour',
    notConnected: 'No traffic events yet. The public beacon must be deployed before this chart begins filling.',
    status: 'Status', total: 'Total', time: 'Time', order: 'Order', transition: 'Transition', actor: 'Actor',
    brandSafe: 'Brand-safe bilingual UI', brandSafeBody: 'Logos, store names, product brands, UPCs, and addresses never pass through translation.',
  },
  es: {
    console: 'Panel de Gerencia', signIn: 'Acceso protegido para gerencia', email: 'Correo', password: 'Contraseña',
    enter: 'Iniciar sesión', signing: 'Entrando…', noAccess: 'Se requiere acceso de gerente', noAccessBody: 'Esta cuenta puede usar la cocina, pero no está autorizada para herramientas de gerencia.',
    signOut: 'Salir', kitchen: 'Panel de cocina', customer: 'Menú del cliente', overview: 'Resumen', orders: 'Pedidos', pricing: 'Precios y Facturas',
    catalog: 'Catálogo', operations: 'Operaciones', staff: 'Personal', audit: 'Auditoría', insights: 'Estadísticas',
    today: 'Hoy', refresh: 'Actualizar', loading: 'Cargando datos protegidos…', ordersToday: 'Pedidos de hoy', sales: 'Valor de pedidos',
    avgTicket: 'Pedido promedio', active: 'Pedidos activos', avgPrep: 'Preparación promedio', pageViews: 'Visitas',
    recentOrders: 'Pedidos recientes', noOrders: 'No hay pedidos en esta vista.', pricingTitle: 'Reporte de precios de factura',
    pricingBody: 'Ingresa líneas ya revisadas. El servidor calcula el costo unitario y un precio seguro terminado en .49 o .99.',
    vendor: 'Suplidor', invoiceNumber: 'Número de factura / orden', invoiceDate: 'Fecha de factura', invoiceTotal: 'Total de factura', pages: 'Páginas', noCharge: 'Factura de muestra / sin costo',
    product: 'Producto / marca', upc: 'UPC', quantity: 'Cant. cajas', caseCost: 'Costo / caja', packQty: 'Unid. / caja', lineAmount: 'Total de línea', addLine: 'Añadir línea',
    calculate: 'Generar reporte', calculating: 'Calculando…', remove: 'Quitar', costUnit: 'Costo / unidad', exactRetail: 'Exacto × 1.70',
    suggested: 'Precio para etiqueta', export: 'Exportar CSV', print: 'Imprimir etiquetas', reviewRequired: 'Requiere aprobación humana', noChargeStatus: 'Muestra sin costo — precios bloqueados', invoicePrivacy: 'Las imágenes de facturas permanecen privadas y nunca se guardan en el repositorio público.',
    uploadSoon: 'La carga privada y OCR permanecen desactivados hasta que el almacenamiento protegido y el extractor pasen revisión de seguridad.',
    catalogTitle: 'Catálogo publicado de cocina', catalogBody: 'Solo lectura en esta etapa. Los cambios usarán validación y auditoría del servidor.',
    open: 'Disponible', closed: 'No disponible', operationsTitle: 'Operaciones de tienda', operationsBody: 'Los controles siguen en solo lectura hasta desplegar historial y restauración de cambios.',
    staffTitle: 'Personal y roles', staffBody: 'Los cambios de rol son exclusivos de admin y requieren una operación confiable del servidor.',
    role: 'Rol actual', auditTitle: 'Historial de auditoría', auditBody: 'Transiciones importantes registradas por el servidor.',
    trafficTitle: 'Estadísticas de tráfico', trafficBody: 'Actividad mínima y privada. Sin nombres, teléfonos, direcciones ni IP completas.',
    topPages: 'Páginas principales', sources: 'Fuentes', devices: 'Dispositivos', languages: 'Idiomas', hourly: 'Actividad por hora',
    notConnected: 'Todavía no hay eventos. La señal pública debe desplegarse para comenzar a llenar estas gráficas.',
    status: 'Estado', total: 'Total', time: 'Hora', order: 'Pedido', transition: 'Transición', actor: 'Actor',
    brandSafe: 'Interfaz bilingüe que protege la marca', brandSafeBody: 'Logos, nombres de tienda, marcas de productos, UPC y direcciones nunca se traducen.',
  },
};

const TABS = ['overview', 'orders', 'pricing', 'catalog', 'operations', 'staff', 'audit', 'insights'];
const emptyLine = () => ({ id: crypto.randomUUID(), name: '', upc: '', quantity: '1', caseCost: '', packQty: '', lineAmount: '' });
const emptyInvoice = () => ({ vendor: '', invoiceNumber: '', invoiceDate: '', invoiceTotal: '', pages: '1', noCharge: false });
const money = value => `$${Number(value || 0).toFixed(2)}`;

function EmptyState({ title, body }) {
  return <div className="admin-empty"><strong>{title}</strong><p>{body}</p></div>;
}

function Metric({ label, value, note }) {
  return <article className="admin-metric"><span>{label}</span><strong>{value}</strong>{note ? <small>{note}</small> : null}</article>;
}

function Bars({ rows = [], empty }) {
  const max = Math.max(1, ...rows.map(row => Number(row.value || 0)));
  if (!rows.length) return <EmptyState title={empty} body="" />;
  return <div className="admin-bars">{rows.map(row => (
    <div className="admin-bar-row" key={row.label}>
      <span title={row.label}>{row.label}</span>
      <div><i style={{ width: `${Math.max(4, (Number(row.value || 0) / max) * 100)}%` }} /></div>
      <strong>{row.value}</strong>
    </div>
  ))}</div>;
}

function downloadCsv(rows, invoice) {
  const headers = ['Vendor', 'Invoice Number', 'Product', 'UPC', 'Case Qty', 'Case Cost', 'Pack Qty', 'Line Amount', 'Cost Per Unit', 'Exact Retail', 'Suggested Retail', 'Status'];
  const cells = rows.map(row => [invoice?.vendor, invoice?.invoiceNumber, row.name, row.upc, row.quantity, row.caseCost, row.packQty, row.lineAmount, row.costPerUnit, row.exactRetail, row.suggestedRetail, row.noCharge ? 'NO_CHARGE' : 'REVIEW_REQUIRED']);
  const csv = [headers, ...cells].map(cols => cols.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `anthony-pricing-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminApp() {
  const [language, setLanguage] = useState(() => localStorage.getItem('anthony-admin-lang') === 'es' ? 'es' : 'en');
  const [session, setSession] = useState(() => readStoredSession());
  const [tab, setTab] = useState('overview');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [audit, setAudit] = useState([]);
  const [insights, setInsights] = useState(null);
  const [pricingLines, setPricingLines] = useState([emptyLine()]);
  const [pricingReport, setPricingReport] = useState([]);
  const [pricingSummary, setPricingSummary] = useState(null);
  const [invoice, setInvoice] = useState(emptyInvoice());
  const copy = COPY[language];
  const role = sessionRole(session);
  const authorized = isManagerRole(role);

  const setLang = next => {
    setLanguage(next);
    localStorage.setItem('anthony-admin-lang', next);
    document.documentElement.lang = next;
  };

  const loadProtected = async () => {
    if (!authorized) { setLoading(false); return; }
    setLoading(true);
    setError('');
    const results = await Promise.allSettled([getAdminOverview(), listOrders(), getAdminAudit(), getAdminInsights(7)]);
    if (results[0].status === 'fulfilled') setOverview(results[0].value);
    if (results[1].status === 'fulfilled') setOrders(Array.isArray(results[1].value) ? results[1].value : []);
    if (results[2].status === 'fulfilled') setAudit(Array.isArray(results[2].value) ? results[2].value : []);
    if (results[3].status === 'fulfilled') setInsights(results[3].value);
    const firstFailure = results.find(result => result.status === 'rejected');
    if (firstFailure) setError(firstFailure.reason?.message || 'Some protected data could not be loaded.');
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const fresh = await refreshSession(false);
        if (active) setSession(fresh);
      } catch {
        if (active) setSession(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => { if (authorized) loadProtected(); }, [authorized, session?.access_token]);

  const handleAuth = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try { setSession(await signIn(email.trim(), password)); setPassword(''); }
    catch (e) { setError(e.message || 'Authentication failed.'); }
    finally { setBusy(false); }
  };

  const handlePricing = async event => {
    event.preventDefault(); setBusy(true); setError(''); setPricingReport([]); setPricingSummary(null);
    try {
      const result = await previewPricingReport({ invoice, items: pricingLines.map(({ name, upc, quantity, caseCost, packQty, lineAmount }) => ({ name, upc, quantity, caseCost, packQty, lineAmount })) });
      setPricingReport(Array.isArray(result?.items) ? result.items : []);
      setPricingSummary(result);
    } catch (e) { setError(e.message || 'Pricing report failed.'); }
    finally { setBusy(false); }
  };

  const recentOrders = useMemo(() => orders.slice(0, 12), [orders]);

  if (!session) return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card">
        <div className="admin-auth-brand" translate="no"><span>{BRAND.initials}</span><div><strong>{BRAND.name}</strong><small>{copy.console}</small></div></div>
        <h1>{copy.signIn}</h1>
        <form onSubmit={handleAuth}>
          <label>{copy.email}<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>{copy.password}<input type="password" autoComplete="current-password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required /></label>
          {error ? <p className="admin-error">{error}</p> : null}
          <button className="admin-primary" disabled={busy}>{busy ? copy.signing : copy.enter}</button>
        </form>
        <div className="admin-auth-links"><a href="?staff=1">{copy.kitchen}</a><a href="./">{copy.customer}</a></div>
        <div className="admin-lang"><button className={language === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button><button className={language === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button></div>
      </section>
    </main>
  );

  if (!authorized) return (
    <main className="admin-auth-shell"><section className="admin-auth-card">
      <div className="admin-auth-brand" translate="no"><span>{BRAND.initials}</span><strong>{BRAND.name}</strong></div>
      <h1>{copy.noAccess}</h1><p>{copy.noAccessBody}</p>
      <button className="admin-secondary" onClick={async () => { await signOut(); setSession(null); }}>{copy.signOut}</button>
    </section></main>
  );

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand" translate="no"><span>{BRAND.initials}</span><div><strong>{BRAND.name}</strong><small>{copy.console}</small></div></div>
        <nav aria-label="Admin navigation">{TABS.map(item => <button key={item} aria-current={tab === item ? 'page' : undefined} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{copy[item]}</button>)}</nav>
        <div className="admin-side-foot"><a href="?staff=1">{copy.kitchen}</a><a href="./">{copy.customer}</a></div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-topbar">
          <div><span className="admin-eyebrow" translate="no">{BRAND.kitchen}</span><h1>{copy[tab]}</h1></div>
          <div className="admin-top-actions"><div className="admin-lang"><button className={language === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button><button className={language === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button></div><span className="admin-role">{role}</span><button className="admin-secondary compact" onClick={loadProtected}>{copy.refresh}</button><button className="admin-secondary compact" onClick={async () => { await signOut(); setSession(null); }}>{copy.signOut}</button></div>
        </header>

        <nav className="admin-mobile-nav" aria-label="Admin sections">{TABS.map(item => <button key={item} aria-current={tab === item ? 'page' : undefined} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{copy[item]}</button>)}</nav>
        {error ? <div className="admin-alert" role="alert">{error}</div> : null}
        {loading ? <div className="admin-loading">{copy.loading}</div> : null}

        {!loading && tab === 'overview' ? <div className="admin-page">
          <section className="admin-metrics">
            <Metric label={copy.ordersToday} value={overview?.ordersToday ?? 0} />
            <Metric label={copy.sales} value={money(overview?.orderValueToday)} />
            <Metric label={copy.avgTicket} value={money(overview?.averageOrder)} />
            <Metric label={copy.active} value={overview?.activeOrders ?? 0} />
            <Metric label={copy.avgPrep} value={`${overview?.averagePrepMinutes ?? 0} min`} />
            <Metric label={copy.pageViews} value={insights?.totalViews ?? 0} note="7 days" />
          </section>
          <section className="admin-grid two"><article className="admin-panel"><div className="admin-panel-head"><div><span>{copy.today}</span><h2>{copy.recentOrders}</h2></div></div><OrdersTable orders={recentOrders.slice(0, 6)} copy={copy} /></article>
            <article className="admin-panel"><div className="admin-panel-head"><div><span>7 days</span><h2>{copy.hourly}</h2></div></div><Bars rows={insights?.hourly || []} empty={copy.notConnected} /></article></section>
          <section className="admin-note"><strong>{copy.brandSafe}</strong><p>{copy.brandSafeBody}</p></section>
        </div> : null}

        {!loading && tab === 'orders' ? <div className="admin-page"><section className="admin-panel"><div className="admin-panel-head"><div><span>{copy.today}</span><h2>{copy.recentOrders}</h2></div></div><OrdersTable orders={recentOrders} copy={copy} /></section></div> : null}

        {!loading && tab === 'pricing' ? <div className="admin-page">
          <section className="admin-panel admin-pricing"><div className="admin-panel-head"><div><span>70% markup</span><h2>{copy.pricingTitle}</h2><p>{copy.pricingBody}</p></div></div>
            <div className="admin-privacy"><strong>{copy.invoicePrivacy}</strong><span>{copy.uploadSoon}</span></div>
            <form onSubmit={handlePricing}><div className="pricing-meta">
              <label>{copy.vendor}<input value={invoice.vendor} maxLength={120} onChange={e => setInvoice(current => ({ ...current, vendor: e.target.value }))} required /></label>
              <label>{copy.invoiceNumber}<input value={invoice.invoiceNumber} maxLength={64} onChange={e => setInvoice(current => ({ ...current, invoiceNumber: e.target.value }))} required /></label>
              <label>{copy.invoiceDate}<input type="date" value={invoice.invoiceDate} onChange={e => setInvoice(current => ({ ...current, invoiceDate: e.target.value }))} required /></label>
              <label>{copy.invoiceTotal}<input inputMode="decimal" value={invoice.invoiceTotal} onChange={e => setInvoice(current => ({ ...current, invoiceTotal: e.target.value }))} required /></label>
              <label>{copy.pages}<input inputMode="numeric" value={invoice.pages} onChange={e => setInvoice(current => ({ ...current, pages: e.target.value }))} required /></label>
              <label className="pricing-check"><input type="checkbox" checked={invoice.noCharge} onChange={e => setInvoice(current => ({ ...current, noCharge: e.target.checked, invoiceTotal: e.target.checked ? '0' : current.invoiceTotal }))} /><span>{copy.noCharge}</span></label>
            </div><div className="pricing-lines">{pricingLines.map((line, index) => <div className="pricing-line" key={line.id}>
              <label>{copy.product}<input value={line.name} maxLength={140} onChange={e => setPricingLines(current => current.map(item => item.id === line.id ? { ...item, name: e.target.value } : item))} required /></label>
              <label>{copy.upc}<input inputMode="numeric" value={line.upc} maxLength={32} onChange={e => setPricingLines(current => current.map(item => item.id === line.id ? { ...item, upc: e.target.value } : item))} /></label>
              <label>{copy.quantity}<input inputMode="numeric" value={line.quantity} onChange={e => setPricingLines(current => current.map(item => item.id === line.id ? { ...item, quantity: e.target.value } : item))} required /></label>
              <label>{copy.caseCost}<input inputMode="decimal" value={line.caseCost} onChange={e => setPricingLines(current => current.map(item => item.id === line.id ? { ...item, caseCost: e.target.value } : item))} required /></label>
              <label>{copy.packQty}<input inputMode="numeric" value={line.packQty} onChange={e => setPricingLines(current => current.map(item => item.id === line.id ? { ...item, packQty: e.target.value } : item))} required /></label>
              <label>{copy.lineAmount}<input inputMode="decimal" value={line.lineAmount} onChange={e => setPricingLines(current => current.map(item => item.id === line.id ? { ...item, lineAmount: e.target.value } : item))} required /></label>
              <button type="button" className="admin-remove" aria-label={`${copy.remove} ${index + 1}`} onClick={() => setPricingLines(current => current.length === 1 ? [emptyLine()] : current.filter(item => item.id !== line.id))}>{copy.remove}</button>
            </div>)}</div><div className="pricing-actions"><button type="button" className="admin-secondary" onClick={() => setPricingLines(current => [...current, emptyLine()])}>{copy.addLine}</button><button className="admin-primary" disabled={busy}>{busy ? copy.calculating : copy.calculate}</button></div></form>
            {pricingReport.length ? <><div className={`pricing-status ${pricingSummary?.status === 'no_charge' ? 'no-charge' : ''}`}><strong>{pricingSummary?.status === 'no_charge' ? copy.noChargeStatus : copy.reviewRequired}</strong><span translate="no">{pricingSummary?.invoice?.vendor} · {pricingSummary?.invoice?.invoiceNumber} · {money(pricingSummary?.reconciliation?.calculatedTotal)}</span></div><div className="pricing-report"><table><thead><tr><th>{copy.product}</th><th>{copy.upc}</th><th>{copy.costUnit}</th><th>{copy.exactRetail}</th><th>{copy.suggested}</th></tr></thead><tbody>{pricingReport.map((row, index) => <tr key={`${row.upc}-${index}`}><td translate="no">{row.name}</td><td translate="no">{row.upc || '—'}</td><td>{row.noCharge ? '—' : money(row.costPerUnit)}</td><td>{row.noCharge ? '—' : money(row.exactRetail)}</td><td><strong>{row.noCharge ? copy.noChargeStatus : money(row.suggestedRetail)}</strong></td></tr>)}</tbody></table></div><div className="pricing-report-actions"><button className="admin-secondary" onClick={() => downloadCsv(pricingReport, pricingSummary?.invoice)}>{copy.export}</button><button className="admin-secondary" onClick={() => window.print()}>{copy.print}</button></div></> : null}
          </section></div> : null}

        {!loading && tab === 'catalog' ? <div className="admin-page"><section className="admin-panel"><div className="admin-panel-head"><div><h2>{copy.catalogTitle}</h2><p>{copy.catalogBody}</p></div></div><div className="catalog-grid">{menuData.products.map(item => <article key={item.id}><img src={item.imageUrl} alt="" /><div><strong translate="no">{item.name}</strong><span>{money(item.basePrice)}</span></div><em className={item.available ? 'available' : ''}>{item.available ? copy.open : copy.closed}</em></article>)}</div></section></div> : null}

        {!loading && tab === 'operations' ? <div className="admin-page"><section className="admin-panel"><div className="admin-panel-head"><div><h2>{copy.operationsTitle}</h2><p>{copy.operationsBody}</p></div></div><div className="readonly-controls"><label><span>Kitchen</span><input type="checkbox" checked readOnly /></label><label><span>Pickup</span><input type="checkbox" checked readOnly /></label><label><span>Delivery</span><input type="checkbox" checked readOnly /></label></div></section></div> : null}

        {!loading && tab === 'staff' ? <div className="admin-page"><section className="admin-panel"><div className="admin-panel-head"><div><h2>{copy.staffTitle}</h2><p>{copy.staffBody}</p></div></div><div className="admin-note"><strong>{copy.role}</strong><p>{role}</p></div></section></div> : null}

        {!loading && tab === 'audit' ? <div className="admin-page"><section className="admin-panel"><div className="admin-panel-head"><div><h2>{copy.auditTitle}</h2><p>{copy.auditBody}</p></div></div><AuditTable rows={audit} copy={copy} /></section></div> : null}

        {!loading && tab === 'insights' ? <div className="admin-page"><section className="admin-panel"><div className="admin-panel-head"><div><span>7 days</span><h2>{copy.trafficTitle}</h2><p>{copy.trafficBody}</p></div></div><section className="admin-metrics embedded"><Metric label={copy.pageViews} value={insights?.totalViews ?? 0} /><Metric label={copy.topPages} value={insights?.topPages?.[0]?.label || '—'} /><Metric label={copy.sources} value={insights?.sources?.[0]?.label || '—'} /></section><div className="admin-grid two"><ChartPanel title={copy.topPages} rows={insights?.topPages} empty={copy.notConnected} /><ChartPanel title={copy.sources} rows={insights?.sources} empty={copy.notConnected} /><ChartPanel title={copy.devices} rows={insights?.devices} empty={copy.notConnected} /><ChartPanel title={copy.languages} rows={insights?.languages} empty={copy.notConnected} /></div></section></div> : null}
      </section>
    </main>
  );
}

function OrdersTable({ orders, copy }) {
  if (!orders.length) return <EmptyState title={copy.noOrders} body="" />;
  return <div className="admin-table-wrap"><table><thead><tr><th>{copy.order}</th><th>{copy.status}</th><th>{copy.total}</th><th>{copy.time}</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><strong>#{order.id}</strong><small>{order.tipo_entrega}</small></td><td><span className={`order-status ${order.estado}`}>{order.estado}</span></td><td>{money(order.total)}</td><td>{new Date(order.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>;
}

function AuditTable({ rows, copy }) {
  if (!rows.length) return <EmptyState title={copy.noOrders} body="" />;
  return <div className="admin-table-wrap"><table><thead><tr><th>{copy.order}</th><th>{copy.transition}</th><th>{copy.actor}</th><th>{copy.time}</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>#{row.order_id}</td><td>{row.from_status || '—'} → {row.to_status}</td><td>{row.actor_role || row.source || 'system'}</td><td>{new Date(row.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>;
}

function ChartPanel({ title, rows, empty }) {
  return <article className="admin-chart"><h3>{title}</h3><Bars rows={rows || []} empty={empty} /></article>;
}
