-- =============================================
-- SUBJECT: Mathematics N4 - TEST CONTENT
-- =============================================

-- Subject creation
INSERT INTO subjects (name, code, nated_level, description, color_hex, display_order) 
VALUES ('Mathematics N4', 'MATH-N4', 'N4', 'Advanced mathematical concepts including calculus, algebra, and analytical geometry for engineering applications', '#2563EB', 6);

-- Modules for Mathematics N4
INSERT INTO modules (subject_id, name, description, display_order) 
SELECT id, 'Differential Calculus', 'Limits, derivatives and applications of differentiation', 1 
FROM subjects WHERE code = 'MATH-N4';

INSERT INTO modules (subject_id, name, description, display_order) 
SELECT id, 'Integral Calculus', 'Integration techniques and applications of definite integrals', 2 
FROM subjects WHERE code = 'MATH-N4';

INSERT INTO modules (subject_id, name, description, display_order) 
SELECT id, 'Algebra and Analytical Geometry', 'Complex numbers, matrices and coordinate geometry', 3 
FROM subjects WHERE code = 'MATH-N4';

-- Topics for Differential Calculus
INSERT INTO topics (module_id, name, description, display_order) 
SELECT id, 'Limits and Continuity', 'Evaluating limits and understanding function continuity', 1 
FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (SELECT id FROM subjects WHERE code = 'MATH-N4');

INSERT INTO topics (module_id, name, description, display_order) 
SELECT id, 'Differentiation Rules', 'Power rule, product rule, quotient rule and chain rule', 2 
FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (SELECT id FROM subjects WHERE code = 'MATH-N4');

INSERT INTO topics (module_id, name, description, display_order) 
SELECT id, 'Applications of Derivatives', 'Tangents, normals, rates of change and optimization', 3 
FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (SELECT id FROM subjects WHERE code = 'MATH-N4');

-- Topics for Integral Calculus
INSERT INTO topics (module_id, name, description, display_order) 
SELECT id, 'Integration Techniques', 'Substitution, integration by parts and partial fractions', 1 
FROM modules WHERE name = 'Integral Calculus' AND subject_id IN (SELECT id FROM subjects WHERE code = 'MATH-N4');

INSERT INTO topics (module_id, name, description, display_order) 
SELECT id, 'Definite Integrals', 'Area under curves and applications of definite integrals', 2 
FROM modules WHERE name = 'Integral Calculus' AND subject_id IN (SELECT id FROM subjects WHERE code = 'MATH-N4');

-- Topics for Algebra and Analytical Geometry
INSERT INTO topics (module_id, name, description, display_order) 
SELECT id, 'Complex Numbers', 'Operations with complex numbers and Argand diagrams', 1 
FROM modules WHERE name = 'Algebra and Analytical Geometry' AND subject_id IN (SELECT id FROM subjects WHERE code = 'MATH-N4');

INSERT INTO topics (module_id, name, description, display_order) 
SELECT id, 'Matrices and Determinants', 'Matrix operations and solving systems of equations', 2 
FROM modules WHERE name = 'Algebra and Analytical Geometry' AND subject_id IN (SELECT id FROM subjects WHERE code = 'MATH-N4');

-- Skills for Limits and Continuity
INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Evaluate Limits', 'Calculate limits using algebraic techniques and L''Hôpital''s rule', 2, 85, 1 
FROM topics WHERE name = 'Limits and Continuity' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'MATH-N4'
  )
);

INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Determine Continuity', 'Analyze function continuity at given points', 3, 80, 2 
FROM topics WHERE name = 'Limits and Continuity' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'MATH-N4'
  )
);

-- Skills for Differentiation Rules
INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Apply Power Rule', 'Differentiate polynomial functions using power rule', 1, 90, 1 
FROM topics WHERE name = 'Differentiation Rules' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'MATH-N4'
  )
);

INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Apply Product and Quotient Rules', 'Differentiate products and quotients of functions', 3, 80, 2 
FROM topics WHERE name = 'Differentiation Rules' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'MATH-N4'
  )
);

INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Apply Chain Rule', 'Differentiate composite functions using chain rule', 3, 75, 3 
FROM topics WHERE name = 'Differentiation Rules' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'MATH-N4'
  )
);

