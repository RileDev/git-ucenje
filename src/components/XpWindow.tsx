import React from 'react';
import type { WindowState } from '../types';

interface XpWindowProps {
  win: WindowState;
  isMobile: boolean;
  resizable: boolean;
  zoomScale?: number;
  onZoomIn?: (id: string) => void;
  onZoomOut?: (id: string) => void;
  onZoomReset?: (id: string) => void;
  onFocus: (id: string) => void;
  onClose: (id: string, e: React.MouseEvent) => void;
  onMinimize: (id: string, e: React.MouseEvent) => void;
  onMaximize: (id: string, e: React.MouseEvent) => void;
  onTitleBarMouseDown: (id: string, e: React.MouseEvent) => void;
  onResizeMouseDown: (id: string, e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export const XpWindow: React.FC<XpWindowProps> = ({
  win,
  isMobile,
  resizable,
  zoomScale = 1.0,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onTitleBarMouseDown,
  onResizeMouseDown,
  children,
}) => {
  const isFocused = win.active;
  const style: React.CSSProperties = win.isMaximized
    ? { top: 0, left: 0, width: '100vw', height: 'calc(100vh - 40px)', position: 'absolute' }
    : { top: win.y, left: win.x, width: win.w, height: win.h, position: 'absolute' };

  const zoomPercent = Math.round(zoomScale * 100);

  return (
    <div
      className={`xp-window ${isFocused ? 'active' : ''}`}
      style={style}
      onClick={() => onFocus(win.id)}
    >
      {/* Title bar */}
      <div className="xp-window-titlebar" onMouseDown={(e) => onTitleBarMouseDown(win.id, e)}>
        <div className="xp-window-title" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {win.icon.endsWith('.png') ? (
            <img src={win.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 4 }} />
          ) : (
            <span className="xp-window-title-icon">{win.icon}</span>
          )}
          <span>{win.title}</span>
        </div>

        {/* Titlebar Accessibility Zoom Controls */}
        <div className="xp-window-zoom-controls" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="xp-zoom-btn"
            title="Odzumiraj sadržaj (Ctrl + -)"
            onClick={() => onZoomOut && onZoomOut(win.id)}
          >
            A-
          </button>
          <div
            className="xp-zoom-label"
            title="Klikni za resetovanje na 100% (Ctrl + 0)"
            onClick={() => onZoomReset && onZoomReset(win.id)}
          >
            {zoomPercent}%
          </div>
          <button
            type="button"
            className="xp-zoom-btn"
            title="Uzumiraj sadržaj (Ctrl + +)"
            onClick={() => onZoomIn && onZoomIn(win.id)}
          >
            A+
          </button>
        </div>

        {/* Window Chrome Controls */}
        <div className="xp-window-controls">
          <div className="xp-control-btn xp-btn-minimize" onClick={(e) => onMinimize(win.id, e)} />
          <div className="xp-control-btn xp-btn-maximize" onClick={(e) => onMaximize(win.id, e)} />
          <div className="xp-control-btn xp-btn-close" onClick={(e) => onClose(win.id, e)}>×</div>
        </div>
      </div>

      {/* Window Content Container with Accessibility Zoom */}
      <div
        className="xp-window-content"
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            zoom: zoomScale,
            overflow: 'auto',
          }}
        >
          {children}
        </div>
      </div>

      {/* Status bar */}
      {resizable && !win.isMaximized && !isMobile && (
        <div
          className="xp-window-statusbar"
          style={{
            height: 20,
            backgroundColor: 'var(--xp-window-bg, #ece9d8)',
            borderTop: '1px solid #d4d0c8',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 6,
            paddingRight: 16,
            fontSize: 10.5,
            color: '#444',
            fontFamily: 'Tahoma, Arial, sans-serif',
            userSelect: 'none',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          <span>Sadržaj: {zoomPercent}%</span>
          <div
            style={{
              position: 'absolute',
              right: 2,
              bottom: 2,
              width: 12,
              height: 12,
              cursor: 'se-resize',
              backgroundImage:
                'linear-gradient(135deg, transparent 30%, #555555 30%, #555555 40%, transparent 40%, transparent 50%, #555555 50%, #555555 60%, transparent 60%, transparent 70%, #555555 70%, #555555 80%, transparent 80%)',
              backgroundSize: '4px 4px',
              zIndex: 999,
            }}
            onMouseDown={(e) => onResizeMouseDown(win.id, e)}
          />
        </div>
      )}
    </div>
  );
};
