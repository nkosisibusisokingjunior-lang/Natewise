// components/QuestionRenderer.tsx
import React, { useEffect, useRef } from 'react';
import { MathJaxContext, MathJax } from 'react-mathjax';
import mermaid from 'mermaid';

interface QuestionRendererProps {
  questionText: string;
  questionData: any;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ questionText, questionData }) => {
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (diagramRef.current && questionData?.diagram) {
      // Render Mermaid diagrams
      mermaid.initialize({ 
        startOnLoad: true,
        theme: 'default'
      });
      
      try {
        mermaid.render('diagram', questionData.diagram).then(({ svg }) => {
          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
          }
        });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    }
  }, [questionData]);

  return (
    <MathJaxContext>
      <div className="question-content">
        {/* Render question text with LaTeX */}
        <MathJax dynamic>
          <div>{questionText}</div>
        </MathJax>
        
        {/* Render diagram if present */}
        {questionData?.diagram && (
          <div ref={diagramRef} className="question-diagram mt-4"></div>
        )}
        
        {/* Render options */}
        {questionData?.options && (
          <div className="options mt-4 space-y-2">
            {questionData.options.map((option: string, index: number) => (
              <MathJax key={index} dynamic>
                <div className="option">{option}</div>
              </MathJax>
            ))}
          </div>
        )}
      </div>
    </MathJaxContext>
  );
};

export default QuestionRenderer;