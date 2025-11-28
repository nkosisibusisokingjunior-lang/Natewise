import { useEffect, useState } from "react";

interface Subject {
  id: number;
  name: string;
  code: string;
  nated_level: string;
  description: string;
  modules?: Module[];
}

interface Module {
  id: number;
  subject_id: number;
  name: string;
  description: string;
  topics?: Topic[];
}

interface Topic {
  id: number;
  module_id: number;
  name: string;
  description: string;
  skills?: Skill[];
}

interface Skill {
  id: number;
  topic_id: number;
  name: string;
  description: string;
  questions?: Question[];
}

interface Question {
  id: number;
  skill_id: number;
  question_text: string;
  question_data: string;
  correct_answer: string;
  explanation: string;
  difficulty_rating: number;
  points_value: number;
}

export default function AdminContentManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<number[]>([]);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);
  const [expandedSkills, setExpandedSkills] = useState<number[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [questionOptions, setQuestionOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
  const [difficultyRating, setDifficultyRating] = useState<number>(1);
  const [pointsValue, setPointsValue] = useState<number>(10);
  const [loading, setLoading] = useState(true);

  // Fetch all data with full hierarchy
  const fetchFullHierarchy = async () => {
    try {
      setLoading(true);
      console.log("Fetching full hierarchy...");
      
      // Fetch subjects
      const subjectsResponse = await fetch("/api/subjects");
      const subjectsData = await subjectsResponse.json();
      console.log("Subjects:", subjectsData);

      // For each subject, fetch modules, topics, skills, and questions
      const subjectsWithFullData = await Promise.all(
        subjectsData.map(async (subject: Subject) => {
          try {
            // Fetch modules for this subject
            const modulesResponse = await fetch(`/api/subjects/${subject.id}`);
            const subjectWithModules = await modulesResponse.json();
            
            // If modules exist, fetch topics for each module
            if (subjectWithModules.modules) {
              const modulesWithTopics = await Promise.all(
                subjectWithModules.modules.map(async (module: Module) => {
                  try {
                    // Fetch topics for this module
                    const topicsResponse = await fetch(`/api/modules/${module.id}`);
                    const moduleWithTopics = await topicsResponse.json();
                    
                    // If topics exist, fetch skills for each topic
                    if (moduleWithTopics.topics) {
                      const topicsWithSkills = await Promise.all(
                        moduleWithTopics.topics.map(async (topic: Topic) => {
                          try {
                            // Fetch skills for this topic
                            const skillsResponse = await fetch(`/api/topics/${topic.id}/skills`);
                            const skillsData = await skillsResponse.json();
                            
                            // If skills exist, fetch questions for each skill
                            if (skillsData && skillsData.length > 0) {
                              const skillsWithQuestions = await Promise.all(
                                skillsData.map(async (skill: Skill) => {
                                  try {
                                    // Fetch questions for this skill
                                    const questionsResponse = await fetch(`/api/skills/${skill.id}/questions`);
                                    const questionsData = await questionsResponse.json();
                                    return {
                                      ...skill,
                                      questions: questionsData || []
                                    };
                                  } catch (error) {
                                    console.error(`Error fetching questions for skill ${skill.id}:`, error);
                                    return { ...skill, questions: [] };
                                  }
                                })
                              );
                              return { ...topic, skills: skillsWithQuestions };
                            }
                            return { ...topic, skills: [] };
                          } catch (error) {
                            console.error(`Error fetching skills for topic ${topic.id}:`, error);
                            return { ...topic, skills: [] };
                          }
                        })
                      );
                      return { ...module, topics: topicsWithSkills };
                    }
                    return { ...module, topics: [] };
                  } catch (error) {
                    console.error(`Error fetching topics for module ${module.id}:`, error);
                    return { ...module, topics: [] };
                  }
                })
              );
              return { ...subject, modules: modulesWithTopics };
            }
            return { ...subject, modules: [] };
          } catch (error) {
            console.error(`Error fetching modules for subject ${subject.id}:`, error);
            return { ...subject, modules: [] };
          }
        })
      );

      console.log("Full hierarchy data:", subjectsWithFullData);
      setSubjects(subjectsWithFullData);
    } catch (error) {
      console.error("Failed to fetch full hierarchy:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullHierarchy();
  }, []);

  // Refresh data after any operation
  const refreshData = () => {
    fetchFullHierarchy();
  };

  // Toggle expansion functions
  const toggleSubject = (subjectId: number) => {
    setExpandedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const toggleSkill = (skillId: number) => {
    setExpandedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  // Create functions
  const createSubject = async (data: any) => {
    await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    refreshData();
  };

  const createModule = async (subjectId: number, data: any) => {
    await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, subject_id: subjectId })
    });
    refreshData();
  };

  const createTopic = async (moduleId: number, data: any) => {
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, module_id: moduleId })
    });
    refreshData();
  };

  const createSkill = async (topicId: number, data: any) => {
    await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, topic_id: topicId })
    });
    refreshData();
  };

  const createQuestion = async (skillId: number, data: any) => {
    try {
      console.log("Creating question for skill:", skillId, "with data:", data);
      
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          skill_id: skillId,
          question_text: data.question_text,
          question_data: data.question_data,
          correct_answer: data.correct_answer,
          explanation: data.explanation,
          question_type: "multiple_choice",
          difficulty_rating: data.difficulty_rating,
          points_value: data.points_value
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await response.json();
      refreshData();
    } catch (error) {
      console.error("Failed to create question:", error);
      throw error;
    }
  };

  // Delete functions
  const deleteSubject = async (subjectId: number) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      await fetch(`/api/subjects/${subjectId}`, { method: "DELETE" });
      refreshData();
    }
  };

  const deleteModule = async (moduleId: number) => {
    if (confirm("Are you sure you want to delete this module?")) {
      await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
      refreshData();
    }
  };

  const deleteTopic = async (topicId: number) => {
    if (confirm("Are you sure you want to delete this topic?")) {
      await fetch(`/api/topics/${topicId}`, { method: "DELETE" });
      refreshData();
    }
  };

  const deleteSkill = async (skillId: number) => {
    if (confirm("Are you sure you want to delete this skill?")) {
      await fetch(`/api/skills/${skillId}`, { method: "DELETE" });
      refreshData();
    }
  };

  const deleteQuestion = async (questionId: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
      refreshData();
    }
  };

  // Helper function to safely get string values from FormData
  const getFormStringValue = (formData: FormData, key: string): string => {
    const value = formData.get(key);
    return value ? value.toString() : '';
  };

  // Reset question form when opening modal
  const resetQuestionForm = () => {
    setQuestionOptions(['', '', '', '']);
    setCorrectAnswerIndex(0);
    setDifficultyRating(1);
    setPointsValue(10);
  };

  // Handle option change
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionOptions];
    newOptions[index] = value;
    setQuestionOptions(newOptions);
  };

  // Parse question data safely
  const parseQuestionData = (questionData: string) => {
    try {
      return JSON.parse(questionData);
    } catch {
      return { options: [] };
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">Loading content hierarchy...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Content Manager</h1>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => {
            setEditingItem({ type: "subject", data: null });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Add Subject
        </button>
        <button 
          onClick={refreshData}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Refresh Data
        </button>
      </div>

      <div className="space-y-4">
        {subjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No subjects found. Create your first subject to get started!
          </div>
        ) : (
          subjects.map(subject => (
            <div key={subject.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleSubject(subject.id)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                  >
                    {expandedSubjects.includes(subject.id) ? "▼" : "▶"}
                  </button>
                  <h3 className="font-bold text-lg">{subject.name}</h3>
                  <span className="text-sm text-gray-500">({subject.code})</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingItem({ type: "module", parentId: subject.id, data: null });
                      setShowModal(true);
                    }}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    + Module
                  </button>
                  <button 
                    onClick={() => deleteSubject(subject.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedSubjects.includes(subject.id) && (
                <div className="mt-4 ml-6 space-y-4">
                  {subject.modules && subject.modules.length > 0 ? (
                    subject.modules.map(module => (
                      <div key={module.id} className="border-l-2 border-blue-200 pl-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => toggleModule(module.id)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded"
                            >
                              {expandedModules.includes(module.id) ? "▼" : "▶"}
                            </button>
                            <h4 className="font-semibold text-md">{module.name}</h4>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingItem({ type: "topic", parentId: module.id, data: null });
                                setShowModal(true);
                              }}
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                            >
                              + Topic
                            </button>
                            <button 
                              onClick={() => deleteModule(module.id)}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {expandedModules.includes(module.id) && (
                          <div className="mt-2 ml-4 space-y-2">
                            {module.topics && module.topics.length > 0 ? (
                              module.topics.map(topic => (
                                <div key={topic.id} className="border-l-2 border-green-200 pl-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => toggleTopic(topic.id)}
                                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded"
                                      >
                                        {expandedTopics.includes(topic.id) ? "▼" : "▶"}
                                      </button>
                                      <h5 className="font-medium text-sm">{topic.name}</h5>
                                    </div>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => {
                                          setEditingItem({ type: "skill", parentId: topic.id, data: null });
                                          setShowModal(true);
                                        }}
                                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                      >
                                        + Skill
                                      </button>
                                      <button 
                                        onClick={() => deleteTopic(topic.id)}
                                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>

                                  {expandedTopics.includes(topic.id) && (
                                    <div className="mt-2 ml-4 space-y-2">
                                      {topic.skills && topic.skills.length > 0 ? (
                                        topic.skills.map(skill => (
                                          <div key={skill.id} className="border-l-2 border-purple-200 pl-4">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <button 
                                                  onClick={() => toggleSkill(skill.id)}
                                                  className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded"
                                                >
                                                  {expandedSkills.includes(skill.id) ? "▼" : "▶"}
                                                </button>
                                                <h6 className="text-sm font-medium">{skill.name}</h6>
                                                <span className="text-xs text-gray-500">
                                                  ({skill.questions ? skill.questions.length : 0} questions)
                                                </span>
                                              </div>
                                              <div className="flex gap-2">
                                                <button 
                                                  onClick={() => {
                                                    resetQuestionForm();
                                                    setEditingItem({ type: "question", parentId: skill.id, data: null });
                                                    setShowModal(true);
                                                  }}
                                                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                >
                                                  + Question
                                                </button>
                                                <button 
                                                  onClick={() => deleteSkill(skill.id)}
                                                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                >
                                                  Delete
                                                </button>
                                              </div>
                                            </div>

                                            {expandedSkills.includes(skill.id) && (
                                              <div className="mt-2 ml-4 space-y-2">
                                                {skill.questions && skill.questions.length > 0 ? (
                                                  skill.questions.map(question => {
                                                    const questionData = parseQuestionData(question.question_data);
                                                    
                                                    return (
                                                      <div key={question.id} className="bg-gray-50 p-3 rounded border">
                                                        <div className="flex justify-between items-start mb-2">
                                                          <div className="font-medium text-sm flex-1">
                                                            {question.question_text}
                                                          </div>
                                                          <button 
                                                            onClick={() => deleteQuestion(question.id)}
                                                            className="ml-2 text-red-500 hover:text-red-700 text-xs"
                                                          >
                                                            Delete
                                                          </button>
                                                        </div>
                                                        <div className="text-xs text-gray-600 space-y-1 mb-2">
                                                          <div><strong>Options:</strong></div>
                                                          {questionData.options?.map((option: string, index: number) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                              <span>{String.fromCharCode(65 + index)}.</span>
                                                              <span className={option === question.correct_answer ? "text-green-600 font-medium" : ""}>
                                                                {option}
                                                                {option === question.correct_answer && " ✓"}
                                                              </span>
                                                            </div>
                                                          ))}
                                                        </div>
                                                        <div className="flex gap-4 text-xs text-gray-500">
                                                          <div><strong>Difficulty:</strong> {question.difficulty_rating}/5</div>
                                                          <div><strong>Points:</strong> {question.points_value}</div>
                                                        </div>
                                                        {question.explanation && (
                                                          <div className="text-xs text-gray-500 mt-2">
                                                            <strong>Explanation:</strong> {question.explanation}
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  })
                                                ) : (
                                                  <div className="text-xs text-gray-400 italic">
                                                    No questions yet - click "+ Question" to add some!
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-sm text-gray-400 italic">
                                          No skills yet
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-400 italic">
                                No topics yet
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      No modules yet
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal for creating items */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editingItem?.data ? "Edit" : "Create"} {editingItem?.type}
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);

              try {
                if (editingItem?.type === "subject") {
                  await createSubject({
                    name: getFormStringValue(formData, "name"),
                    code: getFormStringValue(formData, "code"),
                    nated_level: getFormStringValue(formData, "nated_level"),
                    description: getFormStringValue(formData, "description"),
                    color_hex: getFormStringValue(formData, "color_hex")
                  });
                } else if (editingItem?.type === "module") {
                  await createModule(editingItem.parentId, {
                    name: getFormStringValue(formData, "name"),
                    description: getFormStringValue(formData, "description")
                  });
                } else if (editingItem?.type === "topic") {
                  await createTopic(editingItem.parentId, {
                    name: getFormStringValue(formData, "name"),
                    description: getFormStringValue(formData, "description")
                  });
                } else if (editingItem?.type === "skill") {
                  await createSkill(editingItem.parentId, {
                    name: getFormStringValue(formData, "name"),
                    description: getFormStringValue(formData, "description")
                  });
                } else if (editingItem?.type === "question") {
                  // For questions, use the state-based options
                  const filteredOptions = questionOptions.filter(opt => opt.trim() !== "");
                  
                  if (filteredOptions.length < 2) {
                    alert("Please provide at least 2 options");
                    return;
                  }

                  if (correctAnswerIndex >= filteredOptions.length) {
                    alert("Please select a valid correct answer");
                    return;
                  }
                  
                  const correctAnswer = filteredOptions[correctAnswerIndex];
                  
                  await createQuestion(editingItem.parentId, {
                    question_text: getFormStringValue(formData, "question_text"),
                    question_data: { options: filteredOptions },
                    correct_answer: correctAnswer,
                    explanation: getFormStringValue(formData, "explanation"),
                    difficulty_rating: difficultyRating,
                    points_value: pointsValue
                  });
                }
                
                setShowModal(false);
                setEditingItem(null);
              } catch (error) {
                alert("Failed to create item: " + (error instanceof Error ? error.message : 'Unknown error'));
                console.error(error);
              }
            }}>
              {editingItem?.type === "subject" && (
                <>
                  <input name="name" placeholder="Subject Name" className="w-full border p-2 mb-2 rounded" required />
                  <input name="code" placeholder="Code (e.g., MAT-N4)" className="w-full border p-2 mb-2 rounded" required />
                  <input name="nated_level" placeholder="Level (e.g., N4)" className="w-full border p-2 mb-2 rounded" required />
                  <textarea name="description" placeholder="Description" className="w-full border p-2 mb-2 rounded" />
                  <input name="color_hex" placeholder="Color (#3B82F6)" className="w-full border p-2 mb-2 rounded" />
                </>
              )}

              {(editingItem?.type === "module" || editingItem?.type === "topic" || editingItem?.type === "skill") && (
                <>
                  <input name="name" placeholder={`${editingItem.type} Name`} className="w-full border p-2 mb-2 rounded" required />
                  <textarea name="description" placeholder="Description" className="w-full border p-2 mb-2 rounded" />
                </>
              )}

              {editingItem?.type === "question" && (
                <>
                  <textarea 
                    name="question_text" 
                    placeholder="Question Text" 
                    className="w-full border p-2 mb-2 rounded" 
                    required 
                  />
                  
                  <div className="space-y-2 mb-2">
                    <label className="block text-sm font-medium mb-2">Options:</label>
                    {questionOptions.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={correctAnswerIndex === index}
                          onChange={() => setCorrectAnswerIndex(index)}
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 border p-2 rounded"
                          required={index < 2} // First two options are required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Difficulty (1-5)</label>
                      <select 
                        value={difficultyRating}
                        onChange={(e) => setDifficultyRating(Number(e.target.value))}
                        className="w-full border p-2 rounded"
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? '★' : '★'.repeat(num)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Points Value</label>
                      <input
                        type="number"
                        value={pointsValue}
                        onChange={(e) => setPointsValue(Number(e.target.value))}
                        className="w-full border p-2 rounded"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <textarea 
                    name="explanation" 
                    placeholder="Explanation (optional)" 
                    className="w-full border p-2 mb-2 rounded" 
                  />
                </>
              )}

              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}