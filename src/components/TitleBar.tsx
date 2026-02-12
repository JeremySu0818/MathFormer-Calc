interface TitleBarProps { }

function TitleBar(_props: TitleBarProps) {
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.windowMinimize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.windowClose();
    }
  };

  return (
    <div className="title-bar">
      <div className="title-bar-controls">
        <button
          className="title-bar-btn close"
          onClick={handleClose}
          aria-label="Close window"
        />
        <button
          className="title-bar-btn minimize"
          onClick={handleMinimize}
          aria-label="Minimize window"
        />
      </div>

      <div className="title-bar-title"></div>
    </div>
  );
}

export default TitleBar;
