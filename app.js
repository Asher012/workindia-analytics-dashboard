// WorkIndia Support Team Analytics Dashboard JavaScript
class WorkIndiaAnalyticsDashboard {
  constructor() {
    this.rawData = [];
    this.processedData = {};
    this.charts = {};
    this.currentFilters = {};
    
    // WorkIndia brand colors for charts
    this.chartColors = {
      primary: ['#3F51B5', '#7986CB', '#303F9F', '#C5CAE9', '#9FA8DA'],
      accent: ['#FF5722', '#FF8A65', '#D84315', '#FFAB91', '#BCAAA4'],
      mixed: ['#3F51B5', '#FF5722', '#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#607D8B', '#795548', '#E91E63', '#009688']
    };
    
    this.initializeData();
    this.setupEventListeners();
    this.updateCurrentDate();
    this.renderDashboard();
  }

  initializeData() {
    // Sample data for demonstration
    this.processedData = {
      sample_data: [
        {
          "Hour": 8, "Date": "2025-09-17", "user": "9047", "full_name": "Gimitha P",
          "status": "PB", "status_name": "Product Briefing", "hangupby": "AGENT",
          "length_in_sec": 390, "Duration_Minutes": 6.5, "Is_Successful": "Success",
          "Call_Category": "Product Briefing", "Performance_Score": 100
        },
        {
          "Hour": 9, "Date": "2025-09-17", "user": "9033", "full_name": "Anupama Manna",
          "status": "CC", "status_name": "Candidate Calls", "hangupby": "CALLER",
          "length_in_sec": 180, "Duration_Minutes": 3.0, "Is_Successful": "Failed",
          "Call_Category": "Customer Support", "Performance_Score": 60
        }
      ],
      agent_performance: [
        { "user": "9047", "full_name": "Gimitha P", "Total_Calls": 11, "Avg_Duration_Min": 4.18, "Successful_Calls": 8, "Success_Rate": 72.7, "Performance_Score": 76.36 },
        { "user": "9039", "full_name": "Arpitha SM", "Total_Calls": 10, "Avg_Duration_Min": 4.91, "Successful_Calls": 6, "Success_Rate": 60.0, "Performance_Score": 72.0 },
        { "user": "9104", "full_name": "Minaj G", "Total_Calls": 12, "Avg_Duration_Min": 2.71, "Successful_Calls": 4, "Success_Rate": 33.3, "Performance_Score": 61.67 },
        { "user": "9033", "full_name": "Anupama Manna", "Total_Calls": 12, "Avg_Duration_Min": 5.18, "Successful_Calls": 3, "Success_Rate": 25.0, "Performance_Score": 60.0 }
      ],
      hourly_stats: [
        { "Hour": 7, "Total_Calls": 1, "Success_Rate": 0.0, "Avg_Duration": 0.02 },
        { "Hour": 8, "Total_Calls": 6, "Success_Rate": 50.0, "Avg_Duration": 6.51 },
        { "Hour": 9, "Total_Calls": 31, "Success_Rate": 32.3, "Avg_Duration": 3.17 },
        { "Hour": 10, "Total_Calls": 59, "Success_Rate": 37.3, "Avg_Duration": 5.15 }
      ],
      call_categories: [
        { "category": "Product Briefing", "count": 35, "percentage": 36.1 },
        { "category": "Customer Support", "count": 23, "percentage": 23.7 },
        { "category": "Business Issues", "count": 21, "percentage": 21.6 },
        { "category": "System Issues", "count": 13, "percentage": 13.4 },
        { "category": "Technical Issues", "count": 5, "percentage": 5.2 }
      ],
      summary_kpis: {
        total_calls: 97,
        success_rate: 36.1,
        avg_duration: 4.67,
        peak_hour: "10:00 AM",
        top_agent: "Gimitha P",
        active_agents: 13
      }
    };
  }

  setupEventListeners() {
    // File upload
    const fileInput = document.getElementById('excel-upload');
    const uploadArea = document.querySelector('.upload-area');
    
    if (fileInput && uploadArea) {
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
      
      // Drag and drop
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#3F51B5';
        uploadArea.style.backgroundColor = 'rgba(63, 81, 181, 0.05)';
      });
      
      uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#E0E0E0';
        uploadArea.style.backgroundColor = '#FAFAFA';
      });
      
      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#E0E0E0';
        uploadArea.style.backgroundColor = '#FAFAFA';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          fileInput.files = files;
          this.handleFileUpload({ target: { files: files } });
        }
      });
    }
    
    // Filter controls
    document.getElementById('reset-filters')?.addEventListener('click', () => this.resetFilters());
    document.getElementById('apply-filters')?.addEventListener('click', () => this.applyFilters());
    
    // Export controls
    document.getElementById('export-dashboard')?.addEventListener('click', () => this.exportDashboard());
    document.getElementById('download-report')?.addEventListener('click', () => this.downloadReport());
    document.getElementById('print-dashboard')?.addEventListener('click', () => this.printDashboard());
    
    // Usage guide toggle
    document.getElementById('toggle-guide')?.addEventListener('click', () => this.toggleUsageGuide());
    
    // Table search
    document.getElementById('table-search')?.addEventListener('input', (e) => this.searchTable(e.target.value));
    
    // Table sorting
    document.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', () => this.sortTable(th.dataset.sort));
    });
  }

  updateCurrentDate() {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const currentDateEl = document.getElementById('current-date');
    const lastUpdatedEl = document.getElementById('last-updated');
    
    if (currentDateEl) {
      currentDateEl.textContent = now.toLocaleDateString('en-US', options);
    }
    
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }

  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const progressBar = document.getElementById('upload-progress');
    const errorDiv = document.getElementById('upload-error');
    
    // Show progress bar
    progressBar?.classList.remove('hidden');
    errorDiv?.classList.add('hidden');
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (progressBar) progressBar.value = i;
      }
      
      // Process file (simplified - in real implementation would parse Excel/CSV)
      await this.processUploadedFile(file);
      
      // Hide progress bar
      progressBar?.classList.add('hidden');
      
      // Update dashboard
      this.renderDashboard();
      
      // Show success message
      this.showNotification('File uploaded successfully!', 'success');
      
    } catch (error) {
      console.error('Upload error:', error);
      progressBar?.classList.add('hidden');
      
      if (errorDiv) {
        errorDiv.textContent = 'Error uploading file. Please try again.';
        errorDiv.classList.remove('hidden');
      }
    }
  }

  async processUploadedFile(file) {
    // In a real implementation, this would parse the Excel/CSV file
    // For now, we'll simulate data processing
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate processing - in reality would use libraries like xlsx or papa parse
        console.log('Processing file:', file.name);
        resolve();
      }, 1000);
    });
  }

  renderDashboard() {
    this.updateKPIs();
    this.renderCharts();
    this.populateTable();
    this.populateFilters();
  }

  updateKPIs() {
    const kpis = this.processedData.summary_kpis;
    
    document.getElementById('kpi-total-calls').textContent = kpis.total_calls;
    document.getElementById('kpi-success-rate').textContent = `${kpis.success_rate}%`;
    document.getElementById('kpi-avg-duration').textContent = `${kpis.avg_duration} min`;
    document.getElementById('kpi-peak-hour').textContent = kpis.peak_hour;
    document.getElementById('kpi-top-agent').textContent = kpis.top_agent;
    document.getElementById('kpi-active-agents').textContent = kpis.active_agents;
  }

  renderCharts() {
    this.renderAgentPerformanceChart();
    this.renderHourlyVolumeChart();
    this.renderCallCategoriesChart();
    this.renderCallOutcomesChart();
  }

  renderAgentPerformanceChart() {
    const ctx = document.getElementById('agent-performance-chart');
    if (!ctx) return;
    
    if (this.charts.agentPerformance) {
      this.charts.agentPerformance.destroy();
    }
    
    const data = this.processedData.agent_performance.slice(0, 8); // Top 8 agents
    
    this.charts.agentPerformance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(agent => agent.full_name),
        datasets: [{
          label: 'Success Rate (%)',
          data: data.map(agent => agent.Success_Rate),
          backgroundColor: this.chartColors.primary[0],
          borderColor: this.chartColors.primary[2],
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  }

  renderHourlyVolumeChart() {
    const ctx = document.getElementById('hourly-volume-chart');
    if (!ctx) return;
    
    if (this.charts.hourlyVolume) {
      this.charts.hourlyVolume.destroy();
    }
    
    const data = this.processedData.hourly_stats;
    
    this.charts.hourlyVolume = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(hour => `${hour.Hour}:00`),
        datasets: [{
          label: 'Total Calls',
          data: data.map(hour => hour.Total_Calls),
          borderColor: this.chartColors.primary[0],
          backgroundColor: this.chartColors.primary[0] + '20',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  renderCallCategoriesChart() {
    const ctx = document.getElementById('call-categories-chart');
    if (!ctx) return;
    
    if (this.charts.callCategories) {
      this.charts.callCategories.destroy();
    }
    
    const data = this.processedData.call_categories;
    
    this.charts.callCategories = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(cat => cat.category),
        datasets: [{
          data: data.map(cat => cat.count),
          backgroundColor: this.chartColors.mixed,
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  renderCallOutcomesChart() {
    const ctx = document.getElementById('call-outcomes-chart');
    if (!ctx) return;
    
    if (this.charts.callOutcomes) {
      this.charts.callOutcomes.destroy();
    }
    
    // Simplified outcomes data
    const outcomes = [
      { status: 'Success', count: 35 },
      { status: 'Failed', count: 62 }
    ];
    
    this.charts.callOutcomes = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: outcomes.map(outcome => outcome.status),
        datasets: [{
          label: 'Call Count',
          data: outcomes.map(outcome => outcome.count),
          backgroundColor: [this.chartColors.primary[0], this.chartColors.accent[0]],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  populateTable() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;
    
    const data = this.processedData.agent_performance;
    
    tableBody.innerHTML = data.map(agent => `
      <tr>
        <td>${agent.full_name}</td>
        <td>${agent.Total_Calls}</td>
        <td>${agent.Avg_Duration_Min.toFixed(2)} min</td>
        <td>${agent.Success_Rate.toFixed(1)}%</td>
        <td>${agent.Performance_Score.toFixed(1)}</td>
      </tr>
    `).join('');
  }

  populateFilters() {
    const agentSelect = document.getElementById('filter-agent');
    if (!agentSelect) return;
    
    const agents = this.processedData.agent_performance;
    
    agentSelect.innerHTML = '<option value="">All Agents</option>' + 
      agents.map(agent => `<option value="${agent.user}">${agent.full_name}</option>`).join('');
  }

  resetFilters() {
    document.getElementById('filter-date-start').value = '';
    document.getElementById('filter-date-end').value = '';
    document.getElementById('filter-agent').value = '';
    document.getElementById('filter-status').value = '';
    
    this.currentFilters = {};
    this.renderDashboard();
  }

  applyFilters() {
    this.currentFilters = {
      dateStart: document.getElementById('filter-date-start').value,
      dateEnd: document.getElementById('filter-date-end').value,
      agent: document.getElementById('filter-agent').value,
      status: document.getElementById('filter-status').value
    };
    
    // In a real implementation, this would filter the data
    console.log('Applying filters:', this.currentFilters);
    this.showNotification('Filters applied successfully!', 'success');
  }

  searchTable(searchTerm) {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const isVisible = text.includes(searchTerm.toLowerCase());
      row.style.display = isVisible ? '' : 'none';
    });
  }

  sortTable(column) {
    // Simple sorting implementation
    console.log('Sorting by:', column);
    this.showNotification(`Sorted by ${column}`, 'info');
  }

  exportDashboard() {
    // Create a simple export
    const exportData = {
      generated_at: new Date().toISOString(),
      summary: this.processedData.summary_kpis,
      agent_performance: this.processedData.agent_performance,
      hourly_stats: this.processedData.hourly_stats
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'workindia-analytics-export.json';
    link.click();
    
    this.showNotification('Dashboard exported successfully!', 'success');
  }

  downloadReport() {
    // Generate a simple text report
    const report = `
WorkIndia Support Team Analytics Report
Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS:
- Total Calls: ${this.processedData.summary_kpis.total_calls}
- Success Rate: ${this.processedData.summary_kpis.success_rate}%
- Average Duration: ${this.processedData.summary_kpis.avg_duration} minutes
- Peak Hour: ${this.processedData.summary_kpis.peak_hour}
- Top Agent: ${this.processedData.summary_kpis.top_agent}
- Active Agents: ${this.processedData.summary_kpis.active_agents}

TOP PERFORMING AGENTS:
${this.processedData.agent_performance.slice(0, 5).map(agent => 
  `- ${agent.full_name}: ${agent.Success_Rate.toFixed(1)}% success rate (${agent.Total_Calls} calls)`
).join('\n')}

Built by Ayush Pandey ORM | WorkIndia
    `;
    
    const reportBlob = new Blob([report], {type: 'text/plain'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(reportBlob);
    link.download = 'workindia-support-report.txt';
    link.click();
    
    this.showNotification('Report downloaded successfully!', 'success');
  }

  printDashboard() {
    window.print();
  }

  toggleUsageGuide() {
    const guide = document.getElementById('usage-guide');
    const button = document.getElementById('toggle-guide');
    
    if (guide && button) {
      guide.classList.toggle('hidden');
      button.textContent = guide.classList.contains('hidden') ? 'Show Usage Guide' : 'Hide Usage Guide';
    }
  }

  showNotification(message, type = 'info') {
    // Create a simple toast notification
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: #3F51B5;
      color: white;
      border-radius: 6px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.workIndiaDashboard = new WorkIndiaAnalyticsDashboard();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);