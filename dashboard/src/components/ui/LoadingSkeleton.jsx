
function LoadingSkeleton() {
  return (
    <div className="skeleton-container">
      <div className="skeleton-header">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
      </div>
      <div className="skeleton-stats">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="skeleton skeleton-card"></div>
        ))}
      </div>
      <div className="skeleton-charts">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton skeleton-chart"></div>
        ))}
      </div>
      <div className="skeleton-table">
        <div className="skeleton skeleton-row"></div>
        <div className="skeleton skeleton-row"></div>
        <div className="skeleton skeleton-row"></div>
        <div className="skeleton skeleton-row"></div>
        <div className="skeleton skeleton-row"></div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
