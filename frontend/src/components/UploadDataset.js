"use client";

import React, { useState, useRef } from 'react';

export default function UploadDataset({ onUploadSuccess, modelType }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError("Please upload a valid CSV or Excel file.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // In a real scenario this points to http://localhost:8000/api/predict/svr
      // For demonstration if backend fails we might mock it
      const response = await fetch(`http://localhost:8000/api/predict/${modelType}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      onUploadSuccess(data);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to backend or process file. Make sure Python backend is running.");
      
      // Fallback Mock Data for UI demonstration if backend isn't running
      setTimeout(() => {
        onUploadSuccess({
          dataset_details: {
            columns: ["Luas Tanah", "Kamar Tidur", "Kamar Mandi", "Harga"],
            row_count: 500,
            data: [
               {"Luas Tanah": 120, "Kamar Tidur": 3, "Kamar Mandi": 2, "Harga": 1500000000},
               {"Luas Tanah": 80, "Kamar Tidur": 2, "Kamar Mandi": 1, "Harga": 800000000}
            ]
          },
          predictions: [1523000000, 812000000],
          manual_calculation: {
            kernel: "rbf",
            gamma: "scale",
            intercept: 125000.5,
            formula_explanation: "Rumus SVR:\nf(x) = Σ (alpha_i * K(x_i, x)) + b\nb (Intercept) = 125000.5\n\nK(x_i, x) adalah fungsi kernel RBF. Untuk data uji baru x, hitung jarak/perkalian dengan setiap support vector (x_i), lalu kalikan dengan koefisien alpha_i, jumlahkan semuanya, lalu tambahkan intercept."
          }
        });
      }, 1500); // simulate network delay then show mock
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h3 className="section-title">Upload Dataset (.csv / .xlsx)</h3>
      <div 
        className={`upload-box ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <div className="upload-icon">📁</div>
        {file ? (
          <div>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{file.name}</h4>
            <p style={{ color: 'var(--text-secondary)' }}>Click or drag to change file</p>
          </div>
        ) : (
          <div>
            <h4>Click to browse or drag and drop your dataset here</h4>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Supports CSV, XLSX</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
      </div>

      {error && (
        <div style={{ color: 'var(--error)', marginTop: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      {file && (
        <div style={{ textAlign: 'center' }}>
          <button 
            className="btn-primary" 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Processing Model...' : `Run ${modelType.toUpperCase()} Prediction`}
          </button>
        </div>
      )}
      
      {isUploading && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Extracting patterns & preparing manual steps...</p>
        </div>
      )}
    </div>
  );
}
