# EdgePlug Dependency Security Report Generator for Windows
# This script analyzes dependencies and generates security reports

param(
    [string]$ProjectName = "edgeplug-marketplace",
    [string]$ProjectVersion = "1.0.0",
    [string]$OutputDir = "./security-reports",
    [string]$ScanType = "all"  # all, go, nodejs, python, docker
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to install security scanning tools
function Install-SecurityTools {
    Write-ColorOutput "Installing security scanning tools..." $Blue
    
    # Check if Chocolatey is available
    if (-not (Test-Command "choco")) {
        Write-ColorOutput "Installing Chocolatey package manager..." $Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    
    # Install security tools
    $Tools = @(
        "grype",
        "trivy",
        "snyk",
        "npm-audit",
        "pip-audit"
    )
    
    foreach ($Tool in $Tools) {
        if (-not (Test-Command $Tool)) {
            Write-ColorOutput "Installing $Tool..." $Yellow
            switch ($Tool) {
                "grype" { choco install grype -y }
                "trivy" { choco install trivy -y }
                "snyk" { npm install -g snyk }
                default { Write-ColorOutput "$Tool will be used if available" $Yellow }
            }
        } else {
            Write-ColorOutput "$Tool already installed" $Green
        }
    }
    
    Write-ColorOutput "Security tools installation completed" $Green
}

# Function to scan Go dependencies
function Scan-GoDependencies {
    Write-ColorOutput "Scanning Go dependencies..." $Blue
    
    if (Test-Path "go.mod") {
        $GoReportFile = "$OutputDir/go-security-report.json"
        
        if (Test-Command "grype") {
            # Use grype for Go scanning
            & grype dir:. --output json > $GoReportFile
            Write-ColorOutput "Go security scan completed: $GoReportFile" $Green
        } else {
            Write-ColorOutput "grype not available for Go scanning" $Yellow
        }
        
        # Generate Go dependency list
        $GoDepsFile = "$OutputDir/go-dependencies.txt"
        & go list -m all > $GoDepsFile
        Write-ColorOutput "Go dependencies listed: $GoDepsFile" $Green
    } else {
        Write-ColorOutput "go.mod not found, skipping Go scanning" $Yellow
    }
}

# Function to scan Node.js dependencies
function Scan-NodeJSDependencies {
    Write-ColorOutput "Scanning Node.js dependencies..." $Blue
    
    if (Test-Path "package.json") {
        $NodeReportFile = "$OutputDir/nodejs-security-report.json"
        
        # Run npm audit
        if (Test-Command "npm") {
            & npm audit --json > $NodeReportFile
            Write-ColorOutput "Node.js security scan completed: $NodeReportFile" $Green
        }
        
        # Use Snyk if available
        if (Test-Command "snyk") {
            $SnykReportFile = "$OutputDir/nodejs-snyk-report.json"
            & snyk test --json > $SnykReportFile
            Write-ColorOutput "Snyk scan completed: $SnykReportFile" $Green
        }
        
        # Generate dependency tree
        $DepsTreeFile = "$OutputDir/nodejs-dependency-tree.txt"
        & npm list > $DepsTreeFile
        Write-ColorOutput "Node.js dependency tree: $DepsTreeFile" $Green
    } else {
        Write-ColorOutput "package.json not found, skipping Node.js scanning" $Yellow
    }
}

# Function to scan Python dependencies
function Scan-PythonDependencies {
    Write-ColorOutput "Scanning Python dependencies..." $Blue
    
    if (Test-Path "requirements.txt") {
        $PythonReportFile = "$OutputDir/python-security-report.json"
        
        # Use pip-audit if available
        if (Test-Command "pip-audit") {
            & pip-audit --format json > $PythonReportFile
            Write-ColorOutput "Python security scan completed: $PythonReportFile" $Green
        } else {
            Write-ColorOutput "pip-audit not available for Python scanning" $Yellow
        }
        
        # Generate dependency list
        $PythonDepsFile = "$OutputDir/python-dependencies.txt"
        & pip freeze > $PythonDepsFile
        Write-ColorOutput "Python dependencies listed: $PythonDepsFile" $Green
    } else {
        Write-ColorOutput "requirements.txt not found, skipping Python scanning" $Yellow
    }
}

# Function to scan Docker images
function Scan-DockerImages {
    Write-ColorOutput "Scanning Docker images..." $Blue
    
    if (Test-Command "docker") {
        $DockerReportFile = "$OutputDir/docker-security-report.json"
        
        # Use trivy for Docker scanning
        if (Test-Command "trivy") {
            $ImageName = "edgeplug-marketplace:latest"
            & trivy image --format json --output $DockerReportFile $ImageName
            Write-ColorOutput "Docker security scan completed: $DockerReportFile" $Green
        } else {
            Write-ColorOutput "trivy not available for Docker scanning" $Yellow
        }
        
        # Use grype for Docker scanning as alternative
        if (Test-Command "grype") {
            $GrypeDockerReportFile = "$OutputDir/docker-grype-report.json"
            & grype $ImageName --output json > $GrypeDockerReportFile
            Write-ColorOutput "Grype Docker scan completed: $GrypeDockerReportFile" $Green
        }
    } else {
        Write-ColorOutput "Docker not available, skipping Docker scanning" $Yellow
    }
}

# Function to generate comprehensive security report
function Generate-ComprehensiveReport {
    Write-ColorOutput "Generating comprehensive security report..." $Blue
    
    $ReportFile = "$OutputDir/comprehensive-security-report.html"
    
    # Collect scan results
    $ScanResults = @{
        Go = Test-Path "$OutputDir/go-security-report.json"
        NodeJS = Test-Path "$OutputDir/nodejs-security-report.json"
        Python = Test-Path "$OutputDir/python-security-report.json"
        Docker = Test-Path "$OutputDir/docker-security-report.json"
    }
    
    # Create HTML report
    $HtmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>EdgePlug Comprehensive Security Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .vulnerability { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 3px; }
        .critical { border-left: 5px solid #e74c3c; background-color: #fdf2f2; }
        .high { border-left: 5px solid #e67e22; background-color: #fef9e7; }
        .medium { border-left: 5px solid #f1c40f; background-color: #fefefe; }
        .low { border-left: 5px solid #27ae60; background-color: #f8f9fa; }
        .summary { background-color: #ecf0f1; padding: 15px; border-radius: 5px; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
        .status-success { background-color: #27ae60; }
        .status-warning { background-color: #f39c12; }
        .status-error { background-color: #e74c3c; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric { background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2c3e50; }
        .metric-label { color: #7f8c8d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>EdgePlug Comprehensive Security Report</h1>
            <p>Generated on: $(Get-Date)</p>
            <p>Project: $ProjectName v$ProjectVersion</p>
        </div>
        
        <div class="section">
            <h2>Scan Summary</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">$($ScanResults.Values | Where-Object { $_ } | Measure-Object | Select-Object -ExpandProperty Count)</div>
                    <div class="metric-label">Scans Completed</div>
                </div>
                <div class="metric">
                    <div class="metric-value">$($ScanResults.Count)</div>
                    <div class="metric-label">Total Scans</div>
                </div>
            </div>
            
            <div class="summary">
                <h3>Scan Status</h3>
                <ul>
                    <li>Go Dependencies: <span class="status $(if($ScanResults.Go){'status-success'}else{'status-error'})">$(if($ScanResults.Go){'Completed'}else{'Not Found'})</span></li>
                    <li>Node.js Dependencies: <span class="status $(if($ScanResults.NodeJS){'status-success'}else{'status-error'})">$(if($ScanResults.NodeJS){'Completed'}else{'Not Found'})</span></li>
                    <li>Python Dependencies: <span class="status $(if($ScanResults.Python){'status-success'}else{'status-error'})">$(if($ScanResults.Python){'Completed'}else{'Not Found'})</span></li>
                    <li>Docker Images: <span class="status $(if($ScanResults.Docker){'status-success'}else{'status-error'})">$(if($ScanResults.Docker){'Completed'}else{'Not Found'})</span></li>
                </ul>
            </div>
        </div>
        
        <div class="section">
            <h2>Security Recommendations</h2>
            <div class="summary">
                <h3>Immediate Actions</h3>
                <ul>
                    <li>Review all critical and high severity vulnerabilities</li>
                    <li>Update dependencies with known security issues</li>
                    <li>Implement automated security scanning in CI/CD</li>
                    <li>Set up vulnerability monitoring and alerts</li>
                </ul>
                
                <h3>Long-term Strategy</h3>
                <ul>
                    <li>Establish regular security review cycles</li>
                    <li>Implement dependency management policies</li>
                    <li>Use automated tools for continuous monitoring</li>
                    <li>Train development team on security best practices</li>
                </ul>
            </div>
        </div>
        
        <div class="section">
            <h2>Compliance Information</h2>
            <div class="summary">
                <h3>Standards Compliance</h3>
                <ul>
                    <li><strong>IEC 62443-4-1:</strong> Secure development lifecycle</li>
                    <li><strong>IEC 62443-4-2:</strong> Security requirements for components</li>
                    <li><strong>NIST Cybersecurity Framework:</strong> Risk management</li>
                    <li><strong>ISO 27001:</strong> Information security management</li>
                    <li><strong>OWASP Top 10:</strong> Web application security</li>
                </ul>
                
                <h3>SBOM Requirements</h3>
                <ul>
                    <li>CycloneDX format for machine-readable SBOMs</li>
                    <li>SPDX format for industry standard compliance</li>
                    <li>Regular SBOM updates with each release</li>
                    <li>Vulnerability correlation with SBOM components</li>
                </ul>
            </div>
        </div>
        
        <div class="section">
            <h2>Generated Reports</h2>
            <div class="summary">
                <h3>Available Reports</h3>
                <ul>
                    <li>Go Security Report: $(if($ScanResults.Go){'Available'}else{'Not Available'})</li>
                    <li>Node.js Security Report: $(if($ScanResults.NodeJS){'Available'}else{'Not Available'})</li>
                    <li>Python Security Report: $(if($ScanResults.Python){'Available'}else{'Not Available'})</li>
                    <li>Docker Security Report: $(if($ScanResults.Docker){'Available'}else{'Not Available'})</li>
                </ul>
                
                <h3>Next Steps</h3>
                <ol>
                    <li>Review individual scan reports for detailed findings</li>
                    <li>Prioritize vulnerabilities by severity and impact</li>
                    <li>Create remediation plan for identified issues</li>
                    <li>Implement monitoring for new vulnerabilities</li>
                </ol>
            </div>
        </div>
    </div>
</body>
</html>
"@
    
    $HtmlContent | Out-File -FilePath $ReportFile -Encoding UTF8
    Write-ColorOutput "Comprehensive security report generated: $ReportFile" $Green
}

# Function to generate vulnerability summary
function Generate-VulnerabilitySummary {
    Write-ColorOutput "Generating vulnerability summary..." $Blue
    
    $SummaryFile = "$OutputDir/vulnerability-summary.json"
    
    $Summary = @{
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        project = $ProjectName
        version = $ProjectVersion
        scans = @{
            go = Test-Path "$OutputDir/go-security-report.json"
            nodejs = Test-Path "$OutputDir/nodejs-security-report.json"
            python = Test-Path "$OutputDir/python-security-report.json"
            docker = Test-Path "$OutputDir/docker-security-report.json"
        }
        recommendations = @(
            "Regularly update dependencies to patch known vulnerabilities",
            "Use automated security scanning in CI/CD pipelines",
            "Implement dependency vulnerability monitoring",
            "Consider using SBOM tools for compliance requirements",
            "Establish security review processes for new dependencies"
        )
        compliance = @{
            iec62443 = "Secure development lifecycle and component requirements"
            nist = "Cybersecurity framework implementation"
            iso27001 = "Information security management"
            owasp = "Web application security best practices"
        }
    }
    
    $Summary | ConvertTo-Json -Depth 10 | Out-File -FilePath $SummaryFile -Encoding UTF8
    Write-ColorOutput "Vulnerability summary generated: $SummaryFile" $Green
}

# Main execution
Write-ColorOutput "EdgePlug Dependency Security Report Generator for Windows" $Blue
Write-ColorOutput "=====================================================" $White

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Install security tools
Install-SecurityTools

# Run scans based on scan type
switch ($ScanType) {
    "all" {
        Scan-GoDependencies
        Scan-NodeJSDependencies
        Scan-PythonDependencies
        Scan-DockerImages
    }
    "go" { Scan-GoDependencies }
    "nodejs" { Scan-NodeJSDependencies }
    "python" { Scan-PythonDependencies }
    "docker" { Scan-DockerImages }
    default {
        Write-ColorOutput "Invalid scan type. Use: all, go, nodejs, python, docker" $Red
        exit 1
    }
}

# Generate reports
Generate-ComprehensiveReport
Generate-VulnerabilitySummary

Write-ColorOutput "`nSecurity report generation completed successfully!" $Green
Write-ColorOutput "Check the '$OutputDir' directory for generated reports." $White 