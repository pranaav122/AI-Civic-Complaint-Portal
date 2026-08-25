import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, 
  AreaChart, Area, Legend, ComposedChart
} from 'recharts';
import { Loader2, Calendar, Download } from 'lucide-react';
import StatsCard from '../../components/StatsCard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data fetching. In real app, use api calls.
      const mockData = {
        overview: { total: 1245, resolved: 890, pending: 235, resolutionRate: 71.5, avgTime: 4.2 },
        byCategory: [
          { name: 'Sanitation', count: 450 }, { name: 'Water', count: 320 }, 
          { name: 'Roads', count: 210 }, { name: 'Electricity', count: 180 }, { name: 'Health', count: 85 }
        ],
        priorityDistribution: [
          { name: 'Critical', value: 120 }, { name: 'High', value: 340 }, 
          { name: 'Medium', value: 580 }, { name: 'Low', value: 205 }
        ],
        trends: Array.from({length: 30}, (_, i) => ({
          date: `Day ${i+1}`, new: Math.floor(Math.random() * 20) + 10, resolved: Math.floor(Math.random() * 25) + 5
        })),
        departmentPerformance: [
          { name: 'Sanitation Dept', avgDays: 3.5, total: 400 },
          { name: 'Water Board', avgDays: 4.2, total: 300 },
          { name: 'PWD', avgDays: 6.8, total: 200 },
          { name: 'Electricity Board', avgDays: 2.1, total: 150 }
        ]
      };
      
      // Simulating API delay
      setTimeout(() => {
        setData(mockData);
        setLoading(false);
      }, 500);
      
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <div className="flex h-screen justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select 
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">Total Complaints</div>
          <div className="text-2xl font-bold text-gray-900">{data?.overview.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">Resolved</div>
          <div className="text-2xl font-bold text-green-600">{data?.overview.resolved}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">Pending</div>
          <div className="text-2xl font-bold text-amber-500">{data?.overview.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">Resolution Rate</div>
          <div className="text-2xl font-bold text-blue-600">{data?.overview.resolutionRate}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">Avg Resolution Time</div>
          <div className="text-2xl font-bold text-gray-900">{data?.overview.avgTime} <span className="text-sm font-normal text-gray-500">days</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Volume Trends</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="new" name="New Complaints" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNew)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Complaints by Category</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byCategory} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" tick={{fontSize: 12}} />
                <YAxis dataKey="name" type="category" tick={{fontSize: 12}} width={80} />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                  {data?.byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Priority Distribution</h2>
          <div className="h-72 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data?.priorityDistribution} 
                  cx="50%" cy="50%" 
                  innerRadius={70} outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data?.priorityDistribution.map((entry, index) => {
                    const colors = { 'Critical': '#ef4444', 'High': '#f97316', 'Medium': '#3b82f6', 'Low': '#9ca3af' };
                    return <Cell key={`cell-${index}`} fill={colors[entry.name] || COLORS[index]} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Department Performance</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data?.departmentPerformance} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid stroke="#f5f5f5" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 11}} />
                <YAxis yAxisId="left" orientation="left" tick={{fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="total" name="Total Handled" barSize={20} fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgDays" name="Avg Days to Resolve" stroke="#ef4444" strokeWidth={2} dot={{r: 4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
