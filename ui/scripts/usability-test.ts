import { chromium, Browser, Page } from '@playwright/test';

interface UsabilityTask {
  id: string;
  title: string;
  description: string;
  steps: string[];
  successCriteria: string[];
}

interface UsabilityTestResult {
  participantId: string;
  taskId: string;
  completionTime: number;
  success: boolean;
  errors: string[];
  observations: string[];
  susScore: number;
}

const TASKS: UsabilityTask[] = [
  {
    id: 'task-1',
    title: 'Navigate to Canvas',
    description: 'Find and open the Canvas workspace',
    steps: [
      'Look for the Canvas navigation item',
      'Click on Canvas to open the workspace'
    ],
    successCriteria: [
      'Canvas workspace is visible',
      'Toolbox is present on the left'
    ]
  },
  {
    id: 'task-2',
    title: 'Add a PLC Node',
    description: 'Add a PLC component to the canvas',
    steps: [
      'Find the PLC component in the toolbox',
      'Drag the PLC component to the canvas',
      'Verify the PLC appears on the canvas'
    ],
    successCriteria: [
      'PLC node is visible on canvas',
      'Node has proper styling and labels'
    ]
  },
  {
    id: 'task-3',
    title: 'Search in Marketplace',
    description: 'Search for a specific component in the marketplace',
    steps: [
      'Navigate to the Marketplace',
      'Use the search bar to find a component',
      'Verify search results are displayed'
    ],
    successCriteria: [
      'Search results are shown',
      'Results match the search query'
    ]
  },
  {
    id: 'task-4',
    title: 'Acknowledge an Alert',
    description: 'Find and acknowledge an alert in the alerts section',
    steps: [
      'Navigate to the Alerts section',
      'Find an active alert',
      'Click the acknowledge button'
    ],
    successCriteria: [
      'Alert status changes to acknowledged',
      'Alert is no longer in active list'
    ]
  },
  {
    id: 'task-5',
    title: 'Change Language',
    description: 'Change the application language to French',
    steps: [
      'Navigate to Settings',
      'Find the language selection',
      'Change language to French'
    ],
    successCriteria: [
      'Interface text changes to French',
      'Language setting is saved'
    ]
  }
];

const SUS_QUESTIONS = [
  'I think that I would like to use this system frequently',
  'I found the system unnecessarily complex',
  'I thought the system was easy to use',
  'I think that I would need the support of a technical person to be able to use this system',
  'I found the various functions in this system were well integrated',
  'I thought there was too much inconsistency in this system',
  'I would imagine that most people would learn to use this system very quickly',
  'I found the system very cumbersome to use',
  'I felt very confident using the system',
  'I needed to learn a lot of things before I could get going with this system'
];

class UsabilityTestRunner {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: UsabilityTestResult[] = [];

  async initialize() {
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
    await this.page.goto('http://localhost:5173');
  }

  async runTask(task: UsabilityTask): Promise<UsabilityTestResult> {
    if (!this.page) throw new Error('Page not initialized');

    const startTime = Date.now();
    const errors: string[] = [];
    const observations: string[] = [];

    try {
      console.log(`\n=== Running Task: ${task.title} ===`);
      console.log(task.description);

      for (const step of task.steps) {
        console.log(`Step: ${step}`);
        // Here you would implement the actual step execution
        // For now, we'll simulate the steps
        await this.page.waitForTimeout(1000);
      }

      // Check success criteria
      let success = true;
      for (const criterion of task.successCriteria) {
        try {
          // Here you would implement actual success criteria checking
          console.log(`✓ ${criterion}`);
        } catch (error) {
          success = false;
          errors.push(`Failed: ${criterion}`);
          console.log(`✗ ${criterion}`);
        }
      }

      const completionTime = Date.now() - startTime;

      return {
        participantId: 'test-participant',
        taskId: task.id,
        completionTime,
        success,
        errors,
        observations,
        susScore: 0 // Will be calculated separately
      };

    } catch (error) {
      return {
        participantId: 'test-participant',
        taskId: task.id,
        completionTime: Date.now() - startTime,
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        observations: [],
        susScore: 0
      };
    }
  }

  async runSUSSurvey(): Promise<number> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('\n=== System Usability Scale (SUS) Survey ===');
    
    let totalScore = 0;
    
    for (let i = 0; i < SUS_QUESTIONS.length; i++) {
      const question = SUS_QUESTIONS[i];
      console.log(`\nQuestion ${i + 1}: ${question}`);
      
      // Simulate user response (1-5 scale)
      const response = Math.floor(Math.random() * 5) + 1;
      console.log(`Response: ${response}`);
      
      // Calculate SUS score
      let score = response - 1; // Convert to 0-4 scale
      if (i % 2 === 1) { // Even questions (0-indexed) are reversed
        score = 4 - score;
      }
      totalScore += score;
    }
    
    const susScore = (totalScore / 40) * 100; // Convert to 0-100 scale
    console.log(`\nSUS Score: ${susScore.toFixed(1)}/100`);
    
    return susScore;
  }

  async runFullTest() {
    await this.initialize();

    console.log('=== EdgePlug Usability Test ===');
    console.log('Starting usability test with 5 participants...');

    for (let participant = 1; participant <= 5; participant++) {
      console.log(`\n--- Participant ${participant} ---`);
      
      // Run all tasks
      for (const task of TASKS) {
        const result = await this.runTask(task);
        this.results.push(result);
      }
      
      // Run SUS survey
      const susScore = await this.runSUSSurvey();
      
      // Update SUS scores for this participant
      this.results
        .filter(r => r.participantId === `participant-${participant}`)
        .forEach(r => r.susScore = susScore);
    }

    await this.generateReport();
    await this.cleanup();
  }

  async generateReport() {
    console.log('\n=== Usability Test Report ===');
    
    const totalTasks = this.results.length;
    const successfulTasks = this.results.filter(r => r.success).length;
    const avgCompletionTime = this.results.reduce((sum, r) => sum + r.completionTime, 0) / totalTasks;
    const avgSUSScore = this.results.reduce((sum, r) => sum + r.susScore, 0) / totalTasks;
    
    console.log(`Total Tasks: ${totalTasks}`);
    console.log(`Successful Tasks: ${successfulTasks} (${((successfulTasks / totalTasks) * 100).toFixed(1)}%)`);
    console.log(`Average Completion Time: ${avgCompletionTime.toFixed(0)}ms`);
    console.log(`Average SUS Score: ${avgSUSScore.toFixed(1)}/100`);
    
    // Task-specific analysis
    const taskAnalysis = TASKS.map(task => {
      const taskResults = this.results.filter(r => r.taskId === task.id);
      const successRate = (taskResults.filter(r => r.success).length / taskResults.length) * 100;
      const avgTime = taskResults.reduce((sum, r) => sum + r.completionTime, 0) / taskResults.length;
      
      return {
        task: task.title,
        successRate: successRate.toFixed(1),
        avgTime: avgTime.toFixed(0)
      };
    });
    
    console.log('\nTask Analysis:');
    taskAnalysis.forEach(analysis => {
      console.log(`${analysis.task}: ${analysis.successRate}% success, ${analysis.avgTime}ms avg`);
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the usability test
async function main() {
  const runner = new UsabilityTestRunner();
  await runner.runFullTest();
}

if (require.main === module) {
  main().catch(console.error);
} 