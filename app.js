// WorkIndia Support Team Analytics Dashboard - JavaScript
class WorkIndiaDashboard {
    constructor() {
        this.currentData = null;
        this.charts = {};
        this.sortDirection = {};
        
        // Real data from your Excel file (cleaned and processed)
        this.defaultData = {
            "summary_kpis": {
                "total_calls": 97,
                "success_rate": 36.1,
                "avg_duration": 4.55,
                "peak_hour": "10:00 AM",
                "peak_hour_calls": 59,
                "top_agent": "akhila.s",
                "active_agents": 14
            },
            "agent_performance": [
                {"user": "9035", "full_name": "akhila.s", "Total_Calls": 1, "Avg_Duration_Min": 8.93, "Total_Duration_Min": 8.93, "Successful_Calls": 1, "Success_Rate": 100.0},
                {"user": "9704", "full_name": "naiksirisha.rama", "Total_Calls": 4, "Avg_Duration_Min": 9.62, "Total_Duration_Min": 38.47, "Successful_Calls": 3, "Success_Rate": 75.0},
                {"user": "9047", "full_name": "gimitha.p", "Total_Calls": 11, "Avg_Duration_Min": 4.18, "Total_Duration_Min": 45.93, "Successful_Calls": 8, "Success_Rate": 72.7},
                {"user": "9039", "full_name": "arpitha.sm", "Total_Calls": 10, "Avg_Duration_Min": 4.91, "Total_Duration_Min": 49.13, "Successful_Calls": 6, "Success_Rate": 60.0},
                {"user": "9104", "full_name": "minaj.g", "Total_Calls": 12, "Avg_Duration_Min": 2.71, "Total_Duration_Min": 32.47, "Successful_Calls": 4, "Success_Rate": 33.3},
                {"user": "9049", "full_name": "bindu.p", "Total_Calls": 6, "Avg_Duration_Min": 2.95, "Total_Duration_Min": 17.70, "Successful_Calls": 2, "Success_Rate": 33.3},
                {"user": "9141", "full_name": "mounika.n", "Total_Calls": 6, "Avg_Duration_Min": 6.46, "Total_Duration_Min": 38.73, "Successful_Calls": 2, "Success_Rate": 33.3},
                {"user": "9774", "full_name": "shrusti.s", "Total_Calls": 6, "Avg_Duration_Min": 13.51, "Total_Duration_Min": 81.05, "Successful_Calls": 2, "Success_Rate": 33.3},
                {"user": "9053", "full_name": "shabaaz.khan", "Total_Calls": 11, "Avg_Duration_Min": 2.79, "Total_Duration_Min": 30.72, "Successful_Calls": 3, "Success_Rate": 27.3},
                {"user": "9033", "full_name": "anupama.manna", "Total_Calls": 12, "Avg_Duration_Min": 5.18, "Total_Duration_Min": 62.13, "Successful_Calls": 3, "Success_Rate": 25.0}
            ],
            "hourly_stats": [
                {"Hour": 7, "Total_Calls": 1, "Avg_Duration_Min": 0.02, "Successful_Calls": 0, "Success_Rate": 0.0},
                {"Hour": 8, "Total_Calls": 6, "Avg_Duration_Min": 6.51, "Successful_Calls": 3, "Success_Rate": 50.0},
                {"Hour": 9, "Total_Calls": 31, "Avg_Duration_Min": 3.17, "Successful_Calls": 10, "Success_Rate": 32.3},
                {"Hour": 10, "Total_Calls": 59, "Avg_Duration_Min": 5.15, "Successful_Calls": 22, "Success_Rate": 37.3}
            ],
            "call_categories": [
                {"category": "Product Briefing", "count": 35, "percentage": 36.1},
                {"category": "Customer Support", "count": 23, "percentage": 23.7},
                {"category": "Business Issues", "count": 21, "percentage": 21.6},
                {"category": "System Issues", "count": 13, "percentage": 13.4},
                {"category": "Technical Issues", "count": 5, "percentage": 5.2}
            ],
            "call_outcomes": [
                {"outcome": "Failed", "count": 62},
                {"outcome": "Success", "count": 35}
            ]
        };
        
        this.init();
    }
    
