import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Path
from pydantic import BaseModel
from typing import Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
import io
import numpy as np
import json
from sklearn.metrics import r2_score, mean_absolute_error

app = FastAPI(title="ML Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models if exists
MODEL_SVR_PATH = os.path.join(os.path.dirname(__file__), "..", "model_svr_harga_rumah.pkl")
MODEL_RF_PATH = os.path.join(os.path.dirname(__file__), "..", "random_forest_jordan.pkl")

models = {}
if os.path.exists(MODEL_SVR_PATH):
    try:
        models['SVR'] = joblib.load(MODEL_SVR_PATH)
        print("SVR Model loaded successfully.")
    except Exception as e:
        print(f"Failed to load SVR model: {e}")

if os.path.exists(MODEL_RF_PATH):
    try:
        models['RF'] = joblib.load(MODEL_RF_PATH)
        print("RF Model loaded successfully.")
    except Exception as e:
        print(f"Failed to load RF model: {e}")

@app.get("/")
def read_root():
    return {"message": "Welcome to ML Backend API", "loaded_models": list(models.keys())}

@app.post("/api/predict/{model_type}")
async def predict_batch(
    model_type: str = Path(..., description="Tipe model: 'svr' atau 'rf'"),
    file: UploadFile = File(...)
):
    model_key = model_type.upper()
    if model_key not in models:
        raise HTTPException(status_code=404, detail=f"Model {model_key} is not loaded in backend.")
        
    model = models[model_key]

    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV or Excel file.")
    
    # Read file
    content = await file.read()
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # 1. Subset Dataset to ONLY the features expected by the model
    try:
        expected_features = getattr(model, 'feature_names_in_', None)
        if expected_features is not None:
            missing_cols = [col for col in expected_features if col not in df.columns]
            if missing_cols:
                raise ValueError(f"Dataset yang diunggah tidak memiliki kolom yang dibutuhkan model: {missing_cols}. Model harga rumah ini WAJIB membutuhkan {len(expected_features)} kolom tersebut.")
            
            X = df[list(expected_features)]
        else:
            X = df
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Prepare details using ONLY the subsetted features X
    dataset_details = {
        "columns": X.columns.tolist(),
        "row_count": len(X),
        "data": json.loads(X.head(1000).to_json(orient="records")),
        "describe": json.loads(X.describe().to_json())
    }
    
    # 3. Make Prediction
    try:
        predictions_raw = model.predict(X)
        
        # SVR dilatih menggunakan np.log1p, jadi kita kembalikan menggunakan np.expm1
        # Random Forest tampaknya memprediksi harga asli (Rupiah), jadi jangan di-expm1
        if model_key == 'SVR':
            predictions_rp = np.expm1(predictions_raw)
            predictions_for_eval = predictions_raw
        else:
            predictions_rp = predictions_raw
            predictions_for_eval = predictions_raw

        # Ganti nilai tak terhingga (inf/nan) dengan 0 agar JSON tidak crash (jaga-jaga)
        predictions_rp = np.nan_to_num(predictions_rp, posinf=0.0, neginf=0.0)
        
        prediction_results = predictions_rp.tolist()
        
        # Hitung Evaluasi jika harga asli ada di dataset
        evaluation_metrics = None
        target_col = None
        for col in ['price_in_rp', 'price', 'Price', 'harga', 'Harga', 'Sale_Price', 'Sale_Price_USD', 'Resale_Price', 'Resale_Price_USD', 'Profit_Margin_USD', 'Retail_Price_USD']:
            if col in df.columns:
                target_col = col
                break
                
        if target_col:
            y_true_rp = df[target_col].values
            
            # R2 Score (SVR butuh log, RF pakai raw)
            if model_key == 'SVR':
                r2 = r2_score(np.log1p(y_true_rp), predictions_for_eval)
            else:
                r2 = r2_score(y_true_rp, predictions_for_eval)
            
            # MAE pada harga asli (Rupiah)
            mae = mean_absolute_error(y_true_rp, predictions_rp)
            
            # Siapkan data scatter (ambil max 200 data agar tidak memberatkan browser)
            scatter_data = []
            for i in range(min(len(y_true_rp), 200)):
                scatter_data.append({
                    "actual": float(y_true_rp[i]),
                    "predicted": float(predictions_rp[i])
                })
                
            evaluation_metrics = {
                "r2_score": r2,
                "mae": mae,
                "total_evaluated": len(y_true_rp),
                "scatter_data": scatter_data
            }
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error. {str(e)}")

    # Extract Manual Calculation Steps for specific models
    manual_calculation = None
    estimator = model
    if hasattr(model, 'steps'):
        estimator = model.steps[-1][1]

    if model_key == 'SVR' and hasattr(estimator, 'support_vectors_'):
        kernel = getattr(estimator, 'kernel', 'rbf')
        
        # Safely get length (handles sparse matrices)
        if hasattr(estimator.support_vectors_, 'shape'):
            n_support = estimator.support_vectors_.shape[0]
        else:
            n_support = len(estimator.support_vectors_)
            
        manual_calculation = {
            "kernel": kernel,
            "total_support_vectors": n_support,
            "formula_explanation": (
                f"Rumus SVR dengan kernel {kernel}:\n"
                f"Model menggunakan {n_support} Support Vectors untuk membentuk margin prediksi."
            )
        }
    elif model_key == 'RF' and hasattr(estimator, 'estimators_'):
        n_estimators = len(estimator.estimators_)
        manual_calculation = {
            "total_trees": n_estimators,
            "formula_explanation": (
                f"Model Random Forest terdiri dari {n_estimators} Decision Trees (Pohon Keputusan).\n"
                f"Prediksi akhir didapatkan dari rata-rata (Ensemble/Averaging) hasil tebakan dari {n_estimators} pohon tersebut."
            )
        }

    return {
        "dataset_details": dataset_details,
        "predictions": prediction_results,
        "manual_calculation": manual_calculation,
        "evaluation_metrics": evaluation_metrics
    }

class ManualData(BaseModel):
    features: Dict[str, Any]

@app.get("/api/predict/{model_type}/features")
def get_features(model_type: str = Path(...)):
    model_key = model_type.upper()
    if model_key not in models:
        raise HTTPException(status_code=404, detail=f"Model {model_key} is not loaded.")
    
    model = models[model_key]
    if hasattr(model, 'feature_names_in_'):
        return {"features": list(model.feature_names_in_)}
    raise HTTPException(status_code=400, detail="Model does not expose feature names.")

@app.post("/api/predict/{model_type}/manual")
async def predict_manual(
    data: ManualData,
    model_type: str = Path(...)
):
    model_key = model_type.upper()
    if model_key not in models:
        raise HTTPException(status_code=404, detail=f"Model {model_key} is not loaded in backend.")
    
    model = models[model_key]
        
    try:
        # Konversi JSON dari frontend menjadi DataFrame (1 baris)
        df_new = pd.DataFrame([data.features])
        
        # Validasi kolom
        expected_features = getattr(model, 'feature_names_in_', None)
        if expected_features is not None:
            missing_cols = [col for col in expected_features if col not in df_new.columns]
            if missing_cols:
                # Jika ada yang kosong/tidak diisi, kita isi dengan None agar Pipeline yg urus (SimpleImputer)
                for col in missing_cols:
                    df_new[col] = None
        
        # Prediksi
        predictions_raw = model.predict(df_new)
        
        if model_key == 'SVR':
            predictions_rp = np.expm1(predictions_raw)
        else:
            predictions_rp = predictions_raw
            
        predictions_rp = np.nan_to_num(predictions_rp, posinf=0.0, neginf=0.0)
        
        # Ekstrak manual calculation (Sederhana)
        manual_calculation = {
            "formula_explanation": (
                f"Fungsi prediksi ({model_key}) memproses 1 baris data baru Anda.\n"
                f"Nilai prediksi: Rp {predictions_rp[0]:,.0f}."
            )
        }
            
        return {
            "prediction": predictions_rp[0],
            "manual_calculation": manual_calculation
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Manual Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
