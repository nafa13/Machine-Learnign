"use client";

import React, { useState, useEffect } from 'react';

export default function ManualInputSVR({ modelType }) {
  const [features, setFeatures] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch required features on mount
  useEffect(() => {
    async function fetchFeatures() {
      try {
        const res = await fetch(`http://localhost:8000/api/predict/${modelType}/features`);
        if (!res.ok) throw new Error('Gagal mengambil daftar fitur dari backend');
        const data = await res.json();
        setFeatures(data.features || []);
      } catch (err) {
        console.error(err);
        // Fallback features if backend is unreachable
        setFeatures(['land_size_m2', 'building_size_m2', 'kamar_tidur', 'kamar_mandi']);
      }
    }
    fetchFeatures();
  }, [modelType]);

  const handleInputChange = (e, featureName) => {
    setFormData({
      ...formData,
      [featureName]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    // Convert strings to appropriate types if possible (backend will also handle this)
    const processedData = {};
    for (const key in formData) {
      const val = formData[key];
      processedData[key] = isNaN(Number(val)) || val === '' ? val : Number(val);
    }

    try {
      const res = await fetch(`http://localhost:8000/api/predict/${modelType}/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: processedData })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Terjadi kesalahan saat memprediksi');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(num);
  };

  const formatFeatureName = (feature) => {
    // Kamus terjemahan untuk fitur SVR (tambahkan jika ada nama lain)
    const dictionary = {
      'district': 'Kecamatan / Daerah',
      'city': 'Kota',
      'property_type': 'Tipe Properti (Contoh: Rumah/Apartemen)',
      'bedrooms': 'Jumlah Kamar Tidur',
      'bathrooms': 'Jumlah Kamar Mandi',
      'land_size_m2': 'Luas Tanah (m²)',
      'building_size_m2': 'Luas Bangunan (m²)',
      'carports': 'Kapasitas Carport (Mobil)',
      'certificate': 'Jenis Sertifikat (Contoh: SHM/HGB)',
      'electricity': 'Daya Listrik (VA)',
      'maid_bedrooms': 'Kamar Tidur Pembantu',
      'maid_bathrooms': 'Kamar Mandi Pembantu',
      'floors': 'Jumlah Lantai',
      'property_condition': 'Kondisi Properti (Contoh: Bagus/Baru)',
      'garages': 'Kapasitas Garasi (Mobil)',
      'furnishing': 'Status Perabotan (Furnishing)',
    };
    
    if (dictionary[feature.toLowerCase()]) {
      return dictionary[feature.toLowerCase()];
    }
    
    // Fallback: Ganti underscore dengan spasi dan jadikan kapital di awal kata
    return feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="glass-card">
        <h2 className="section-title">✍️ Form Input Data Manual</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Silakan isi nilai untuk masing-masing fitur di bawah ini. Fitur yang dikosongkan akan diisi secara otomatis menggunakan nilai rata-rata (median/modus) oleh sistem AI.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {features.map((feature) => (
            <div key={feature} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                {formatFeatureName(feature)}
              </label>
              <input
                type="text"
                placeholder={`Masukkan ${formatFeatureName(feature)}`}
                value={formData[feature] || ''}
                onChange={(e) => handleInputChange(e, feature)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>
          ))}

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem', textAlign: 'center' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
            >
              {loading ? 'Memproses...' : '🚀 Prediksi Harga Sekarang'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--error)', borderRadius: '0.5rem', color: '#fca5a5' }}>
            ⚠️ Error: {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '1rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Hasil Prediksi {modelType.toUpperCase()}</h3>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)' }}>
              Rp {formatNumber(result.prediction)}
            </div>
            
            {result.manual_calculation && (
              <div style={{ marginTop: '2rem', textAlign: 'left', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Detail Penjelasan:</h4>
                <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{result.manual_calculation.formula_explanation}</p>
                <div style={{ marginTop: '0.5rem', color: 'gray', fontSize: '0.9rem' }}>
                  *Catatan: Imputasi (pengisian data kosong), Scaling, dan One-Hot Encoding berjalan secara otomatis di latar belakang.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
