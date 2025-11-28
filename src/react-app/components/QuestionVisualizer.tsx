import { useState, useEffect } from "react";

interface VisualizerProps {
  questionType: string;
  questionData: any;
  userAnswer?: string;
  correctAnswer?: string;
  showSolution?: boolean;
}

export function QuestionVisualizer({ questionType, questionData, userAnswer, correctAnswer, showSolution }: VisualizerProps) {
  if (questionType === 'graph_equation') {
    return <GraphVisualizer data={questionData} userAnswer={userAnswer} correctAnswer={correctAnswer} showSolution={showSolution} />;
  }
  
  if (questionType === 'force_diagram') {
    return <ForceDiagramVisualizer data={questionData} userAnswer={userAnswer} correctAnswer={correctAnswer} showSolution={showSolution} />;
  }
  
  return null;
}

function GraphVisualizer({ data, showSolution }: any) {
  const canvasRef = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef && canvasRef[0]) {
      const canvas = canvasRef[0];
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw axes
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      
      // X-axis
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      
      // Draw grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      
      // Draw function if available
      if (data.equation && showSolution) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let x = -canvas.width / 2; x < canvas.width / 2; x++) {
          const scaledX = x / 40;
          let y = 0;
          
          // Simple linear equation parser: y = mx + b
          if (data.equation && data.equation.includes('x')) {
            // Very basic evaluation - in production, use a proper math parser
            y = scaledX * 2; // Placeholder
          }
          
          const canvasX = canvas.width / 2 + x;
          const canvasY = canvas.height / 2 - (y * 40);
          
          if (x === -canvas.width / 2) {
            ctx.moveTo(canvasX, canvasY);
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        }
        ctx.stroke();
      }
    }
  }, [data, showSolution]);

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-indigo-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Graph Visualization</h3>
      <canvas 
        ref={(el) => canvasRef[1](el)}
        width={400} 
        height={400} 
        className="border border-gray-300 rounded-lg mx-auto"
      />
    </div>
  );
}

function ForceDiagramVisualizer({ data, showSolution }: any) {
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-purple-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Force Diagram</h3>
      <div className="relative w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
        {/* Simple object representation */}
        <div className="w-16 h-16 bg-gray-800 rounded-lg shadow-lg"></div>
        
        {/* Force vectors */}
        {showSolution && data.forces && (
          <>
            {data.forces.map((force: any, index: number) => (
              <ForceVector 
                key={index}
                force={force.magnitude}
                angle={force.angle}
                color={force.color || '#6366f1'}
                label={force.label}
              />
            ))}
          </>
        )}
      </div>
      {showSolution && data.resultant && (
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm font-semibold text-indigo-900">
            Resultant Force: {data.resultant} N
          </p>
        </div>
      )}
    </div>
  );
}

function ForceVector({ force, angle, color, label }: any) {
  const radians = (angle * Math.PI) / 180;
  const length = force * 2; // Scale factor
  const endX = Math.cos(radians) * length;
  const endY = -Math.sin(radians) * length;

  return (
    <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
      <svg width="200" height="200" className="absolute" style={{ left: '-100px', top: '-100px' }}>
        <defs>
          <marker
            id={`arrowhead-${label}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill={color} />
          </marker>
        </defs>
        <line
          x1="100"
          y1="100"
          x2={100 + endX}
          y2={100 + endY}
          stroke={color}
          strokeWidth="3"
          markerEnd={`url(#arrowhead-${label})`}
        />
        <text x={100 + endX + 10} y={100 + endY} fill={color} fontSize="12" fontWeight="bold">
          {label}
        </text>
      </svg>
    </div>
  );
}
