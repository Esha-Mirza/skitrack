
from experiment_tracker import Storage
from experiment_tracker import track_run
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


@track_run
def train_iris_model():
    iris = load_iris()
    X, y = iris.data, iris.target
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=5,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Test Accuracy: {accuracy:.4f}")
    
    return model, X_test, y_test


def test_storage():

    print("\nTESTING STORAGE OPERATIONS\n")
    
    storage = Storage()
    
    count = storage.get_run_count()
    print(f"Initial runs in database: {count}")
    

    print("\nTraining model with tracking...")
    train_iris_model()
    

    new_count = storage.get_run_count()
    print(f"\nRuns after training: {new_count}")
    
  
    print("\nAll runs in database:")
    runs = storage.get_all_runs()
    for i, run in enumerate(runs, 1):
        print(f"  {i}. Run ID: {run['run_id']}")
        print(f"     Model: {run['model_name']}")
        print(f"     Time: {run['timestamp']}")
        print(f"     Shape: {run['dataset_shape']}")
        print(f"     Hash: {run['dataset_hash']}")
        print()
    
    print("Storage test complete!")


if __name__ == "__main__":
    test_storage()