// FILE: src/services/reportService.js
// 📄 Report generation for enterprise - exportable PDF/CSV

import { getOrgDashboardData, getOrgMoodAnalytics, getOrgEngagement } from './analyticsService';
import { getOrgTherapists } from './therapistService';

// Generate weekly summary report data
export const generateWeeklyReport = async (organizationId, orgName) => {
  const dashboardData = await getOrgDashboardData(organizationId);
  const therapists = await getOrgTherapists(organizationId);

  if (!dashboardData.success) {
    throw new Error('Failed to fetch data');
  }

  const { moodAnalytics, engagement, alerts } = dashboardData.data;

  return {
    title: `Weekly Wellness Report - ${orgName}`,
    period: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    generatedAt: new Date().toISOString(),
    
    summary: {
      totalMembers: engagement.totalMembers,
      activeThisWeek: engagement.activeThisWeek,
      engagementRate: `${engagement.engagementRate}%`,
      avgMoodScore: `${moodAnalytics.avgMoodScore}/10`,
      weekOverWeekChange: `${moodAnalytics.weekOverWeek > 0 ? '+' : ''}${moodAnalytics.weekOverWeek}%`
    },

    engagement: {
      activeToday: engagement.activeToday,
      activeThisWeek: engagement.activeThisWeek,
      inactive: engagement.inactive,
      totalJournalEntries: engagement.totalJournalEntries,
      totalPosts: engagement.totalPosts
    },

    moodInsights: {
      averageScore: moodAnalytics.avgMoodScore,
      totalCheckIns: moodAnalytics.totalCheckIns,
      distribution: moodAnalytics.moodDistribution
    },

    alerts: {
      total: alerts.totalAlerts,
      items: alerts.alerts.slice(0, 10)
    },

    therapists: {
      total: therapists.length,
      list: therapists.map(t => ({
        name: t.name,
        title: t.title,
        assignedCount: t.assignedMembers?.length || 0
      }))
    }
  };
};

// Generate monthly comprehensive report
export const generateMonthlyReport = async (organizationId, orgName) => {
  const moodAnalytics = await getOrgMoodAnalytics(organizationId, 30);
  const engagement = await getOrgEngagement(organizationId);
  const therapists = await getOrgTherapists(organizationId);

  const recommendations = generateRecommendations(moodAnalytics, engagement);

  return {
    title: `Monthly Wellness Report - ${orgName}`,
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    generatedAt: new Date().toISOString(),

    summary: {
      totalMembers: engagement.totalMembers,
      activeThisWeek: engagement.activeThisWeek,
      engagementRate: `${engagement.engagementRate}%`,
      avgMoodScore: `${moodAnalytics.avgMoodScore}/10`,
      weekOverWeekChange: `${moodAnalytics.weekOverWeek > 0 ? '+' : ''}${moodAnalytics.weekOverWeek}%`,
      totalJournalEntries: engagement.totalJournalEntries,
      atRiskCount: engagement.atRiskCount
    },

    moodDistribution: moodAnalytics.moodDistribution,

    recommendations,

    therapists: therapists.map(t => ({
      name: t.name,
      title: t.title,
      specialties: t.specialties,
      caseload: t.assignedMembers?.length || 0
    }))
  };
};

// Generate smart recommendations based on data
const generateRecommendations = (mood, engagement) => {
  const recommendations = [];

  if (parseFloat(engagement.engagementRate) < 50) {
    recommendations.push({
      priority: 'high',
      area: 'Engagement',
      insight: `Only ${engagement.engagementRate}% of members were active this week`,
      action: 'Consider sending engagement reminders or launching a wellness challenge'
    });
  }

  if (mood.avgMoodScore < 5) {
    recommendations.push({
      priority: 'high',
      area: 'Wellness',
      insight: `Average mood score is ${mood.avgMoodScore}/10, below healthy threshold`,
      action: 'Review support resources and consider additional wellness initiatives'
    });
  }

  if (engagement.atRiskCount > 0) {
    recommendations.push({
      priority: 'medium',
      area: 'Retention',
      insight: `${engagement.atRiskCount} members showing disengagement patterns`,
      action: 'Reach out to inactive members with personalized check-ins'
    });
  }

  if (mood.weekOverWeek < -10) {
    recommendations.push({
      priority: 'medium',
      area: 'Trend',
      insight: `Mood scores declined ${Math.abs(mood.weekOverWeek)}% from last week`,
      action: 'Investigate potential causes and increase support availability'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'low',
      area: 'General',
      insight: 'Metrics are healthy across all areas',
      action: 'Continue current wellness programs and monitor for changes'
    });
  }

  return recommendations;
};

