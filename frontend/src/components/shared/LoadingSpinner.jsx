const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-wrapper fade-in">
      <div className="spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