-- Questions for Evaluate Limits
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Evaluate the limit: $$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$$',
'{
  "options": [
    "4", 
    "0", 
    "2", 
    "Undefined"
  ],
  "latex": "$$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = \\lim_{x \\to 2} \\frac{(x-2)(x+2)}{x-2} = \\lim_{x \\to 2} (x+2)$$"
}', 
'4',
'Factor and simplify: $$\\frac{x^2-4}{x-2} = \\frac{(x-2)(x+2)}{x-2} = x+2$$, then substitute x=2: 2+2=4',
2, 15
FROM skills WHERE name = 'Evaluate Limits' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Limits and Continuity' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Evaluate the limit: $$\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$$',
'{
  "options": [
    "3", 
    "0", 
    "1", 
    "Undefined"
  ],
  "latex": "Using standard limit: $$\\lim_{x \\to 0} \\frac{\\sin(kx)}{x} = k$$"
}', 
'3',
'Using the standard limit $$\\lim_{x \\to 0} \\frac{\\sin(kx)}{x} = k$$, with k=3 gives the answer 3',
2, 15
FROM skills WHERE name = 'Evaluate Limits' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Limits and Continuity' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

-- Questions for Apply Power Rule
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Find the derivative of $$f(x) = 4x^3 - 2x^2 + 5x - 7$$',
'{
  "options": [
    "$$12x^2 - 4x + 5$$", 
    "$$12x^2 - 4x + 12$$", 
    "$$4x^2 - 2x + 5$$", 
    "$$12x^3 - 4x^2 + 5x$$"
  ],
  "latex": "Apply power rule to each term: $$\\frac{d}{dx}(4x^3) = 12x^2$$, $$\\frac{d}{dx}(-2x^2) = -4x$$, $$\\frac{d}{dx}(5x) = 5$$, $$\\frac{d}{dx}(-7) = 0$$"
}', 
'$$12x^2 - 4x + 5$$',
'Apply power rule term by term: $$\\frac{d}{dx}(4x^3) = 12x^2$$, $$\\frac{d}{dx}(-2x^2) = -4x$$, $$\\frac{d}{dx}(5x) = 5$$, constant derivative is 0',
1, 10
FROM skills WHERE name = 'Apply Power Rule' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Differentiation Rules' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Differentiate $$y = \\frac{1}{x^2}$$',
'{
  "options": [
    "$$-\\frac{2}{x^3}$$", 
    "$$\\frac{2}{x^3}$$", 
    "$$-\\frac{1}{2x}$$", 
    "$$\\frac{1}{2x^3}$$"
  ],
  "latex": "Rewrite as $$y = x^{-2}$$ then apply power rule: $$\\frac{dy}{dx} = -2x^{-3} = -\\frac{2}{x^3}$$"
}', 
'$$-\\frac{2}{x^3}$$',
'Rewrite as $$y = x^{-2}$$, then apply power rule: $$\\frac{dy}{dx} = -2x^{-3} = -\\frac{2}{x^3}$$',
2, 15
FROM skills WHERE name = 'Apply Power Rule' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Differentiation Rules' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

-- Questions for Apply Product and Quotient Rules
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Find the derivative of $$f(x) = (x^2 + 1)(3x - 2)$$ using the product rule',
'{
  "options": [
    "$$9x^2 - 4x + 3$$", 
    "$$6x^2 - 4x + 3$$", 
    "$$3x^2 + 2x - 1$$", 
    "$$9x^2 + 4x - 3$$"
  ],
  "latex": "Product rule: $$f''(x) = (2x)(3x-2) + (x^2+1)(3)$$"
}', 
'$$9x^2 - 4x + 3$$',
'Product rule: $$f''(x) = (2x)(3x-2) + (x^2+1)(3) = 6x^2 - 4x + 3x^2 + 3 = 9x^2 - 4x + 3$$',
3, 20
FROM skills WHERE name = 'Apply Product and Quotient Rules' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Differentiation Rules' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Differentiate $$y = \\frac{x}{x^2 + 1}$$ using the quotient rule',
'{
  "options": [
    "$$\\frac{1 - x^2}{(x^2 + 1)^2}$$", 
    "$$\\frac{1 + x^2}{(x^2 + 1)^2}$$", 
    "$$\\frac{x^2 - 1}{(x^2 + 1)^2}$$", 
    "$$\\frac{2x}{(x^2 + 1)^2}$$"
  ],
  "latex": "Quotient rule: $$\\frac{dy}{dx} = \\frac{(1)(x^2+1) - (x)(2x)}{(x^2+1)^2}$$"
}', 
'$$\\frac{1 - x^2}{(x^2 + 1)^2}$$',
'Quotient rule: $$\\frac{dy}{dx} = \\frac{(1)(x^2+1) - (x)(2x)}{(x^2+1)^2} = \\frac{x^2+1-2x^2}{(x^2+1)^2} = \\frac{1-x^2}{(x^2+1)^2}$$',
3, 20
FROM skills WHERE name = 'Apply Product and Quotient Rules' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Differentiation Rules' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

