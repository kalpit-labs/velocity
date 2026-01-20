import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getFieldAnalysis, getAggregateData } from '../services/api';
import Loading from '../components/common/Loading';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

const Analytics = () => {
  const { dbName, collName } = useParams();
  const [fieldAnalysis, setFieldAnalysis] = useState(null);
  const [aggregateData, setAggregateData] = useState(null);
  const [selectedField, setSelectedField] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFieldAnalysis();
  }, [dbName, collName]);

  useEffect(() => {
    if (selectedField) {
      fetchAggregateData(selectedField);
    }
  }, [selectedField]);

  const fetchFieldAnalysis = async () => {
    try {
      setLoading(true);
      const response = await getFieldAnalysis(dbName, collName);
      setFieldAnalysis(response.data);

      // Auto-select first non-_id field
      const firstField = response.data.fields.find(f => f.name !== '_id');
      if (firstField) {
        setSelectedField(firstField.name);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching field analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAggregateData = async (field) => {
    try {
      const response = await getAggregateData(dbName, collName, {
        groupBy: field,
        metric: 'count'
      });
      setAggregateData(response.data);
    } catch (err) {
      console.error('Error fetching aggregate data:', err);
    }
  };

  if (loading) return <Loading message="Analyzing data..." />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
      </div>
    );
  }

  const fieldTypeData = fieldAnalysis?.fields.reduce((acc, field) => {
    field.types.forEach(type => {
      const existing = acc.find(item => item.name === type);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: type, value: 1 });
      }
    });
    return acc;
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">{decodeURIComponent(collName)}</p>
      </div>

      {/* Field Analysis Summary */}
      {fieldAnalysis && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Field Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Total Fields</div>
              <div className="text-2xl font-bold text-blue-600">{fieldAnalysis.fields.length}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Sample Size</div>
              <div className="text-2xl font-bold text-green-600">{fieldAnalysis.sampleSize}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">Total Documents</div>
              <div className="text-2xl font-bold text-purple-600">{fieldAnalysis.totalDocuments.toLocaleString()}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presence</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fieldAnalysis.fields.map((field) => (
                  <tr key={field.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{field.primaryType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{field.presence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Field Type Distribution */}
      {fieldTypeData && fieldTypeData.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Field Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fieldTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {fieldTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Value Distribution */}
      {fieldAnalysis && fieldAnalysis.fields.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Value Distribution by Field</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Field</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="input w-full max-w-md"
            >
              {fieldAnalysis.fields.map((field) => (
                <option key={field.name} value={field.name}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>

          {aggregateData && aggregateData.length > 0 && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={aggregateData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0088FE" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {aggregateData && aggregateData.length === 0 && (
            <p className="text-gray-600 text-center py-8">No data available for this field</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
