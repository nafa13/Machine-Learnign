"use client";

import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 20px var(--accent-primary))' }}>🔮</span>
      </div>
      
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', margin: '0 0 1rem 0', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
        SELAMAT DATANG DI NEXUS
      </h1>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6', marginBottom: '3rem' }}>
        Platform prediksi analitik berteknologi tinggi yang ditenagai oleh ekosistem Machine Learning tingkat lanjut. Unggah berbagai jenis dataset Anda, pilih arsitektur model AI, dan saksikan algoritma membedah pola kompleks dalam hitungan detik.
      </p>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link href="/metode" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '50px' }}>
            Mulai Analisis Metode <span>🚀</span>
          </button>
        </Link>
        <button 
          className="btn-primary" 
          style={{ padding: '1.25rem 3rem', fontSize: '1.2rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px' }}
          onClick={() => alert("Dokumentasi sistem sedang dalam pengembangan.")}
        >
          Lihat Dokumentasi
        </button>
      </div>
      
      <div style={{ marginTop: '5rem', display: 'flex', gap: '2rem', opacity: 0.7 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>2</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Model AI Aktif</div>
        </div>
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>10ms</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Latency Prediksi</div>
        </div>
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>99%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Uptime Sistem</div>
        </div>
      </div>
    </main>
  );
}
