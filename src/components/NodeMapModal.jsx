import React, { useEffect } from 'react';
import { MapPin, X, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import nodesData from '../data/nodes.json';

export default function NodeMapModal({
  isOpen,
  onClose,
  currentNodeId,
  completedNodeIds,
  onSelectNode
}) {
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

  const currentNode = nodesData.find(n => n.id === currentNodeId);
  const availableConnections = currentNode?.connections || [];

  return (
    <div className="modal-overlay">
      <div className="map-modal-card">
        <div className="modal-header">
          <div className="header-left">
            <MapPin size={22} className="text-crimson" />
            <h2>어둠의 안개 숲 (Act 1 Node Map)</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p className="map-subtext">
          원하는 지역 노드를 클릭하여 이동하세요. 이동 시 해당 지역의 이벤트나 전투가 시작됩니다. (ESC로 닫기)
        </p>

        {/* Node Grid Map */}
        <div className="nodes-tree">
          {nodesData.map((node) => {
            const isCurrent = node.id === currentNodeId;
            const isCompleted = completedNodeIds.includes(node.id);
            const isSelectable = availableConnections.includes(node.id);

            return (
              <div
                key={node.id}
                className={`node-card ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isSelectable ? 'selectable' : 'locked'}`}
                onClick={() => {
                  if (isSelectable) {
                    onSelectNode(node.id);
                    onClose();
                  }
                }}
              >
                <div className="node-icon-wrapper">
                  {isCompleted ? (
                    <CheckCircle size={24} className="text-emerald" />
                  ) : isCurrent ? (
                    <MapPin size={24} className="text-crimson animate-pulse" />
                  ) : isSelectable ? (
                    <ArrowRight size={24} className="text-gold" />
                  ) : (
                    <Lock size={20} className="text-muted" />
                  )}
                </div>

                <div className="node-info">
                  <span className="node-type-tag">{node.type.toUpperCase()}</span>
                  <h4 className="node-name">{node.name}</h4>
                  <p className="node-desc">{node.description}</p>
                </div>

                {isSelectable && (
                  <button className="btn-visit">이동</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
