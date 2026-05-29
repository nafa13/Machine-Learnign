"use client";

import React, { useState } from 'react';
import ModelEvaluation from './ModelEvaluation';

export default function ResultSVR({ resultData, modelType = 'svr' }) {
  const [selectedRow, setSelectedRow] = useState(1);

  if (!resultData) return null;

  const { dataset_details, predictions, manual_calculation, evaluation_metrics } = resultData;
  const maxRows = predictions ? predictions.length : dataset_details.row_count;

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(num);
  };

  const handleRowChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 1;
    if (val < 1) val = 1;
    if (val > maxRows) val = maxRows;
    setSelectedRow(val);
  };

  const currentIndex = selectedRow - 1;
  const rowFeatures = dataset_details.data && dataset_details.data[currentIndex];
  const rowPrediction = predictions && predictions[currentIndex];

  return (
    <div className="results-container">
      {evaluation_metrics && (
        <ModelEvaluation metrics={evaluation_metrics} />
      )}

      <div className="glass-card">
        <h2 className="section-title">📊 Rincian Dataset & Pilih Baris</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Baris Dataset</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{dataset_details.row_count}</div>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Jumlah Kolom Fitur ({modelType.toUpperCase()})</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{dataset_details.columns.length}</div>
          </div>
        </div>

        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>🔍 Cari Prediksi Berdasarkan Baris</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Masukkan nomor baris data yang ingin Anda lihat hasil prediksinya (1 hingga {maxRows}).
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>Pilih Baris ke-</label>
            <input 
              type="number" 
              min="1" 
              max={maxRows} 
              value={selectedRow}
              onChange={handleRowChange}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--accent-secondary)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                fontSize: '1.1rem',
                width: '120px'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Data pada Baris ke-{selectedRow}</h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {dataset_details.columns.map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                  <th style={{ color: 'var(--success)', whiteSpace: 'nowrap' }}>✨ Prediksi Harga (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {dataset_details.columns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {rowFeatures ? rowFeatures[col] : <span style={{color: 'gray'}}>N/A (Data terlalu besar)</span>}
                    </td>
                  ))}
                  <td style={{ fontWeight: 'bold', color: 'var(--success)', fontSize: '1.1rem' }}>
                    {rowPrediction ? formatNumber(rowPrediction) : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">📈 Penjelasan Perhitungan Manual {modelType.toUpperCase()}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Bagaimana model menghasilkan prediksi <strong>Rp {rowPrediction ? formatNumber(rowPrediction) : 0}</strong> pada baris ke-{selectedRow} tersebut? Berikut adalah rahasia dapur perhitungan matematisnya.
        </p>

        {manual_calculation && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Langkah Perhitungan {modelType.toUpperCase()}</h4>
            <div className="formula-box">
              {manual_calculation.formula_explanation}
            </div>
            
            <div style={{ marginTop: '1rem', padding: '1rem', borderLeft: '4px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)' }}>
              <strong>Parameter Ekstrak dari Model `.pkl`:</strong>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                {manual_calculation.kernel && <li>Kernel yang digunakan: <code>{manual_calculation.kernel}</code></li>}
                {manual_calculation.intercept !== undefined && <li>Nilai Intercept (b): <code>{formatNumber(manual_calculation.intercept)}</code></li>}
                {manual_calculation.total_support_vectors && <li>Total Support Vectors: <code>{formatNumber(manual_calculation.total_support_vectors)}</code></li>}
                {manual_calculation.total_trees && <li>Total Decision Trees (RF): <code>{manual_calculation.total_trees}</code> pohon</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
