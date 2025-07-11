import { useState, useEffect, useRef } from 'react';
import '../styles/NotFound.css';

const ClickGame = ({ onClose }) => {
  const [circles, setCircles] = useState([]);
  const gameAreaRef = useRef(null);

  const handleClick = (e) => {
    if (circles.length >= 2) {
      setCircles([]);
      return;
    }

    // Get the position relative to the game area
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Generate random size between 20 and 100px
    const size = Math.max(20, Math.min(100, Math.floor(Math.random() * 80 + 20)));
    
    // Generate random color
    const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    setCircles(prev => [...prev, { 
      x, 
      y, 
      size, 
      color,
      id: Date.now() + Math.random() // Unique ID for each circle
    }]);
  };

  return (
    <div className="game-overlay">
      <div className="game-container">
        <button className="game-close-btn" onClick={onClose}>
          ✕ Close Game
        </button>
        <div 
          ref={gameAreaRef}
          className="game-area" 
          onClick={handleClick}
        >
          {circles.map((circle) => (
            <div 
              key={circle.id}
              className="circle"
              style={{
                position: 'absolute',
                left: `${circle.x - circle.size/2}px`,
                top: `${circle.y - circle.size/2}px`,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                backgroundColor: circle.color,
                borderRadius: '50%',
                border: '2px solid rgba(0,0,0,0.2)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          ))}
        </div>
        <div className="game-instructions">
          <p>Click anywhere to create circles! (Max 2 at a time)</p>
          <p>Click when 2 circles exist to clear them</p>
        </div>
      </div>
    </div>
  );
};

const NotFound = () => {
  const [showGame, setShowGame] = useState(false);

  const handleGoHome = () => {
    window.history.back();
  };

  const toggleGame = () => {
    setShowGame(prev => !prev);
  };

  return (
    <>
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-description">
            The page you're looking for doesn't exist.
          </p>
          <div className="error-actions">
            <button className="btn-primary" onClick={handleGoHome}>
              Go Back
            </button>
            <button className="btn-secondary" onClick={toggleGame}>
              {showGame ? 'Close Game' : 'Play Game'}
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
      
      {showGame && <ClickGame onClose={toggleGame} />}
      
      <style jsx>{`
        .game-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .game-container {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          max-width: 90vw;
          max-height: 90vh;
          width: 800px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .game-area {
          width: 100%;
          height: 60vh;
          background-color: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          position: relative;
          cursor: pointer;
          overflow: hidden;
        }
        
        .game-close-btn {
          align-self: flex-end;
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        .game-close-btn:hover {
          background: #c82333;
          transform: translateY(-2px);
        }
        
        .game-instructions {
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .btn-primary {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
        }
        
        .btn-primary:hover {
          background: #0069d9;
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          margin-left: 10px;
          transition: background-color 0.3s;
        }
        
        .btn-secondary:hover {
          background: #5a6268;
        }
      `}</style>
    </>
  );
};

export default NotFound;