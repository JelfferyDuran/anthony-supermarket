import { useEffect, useMemo, useState } from 'react';
import {
  cancelInventoryCount,
  completeInventoryCount,
  listInventoryBalances,
  listInventoryCounts,
  listPosAliases,
  listPricingProducts,
  listUnmatchedPos,
  registerPosAlias,
  saveInventoryCountLines,
  startInventoryCount,
} from '../lib/pricingAdminApi.js';

const GENERIC_POS_NAMES = new Set([
  'GENERAL FOOD',
  'PRODUCE',
  'MEAT/FISH',
  'BISTEC/STEAK',
]);

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

function productLabel(product) {
  if (!product) return 'Unknown product';
  const suffix = product.upc ? ` · UPC ${product.upc}` : '';
  return `${product.name}${suffix}`;
}

export default function PricingManagerBoard({ token }) {
  const [view, setView] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [balances, setBalances] = useState([]);
  const [counts, setCounts] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [aliases, setAliases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [countLabel, setCountLabel] = useState('Cycle count');
  const [activeCount, setActiveCount] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [draftLines, setDraftLines] = useState([]);
  const [aliasSelections, setAliasSelections] = useState({});

  const productById = useMemo(
    () => Object.fromEntries(products.map((product) => [product.id, product])),
    [products],
  );

  async function refresh() {
    setError('');
    try {
      const [nextProducts, nextBalances, nextCounts, nextUnmatched, nextAliases] = await Promise.all([
        listPricingProducts(token),
        listInventoryBalances(token),
        listInventoryCounts(token),
        listUnmatchedPos(token),
        listPosAliases(token),
      ]);
      setProducts(nextProducts);
      setBalances(nextBalances);
      setCounts(nextCounts);
      setUnmatched(nextUnmatched);
      setAliases(nextAliases);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [nextProducts, nextBalances, nextCounts, nextUnmatched, nextAliases] = await Promise.all([
          listPricingProducts(token),
          listInventoryBalances(token),
          listInventoryCounts(token),
          listUnmatchedPos(token),
          listPosAliases(token),
        ]);
        if (!alive) return;
        setProducts(nextProducts);
        setBalances(nextBalances);
        setCounts(nextCounts);
        setUnmatched(nextUnmatched);
        setAliases(nextAliases);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  async function startCount() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const count = await startInventoryCount(token, { label: countLabel || 'Cycle count' });
      setActiveCount(count);
      setDraftLines([]);
      setNotice(`Started inventory count ${count.label || count.id}. Nothing changes on hand until you complete it.`);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function addDraftLine() {
    const qty = Number(quantity);
    if (!selectedProductId || !Number.isFinite(qty) || qty < 0) {
      setError('Choose a product and enter a non-negative quantity.');
      return;
    }
    const product = productById[selectedProductId];
    setDraftLines((current) => [
      ...current.filter((line) => line.product_id !== selectedProductId),
      { product_id: selectedProductId, quantity_each: qty, name: product?.name || selectedProductId },
    ]);
    setQuantity('');
    setError('');
  }

  async function saveLines() {
    if (!activeCount || draftLines.length === 0) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await saveInventoryCountLines(token, activeCount.id, draftLines.map(({ product_id, quantity_each }) => ({
        product_id,
        quantity_each,
      })));
      setNotice(`Saved ${draftLines.length} count line${draftLines.length === 1 ? '' : 's'} to the draft session.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function finishCount() {
    if (!activeCount || draftLines.length === 0) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await saveInventoryCountLines(token, activeCount.id, draftLines.map(({ product_id, quantity_each }) => ({
        product_id,
        quantity_each,
      })));
      await completeInventoryCount(token, activeCount.id);
      setNotice(`Completed ${activeCount.label || 'inventory count'} and updated ${draftLines.length} on-hand balance${draftLines.length === 1 ? '' : 's'}.`);
      setActiveCount(null);
      setDraftLines([]);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function cancelCount(sessionId) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await cancelInventoryCount(token, sessionId);
      if (activeCount?.id === sessionId) {
        setActiveCount(null);
        setDraftLines([]);
      }
      setNotice('Draft inventory count cancelled. No on-hand balances were changed.');
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function approveAlias(row) {
    const key = row.normalized_name || row.sample_item_name || row.upc;
    const productId = aliasSelections[key];
    if (!productId) {
      setError('Choose the canonical product before approving a POS mapping.');
      return;
    }
    const normalized = String(row.normalized_name || '').toUpperCase();
    if (!row.upc && GENERIC_POS_NAMES.has(normalized)) {
      setError(`${normalized} is a broad POS button, not one product. It cannot be approved as a product alias.`);
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');
    try {
      // UPC is stronger evidence. When it exists, register only the UPC so a
      // generic/reused POS description cannot accidentally claim future rows.
      const result = await registerPosAlias(token, {
        productId,
        upc: row.upc || null,
        normalizedName: row.upc ? null : row.normalized_name,
      });
      const product = productById[productId];
      setNotice(`Approved ${row.upc ? `UPC ${row.upc}` : row.normalized_name} → ${product?.name || productId}. Backfilled ${result?.rows_backfilled || 0} historical row(s).`);
      setAliasSelections((current) => ({ ...current, [key]: '' }));
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="board-head"><h2>Pricing & Inventory</h2><span className="board-sync">Loading…</span></div>;

  return (
    <div className="store-board">
      <div className="board-head">
        <div>
          <h2>Pricing & Inventory</h2>
          <span className="board-sync">70% markup · approved retail remains server-authoritative</span>
        </div>
        <button className="admin-logout" onClick={refresh} disabled={busy}>Refresh</button>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {notice && <div className="st-section" style={{ borderLeft: '4px solid currentColor' }}>{notice}</div>}

      <div className="admin-tabs" style={{ marginBottom: 16 }}>
        <button className={view === 'inventory' ? 'admin-tab active' : 'admin-tab'} onClick={() => setView('inventory')}>📦 Inventory Counts</button>
        <button className={view === 'matches' ? 'admin-tab active' : 'admin-tab'} onClick={() => setView('matches')}>🔗 POS Matching</button>
      </div>

      {view === 'inventory' && (
        <>
          <div className="st-section">
            <h3>New physical count</h3>
            {!activeCount ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input value={countLabel} onChange={(e) => setCountLabel(e.target.value)} placeholder="Count label" />
                <button className="admin-tab active" onClick={startCount} disabled={busy}>Start draft count</button>
              </div>
            ) : (
              <div>
                <p><strong>{activeCount.label || 'Draft count'}</strong> · Draft · balances do not change until completion.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 140px auto', gap: 8, alignItems: 'center' }}>
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                    <option value="">Choose product…</option>
                    {products.map((product) => <option key={product.id} value={product.id}>{productLabel(product)}</option>)}
                  </select>
                  <input type="number" min="0" step="0.001" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty each" />
                  <button className="admin-tab" onClick={addDraftLine}>Add / replace</button>
                </div>

                {draftLines.length > 0 && (
                  <table className="st-table" style={{ marginTop: 12 }}>
                    <thead><tr><th>Product</th><th>Counted each</th><th></th></tr></thead>
                    <tbody>
                      {draftLines.map((line) => (
                        <tr key={line.product_id}>
                          <td>{line.name}</td>
                          <td>{line.quantity_each}</td>
                          <td><button className="admin-logout" onClick={() => setDraftLines((current) => current.filter((x) => x.product_id !== line.product_id))}>Remove</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <button className="admin-tab" onClick={saveLines} disabled={busy || draftLines.length === 0}>Save draft</button>
                  <button className="admin-tab active" onClick={finishCount} disabled={busy || draftLines.length === 0}>Complete & update on-hand</button>
                  <button className="admin-logout" onClick={() => cancelCount(activeCount.id)} disabled={busy}>Cancel count</button>
                </div>
              </div>
            )}
          </div>

          <div className="st-section">
            <h3>Current on-hand balances</h3>
            {balances.length === 0 ? <div className="k-empty">No completed physical counts yet.</div> : (
              <table className="st-table">
                <thead><tr><th>Product</th><th>On hand</th><th>Retail</th><th>Updated</th></tr></thead>
                <tbody>
                  {balances.slice(0, 100).map((row) => {
                    const product = row.pricing_products || productById[row.product_id];
                    return (
                      <tr key={row.product_id}>
                        <td>{product?.name || row.product_id}</td>
                        <td>{row.on_hand_quantity}</td>
                        <td>{product?.current_retail_price != null ? money(product.current_retail_price) : '—'}</td>
                        <td>{row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="st-section">
            <h3>Count history</h3>
            <table className="st-table">
              <thead><tr><th>Label</th><th>Status</th><th>Created</th><th>Completed</th><th></th></tr></thead>
              <tbody>
                {counts.map((count) => (
                  <tr key={count.id}>
                    <td>{count.label || count.id.slice(0, 8)}</td>
                    <td><span className="st-chip">{count.status}</span></td>
                    <td>{new Date(count.created_at).toLocaleString()}</td>
                    <td>{count.completed_at ? new Date(count.completed_at).toLocaleString() : '—'}</td>
                    <td>{count.status === 'draft' && count.id !== activeCount?.id ? <button className="admin-logout" onClick={() => cancelCount(count.id)} disabled={busy}>Cancel</button> : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'matches' && (
        <>
          <div className="st-section">
            <h3>Unmatched NRS sales — review queue</h3>
            <p className="board-sync">Approve only when the POS identity and canonical product are the same real item. UPC mappings are preferred. Broad department buttons stay unmatched.</p>
            <table className="st-table">
              <thead><tr><th>POS item</th><th>UPC</th><th>Rows</th><th>Revenue</th><th>Canonical product</th><th></th></tr></thead>
              <tbody>
                {unmatched.map((row) => {
                  const key = row.normalized_name || row.sample_item_name || row.upc;
                  const generic = !row.upc && GENERIC_POS_NAMES.has(String(row.normalized_name || '').toUpperCase());
                  return (
                    <tr key={key}>
                      <td>
                        <strong>{row.sample_item_name || row.normalized_name || 'Unknown'}</strong>
                        {generic && <div className="st-sub">Broad POS button — do not map to one product</div>}
                      </td>
                      <td>{row.upc || '—'}</td>
                      <td>{row.sale_rows}</td>
                      <td>{money(row.revenue)}</td>
                      <td>
                        <select
                          value={aliasSelections[key] || ''}
                          onChange={(e) => setAliasSelections((current) => ({ ...current, [key]: e.target.value }))}
                          disabled={generic}
                        >
                          <option value="">Choose exact product…</option>
                          {products.map((product) => <option key={product.id} value={product.id}>{productLabel(product)}</option>)}
                        </select>
                      </td>
                      <td><button className="admin-tab active" disabled={busy || generic || !aliasSelections[key]} onClick={() => approveAlias(row)}>Approve exact match</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="st-section">
            <h3>Approved POS aliases</h3>
            {aliases.length === 0 ? <div className="k-empty">No manager-approved aliases yet.</div> : (
              <table className="st-table">
                <thead><tr><th>Evidence</th><th>Canonical product</th><th>Approved</th></tr></thead>
                <tbody>
                  {aliases.map((alias) => (
                    <tr key={alias.id}>
                      <td>{alias.upc ? `UPC ${alias.upc}` : alias.normalized_name}</td>
                      <td>{alias.pricing_products?.name || productById[alias.product_id]?.name || alias.product_id}</td>
                      <td>{new Date(alias.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
