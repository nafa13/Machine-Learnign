import pickle
import sys

def inspect_model(pkl_path):
    with open(pkl_path, 'rb') as f:
        model = pickle.load(f)
        
    print(f"Model Type: {type(model)}")
    if hasattr(model, 'steps'):
        print(f"Pipeline steps: {model.steps}")
        
    if hasattr(model, 'feature_names_in_'):
        features = list(model.feature_names_in_)
        print(f"\nFeature Names In ({len(features)}):")
        print(features)
    elif hasattr(model, 'estimators_'):
        print("\nRandom Forest detected. Checking first estimator...")
        first = model.estimators_[0]
        if hasattr(first, 'feature_names_in_'):
            print(list(first.feature_names_in_))
        else:
            print("No feature_names_in_ found in estimator.")
    else:
        print("\nCould not find feature names.")

if __name__ == '__main__':
    inspect_model('random_forest_jordan.pkl')
