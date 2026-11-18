



// Booth code se qatar aur number nikalta hai: "B4" -> qatar B, number 4
function parse(code) {
  const m = /^([A-Za-z]+)\s*-?\s*(\d+)/.exec(code || '');
  return m ? { row: m[1].toUpperCase(), num: parseInt(m[2], 10) } : { row: '#', num: 0 };
}

/*
  mode = 'admin'  : poora naqsha, company ka naam, free booth par Delete
  mode = 'select' : exhibitor ke liye, free booth par click karke chunna
  mode = 'view'   : sirf dekhna
*/
export default function FloorPlan({ booths, selectedId, onSelect, onDelete, mode = 'view' }) {
  if (!booths || booths.length === 0) {
    return <p className="fp-empty">No booths for this expo yet.</p>;
  }

  const rows = {};
  booths.forEach((b) => {
    const { row, num } = parse(b.code);
    (rows[row] = rows[row] || []).push({ ...b, num });
  });
  const names = Object.keys(rows).sort();
  names.forEach((r) => rows[r].sort((a, b) => a.num - b.num));

  return (
    <div className="fp">
      <div className="fp-stage">Main stage</div>

      {names.map((r) => (
        <div className="fp-row" key={r}>
          <span className="fp-rowname">{r}</span>

          <div className="fp-cells">
            {rows[r].map((b) => {
              const taken = Boolean(b.assignedTo);
              const label = taken
                ? mode === 'select'
                  ? 'Reserved'
                  : b.assignedTo.companyName || 'Reserved'
                : 'Free';
              const cls = 'fp-cell ' + (b.size || 'medium') + (taken ? ' taken' : '');

              if (mode === 'select') {
                return (
                  <button
                    type="button"
                    key={b._id}
                    className={cls}
                    disabled={taken}
                    aria-pressed={selectedId === b._id}
                    onClick={() => onSelect && onSelect(b)}
                  >
                    <b>{b.code}</b>
                    <small>{b.size}</small>
                    <small>{label}</small>
                  </button>
                );
              }

              return (
                <div key={b._id} className={cls}>
                  <b>{b.code}</b>
                  <small>{b.size}</small>
                  <small>{label}</small>
                  {mode === 'admin' && !taken && onDelete && (
                    <button type="button" className="fp-del" onClick={() => onDelete(b)}>
                      Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="fp-legend">
        <span><i className="free"></i>Free</span>
        <span><i className="taken"></i>Reserved</span>
        {mode === 'select' && <span><i className="pick"></i>Your pick</span>}
      </div>
    </div>
  );
}