// Convert report to CSV format
export const reportToCSV = (report) => {
  const lines = [];
  
  lines.push(`"${report.title}"`);
  lines.push(`"Generated: ${new Date(report.generatedAt).toLocaleString()}"`);
  lines.push(`"Period: ${report.period.start} to ${report.period.end}"`);
  lines.push('');
  
  lines.push('"SUMMARY"');
  lines.push('"Metric","Value"');
  
  Object.entries(report.summary).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    lines.push(`"${label}","${value}"`);
  });
  lines.push('');

  if (report.moodDistribution) {
    lines.push('"MOOD DISTRIBUTION"');
    lines.push('"Mood","Count"');
    Object.entries(report.moodDistribution).forEach(([mood, count]) => {
      lines.push(`"${mood}","${count}"`);
    });
    lines.push('');
  }

  if (report.therapists) {
    lines.push('"THERAPISTS"');
    lines.push('"Name","Title","Caseload"');
    report.therapists.forEach(t => {
      lines.push(`"${t.name}","${t.title || ''}","${t.caseload || t.assignedCount || 0}"`);
    });
  }

  return lines.join('\n');
};

// Generate downloadable report
export const downloadReport = (report, format = 'json') => {
  let content, filename, type;

  if (format === 'csv') {
    content = reportToCSV(report);
    filename = `wellness-report-${report.period.end}.csv`;
    type = 'text/csv';
  } else {
    content = JSON.stringify(report, null, 2);
    filename = `wellness-report-${report.period.end}.json`;
    type = 'application/json';
  }

  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Generate printable HTML report
export const generatePrintableReport = (report) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${report.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #7C3AED; border-bottom: 3px solid #7C3AED; padding-bottom: 10px; }
    h2 { color: #4B5563; margin-top: 30px; }
    .period { color: #6B7280; font-size: 14px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { background: linear-gradient(135deg, #F3E8FF, #FCE7F3); padding: 20px; border-radius: 12px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #7C3AED; }
    .stat-label { color: #6B7280; font-size: 14px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E5E7EB; }
    th { background: #F9FAFB; font-weight: 600; }
    .recommendation { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #F59E0B; }
    .recommendation.high { background: #FEE2E2; border-color: #EF4444; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #9CA3AF; font-size: 12px; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>📊 ${report.title}</h1>
  <p class="period">Period: ${report.period.start} to ${report.period.end}</p>
  
  <h2>Executive Summary</h2>
  <div class="summary-grid">
    <div class="stat-card">
      <div class="stat-value">${report.summary.totalMembers}</div>
      <div class="stat-label">Total Members</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.summary.avgMoodScore}</div>
      <div class="stat-label">Avg Wellness Score</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.summary.engagementRate}</div>
      <div class="stat-label">Engagement Rate</div>
    </div>
  </div>

  ${report.recommendations ? `
  <h2>Recommendations</h2>
  ${report.recommendations.map(r => `
    <div class="recommendation ${r.priority}">
      <strong>${r.area}:</strong> ${r.insight}<br>
      <em>Action: ${r.action}</em>
    </div>
  `).join('')}
  ` : ''}

  ${report.therapists && report.therapists.length > 0 ? `
  <h2>Therapist Directory</h2>
  <table>
    <tr><th>Name</th><th>Title</th><th>Caseload</th></tr>
    ${report.therapists.map(t => `
      <tr>
        <td>${t.name}</td>
        <td>${t.title || '-'}</td>
        <td>${t.caseload || t.assignedCount || 0} members</td>
      </tr>
    `).join('')}
  </table>
  ` : ''}

  <div class="footer">
    Generated by YRNAlone Enterprise • ${new Date(report.generatedAt).toLocaleString()}
  </div>
</body>
</html>
  `;
};

// Open printable report in new window
export const printReport = (report) => {
  const html = generatePrintableReport(report);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};