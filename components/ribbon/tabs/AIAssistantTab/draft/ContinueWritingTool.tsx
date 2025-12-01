
import React, { useState, useMemo } from 'react';
import { PenTool, Sparkles, FileText, Feather, Activity, BookOpen, ScrollText, Mail, FileBarChart, Video, LayoutTemplate, Search, ChevronRight, ChevronDown } from 'lucide-react';
import { DropdownRibbonButton } from '../common/AITools';
import { useAIAssistantTab } from '../AIAssistantTabContext';
import { useAI } from '../../../../../hooks/useAI';
import { MenuPortal } from '../../../common/MenuPortal';

// --- Predictive Data ---
const PREDICTIVE_CATEGORIES = {
  "Research & Academic": [
    { l: "Research Paper", f: "Method → Results" },
    { l: "Scientific Article", f: "Abstract → Findings" },
    { l: "Academic Essay", f: "Thesis → Evidence" },
    { l: "Case Study", f: "Background → Analysis" },
    { l: "Literature Review", f: "Themes → Gaps" },
    { l: "Meta-analysis", f: "Studies → Aggregated Results" },
    { l: "Research Proposal", f: "Problem Statement → Methodology" },
    { l: "Dissertation", f: "Introduction → Literature Review" },
    { l: "Thesis", f: "Hypothesis → Testing" },
    { l: "Lab Report", f: "Procedure → Observations" },
    { l: "Field Study", f: "Setup → Observations" },
    { l: "Experiment Report", f: "Variables → Outcomes" },
    { l: "Data Analysis Report", f: "Dataset → Interpretation" },
    { l: "Statistical Report", f: "Metrics → Conclusion" },
    { l: "Ethnographic Study", f: "Context → Behavior Patterns" },
    { l: "Survey Report", f: "Responses → Insights" },
    { l: "Interview Analysis", f: "Transcripts → Themes" },
    { l: "Scientific Review", f: "Topic → Evidence Summary" },
    { l: "White Paper", f: "Problem → Solutions" },
    { l: "Scholarly Commentary", f: "Claim → Supporting Arguments" },
    { l: "Annotated Bibliography", f: "Source Citation → Summary" },
    { l: "Academic Abstract", f: "Topic → Key Findings" },
    { l: "Technical Review", f: "Technology → Evaluation" },
    { l: "Conceptual Framework", f: "Concepts → Relationships" },
    { l: "Hypothesis Document", f: "Prediction → Rationale" },
    { l: "Policy Research", f: "Issue → Recommendations" },
    { l: "Comparative Study", f: "Subjects → Comparison" },
    { l: "STEM Report", f: "Concept → Application" },
    { l: "Analytical Essay", f: "Claim → Breakdown" },
    { l: "Reflective Essay", f: "Experience → Reflection" },
    { l: "Position Paper", f: "Stance → Argument" },
    { l: "Critical Analysis", f: "Work → Critique" },
    { l: "Theory Paper", f: "Concept → Applications" },
    { l: "Philosophical Essay", f: "Question → Reasoning" },
    { l: "Debate Brief", f: "Claim → Evidence" },
    { l: "Study Notes", f: "Topic → Summary" },
    { l: "Flashcard Set", f: "Term → Definition" },
    { l: "Scholarly Outline", f: "Topic → Subsections" },
    { l: "Research Timeline", f: "Milestones → Expected Results" },
    { l: "Peer Review Document", f: "Paper Summary → Evaluation" }
  ],
  "Technical & Engineering": [
    { l: "Technical Specification", f: "Requirements → Constraints" },
    { l: "System Design Doc", f: "Architecture → Flow Diagrams" },
    { l: "API Documentation", f: "Endpoint → Example Requests" },
    { l: "SDK Guide", f: "Feature → Implementation Steps" },
    { l: "Developer Guide", f: "Setup → Usage" },
    { l: "Code Review Summary", f: "Change → Recommendation" },
    { l: "Software Proposal", f: "Overview → Technical Plan" },
    { l: "QA Test Plan", f: "Scenario → Expected Outcome" },
    { l: "Test Case", f: "Steps → Expected Result" },
    { l: "Bug Report", f: "Steps → Expected Behavior" },
    { l: "Change Log", f: "Version → Updates" },
    { l: "Release Notes", f: "Update → Fixes" },
    { l: "Technical Roadmap", f: "Phase → Deliverables" },
    { l: "Cybersecurity Report", f: "Threat → Recommendation" },
    { l: "System Audit", f: "Component → Status" },
    { l: "Network Plan", f: "Topology → Configurations" },
    { l: "Database Schema Doc", f: "Table → Fields" },
    { l: "Algorithm Explanation", f: "Problem → Approach" },
    { l: "Engineering Blueprint Summary", f: "Component → Purpose" },
    { l: "Firmware Manual", f: "Module → Commands" },
    { l: "Hardware Spec", f: "Component → Power Requirements" },
    { l: "Product Requirement Document", f: "Feature → Acceptance Criteria" },
    { l: "UI/UX Spec", f: "Page → Behaviors" },
    { l: "Interaction Flow", f: "Step → Next Step" },
    { l: "Game Design Doc", f: "Mechanic → Gameplay Loop" },
    { l: "Game Level Design", f: "Environment → Objectives" },
    { l: "Software Onboarding", f: "Step → Expected Output" },
    { l: "DevOps Runbook", f: "Incident → Resolution" },
    { l: "CI/CD Guide", f: "Pipeline Step → Tools" },
    { l: "Architecture Decision Record", f: "Context → Decision" },
    { l: "Patch Notes", f: "Issue → Fix" },
    { l: "Error Guide", f: "Code → Explanation" },
    { l: "Debugging Log", f: "Problem → Fix Attempt" },
    { l: "Machine Learning Report", f: "Model → Evaluation" },
    { l: "Dataset Card", f: "Field → Description" },
    { l: "Feature Engineering Doc", f: "Raw Feature → Transformation" },
    { l: "AI Model Card", f: "Architecture → Limitations" },
    { l: "Robotics Report", f: "Component → Function" },
    { l: "IoT Plan", f: "Device → Communication Method" },
    { l: "Cloud Architecture Doc", f: "Service → Configuration" },
    { l: "Virtualization Guide", f: "Machine → Settings" },
    { l: "Containerization Guide", f: "Image → Deployment Steps" },
    { l: "SRE Playbook", f: "Alert → Actions" },
    { l: "Performance Test Report", f: "Metric → Result" },
    { l: "Workflow Diagram", f: "Node → Next Node" },
    { l: "Technical FAQ", f: "Question → Answer" },
    { l: "Build Guide", f: "Step → Tools" },
    { l: "API Changelog", f: "Version → Differences" },
    { l: "Microservice Spec", f: "Service → Endpoints" },
    { l: "Code Migration Plan", f: "Old System → New System" }
  ],
  "Business & Management": [
    { l: "Business Plan", f: "Executive Summary → Strategy" },
    { l: "Startup Pitch", f: "Problem → Value Proposition" },
    { l: "Product Pitch", f: "Feature → Benefit" },
    { l: "Company Profile", f: "Overview → Services" },
    { l: "SWOT Analysis", f: "Strengths → Weaknesses" },
    { l: "Competitive Analysis", f: "Competitor → Insights" },
    { l: "Market Research", f: "Trend → Forecast" },
    { l: "Feasibility Study", f: "Assessment → Conclusion" },
    { l: "Business Report", f: "Summary → Insights" },
    { l: "Annual Report", f: "Highlights → Performance" },
    { l: "Quarterly Report", f: "Metrics → Analysis" },
    { l: "Financial Statement", f: "Accounts → Totals" },
    { l: "Budget Plan", f: "Category → Allocations" },
    { l: "Profit & Loss Sheet", f: "Revenue → Expense" },
    { l: "Risk Assessment", f: "Hazard → Mitigation" },
    { l: "Compliance Report", f: "Requirement → Status" },
    { l: "Audit Report", f: "Findings → Recommendations" },
    { l: "Strategic Plan", f: "Goal → To-Do Steps" },
    { l: "Operations Manual", f: "Task → Steps" },
    { l: "Standard Operating Procedure", f: "Step → Compliance Notes" },
    { l: "Meeting Agenda", f: "Topic → Time Block" },
    { l: "Meeting Minutes", f: "Discussion → Action Item" },
    { l: "Organizational Chart", f: "Role → Sub-Role" },
    { l: "Employee Handbook", f: "Policy → Rules" },
    { l: "Performance Review", f: "Strength → Improvement" },
    { l: "Hiring Plan", f: "Role → Requirements" },
    { l: "Interview Evaluation", f: "Candidate → Score" },
    { l: "Training Plan", f: "Module → Exercises" },
    { l: "Onboarding Checklist", f: "Step → Requirements" },
    { l: "Sales Report", f: "Product → Metrics" },
    { l: "Sales Pitch", f: "Feature → Benefit" },
    { l: "Marketing Plan", f: "Campaign → Channels" },
    { l: "Campaign Proposal", f: "Objective → Strategy" },
    { l: "Customer Journey Map", f: "Stage → Touchpoint" },
    { l: "CRM Notes", f: "Client → Next Action" },
    { l: "Business Case", f: "Problem → ROI" },
    { l: "Contract", f: "Term → Obligation" },
    { l: "Agreement", f: "Parties → Responsibilities" },
    { l: "Memorandum", f: "Issue → Statement" },
    { l: "Non-disclosure Agreement", f: "Clause → Conditions" },
    { l: "Invoice", f: "Item → Total" },
    { l: "Quotation", f: "Requirement → Estimate" },
    { l: "Purchase Order", f: "Item → Quantity" },
    { l: "Supplier Report", f: "Vendor → Evaluation" },
    { l: "Inventory Report", f: "Item → Stock Level" },
    { l: "Logistics Plan", f: "Route → Schedule" },
    { l: "Shipment Report", f: "Package → Status" },
    { l: "Customer Support Summary", f: "Issue → Resolution" },
    { l: "Call Log", f: "Caller → Summary" },
    { l: "Ticket Report", f: "Issue → Fix" },
    { l: "Partnership Proposal", f: "Synergy → Benefits" },
    { l: "Event Plan", f: "Agenda → Requirements" },
    { l: "Brand Guide", f: "Element → Rules" },
    { l: "Product Requirement", f: "Feature → Behavior" },
    { l: "Value Proposition Canvas", f: "Customer → Benefit" },
    { l: "User Persona", f: "Profile → Needs" },
    { l: "OKR Document", f: "Objective → Key Result" },
    { l: "KPI Report", f: "Metric → Performance" },
    { l: "Risk Log", f: "Issue → Severity" },
    { l: "Governance Document", f: "Rule → Procedure" }
  ],
  "Creative & Media": [
    { l: "Novel Outline", f: "Chapter → Plot Points" },
    { l: "Story Scene", f: "Setup → Conflict" },
    { l: "Character Profile", f: "Trait → Backstory" },
    { l: "World-building Doc", f: "Region → Culture" },
    { l: "Magic System Doc", f: "Rule → Limit" },
    { l: "Creature Design", f: "Species → Abilities" },
    { l: "Mythology Doc", f: "Origin → Legends" },
    { l: "Short Story", f: "Beginning → Rising Action" },
    { l: "Flash Fiction", f: "Prompt → Twist" },
    { l: "Script", f: "Scene → Dialogue" },
    { l: "Screenplay", f: "Heading → Action" },
    { l: "TV Episode Outline", f: "Act → Beats" },
    { l: "Movie Treatment", f: "Character → Arc" },
    { l: "Comic Script", f: "Panel → Dialogue" },
    { l: "Manga Script", f: "Page → Frame" },
    { l: "Animation Script", f: "Scene → Voice Lines" },
    { l: "Video Script", f: "Segment → Narration" },
    { l: "Documentary Script", f: "Topic → Evidence" },
    { l: "Podcast Script", f: "Section → Conversation" },
    { l: "Audio Drama", f: "Scene → Sound Cues" },
    { l: "Interview Script", f: "Question → Follow-up" },
    { l: "Journalism Article", f: "Lead → Body" },
    { l: "News Story", f: "What → Why" },
    { l: "Opinion Column", f: "Claim → Arguments" },
    { l: "Review", f: "Summary → Critique" },
    { l: "Travel Blog", f: "Location → Experience" },
    { l: "Lifestyle Blog", f: "Topic → Tips" },
    { l: "How-To Article", f: "Step → Example" },
    { l: "Top-10 List", f: "Item → Explanation" },
    { l: "Personal Diary", f: "Day → Thoughts" },
    { l: "Memoir", f: "Memory → Lesson" },
    { l: "Poem", f: "Theme → Imagery" },
    { l: "Lyric Sheet", f: "Verse → Chorus" },
    { l: "Riddle", f: "Clue → Answer" },
    { l: "Fable", f: "Setup → Moral" },
    { l: "Children's Story", f: "Character → Situation" },
    { l: "Folktale", f: "Myth → Meaning" },
    { l: "Urban Legend", f: "Event → Suspense" },
    { l: "Horror Story", f: "Calm → Rising Dread" },
    { l: "Mystery Story", f: "Clue → Suspect" },
    { l: "Thriller Outline", f: "Tension → Escalation" },
    { l: "Fantasy Outline", f: "Kingdom → Quest" },
    { l: "Sci-Fi Outline", f: "Tech → Conflict" },
    { l: "Romance Outline", f: "Meeting → Tension" },
    { l: "Comedy Script", f: "Setup → Punchline" },
    { l: "Parody Script", f: "Reference → Twist" },
    { l: "Songwriting Plan", f: "Verse → Hook" },
    { l: "Music Album Concept", f: "Track → Emotion" },
    { l: "Speech Script", f: "Opening → Key Points" },
    { l: "Debate Script", f: "Claim → Rebuttal" }
  ],
  "Education & Teaching": [
    { l: "Course Syllabus", f: "Topic → Weekly Plan" },
    { l: "Lesson Plan", f: "Objective → Activities" },
    { l: "Curriculum Outline", f: "Module → Competency" },
    { l: "Study Guide", f: "Topic → Key Notes" },
    { l: "Worksheet", f: "Concept → Practice Questions" },
    { l: "Exam Paper", f: "Section → Questions" },
    { l: "Answer Sheet", f: "Question → Explanation" },
    { l: "Quiz", f: "Question → Options" },
    { l: "Flashcards", f: "Term → Definition" },
    { l: "Workbook Chapter", f: "Theory → Exercises" },
    { l: "Teacher’s Guide", f: "Lesson → Tips" },
    { l: "Rubric", f: "Criteria → Scoring" },
    { l: "Educational Poster", f: "Topic → Key Points" },
    { l: "Science Fair Report", f: "Problem → Method" },
    { l: "Student Portfolio", f: "Project → Reflection" },
    { l: "Project Rubric", f: "Requirement → Score" },
    { l: "Class Rules", f: "Category → Guidelines" },
    { l: "Reading Log", f: "Book → Reflection" },
    { l: "Academic Progress Report", f: "Subject → Comments" },
    { l: "Internship Report", f: "Task → Learning" },
    { l: "Field Trip Report", f: "Place → Observations" },
    { l: "Journal Entry", f: "Event → Reflection" },
    { l: "Research Notebook", f: "Date → Notes" },
    { l: "Debate Outline", f: "Point → Evidence" },
    { l: "Seminar Notes", f: "Topic → Interpretation" },
    { l: "Presentation Slides", f: "Title → Points" },
    { l: "Academic Poster", f: "Section → Visual" },
    { l: "Thesis Defense Slides", f: "Claim → Evidence" },
    { l: "Student Feedback Form", f: "Question → Response" },
    { l: "Peer Evaluation", f: "Work → Comments" },
    { l: "Homework Sheet", f: "Task → Instructions" },
    { l: "Group Project Plan", f: "Roles → Tasks" },
    { l: "Capstone Proposal", f: "Topic → Plan" },
    { l: "Case Method", f: "Scenario → Questions" },
    { l: "Literacy Plan", f: "Skill → Practice" },
    { l: "Math Problem Set", f: "Topic → Exercises" },
    { l: "Lab Worksheet", f: "Setup → Observations" },
    { l: "Reading Comprehension", f: "Passage → Questions" },
    { l: "Annotated Text", f: "Line → Interpretation" },
    { l: "Spelling List", f: "Word → Definition" },
    { l: "Vocabulary Builder", f: "Word → Usage" },
    { l: "Grammar Exercise", f: "Rule → Task" },
    { l: "Essay Planner", f: "Claim → Structure" },
    { l: "Revision Plan", f: "Weakness → Action" },
    { l: "Study Roadmap", f: "Chapter → Timeline" },
    { l: "Learning Contract", f: "Goal → Milestone" },
    { l: "Peer Tutoring Sheet", f: "Topic → Notes" },
    { l: "Learning Summary", f: "Week → Insights" },
    { l: "Knowledge Map", f: "Topic → Connections" },
    { l: "Educational Module", f: "Lesson → Assessment" }
  ]
};

