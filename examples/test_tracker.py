from sklearn.datasets import load_iris, load_wine, load_breast_cancer, load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score

from experiment_tracker import track_run


@track_run
def test_logistic_regression():
    dataset = load_wine()
    X, y = dataset.data, dataset.target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    model = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
    model.fit(X_train, y_train)
    print(f"Logistic Regression Accuracy: {accuracy_score(y_test, model.predict(X_test)):.4f}")
    return model, X_test, y_test


@track_run
def test_svm():
    dataset = load_iris()
    X, y = dataset.data, dataset.target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    model = SVC(kernel="rbf", C=1.0, gamma="scale", random_state=42)
    model.fit(X_train, y_train)
    print(f"SVM Accuracy: {accuracy_score(y_test, model.predict(X_test)):.4f}")
    return model, X_test, y_test


@track_run
def test_knn():
    dataset = load_breast_cancer()
    X, y = dataset.data, dataset.target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    model = KNeighborsClassifier(n_neighbors=5)
    model.fit(X_train, y_train)
    print(f"KNN Accuracy: {accuracy_score(y_test, model.predict(X_test)):.4f}")
    return model, X_test, y_test


@track_run
def test_decision_tree():
    dataset = load_iris()
    X, y = dataset.data, dataset.target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = DecisionTreeClassifier(max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    print(f"Decision Tree Accuracy: {accuracy_score(y_test, model.predict(X_test)):.4f}")
    return model, X_test, y_test


@track_run
def test_gradient_boosting():
    dataset = load_wine()
    X, y = dataset.data, dataset.target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
    model.fit(X_train, y_train)
    print(f"Gradient Boosting Accuracy: {accuracy_score(y_test, model.predict(X_test)):.4f}")
    return model, X_test, y_test


@track_run
def test_random_forest():
    dataset = load_breast_cancer()
    X, y = dataset.data, dataset.target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    print(f"Random Forest Accuracy: {accuracy_score(y_test, model.predict(X_test)):.4f}")
    return model, X_test, y_test


@track_run
def test_logistic_regression2():
    dataset = load_diabetes()
    X, y = dataset.data, dataset.target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    model = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
    model.fit(X_train, y_train)
    print(f"Logistic Regression Accuracy: {accuracy_score(y_test, model.predict(X_test)):.4f}")
    return model, X_test, y_test


@track_run
def test_decision_tree2():
    dataset = load_diabetes()
    X, y = dataset.data, dataset.target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = DecisionTreeClassifier(max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    print(f"Decision Tree Accuracy: {accuracy_score(y_test, model.predict(X_test)):.4f}")
    return model, X_test, y_test


if __name__ == "__main__":
    print("=" * 60)
    test_logistic_regression()
    test_svm()
    test_knn()
    test_decision_tree()
    test_gradient_boosting()
    test_random_forest()
    test_logistic_regression2()
    test_decision_tree2()
    print("\n" + "-" * 60)
    print("All experiments completed!")
    print("Check your dashboard to see the results!")
    print("-" * 60)
