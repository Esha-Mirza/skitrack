
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score

from experiment_tracker import track_run


# ============================================
# TEST 1: Logistic Regression
# ============================================
@track_run
def test_logistic_regression():
    """Train Logistic Regression on Iris dataset."""
    iris = load_iris()
    X, y = iris.data, iris.target
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Logistic Regression Accuracy: {accuracy:.4f}")
    
    return model, X_test_scaled, y_test


# ============================================
# TEST 2: SVM
# ============================================
@track_run
def test_svm():
    """Train SVM on Iris dataset."""
    iris = load_iris()
    X, y = iris.data, iris.target
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = SVC(kernel='rbf', C=1.0, gamma='scale', random_state=42)
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"SVM Accuracy: {accuracy:.4f}")
    
    return model, X_test_scaled, y_test


# ============================================
# TEST 3: K-Nearest Neighbors
# ============================================
@track_run
def test_knn():
    """Train KNN on Iris dataset."""
    iris = load_iris()
    X, y = iris.data, iris.target
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = KNeighborsClassifier(n_neighbors=5)
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"KNN Accuracy: {accuracy:.4f}")
    
    return model, X_test_scaled, y_test


# ============================================
# TEST 4: Decision Tree
# ============================================
@track_run
def test_decision_tree():
    """Train Decision Tree on Iris dataset."""
    iris = load_iris()
    X, y = iris.data, iris.target
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    model = DecisionTreeClassifier(max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Decision Tree Accuracy: {accuracy:.4f}")
    
    return model, X_test, y_test


# ============================================
# TEST 5: Gradient Boosting
# ============================================
@track_run
def test_gradient_boosting():
    """Train Gradient Boosting on Iris dataset."""
    iris = load_iris()
    X, y = iris.data, iris.target
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Gradient Boosting Accuracy: {accuracy:.4f}")
    
    return model, X_test, y_test


# ============================================
# TEST 6: Random Forest (for comparison)
# ============================================
@track_run
def test_random_forest():
    """Train Random Forest on Iris dataset."""
    iris = load_iris()
    X, y = iris.data, iris.target
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Random Forest Accuracy: {accuracy:.4f}")
    
    return model, X_test, y_test


# ============================================
# RUN ALL EXPERIMENTS
# ============================================
if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING MULTIPLE MODELS ON IRIS DATASET")
    print("=" * 60)
    
    print("\nLogistic Regression...")
    test_logistic_regression()
    
    print("\nSVM...")
    test_svm()
    
    print("\nKNN...")
    test_knn()
    
    print("\nDecision Tree...")
    test_decision_tree()
    
    print("\nGradient Boosting...")
    test_gradient_boosting()
    
    print("\nRandom Forest...")
    test_random_forest()
    
    print("\n" + "=" * 60)
    print("All experiments completed!")
    print("Check your dashboard to see the results!")
    print("=" * 60)