export const ContinueWritingTool: React.FC = () => {
  const { performAIAction } = useAI();
  const { activeMenu, menuPos, closeMenu } = useAIAssistantTab();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const menuId = 'continue_writing_options';

  const handleContinue = (instruction?: string) => {
      performAIAction('continue_writing', instruction);
      closeMenu();
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm) return null;
    const lowerSearch = searchTerm.toLowerCase();
    const results: { l: string, f: string, category: string }[] = [];
    
    Object.entries(PREDICTIVE_CATEGORIES).forEach(([category, items]) => {
      items.forEach(item => {
        if (item.l.toLowerCase().includes(lowerSearch)) {
          results.push({ ...item, category });
        }
      });
    });
    return results;
  }, [searchTerm]);

  const handlePredictiveClick = (item: { l: string, f: string }) => {
      const instruction = `Context: ${item.l}. Analyze the document structure. Predict and generate the next logical section using the flow: "${item.f}". Do not repeat existing sections.`;
      handleContinue(instruction);
  };

  return (
    <>
        <DropdownRibbonButton 
           id={menuId}
           icon={PenTool} 
           label="Continue Writing" 
           hasArrow
        />

        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={340}>
             <div className="flex flex-col max-h-[600px] h-full overflow-hidden">
                 {/* Fixed Header Options */}
                 <div className="p-2 space-y-2 border-b border-slate-100 bg-white z-10 shrink-0">
                     <button 
                        onClick={() => handleContinue("Smart continuation. Predict the next logical part based on context.")} 
                        className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 rounded-lg text-sm font-semibold text-indigo-700 flex items-center gap-2 group transition-colors shadow-sm border border-indigo-100"
                     >
                        <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-600 group-hover:bg-white group-hover:shadow-sm">
                            <Sparkles size={16} className="fill-indigo-200" />
                        </div>
                        <div>
                            <div className="leading-none">Smart Continuation</div>
                            <div className="text-[10px] font-normal text-indigo-500/80 mt-1">Auto-detect next logical step</div>
                        </div>
                     </button>

                     <div className="grid grid-cols-2 gap-1">
                         <button onClick={() => handleContinue("Style: Formal Academic.")} className="text-left px-2 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <FileText size={12} className="text-slate-400"/> Formal
                         </button>
                         <button onClick={() => handleContinue("Style: Creative.")} className="text-left px-2 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <Feather size={12} className="text-pink-400"/> Creative
                         </button>
                         <button onClick={() => handleContinue("Style: Technical.")} className="text-left px-2 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <Activity size={12} className="text-blue-400"/> Technical
                         </button>
                         <button onClick={() => handleContinue("Style: Simple.")} className="text-left px-2 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <BookOpen size={12} className="text-green-400"/> Simple
                         </button>
                     </div>
                 </div>

                 {/* Predictive Builder Section */}
                 <div className="flex flex-col flex-1 min-h-0 bg-slate-50/50">
                     <div className="px-3 pt-3 pb-2 border-t border-slate-100 bg-slate-50 sticky top-0 z-10">
                         <div className="flex items-center justify-between mb-2">
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                 <LayoutTemplate size={10}/> Predictive Builder
                             </div>
                             <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-mono">250+</span>
                         </div>
                         <div className="relative group">
                             <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"/>
                             <input 
                                type="text" 
                                placeholder="Search document type..." 
                                className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                             />
                         </div>
                     </div>

                     <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 flex-1 px-2 pb-2">
                         {searchTerm ? (
                             // Filtered Results
                             <div className="space-y-0.5">
                                 {filteredItems && filteredItems.length > 0 ? (
                                     filteredItems.map((item, idx) => (
                                         <button 
                                            key={idx} 
                                            onClick={() => handlePredictiveClick(item)}
                                            className="w-full text-left px-3 py-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-md group transition-all"
                                         >
                                             <div className="flex justify-between items-baseline">
                                                 <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">{item.l}</span>
                                                 <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tight">{item.category.split(' ')[0]}</span>
                                             </div>
                                             <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 opacity-80">
                                                 <span className="truncate">{item.f.split('→')[0].trim()}</span>
                                                 <ChevronRight size={8} />
                                                 <span className="truncate text-blue-600 font-medium">{item.f.split('→')[1]?.trim() || 'Next Section'}</span>
                                             </div>
                                         </button>
                                     ))
                                 ) : (
                                     <div className="py-8 text-center text-slate-400 text-xs">
                                         No templates found for "{searchTerm}"
                                     </div>
                                 )}
                             </div>
                         ) : (
                             // Categories View
                             <div className="space-y-1">
                                 {Object.entries(PREDICTIVE_CATEGORIES).map(([category, items]) => {
                                     const isExpanded = expandedCategory === category;
                                     return (
                                         <div key={category} className="rounded-lg overflow-hidden border border-slate-100 bg-white">
                                             <button 
                                                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50 border-b border-slate-100' : ''}`}
                                             >
                                                 {category}
                                                 <div className="flex items-center gap-2">
                                                     <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 rounded">{items.length}</span>
                                                     <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}/>
                                                 </div>
                                             </button>
                                             
                                             {isExpanded && (
                                                 <div className="bg-slate-50/50 p-1 space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                                                     {items.map((item, idx) => (
                                                         <button 
                                                            key={idx} 
                                                            onClick={() => handlePredictiveClick(item)}
                                                            className="w-full text-left px-3 py-1.5 hover:bg-white hover:shadow-sm rounded border border-transparent hover:border-slate-100 transition-all group"
                                                         >
                                                             <div className="text-xs text-slate-600 group-hover:text-blue-700 font-medium">{item.l}</div>
                                                             <div className="text-[10px] text-slate-400 truncate">{item.f}</div>
                                                         </button>
                                                     ))}
                                                 </div>
                                             )}
                                         </div>
                                     );
                                 })}
                             </div>
                         )}
                     </div>
                 </div>
             </div>
        </MenuPortal>
    </>
  );
};
