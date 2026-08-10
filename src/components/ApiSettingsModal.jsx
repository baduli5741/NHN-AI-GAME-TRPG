import React, { useState, useEffect } from 'react';
import { Settings, X, Key, ShieldCheck, Server } from 'lucide-react';

export default function ApiSettingsModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  proxyUrl,
  setProxyUrl
}) {
  const [localKey, setLocalKey] = useState(apiKey || '');
  const [localProxy, setLocalProxy] = useState(proxyUrl || '');

  // ESC Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setApiKey(localKey.trim());
    setProxyUrl(localProxy.trim());
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="settings-modal-card">
        <div className="modal-header">
          <div className="header-left">
            <Settings size={22} className="text-purple" />
            <h2>Gemini API / Vercel Proxy 설정</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="settings-form">
          <div className="info-box">
            <ShieldCheck size={18} className="text-emerald" />
            <p>
              <strong>보안 안내:</strong> API Key 미입력 시에도 내장된 다이나믹 로컬 AI 서사 가속 엔진으로 100% 오프라인 시뮬레이션 플레이가 가능합니다!
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Key size={16} /> Google Gemini API Key (선택)
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="AIZASy..."
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
            />
            <small className="form-hint">Google AI Studio에서 발급받은 무료 API 키를 입력할 수 있습니다.</small>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Server size={16} /> Vercel Serverless Proxy 엔드포인트 (선택)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="https://my-game.vercel.app/api/chat"
              value={localProxy}
              onChange={(e) => setLocalProxy(e.target.value)}
            />
            <small className="form-hint">Vercel에 배포한 백엔드 프록시 URL이 있다면 지정합니다.</small>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              취소 (ESC)
            </button>
            <button type="submit" className="btn-save">
              설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