-- Questions for Apply Chain Rule
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Find the derivative of $$y = (3x^2 + 2x)^4$$',
'{
  "options": [
    "$$4(3x^2 + 2x)^3(6x + 2)$$", 
    "$$4(3x^2 + 2x)^3$$", 
    "$$(3x^2 + 2x)^3(6x + 2)$$", 
    "$$12x(3x^2 + 2x)^3$$"
  ],
  "latex": "Chain rule: $$\\frac{dy}{dx} = 4(3x^2+2x)^3 \\cdot (6x+2)$$"
}', 
'$$4(3x^2 + 2x)^3(6x + 2)$$',
'Chain rule: outer function derivative is $$4(3x^2+2x)^3$$ times inner function derivative $$6x+2$$',
3, 20
FROM skills WHERE name = 'Apply Chain Rule' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Differentiation Rules' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Differentiate $$y = \\sin(2x^3)$$',
'{
  "options": [
    "$$6x^2 \\cos(2x^3)$$", 
    "$$\\cos(2x^3)$$", 
    "$$2x^2 \\cos(2x^3)$$", 
    "$$6x^2 \\sin(2x^3)$$"
  ],
  "latex": "Chain rule: $$\\frac{dy}{dx} = \\cos(2x^3) \\cdot 6x^2$$"
}', 
'$$6x^2 \\cos(2x^3)$$',
'Chain rule: derivative of outer function $$\\cos(2x^3)$$ times derivative of inner function $$6x^2$$',
3, 20
FROM skills WHERE name = 'Apply Chain Rule' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Differentiation Rules' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Differential Calculus' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

-- Skills for Integration Techniques
INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Basic Integration', 'Integrate polynomial functions and basic trigonometric functions', 2, 85, 1 
FROM topics WHERE name = 'Integration Techniques' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Integral Calculus' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'MATH-N4'
  )
);

INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Integration by Substitution', 'Use substitution method to solve integrals', 3, 75, 2 
FROM topics WHERE name = 'Integration Techniques' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Integral Calculus' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'MATH-N4'
  )
);

-- Questions for Basic Integration
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Evaluate $$\\int (3x^2 - 2x + 1) dx$$',
'{
  "options": [
    "$$x^3 - x^2 + x + C$$", 
    "$$3x^3 - 2x^2 + x + C$$", 
    "$$x^3 - 2x^2 + x + C$$", 
    "$$6x - 2 + C$$"
  ],
  "latex": "Integrate term by term: $$\\int 3x^2 dx = x^3$$, $$\\int -2x dx = -x^2$$, $$\\int 1 dx = x$$"
}', 
'$$x^3 - x^2 + x + C$$',
'Integrate term by term: $$\\int 3x^2 dx = x^3$$, $$\\int -2x dx = -x^2$$, $$\\int 1 dx = x$$, plus constant C',
2, 15
FROM skills WHERE name = 'Basic Integration' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Integration Techniques' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Integral Calculus' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Evaluate $$\\int \\cos(x) dx$$',
'{
  "options": [
    "$$\\sin(x) + C$$", 
    "$$-\\sin(x) + C$$", 
    "$$\\cos(x) + C$$", 
    "$$-\\cos(x) + C$$"
  ],
  "latex": "Standard integral: $$\\int \\cos(x) dx = \\sin(x) + C$$"
}', 
'$$\\sin(x) + C$$',
'Standard integral result: $$\\int \\cos(x) dx = \\sin(x) + C$$',
1, 10
FROM skills WHERE name = 'Basic Integration' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Integration Techniques' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Integral Calculus' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

-- Questions for Integration by Substitution
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Evaluate $$\\int 2x \\cdot e^{x^2} dx$$ using substitution',
'{
  "options": [
    "$$e^{x^2} + C$$", 
    "$$2e^{x^2} + C$$", 
    "$$x^2 e^{x^2} + C$$", 
    "$$\\frac{1}{2}e^{x^2} + C$$"
  ],
  "latex": "Let u = x², then du = 2x dx, so $$\\int e^u du = e^u + C = e^{x^2} + C$$"
}', 
'$$e^{x^2} + C$$',
'Let u = x², then du = 2x dx. The integral becomes $$\\int e^u du = e^u + C = e^{x^2} + C$$',
3, 20
FROM skills WHERE name = 'Integration by Substitution' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Integration Techniques' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Integral Calculus' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

-- Skills for Complex Numbers
INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Complex Number Operations', 'Add, subtract, multiply and divide complex numbers', 2, 85, 1 
FROM topics WHERE name = 'Complex Numbers' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Algebra and Analytical Geometry' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'MATH-N4'
  )
);

INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Polar Form Conversion', 'Convert between rectangular and polar forms of complex numbers', 3, 80, 2 
FROM topics WHERE name = 'Complex Numbers' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Algebra and Analytical Geometry' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'MATH-N4'
  )
);

