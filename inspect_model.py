import os
import joblib

# Load Model
MODEL_PATH = "C:/smt6/MachineLearning/Antigrafity baru/model_svr_harga_rumah.pkl"
try:
    model = joblib.load(MODEL_PATH)
    print("Model type:", type(model))
    
    # Check if it's a pipeline
    if hasattr(model, 'steps'):
        print("\nPipeline Steps:")
        for name, step in model.steps:
            print(f"- {name}: {type(step)}")
            
            # If there's a preprocessor/ColumnTransformer
            if hasattr(step, 'transformers_'):
                print("  Transformers:")
                for t_name, transformer, cols in step.transformers_:
                    print(f"    -> {t_name} on columns: {cols}")
                    
            if hasattr(step, 'feature_names_in_'):
                print(f"  Expected Features In: {step.feature_names_in_}")
                print(f"  Number of Expected Features In: {len(step.feature_names_in_)}")
                
    elif hasattr(model, 'feature_names_in_'):
        print(f"\nExpected Features In: {model.feature_names_in_}")
        print(f"Number of Expected Features In: {len(model.feature_names_in_)}")
        
except Exception as e:
    print(f"Error loading model: {e}")
