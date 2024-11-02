import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Server, Database, Activity } from 'lucide-react';

const SystemFlow = () => {
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [systemDetails, setSystemDetails] = useState(null);

  // Mock data
  const systems = {
    step1: [
      { id: 's1', name: 'CRM Frontend', type: 'frontend', health: 'healthy', connections: ['s3', 's4'] },
      { id: 's2', name: 'Sales Portal', type: 'frontend', health: 'warning', connections: ['s3'] }
    ],
    step2: [
      { id: 's3', name: 'API Gateway', type: 'service', health: 'healthy', connections: ['s5', 's6'] },
      { id: 's4', name: 'Queue Service', type: 'service', health: 'error', connections: ['s6'] }
    ],
    step3: [
      { id: 's5', name: 'Auth Service', type: 'service', health: 'healthy', connections: ['s7'] },
      { id: 's6', name: 'Transaction Engine', type: 'service', health: 'healthy', connections: ['s8'] }
    ],
    step4: [
      { id: 's7', name: 'User Database', type: 'database', health: 'healthy', connections: ['s9'] },
      { id: 's8', name: 'Transaction DB', type: 'database', health: 'warning', connections: ['s10'] }
    ],
    step5: [
      { id: 's9', name: 'Analytics Engine', type: 'backend', health: 'healthy', connections: [] },
      { id: 's10', name: 'Reporting Service', type: 'backend', health: 'healthy', connections: [] }
    ]
  };

  // SVG dimensions and layout calculations
  const svgWidth = 1200;
  const svgHeight = 250;
  const stepWidth = svgWidth / 5;
  const nodeHeight = 80;
  const nodeWidth = 160;
  const nodeSpacing = 40;

  // Calculate node positions
  const getNodePosition = (stepIndex, nodeIndex, totalNodesInStep) => {
    const x = stepWidth * stepIndex + (stepWidth - nodeWidth) / 2;
    const totalHeight = totalNodesInStep * nodeHeight + (totalNodesInStep - 1) * nodeSpacing;
    const startY = (svgHeight - totalHeight) / 2;
    const y = startY + nodeIndex * (nodeHeight + nodeSpacing);
    return { x, y };
  };

  // Get connected systems
  const getConnectedSystems = (systemId) => {
    const incoming = Object.values(systems).flat()
      .filter(s => s.connections.includes(systemId))
      .map(s => s.id);
    
    const outgoing = Object.values(systems).flat()
      .find(s => s.id === systemId)?.connections || [];

    return { incoming, outgoing };
  };

  // Generate connection paths
  const generateConnections = () => {
    const connections = [];
    Object.entries(systems).forEach(([step, stepSystems], stepIndex) => {
      stepSystems.forEach(system => {
        const sourcePos = getNodePosition(
          stepIndex,
          stepSystems.indexOf(system),
          stepSystems.length
        );
        
        system.connections.forEach(targetId => {
          const targetStepIndex = Object.entries(systems).findIndex(([_, systems]) =>
            systems.some(s => s.id === targetId)
          );
          const targetStep = Object.values(systems)[targetStepIndex];
          const targetSystem = targetStep.find(s => s.id === targetId);
          const targetPos = getNodePosition(
            targetStepIndex,
            targetStep.indexOf(targetSystem),
            targetStep.length
          );

          connections.push({
            id: `${system.id}-${targetId}`,
            sourceName: system.name,
            targetName: targetSystem.name,
            path: `M ${sourcePos.x + nodeWidth} ${sourcePos.y + nodeHeight/2}
                   C ${sourcePos.x + nodeWidth + 50} ${sourcePos.y + nodeHeight/2},
                     ${targetPos.x - 50} ${targetPos.y + nodeHeight/2},
                     ${targetPos.x} ${targetPos.y + nodeHeight/2}`,
            isHighlighted: selectedSystem === system.id || selectedSystem === targetId
          });
        });
      });
    });
    return connections;
  };

  // Handle system click
  const handleSystemClick = (systemId) => {
    setSelectedSystem(systemId);
    // Simulate API call
    setTimeout(() => {
      setSystemDetails({
        metrics: {
          uptime: '99.99%',
          responseTime: '120ms',
          throughput: '1000 req/s',
          errorRate: '0.01%',
          cpu: '45%',
          memory: '60%',
          activeUsers: '1,234',
          pendingRequests: '23'
        },
        status: {
          lastDeployment: '2 hours ago',
          version: 'v2.3.4',
          environment: 'Production'
        }
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <h1 className="text-2xl font-bold mb-4">System Integration Flow</h1>
        
        <svg width={svgWidth} height={svgHeight} className="w-full h-auto">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626" />
            </marker>
            
            <linearGradient id="dataFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3">
                <animate
                  attributeName="offset"
                  values="-1; 2"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0">
                <animate
                  attributeName="offset"
                  values="-0.5; 2.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>

          {/* Connection Lines */}
          {generateConnections().map((conn, i) => (
            <g key={conn.id} className="transition-opacity duration-300"
               opacity={conn.isHighlighted || !selectedSystem ? 1 : 0.2}>
              <path
                d={conn.path}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              <path
                d={conn.path}
                fill="none"
                stroke="url(#dataFlow)"
                strokeWidth="3"
                strokeDasharray="5,5"
              />
            </g>
          ))}

          {/* System Nodes */}
          {Object.entries(systems).map(([step, stepSystems], stepIndex) => (
            <g key={step}>
              {stepSystems.map((system, systemIndex) => {
                const pos = getNodePosition(stepIndex, systemIndex, stepSystems.length);
                const isSelected = selectedSystem === system.id;
                const isConnected = selectedSystem && (
                  getConnectedSystems(selectedSystem).incoming.includes(system.id) ||
                  getConnectedSystems(selectedSystem).outgoing.includes(system.id)
                );

                return (
                  <g
                    key={system.id}
                    transform={`translate(${pos.x},${pos.y})`}
                    onClick={() => handleSystemClick(system.id)}
                    className="cursor-pointer"
                    opacity={selectedSystem && !isSelected && !isConnected ? 0.5 : 1}
                  >
                    <rect
                      width={nodeWidth}
                      height={nodeHeight}
                      rx="8"
                      fill={isSelected ? '#bfdbfe' : 'white'}
                      stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
                      strokeWidth="2"
                      className="transition-all duration-300"
                    />
                    
                    {/* System Icon */}
                    <svg x="12" y="12" width="24" height="24">
                      {system.type === 'frontend' && <Server className="text-gray-600" />}
                      {system.type === 'service' && <Activity className="text-gray-600" />}
                      {system.type === 'database' && <Database className="text-gray-600" />}
                      {system.type === 'backend' && <Server className="text-gray-600" />}
                    </svg>

                    {/* System Name */}
                    <text x="44" y="28" className="font-medium text-sm">{system.name}</text>

                    {/* Health Status */}
                    <g transform="translate(44, 48)">
                      {system.health === 'healthy' && (
                        <>
                          <circle cx="6" cy="6" r="6" fill="#22c55e" />
                          <text x="18" y="9" className="text-xs">Healthy</text>
                        </>
                      )}
                      {system.health === 'warning' && (
                        <>
                          <circle cx="6" cy="6" r="6" fill="#f59e0b" />
                          <text x="18" y="9" className="text-xs">Warning</text>
                        </>
                      )}
                      {system.health === 'error' && (
                        <>
                          <circle cx="6" cy="6" r="6" fill="#dc2626" />
                          <text x="18" y="9" className="text-xs">Error</text>
                        </>
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Details Panel */}
      {selectedSystem && systemDetails && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">
                {Object.values(systems).flat().find(s => s.id === selectedSystem)?.name}
              </h2>
              <p className="text-gray-600">System Details</p>
            </div>
            <div className="flex gap-4">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                {Object.values(systems).flat().find(s => s.id === selectedSystem)?.type}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
              {Object.entries(systemDetails.metrics).slice(0, 4).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Resource Usage</h3>
              {Object.entries(systemDetails.metrics).slice(4).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Connected Systems</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Incoming From:</h4>
                  {getConnectedSystems(selectedSystem).incoming.map(id => (
                    <div key={id} className="flex items-center gap-2 text-blue-600">
                      → {Object.values(systems).flat().find(s => s.id === id)?.name}
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mt-4">Outgoing To:</h4>
                  {getConnectedSystems(selectedSystem).outgoing.map(id => (
                    <div key={id} className="flex items-center gap-2 text-blue-600">
                      → {Object.values(systems).flat().find(s => s.id === id)?.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-6">
            {Object.entries(systemDetails.status).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                <p className="text-lg font-semibold mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemFlow;