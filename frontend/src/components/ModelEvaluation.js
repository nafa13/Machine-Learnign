"use client";

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ModelEvaluation({ metrics, modelType = 'model' }) {
  if (!metrics) return null;

  const { r2_score, mae, total_evaluated, scatter_data } = metrics;

  const isUSD = modelType === 'rf';

  const formatNumber = (num) => {
    if (isUSD) {
      return '$ ' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
    }
    if (num >= 1e9) return 'Rp ' + (num / 1e9).toFixed(2) + ' Miliar';
    if (num >= 1e6) return 'Rp ' + (num / 1e6).toFixed(2) + ' Juta';
    return 'Rp ' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(num);
  };

  // Find max value to draw perfect prediction line
  let maxVal = 0;
  scatter_data.forEach(d => {
    if (d.actual > maxVal) maxVal = d.actual;
    if (d.predicted > maxVal) maxVal = d.predicted;
  });

  // Add 10% padding to maxVal for chart aesthetic
  maxVal = maxVal * 1.1;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: 'rgba(0,0,0,0.8)', padding: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Harga Asli:</p>
          <p style={{ color: 'white', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{formatNumber(data.actual)}</p>
          
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Harga Prediksi:</p>
          <p style={{ color: 'var(--success)', margin: 0, fontWeight: 'bold' }}>{formatNumber(data.predicted)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card" style={{ marginBottom: '2rem' }}>
      <h2 className="section-title">🎯 Global Evaluation Dashboard</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Karena dataset yang Anda unggah memiliki kolom Harga Asli (<code>price_in_rp</code>), sistem AI berhasil mengevaluasi akurasi model Anda pada <strong>{total_evaluated} baris data</strong> secara keseluruhan.
      </p>
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.05)', borderLeft: '4px solid var(--accent-primary)', borderRadius: '0.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
        <strong>Catatan untuk Penguji:</strong> Skor R² dan MAE di bawah ini adalah performa <em>Global</em> (rata-rata dari seluruh {total_evaluated} baris dataset yang diunggah). Ini adalah metrik absolut model yang tidak akan berubah meskipun Anda meninjau hasil baris individu di tabel bawah.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '0.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Akurasi R² Score</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
            {(r2_score * 100).toFixed(2)}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>*Semakin mendekati 100%, semakin cerdas model mengenali pola harga.</div>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: '0.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Rata-rata Meleset (MAE)</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fca5a5' }}>
            ± {formatNumber(mae)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>*Rata-rata nilai selisih antara tebakan {modelType.toUpperCase()} dengan harga aslinya.</div>
        </div>
      </div>

      <div style={{ height: '400px', width: '100%', marginTop: '3rem', paddingBottom: '2rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>Grafik Sebaran: Harga Asli vs Prediksi</h4>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              type="number" 
              dataKey="actual" 
              name="Harga Asli" 
              tickFormatter={formatNumber}
              stroke="rgba(255,255,255,0.5)"
              domain={[0, maxVal]}
            />
            <YAxis 
              type="number" 
              dataKey="predicted" 
              name={`Prediksi ${modelType.toUpperCase()}`} 
              tickFormatter={formatNumber}
              stroke="rgba(255,255,255,0.5)"
              domain={[0, maxVal]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            
            {/* Garis ideal (Jika prediksi 100% akurat, titik akan berada tepat di atas garis ini) */}
            <ReferenceLine segment={[{ x: 0, y: 0 }, { x: maxVal, y: maxVal }]} stroke="var(--accent-secondary)" strokeWidth={2} strokeDasharray="5 5" />
            
            <Scatter name={isUSD ? "Sneakers" : "Properti"} data={scatter_data} fill="var(--success)" />
          </ScatterChart>
        </ResponsiveContainer>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1.5rem' }}>
          *Garis ungu putus-putus adalah <strong>Garis Ideal</strong>. Titik hijau yang mendempet/mendekati garis tersebut menandakan tebakan yang sangat presisi!
        </div>
      </div>
    </div>
  );
}
