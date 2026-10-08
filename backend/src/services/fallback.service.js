class FallbackService {

  getEmergencyResponse(jobType, payload) {
    if (jobType === 'RESOURCE_CURATION') {
      return { 
        result: [
          {
            title: `Official Documentation`,
            url: "https://developer.mozilla.org",
            type: "documentation",
            sourceName: "MDN Web Docs",
            estimatedTime: "30 mins",
            description: "Read the foundational concepts to establish a strong baseline."
          },
          {
            title: `Crash Course`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(payload.nodeTitle || payload.skillTag || 'programming')} crash course`,
            type: "video",
            sourceName: "YouTube",
            estimatedTime: "25 mins",
            description: "A quick visual breakdown of how this technology works under the hood."
          },
          {
            title: `Best Practices`,
            url: "https://dev.to",
            type: "article",
            sourceName: "DEV Community",
            estimatedTime: "15 mins",
            description: "Learn the industry standards and common pitfalls."
          },
          {
            title: `Interactive Sandbox`,
            url: "https://codesandbox.io",
            type: "interactive",
            sourceName: "CodeSandbox",
            estimatedTime: "45 mins",
            description: "Get hands-on experience and build muscle memory."
          }
        ], 
        fromFallback: true 
      };
    }
  
    if (jobType === 'CAREER_PATH') {
      return { 
        result: {
          skillGaps: ["Advanced State Management", "System Architecture", "Performance Optimization", "Testing"],
          nodes: [
            {
              title: "Mastering React Fundamentals",
              description: "Build a strong foundation by diving deep into component lifecycles and modern hooks.",
              type: "skill",
              estimatedHours: 10,
              skillTag: "react-core",
              skillDomain: "Frontend",
            },
            {
              title: "Global State with Redux Toolkit",
              description: "Learn how to manage complex application state predictably.",
              type: "skill",
              estimatedHours: 8,
              skillTag: "redux",
              skillDomain: "Frontend",
            },
            {
              title: "Build an E-Commerce Cart",
              description: "Apply your state management skills by building a fully functional cart system.",
              type: "project",
              estimatedHours: 15,
              skillTag: "cart-project",
              skillDomain: "Frontend",
            },
            {
              title: "Node.js Architecture",
              description: "Understand event loops, streams, and how to structure robust backend APIs.",
              type: "skill",
              estimatedHours: 12,
              skillTag: "nodejs",
              skillDomain: "Backend",
            },
            {
              title: "Database Design with MongoDB",
              description: "Model complex data relationships using NoSQL schemas.",
              type: "skill",
              estimatedHours: 10,
              skillTag: "mongodb",
              skillDomain: "Backend",
            },
            {
              title: "Secure Authentication API",
              description: "Build a complete JWT authentication flow with refresh tokens.",
              type: "project",
              estimatedHours: 20,
              skillTag: "auth-project",
              skillDomain: "Backend",
            },
            {
              title: "Web Vitals & Performance",
              description: "Learn how to optimize bundle sizes and improve core web vitals.",
              type: "skill",
              estimatedHours: 6,
              skillTag: "performance",
              skillDomain: "Architecture",
            },
            {
              title: "System Design Principles",
              description: "Understand scaling, load balancing, and microservices.",
              type: "skill",
              estimatedHours: 15,
              skillTag: "system-design",
              skillDomain: "Architecture",
            },
            {
              title: "End-to-End Testing",
              description: "Write bulletproof tests using Cypress and Jest.",
              type: "skill",
              estimatedHours: 10,
              skillTag: "testing",
              skillDomain: "Quality",
            },
            {
              title: "Deploy a Full-Stack Application",
              description: "The ultimate test: deploy your backend, frontend, and DB to the cloud.",
              type: "milestone",
              estimatedHours: 25,
              skillTag: "deployment",
              skillDomain: "Quality",
            }
          ]
        }, 
        fromFallback: true 
      };
    }
  
    if (jobType === 'ASSIGNMENT_REVIEW') {
      return {
        result: {
          score: 0,
          skillLevel: "none",
          status: "flagged_for_review",
          criteriaVerdicts: payload.assignment.acceptanceCriteria.map(c => ({
            criterion: c,
            status: "not_met",
            reason: "System was unable to evaluate automatically. Awaiting instructor review."
          })),
          strengths: [],
          improvements: ["Manual instructor review required due to system evaluation error."]
        },
        fromFallback: true
      };
    }
  
    if (jobType === 'COMPANION_MESSAGE') {
      return {
        result: "I'm currently resting my neural networks because our AI systems are at capacity. Try asking me again in a few minutes!",
        fromFallback: true
      };
    }
  
    if (jobType === 'ASSIGNMENT_GENERATION') {
      return {
        result: {
          title: "Hands-on Mastery Project",
          brief: "Build a mini-project demonstrating your mastery of the concepts covered in this module. Focus on best practices, error handling, and clean architecture.",
          timeEstimateMinutes: 60,
          acceptedFormat: "github",
          acceptanceCriteria: [
            "Project runs without critical errors",
            "Code is well-structured and commented",
            "Core module concepts are demonstrably used",
            "Includes a README explaining the approach"
          ],
          commonMistakes: [
            "Overcomplicating the solution",
            "Ignoring edge cases and error handling",
            "Failing to commit code properly to GitHub"
          ],
          exampleOutputUrl: "https://github.com/example/demo"
        },
        fromFallback: true
      };
    }
  
    return {
      result: {
        error: true,
        message: 'This feature is temporarily unavailable. Please try again in a few minutes.'
      },
      fromFallback: true
    };
  }
}

export default new FallbackService();
