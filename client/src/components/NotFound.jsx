import '../styles/NotFound.css';

const NotFound = () => {
  const handleGoHome = () => {
    window.history.back();
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-description">
          The page you're looking for doesn't exists.
        </p>
        <div className="error-actions">
          <button className="btn-primary" onClick={handleGoHome}>
            Home Page
          </button>
        </div>
      </div>
      <div className="error-illustration">
        <div className="floating-elements">
          <div className="element element-1"></div>
          <div className="element element-2"></div>
          <div className="element element-3"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;