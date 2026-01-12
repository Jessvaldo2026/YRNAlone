// FILE: src/components/ExportDataSection.jsx
// 📤 Export Data Section Component

import React, { useState } from 'react';
import ExportService from '../services/ExportService';

const ExportDataSection = ({ user, organizationId }) => {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState('json');

  const handleExportUserData = async () => {
    setExporting(true);
    try {
      const data = await ExportService.exportUserData();
      const filename = `yrnalone-export-${new Date().toISOString().split('T')[0]}`;

      if (exportType === 'json') {
        ExportService.downloadJSON(data, `${filename}.json`);
      } else {
        // For CSV, flatten the data
        const flatData = [
          ...data.journals.map(j => ({ type: 'journal', ...j })),
          ...data.moodHistory.map(m => ({ type: 'mood', ...m })),
          ...data.posts.map(p => ({ type: 'post', ...p }))
        ];
        if (flatData.length > 0) {
          ExportService.downloadCSV(flatData, `${filename}.csv`);
        } else {
          ExportService.downloadJSON(data, `${filename}.json`);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
    setExporting(false);
  };

  const handleExportOrgData = async () => {
    if (!organizationId) return;

    setExporting(true);
    try {
      const data = await ExportService.exportOrganizationData(organizationId);
      const filename = `org-export-${new Date().toISOString().split('T')[0]}`;

      if (exportType === 'json') {
        ExportService.downloadJSON(data, `${filename}.json`);
      } else {
        ExportService.downloadCSV(data.members, `${filename}-members.csv`);
      }
    } catch (error) {
      console.error('Organization export failed:', error);
      alert('Export failed: ' + error.message);
    }
    setExporting(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        📤 Export My Data
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Download all your data including journals, mood history, and profile.
      </p>

      {/* Format Selection */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setExportType('json')}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            exportType === 'json'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          JSON
        </button>
        <button
          onClick={() => setExportType('csv')}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            exportType === 'csv'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          CSV
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleExportUserData}
          disabled={exporting}
          className="w-full bg-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Exporting...
            </>
          ) : (
            <>📥 Download My Data</>
          )}
        </button>

        {organizationId && user?.isOrgAdmin && (
          <button
            onClick={handleExportOrgData}
            disabled={exporting}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>🏢 Export Organization Data</>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Your data is always yours. Export anytime.
      </p>
    </div>
  );
};

export default ExportDataSection;