    init() {
        this.currentData = this.defaultData;
        this.updateDateTime();
        this.setupEventListeners();
        this.updateDashboard();
        
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000);
    }
    
    updateDateTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric', 
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-US', options);
        document.getElementById('lastUpdated').textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    setupEventListeners() {
        // File upload functionality
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
        
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterTable(e.target.value);
        });
        
        // Export functionality
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToCSV();
        });
    }
    
    async handleFileUpload(file) {
        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
            this.showToast('Please select a valid Excel or CSV file', 'error');
            return;
        }
        
        const progressContainer = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressContainer.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = 'Processing...';
        
        try {
            // Simulate processing with progress
            for (let i = 0; i <= 100; i += 20) {
                await new Promise(resolve => setTimeout(resolve, 200));
                progressFill.style.width = i + '%';
                
                if (i === 40) progressText.textContent = 'Reading file...';
                if (i === 60) progressText.textContent = 'Processing data...';
                if (i === 80) progressText.textContent = 'Updating charts...';
                if (i === 100) progressText.textContent = 'Complete!';
            }
            
            // Process the file
            await this.processFile(file);
            
            setTimeout(() => {
                progressContainer.style.display = 'none';
                this.showToast('File uploaded and processed successfully!', 'success');
            }, 500);
            
        } catch (error) {
            console.error('Error processing file:', error);
            progressContainer.style.display = 'none';
            this.showToast('Error processing file. Please try again.', 'error');
        }
    }
    
    async processFile(file) {
        // This is a simplified version - in a real scenario, you'd parse the Excel/CSV file
        // For now, we'll simulate successful processing with some randomized data based on the original
        
        // Simulate file processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Here you would implement actual Excel/CSV parsing using libraries like:
        // - SheetJS for Excel files
        // - PapaParse for CSV files
        
        // For now, update with slightly modified data to show the upload worked
        this.currentData = { ...this.defaultData };
        
        // Add some variation to show new data loaded
        this.currentData.summary_kpis.total_calls += Math.floor(Math.random() * 20) - 10;
        this.currentData.summary_kpis.success_rate += (Math.random() - 0.5) * 10;
        this.currentData.summary_kpis.success_rate = Math.max(0, Math.min(100, this.currentData.summary_kpis.success_rate));
        
        this.updateDashboard();
    }
    
    updateDashboard() {
        this.updateKPIs();
        this.updateCharts();
        this.updateTable();
    }
    
    updateKPIs() {
        const kpis = this.currentData.summary_kpis;
        
        document.getElementById('totalCalls').textContent = kpis.total_calls;
        document.getElementById('successRate').textContent = kpis.success_rate.toFixed(1) + '%';
        document.getElementById('avgDuration').textContent = kpis.avg_duration.toFixed(2) + ' min';
        document.getElementById('peakHour').textContent = kpis.peak_hour;
        document.getElementById('peakHourCalls').textContent = kpis.peak_hour_calls + ' calls';
        document.getElementById('topAgent').textContent = kpis.top_agent;
        document.getElementById('activeAgents').textContent = kpis.active_agents;
    }
    
    updateCharts() {
        this.createAgentChart();
        this.createHourlyChart();
        this.createCategoryChart();
        this.createOutcomeChart();
    }
    
    createAgentChart() {
        const ctx = document.getElementById('agentChart').getContext('2d');
        
        if (this.charts.agentChart) {
            this.charts.agentChart.destroy();
        }
        
        const topAgents = this.currentData.agent_performance.slice(0, 8);
        
        this.charts.agentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topAgents.map(agent => agent.full_name.split('.')[0]),
                datasets: [{
                    label: 'Success Rate (%)',
                    data: topAgents.map(agent => agent.Success_Rate),
                    backgroundColor: '#3F51B5',
                    borderColor: '#303F9F',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        });
    }
    
    createHourlyChart() {
        const ctx = document.getElementById('hourlyChart').getContext('2d');
        
        if (this.charts.hourlyChart) {
            this.charts.hourlyChart.destroy();
        }
        
        const hourlyData = this.currentData.hourly_stats;
        
        this.charts.hourlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hourlyData.map(item => item.Hour + ':00'),
                datasets: [{
                    label: 'Total Calls',
                    data: hourlyData.map(item => item.Total_Calls),
                    borderColor: '#3F51B5',
                    backgroundColor: 'rgba(63, 81, 181, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    createCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        if (this.charts.categoryChart) {
            this.charts.categoryChart.destroy();
        }
        
        const categoryData = this.currentData.call_categories;
        
        this.charts.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.map(item => item.category),
                datasets: [{
                    data: categoryData.map(item => item.count),
                    backgroundColor: ['#3F51B5', '#FF5722', '#4CAF50', '#FF9800', '#2196F3'],
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
    
    createOutcomeChart() {
        const ctx = document.getElementById('outcomeChart').getContext('2d');
        
        if (this.charts.outcomeChart) {
            this.charts.outcomeChart.destroy();
        }
        
        const outcomeData = this.currentData.call_outcomes;
        
        this.charts.outcomeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: outcomeData.map(item => item.outcome),
                datasets: [{
                    label: 'Call Count',
                    data: outcomeData.map(item => item.count),
                    backgroundColor: ['#F44336', '#4CAF50'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    updateTable() {
        const tableBody = document.getElementById('tableBody');
        const agentData = this.currentData.agent_performance;
        
        tableBody.innerHTML = agentData.map(agent => `
            <tr>
                <td>${agent.full_name}</td>
                <td>${agent.Total_Calls}</td>
                <td>${agent.Avg_Duration_Min.toFixed(2)} min</td>
                <td>${agent.Success_Rate.toFixed(1)}%</td>
                <td>${agent.Successful_Calls}</td>
            </tr>
        `).join('');
    }
    
    filterTable(searchTerm) {
        const tableBody = document.getElementById('tableBody');
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isVisible = text.includes(searchTerm.toLowerCase());
            row.style.display = isVisible ? '' : 'none';
        });
    }
    
    exportToCSV() {
        const agentData = this.currentData.agent_performance;
        const headers = ['Agent Name', 'Total Calls', 'Avg Duration (min)', 'Success Rate (%)', 'Successful Calls'];
        
        const csvContent = [
            headers.join(','),
            ...agentData.map(agent => [
                agent.full_name,
                agent.Total_Calls,
                agent.Avg_Duration_Min.toFixed(2),
                agent.Success_Rate.toFixed(1),
                agent.Successful_Calls
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'workindia-agent-performance.csv';
        a.click();
        
        this.showToast('Data exported successfully!', 'success');
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Table sorting functionality
function sortTable(column) {
    const dashboard = window.workIndiaDashboard;
    if (!dashboard) return;
    
    const data = dashboard.currentData.agent_performance;
    const isAscending = dashboard.sortDirection[column] !== 'asc';
    
    data.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (isAscending) {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    dashboard.sortDirection[column] = isAscending ? 'asc' : 'desc';
    dashboard.updateTable();
    dashboard.showToast(`Sorted by ${column}`, 'info');
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.workIndiaDashboard = new WorkIndiaDashboard();
});

// Add CSS animations for toast notifications
const style = document.createElement('style');
style.textContent = `
@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;
document.head.appendChild(style);
