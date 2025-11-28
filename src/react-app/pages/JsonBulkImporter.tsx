import { useState } from "react";

interface JsonContent {
  subjects: Array<{
    name: string;
    code: string;
    nated_level: string;
    description: string;
    color_hex: string;
    modules: Array<{
      name: string;
      description: string;
      topics: Array<{
        name: string;
        description: string;
        skills: Array<{
          name: string;
          description: string;
          difficulty_level?: number;
          mastery_threshold?: number;
          questions: Array<{
            question_text: string;
            question_data: {
              options: string[];
              diagram?: string;
            };
            correct_answer: string;
            explanation: string;
            difficulty_rating?: number;
            points_value?: number;
          }>;
        }>;
      }>;
    }>;
  }>;
}

export default function JsonBulkImporter() {
  const [jsonContent, setJsonContent] = useState<string>("");
  const [parsedData, setParsedData] = useState<JsonContent | null>(null);
  const [importProgress, setImportProgress] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const addProgress = (message: string) => {
    setImportProgress(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const validateJson = (): boolean => {
    try {
      if (!jsonContent.trim()) {
        addProgress("❌ No JSON content provided");
        return false;
      }

      const data = JSON.parse(jsonContent) as JsonContent;
      
      if (!data.subjects || !Array.isArray(data.subjects)) {
        addProgress("❌ Invalid JSON structure: Missing 'subjects' array");
        return false;
      }

      // Validate structure
      for (const subject of data.subjects) {
        if (!subject.name || !subject.code) {
          addProgress(`❌ Invalid subject: Missing name or code`);
          return false;
        }

        for (const module of subject.modules || []) {
          if (!module.name) {
            addProgress(`❌ Invalid module in ${subject.name}: Missing name`);
            return false;
          }

          for (const topic of module.topics || []) {
            if (!topic.name) {
              addProgress(`❌ Invalid topic in ${module.name}: Missing name`);
              return false;
            }

            for (const skill of topic.skills || []) {
              if (!skill.name) {
                addProgress(`❌ Invalid skill in ${topic.name}: Missing name`);
                return false;
              }

              for (const question of skill.questions || []) {
                if (!question.question_text || !question.correct_answer) {
                  addProgress(`❌ Invalid question in ${skill.name}: Missing text or correct answer`);
                  return false;
                }
                if (!question.question_data?.options || question.question_data.options.length < 2) {
                  addProgress(`❌ Invalid question in ${skill.name}: Need at least 2 options`);
                  return false;
                }
              }
            }
          }
        }
      }

      setParsedData(data);
      addProgress(`✅ Validated: ${data.subjects.length} subjects, ${data.subjects.flatMap(s => s.modules).length} modules`);
      return true;
    } catch (error) {
      addProgress(`❌ JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const createSubject = async (subjectData: any): Promise<number> => {
    const response = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subjectData)
    });
    
    if (!response.ok) throw new Error(`Failed to create subject: ${response.statusText}`);
    
    const result = await response.json();
    return result.id;
  };

  const createModule = async (subjectId: number, moduleData: any): Promise<number> => {
    const response = await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...moduleData, subject_id: subjectId })
    });
    
    if (!response.ok) throw new Error(`Failed to create module: ${response.statusText}`);
    
    const result = await response.json();
    return result.id;
  };

  const createTopic = async (moduleId: number, topicData: any): Promise<number> => {
    const response = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...topicData, module_id: moduleId })
    });
    
    if (!response.ok) throw new Error(`Failed to create topic: ${response.statusText}`);
    
    const result = await response.json();
    return result.id;
  };

  const createSkill = async (topicId: number, skillData: any): Promise<number> => {
    const response = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...skillData, 
        topic_id: topicId,
        difficulty_level: skillData.difficulty_level || 1,
        mastery_threshold: skillData.mastery_threshold || 80
      })
    });
    
    if (!response.ok) throw new Error(`Failed to create skill: ${response.statusText}`);
    
    const result = await response.json();
    return result.id;
  };

  const createQuestion = async (skillId: number, questionData: any): Promise<number> => {
    const response = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skill_id: skillId,
        question_text: questionData.question_text,
        question_data: questionData.question_data,
        correct_answer: questionData.correct_answer,
        explanation: questionData.explanation || "",
        question_type: "multiple_choice",
        difficulty_rating: questionData.difficulty_rating || 1,
        points_value: questionData.points_value || 10
      })
    });
    
    if (!response.ok) throw new Error(`Failed to create question: ${response.statusText}`);
    
    const result = await response.json();
    return result.id;
  };

  const importContent = async () => {
    if (!parsedData || !validateJson()) return;

    setIsImporting(true);
    setImportProgress([]);
    
    try {
      addProgress("🚀 Starting bulk import...");

      let totalSubjects = 0;
      let totalModules = 0;
      let totalTopics = 0;
      let totalSkills = 0;
      let totalQuestions = 0;

      for (const subject of parsedData.subjects) {
        addProgress(`📚 Creating subject: ${subject.name}`);
        
        const subjectId = await createSubject(subject);
        totalSubjects++;
        addProgress(`  ✅ Created subject: ${subject.name} (ID: ${subjectId})`);

        for (const module of subject.modules || []) {
          addProgress(`  📖 Creating module: ${module.name}`);
          
          const moduleId = await createModule(subjectId, module);
          totalModules++;
          addProgress(`    ✅ Created module: ${module.name} (ID: ${moduleId})`);

          for (const topic of module.topics || []) {
            addProgress(`    📝 Creating topic: ${topic.name}`);
            
            const topicId = await createTopic(moduleId, topic);
            totalTopics++;
            addProgress(`      ✅ Created topic: ${topic.name} (ID: ${topicId})`);

            for (const skill of topic.skills || []) {
              addProgress(`      🎯 Creating skill: ${skill.name}`);
              
              const skillId = await createSkill(topicId, skill);
              totalSkills++;
              addProgress(`        ✅ Created skill: ${skill.name} (ID: ${skillId})`);

              for (const question of skill.questions || []) {
                addProgress(`        ❓ Creating question for: ${skill.name}`);
                
                await createQuestion(skillId, question);
                totalQuestions++;
              }
              addProgress(`        ✅ Created ${skill.questions?.length || 0} questions for ${skill.name}`);
            }
          }
        }
      }

      addProgress("🎉 Bulk import completed successfully!");
      addProgress(`📊 Summary: ${totalSubjects} subjects, ${totalModules} modules, ${totalTopics} topics, ${totalSkills} skills, ${totalQuestions} questions`);
      
      // Clear form after successful import
      setJsonContent("");
      setParsedData(null);

    } catch (error) {
      addProgress(`❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const loadSampleJson = () => {
    const sample = {
      subjects: [
        {
          name: "Engineering Science N3",
          code: "ENG-SCI-N3",
          nated_level: "N3",
          description: "Comprehensive engineering science principles",
          color_hex: "#EF4444",
          modules: [
            {
              name: "Statics and Dynamics",
              description: "Analysis of forces and motion",
              topics: [
                {
                  name: "Force Systems",
                  description: "Analysis of force systems",
                  skills: [
                    {
                      name: "Resolve Forces",
                      description: "Break down forces into components",
                      difficulty_level: 2,
                      mastery_threshold: 85,
                      questions: [
                        {
                          question_text: "A force of 100 N acts at 30° to the horizontal. What is the horizontal component?",
                          question_data: {
                            options: ["86.6 N", "50.0 N", "100 N", "70.7 N"],
                            diagram: "Force diagram showing components"
                          },
                          correct_answer: "86.6 N",
                          explanation: "Horizontal component = F × cos(30°) = 100 × 0.866 = 86.6 N",
                          difficulty_rating: 2,
                          points_value: 15
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    setJsonContent(JSON.stringify(sample, null, 2));
    addProgress("📝 Sample JSON loaded. Click 'Validate JSON' to check structure.");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">JSON Bulk Content Importer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - JSON Input */}
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button 
              onClick={loadSampleJson}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isImporting}
            >
              Load Sample JSON
            </button>
            <button 
              onClick={validateJson}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={isImporting}
            >
              Validate JSON
            </button>
            <button 
              onClick={importContent}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
              disabled={isImporting || !parsedData}
            >
              {isImporting ? "Importing..." : "Start Import"}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              JSON Content (Subject → Module → Topic → Skill → Question hierarchy)
            </label>
            <textarea
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              placeholder={`Paste your JSON content here...\n\nFormat:\n{\n  "subjects": [\n    {\n      "name": "Subject Name",\n      "code": "SUB-CODE",\n      "modules": [\n        {\n          "name": "Module Name",\n          "topics": [\n            {\n              "name": "Topic Name", \n              "skills": [\n                {\n                  "name": "Skill Name",\n                  "questions": [\n                    {\n                      "question_text": "Question?",\n                      "question_data": {\n                        "options": ["A", "B", "C", "D"]\n                      },\n                      "correct_answer": "A"\n                    }\n                  ]\n                }\n              ]\n            }\n          ]\n        }\n      ]\n    }\n  ]\n}`}
              className="w-full h-96 font-mono text-sm p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isImporting}
            />
          </div>
        </div>

        {/* Right side - Progress Log */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Import Progress</h3>
          <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto">
            {importProgress.length === 0 ? (
              <div className="text-gray-400">
                Import progress will appear here...
                <br />
                <br />
                <strong>Expected JSON Structure:</strong>
                <br />
                • subjects[] → modules[] → topics[] → skills[] → questions[]
                <br />
                • Each question needs: question_text, question_data.options[], correct_answer
                <br />
                • Use Load Sample JSON to see a working example
              </div>
            ) : (
              importProgress.map((message, index) => (
                <div key={index} className="mb-1">
                  {message}
                </div>
              ))
            )}
          </div>

          {parsedData && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ JSON Validated Successfully!</h4>
              <div className="text-sm text-green-700">
                <div>Subjects: {parsedData.subjects.length}</div>
                <div>Total Modules: {parsedData.subjects.flatMap(s => s.modules).length}</div>
                <div>Total Topics: {parsedData.subjects.flatMap(s => s.modules.flatMap(m => m.topics)).length}</div>
                <div>Total Skills: {parsedData.subjects.flatMap(s => s.modules.flatMap(m => m.topics.flatMap(t => t.skills))).length}</div>
                <div>Total Questions: {parsedData.subjects.flatMap(s => s.modules.flatMap(m => m.topics.flatMap(t => t.skills.flatMap(sk => sk.questions)))).length}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}