-- Questions for Complex Number Operations
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Simplify: (3 + 2i) + (1 - 4i)',
'{
  "options": [
    "4 - 2i", 
    "2 + 6i", 
    "4 + 6i", 
    "2 - 2i"
  ],
  "diagram": "Add real parts: 3+1=4, Add imaginary parts: 2i-4i=-2i"
}', 
'4 - 2i',
'Add real parts: 3 + 1 = 4, Add imaginary parts: 2i - 4i = -2i',
1, 10
FROM skills WHERE name = 'Complex Number Operations' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Complex Numbers' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Algebra and Analytical Geometry' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Multiply: (2 + i)(3 - 2i)',
'{
  "options": [
    "8 - i", 
    "4 + 7i", 
    "8 + 7i", 
    "4 - i"
  ],
  "latex": "FOIL method: (2)(3) + (2)(-2i) + (i)(3) + (i)(-2i) = 6 - 4i + 3i - 2i²"
}', 
'8 - i',
'FOIL: 6 - 4i + 3i - 2i² = 6 - i - 2(-1) = 6 - i + 2 = 8 - i',
2, 15
FROM skills WHERE name = 'Complex Number Operations' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Complex Numbers' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Algebra and Analytical Geometry' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

-- Questions for Polar Form Conversion
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Convert the complex number 1 + i to polar form',
'{
  "options": [
    "$$\\sqrt{2}(\\cos\\frac{\\pi}{4} + i\\sin\\frac{\\pi}{4})$$", 
    "$$2(\\cos\\frac{\\pi}{4} + i\\sin\\frac{\\pi}{4})$$", 
    "$$\\sqrt{2}(\\cos\\frac{\\pi}{2} + i\\sin\\frac{\\pi}{2})$$", 
    "$$2(\\cos\\frac{\\pi}{2} + i\\sin\\frac{\\pi}{2})$$"
  ],
  "latex": "r = √(1²+1²)=√2, θ = tan⁻¹(1/1)=π/4"
}', 
'$$\\sqrt{2}(\\cos\\frac{\\pi}{4} + i\\sin\\frac{\\pi}{4})$$',
'Magnitude r = √(1²+1²)=√2, Argument θ = tan⁻¹(1/1)=π/4',
3, 20
FROM skills WHERE name = 'Polar Form Conversion' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Complex Numbers' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Algebra and Analytical Geometry' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

-- Skills for Matrices and Determinants
INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Matrix Operations', 'Perform matrix addition, subtraction and multiplication', 2, 85, 1 
FROM topics WHERE name = 'Matrices and Determinants' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Algebra and Analytical Geometry' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'MATH-N4'
  )
);

INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Calculate Determinants', 'Find determinants of 2x2 and 3x3 matrices', 3, 80, 2 
FROM topics WHERE name = 'Matrices and Determinants' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Algebra and Analytical Geometry' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'MATH-N4'
  )
);

-- Questions for Matrix Operations
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Multiply: $$\\begin{bmatrix} 2 & 1 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} 1 & 0 \\\\ 2 & 3 \\end{bmatrix}$$',
'{
  "options": [
    "$$\\begin{bmatrix} 4 & 3 \\\\ 11 & 12 \\end{bmatrix}$$", 
    "$$\\begin{bmatrix} 2 & 0 \\\\ 6 & 12 \\end{bmatrix}$$", 
    "$$\\begin{bmatrix} 3 & 3 \\\\ 10 & 12 \\end{bmatrix}$$", 
    "$$\\begin{bmatrix} 4 & 3 \\\\ 10 & 12 \\end{bmatrix}$$"
  ],
  "latex": "Matrix multiplication: row1: 2×1+1×2=4, 2×0+1×3=3; row2: 3×1+4×2=11, 3×0+4×3=12"
}', 
'$$\\begin{bmatrix} 4 & 3 \\\\ 11 & 12 \\end{bmatrix}$$',
'Row1: 2×1+1×2=4, 2×0+1×3=3; Row2: 3×1+4×2=11, 3×0+4×3=12',
3, 20
FROM skills WHERE name = 'Matrix Operations' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Matrices and Determinants' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Algebra and Analytical Geometry' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);

-- Questions for Calculate Determinants
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Find the determinant of $$\\begin{bmatrix} 3 & 2 \\\\ 1 & 4 \\end{bmatrix}$$',
'{
  "options": [
    "10", 
    "14", 
    "12", 
    "8"
  ],
  "latex": "det = (3)(4) - (2)(1) = 12 - 2 = 10"
}', 
'10',
'For 2x2 matrix, determinant = ad - bc = (3)(4) - (2)(1) = 12 - 2 = 10',
2, 15
FROM skills WHERE name = 'Calculate Determinants' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Matrices and Determinants' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Algebra and Analytical Geometry' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'MATH-N4'
    )
  )
);