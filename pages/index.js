import { useState } from 'react';
import Head from 'next/head';

const ESTADOS = [
  "AGUASCALIENTES","BAJA CALIFORNIA","BAJA CALIFORNIA SUR","CAMPECHE",
  "CHIAPAS","CHIHUAHUA","CIUDAD DE MEXICO","COAHUILA","COLIMA","DURANGO",
  "GUANAJUATO","GUERRERO","HIDALGO","JALISCO","MEXICO","MICHOACAN",
  "MORELOS","NAYARIT","NUEVO LEON","OAXACA","PUEBLA","QUERETARO",
  "QUINTANA ROO","SAN LUIS POTOSI","SINALOA","SONORA","TABASCO",
  "TAMAULIPAS","TLAXCALA","VERACRUZ","YUCATAN","ZACATECAS"
];

const TIPOS = [
  { value: 'nacimiento',  label: '🟢 Nacimiento' },
  { value: 'defuncion',   label: '⚫ Defunción' },
  { value: 'matrimonio',  label: '🔵 Matrimonio' },
  { value: 'divorcio',    label: '🔴 Divorcio' },
];

export default function Home() {
  const [tipo, setTipo] = useState('nacimiento');
  const [searchMethod, setSearchMethod] = useState('curp');
  const [curp, setCurp] = useState('');
  const [cadena, setCadena] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [counter, setCounter] = useState(0);

  const handleConsultar = async () => {
    const valorBusqueda = searchMethod === 'curp' ? curp : cadena;
    if (!valorBusqueda || !estado) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setError(null);
    setLoading(true);
    setStep(2);

    const body = {
      type: tipo,
      search: searchMethod,
      state: estado,
      id_req: String(Date.now()),
    };

    if (searchMethod === 'curp') {
      body.Curp = curp.toUpperCase();
    } else {
      body.Cadena = cadena;
    }

    try {
      const res = await fetch('/api/consultar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.job_id) {
        setJobId(data.job_id);
        setStatus(data);
        setStep(3);
        pollStatus(data.job_id);
      } else {
        setError('No se pudo iniciar la consulta. Verifica los datos e intenta de nuevo.');
        setStep(1);
      }
    } catch (e) {
      setError('Error de conexión. Intenta de nuevo.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async (id, attempts = 0) => {
    if (attempts > 20) return;
    setCounter(attempts);

    try {
      const res = await fetch(`/api/status/${id}`);
      const data = await res.json();
      setStatus(data);

      if (data.status === 'PENDING' || data.status === 'PROCESSING') {
        setTimeout(() => pollStatus(id, attempts + 1), 3000);
      }
    } catch (e) {
      // silently retry
      setTimeout(() => pollStatus(id, attempts + 1), 3000);
    }
  };

  const handleReset = () => {
    setCurp('');
    setCadena('');
    setEstado('');
    setJobId(null);
    setStatus(null);
    setError(null);
    setStep(1);
    setCounter(0);
  };

  const getStatusColor = (s) => {
    if (!s) return '#888';
    if (s === 'COMPLETED' || s === 'DONE') return '#22c55e';
    if (s === 'PENDING' || s === 'PROCESSING') return '#f59e0b';
    if (s === 'ERROR' || s === 'FAILED') return '#ef4444';
    return '#888';
  };

  const getStatusLabel = (s) => {
    if (!s) return '';
    if (s === 'COMPLETED' || s === 'DONE') return '✅ Completado';
    if (s === 'PENDING') return '⏳ En espera...';
    if (s === 'PROCESSING') return '🔄 Procesando...';
    if (s === 'ERROR' || s === 'FAILED') return '❌ Error';
    return s;
  };

  return (
    <>
      <Head>
        <title>Consulta de Actas — Registro Civil</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow-x: hidden;
        }

        body::before {
          content: '';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at 60% 20%, rgba(99,60,220,0.12) 0%, transparent 50%),
                      radial-gradient(ellipse at 20% 80%, rgba(20,180,160,0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 520px;
          backdrop-filter: blur(20px);
          position: relative;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99,60,220,0.2);
          border: 1px solid rgba(99,60,220,0.3);
          color: #a78bfa;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 100px;
          margin-bottom: 20px;
        }

        h1 {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 8px;
        }

        .subtitle {
          color: rgba(255,255,255,0.4);
          font-size: 14px;
          margin-bottom: 36px;
          line-height: 1.6;
        }

        .field {
          margin-bottom: 18px;
        }

        label {
          display: block;
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        input, select {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: #fff;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          -webkit-appearance: none;
        }

        input::placeholder { color: rgba(255,255,255,0.2); }
        select option { background: #1a1a2e; color: #fff; }

        input:focus, select:focus {
          border-color: rgba(99,60,220,0.6);
          background: rgba(99,60,220,0.05);
        }

        .btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #6b3fe0, #4f46e5);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 8px;
          transition: opacity 0.2s, transform 0.1s;
          letter-spacing: 0.02em;
        }

        .btn:hover { opacity: 0.9; }
        .btn:active { transform: scale(0.99); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-ghost {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
        }

        .error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .status-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 20px;
          margin-top: 24px;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .status-label {
          color: rgba(255,255,255,0.4);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .status-value {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          max-width: 60%;
          text-align: right;
          word-break: break-all;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 28px 0;
        }

        .toggle-group {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 18px;
        }

        .toggle-btn {
          flex: 1;
          padding: 9px 8px;
          border: none;
          border-radius: 7px;
          background: transparent;
          color: rgba(255,255,255,0.35);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .toggle-btn.active {
          background: rgba(99,60,220,0.35);
          color: #fff;
        }

        .section-label {
          color: rgba(255,255,255,0.3);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
          margin-top: 4px;
        }

          background: rgba(0,0,0,0.3);
          border-radius: 10px;
          padding: 14px;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          word-break: break-all;
          white-space: pre-wrap;
          font-family: monospace;
          max-height: 200px;
          overflow-y: auto;
          margin-top: 12px;
        }
      `}</style>

      <div className="card">
        <div className="badge">
          <span>●</span> Registro Civil México
        </div>

        <h1>Consulta de<br />Actas</h1>
        <p className="subtitle">Ingresa los datos para consultar un acta de nacimiento a través del Registro Civil.</p>

        {step === 1 && (
          <>
            {error && <div className="error">⚠️ {error}</div>}

            <p className="section-label">Tipo de acta</p>
            <div className="toggle-group">
              {TIPOS.map(t => (
                <button
                  key={t.value}
                  className={`toggle-btn ${tipo === t.value ? 'active' : ''}`}
                  onClick={() => setTipo(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <p className="section-label">Método de búsqueda</p>
            <div className="toggle-group" style={{ marginBottom: 24 }}>
              <button
                className={`toggle-btn ${searchMethod === 'curp' ? 'active' : ''}`}
                onClick={() => setSearchMethod('curp')}
              >
                Por CURP
              </button>
              <button
                className={`toggle-btn ${searchMethod === 'cadena' ? 'active' : ''}`}
                onClick={() => setSearchMethod('cadena')}
              >
                Por Cadena
              </button>
            </div>

            {searchMethod === 'curp' ? (
              <div className="field">
                <label>CURP</label>
                <input
                  type="text"
                  placeholder="Ej. OEMA940901MNLLRR00"
                  value={curp}
                  onChange={e => setCurp(e.target.value.toUpperCase())}
                  maxLength={18}
                />
              </div>
            ) : (
              <div className="field">
                <label>Cadena de búsqueda</label>
                <input
                  type="text"
                  placeholder="Ingresa la cadena de búsqueda"
                  value={cadena}
                  onChange={e => setCadena(e.target.value)}
                />
              </div>
            )}

            <div className="field">
              <label>Estado</label>
              <select value={estado} onChange={e => setEstado(e.target.value)}>
                <option value="">Selecciona un estado</option>
                {ESTADOS.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <button className="btn" onClick={handleConsultar} disabled={loading}>
              Consultar Acta
            </button>
          </>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }}></div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Iniciando consulta...</p>
          </div>
        )}

        {step === 3 && status && (
          <>
            <div className="status-box">
              <div className="status-row">
                <span className="status-label">Estado</span>
                <span
                  className="status-pill"
                  style={{
                    background: getStatusColor(status.status) + '22',
                    color: getStatusColor(status.status),
                    border: `1px solid ${getStatusColor(status.status)}44`
                  }}
                >
                  {(status.status === 'PENDING' || status.status === 'PROCESSING') && (
                    <span className="spinner"></span>
                  )}
                  {getStatusLabel(status.status)}
                </span>
              </div>

              <div className="status-row">
                <span className="status-label">Job ID</span>
                <span className="status-value" style={{ fontSize: 11 }}>{status.job_id || jobId}</span>
              </div>

              {status.message && (
                <div className="status-row" style={{ marginBottom: 0 }}>
                  <span className="status-label">Mensaje</span>
                  <span className="status-value">{status.message}</span>
                </div>
              )}
            </div>

            {(status.status === 'PENDING' || status.status === 'PROCESSING') && (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
                Verificando automáticamente... ({counter} intentos)
              </p>
            )}

            {status.data && (
              <>
                <div className="divider" />
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 }}>Datos del acta:</p>
                <div className="result-data">{JSON.stringify(status.data, null, 2)}</div>
              </>
            )}

            <div className="divider" />

            <button className="btn btn-ghost" onClick={handleReset}>
              ← Nueva consulta
            </button>
          </>
        )}
      </div>
    </>
  );
}

