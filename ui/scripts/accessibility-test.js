const { chromium } = require('playwright');
const axe = require('axe-core');

async function runAccessibilityTests() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Test URLs
  const testUrls = [
    'http://localhost:5173', // Main demo
    'http://localhost:5173/hifi', // High fidelity demo
    'http://localhost:5173/wireframe', // Wireframe demo
  ];
  
  const results = [];
  
  for (const url of testUrls) {
    try {
      console.log(`Testing accessibility for: ${url}`);
      await page.goto(url);
      
      // Inject axe-core
      await page.addScriptTag({ path: require.resolve('axe-core') });
      
      // Run accessibility analysis
      const accessibilityResults = await page.evaluate(() => {
        return new Promise((resolve) => {
          axe.run((err, results) => {
            if (err) throw err;
            resolve(results);
          });
        });
      });
      
      // Filter for critical and serious violations
      const criticalIssues = accessibilityResults.violations.filter(
        violation => violation.impact === 'critical' || violation.impact === 'serious'
      );
      
      results.push({
        url,
        violations: criticalIssues,
        passes: accessibilityResults.passes.length,
        incomplete: accessibilityResults.incomplete.length,
        inapplicable: accessibilityResults.inapplicable.length
      });
      
      console.log(`Found ${criticalIssues.length} critical/serious violations`);
      
    } catch (error) {
      console.error(`Error testing ${url}:`, error);
      results.push({ url, error: error.message });
    }
  }
  
  await browser.close();
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalUrls: testUrls.length,
      totalViolations: results.reduce((sum, r) => sum + (r.violations?.length || 0), 0),
      totalPasses: results.reduce((sum, r) => sum + (r.passes || 0), 0)
    },
    results
  };
  
  // Save report
  const fs = require('fs');
  const path = require('path');
  const reportDir = path.join(__dirname, '../accessibility-report');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(reportDir, 'accessibility-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Exit with error code if critical violations found
  const totalViolations = results.reduce((sum, r) => sum + (r.violations?.length || 0), 0);
  if (totalViolations > 0) {
    console.error(`❌ Found ${totalViolations} critical/serious accessibility violations`);
    process.exit(1);
  } else {
    console.log('✅ No critical accessibility violations found');
  }
}

runAccessibilityTests().catch(console.error); 