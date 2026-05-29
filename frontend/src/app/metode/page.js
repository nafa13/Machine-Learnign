"use client";

import React, { useState } from 'react';
import UploadDataset from '../../components/UploadDataset';
import ResultSVR from '../../components/ResultSVR';
import ManualInputSVR from '../../components/ManualInputSVR';

export default function MetodePage() {
  const [activeModel, setActiveModel] = useState('SVR');
  const [resultData, setResultData] = useState(null);
  const [inputType, setInputType] = useState('upload');

  const models = [
    { id: 'SVR', name: 'SVR Model', desc: 'Support Vector Regression untuk Prediksi Harga Rumah', active: true, icon: '📈' },
    { id: 'RF', name: 'Random Forest', desc: 'Algoritma Ensemble Decision Trees', active: true, icon: '🌳' },
    { id: 'M3', name: 'Neural Network', desc: 'Deep Learning Multi-layer Perceptron', active: false, icon: '🧠' },
    { id: 'M4', name: 'XGBoost', desc: 'Gradient Boosting untuk Performa Tinggi', active: false, icon: '🚀' },
    { id: 'M5', name: 'K-Means', desc: 'Clustering Unsupervised Learning', active: false, icon: '🎯' },
  ];

  const handleUploadSuccess = (data) => {
    setResultData(data);
  };

  const getPreprocessingSteps = (model) => {
    if (model === 'SVR') {
      return [
        { title: '1. Outlier Removal', desc: 'Menghapus data pencilan (outlier) ekstrim menggunakan metode matematika IQR (Interquartile Range).' },
        { title: '2. Imputasi Data', desc: 'Menggunakan SimpleImputer untuk secara cerdas mengisi kolom/fitur yang kosong dengan nilai median atau modus.' },
        { title: '3. Data Scaling', desc: 'Menggunakan RobustScaler untuk menskalakan fitur numerik agar SVR lebih kebal terhadap gangguan sisa anomali data.' },
        { title: '4. One-Hot Encoding', desc: 'Mengubah data teks / kategorik (seperti Kota, Sertifikat) menjadi representasi vektor biner matriks numerik.' },
        { title: '5. Target Transform', desc: 'Mengubah distribusi asimetris target harga menjadi kurva lonceng normal menggunakan Logaritma (np.log1p).' }
      ];
    } else if (model === 'RF') {
      return [
        { title: '1. Imputasi Data', desc: 'Menggunakan SimpleImputer untuk secara otomatis menangani nilai kosong (Missing Values) pada data input.' },
        { title: '2. One-Hot Encoding', desc: 'Mengubah data kategorik (seperti tipe properti, lokasi) menjadi format biner yang dipahami mesin.' },
        { title: '3. Ensemble Bagging', desc: 'Membangun ratusan "Decision Tree" secara acak dan paralel untuk mencegah model dari Overfitting (menghafal).' },
        { title: '4. Non-Linear Splitting', desc: 'Model secara otomatis mencari pola batas keputusan yang kompleks tanpa memerlukan Data Scaling (RobustScaler).' },
        { title: '5. Average Aggregation', desc: 'Hasil tebakan harga dari setiap pohon dirata-ratakan untuk menghasilkan satu angka prediksi yang sangat akurat.' }
      ];
    }
    return [];
  };

  return (
    <main className="container">
      <header className="header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
        <h1 className="title" style={{ fontSize: '2.5rem' }}>Ruang Operasi Model</h1>
        <p className="subtitle" style={{ margin: 0, textAlign: 'left' }}>
          Pilih model AI Anda, atur konfigurasi, dan jalankan prediksi harga dengan presisi tinggi.
        </p>
      </header>

      <section>
        <h2 className="section-title">1. Pilih Model Prediksi</h2>
        <div className="models-grid">
          {models.map(model => (
            <div 
              key={model.id}
              className={`glass-card model-card ${model.active ? (activeModel === model.id ? 'active' : '') : 'disabled'}`}
              onClick={() => {
                if (model.active) {
                  setActiveModel(model.id);
                  setResultData(null);
                }
              }}
            >
              {!model.active && <span className="badge-soon">Coming Soon</span>}
              {model.active && activeModel === model.id && <span className="badge-active">Selected</span>}
              <div className="model-icon">{model.icon}</div>
              <h3 className="model-title">{model.name}</h3>
              <p className="model-desc">{model.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="glass-card" style={{ marginBottom: '3rem', borderLeft: '4px solid var(--accent-secondary)' }}>
          <h2 className="section-title" style={{ fontSize: '1.4rem' }}>⚙️ Arsitektur Preprocessing & Pipeline</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Model {activeModel} ini tidak hanya sekadar algoritma biasa, melainkan sebuah <strong>Pipeline Machine Learning</strong> yang terintegrasi. Berikut adalah teknik preprocessing yang dijalankan secara otomatis di belakang layar untuk menjamin akurasi model yang tinggi:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {getPreprocessingSteps(activeModel).map((step, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{step.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {['SVR', 'RF'].includes(activeModel) && (
        <section>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button 
              className="btn-primary"
              onClick={() => { setInputType('upload'); setResultData(null); }}
              style={{ flex: 1, opacity: inputType === 'upload' ? 1 : 0.4, transition: '0.3s' }}
            >
              📂 Unggah File (Excel/CSV)
            </button>
            <button 
              className="btn-primary"
              onClick={() => { setInputType('manual'); setResultData(null); }}
              style={{ flex: 1, opacity: inputType === 'manual' ? 1 : 0.4, transition: '0.3s', background: 'var(--accent-secondary)' }}
            >
              ✍️ Input Data Baru (Manual)
            </button>
          </div>

          {inputType === 'upload' ? (
            <div className="glass-card">
              <h2 className="section-title">2. Unggah Dataset ({activeModel})</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Unggah dataset Anda dalam format CSV atau Excel untuk memulai batch prediksi menggunakan {activeModel}.
              </p>
              <UploadDataset onUploadSuccess={handleUploadSuccess} modelType={activeModel.toLowerCase()} />
            </div>
          ) : (
            <ManualInputSVR modelType={activeModel.toLowerCase()} />
          )}
        </section>
      )}

      {resultData && ['SVR', 'RF'].includes(activeModel) && inputType === 'upload' && (
        <ResultSVR resultData={resultData} modelType={activeModel.toLowerCase()} />
      )}
    </main>
  );
}
