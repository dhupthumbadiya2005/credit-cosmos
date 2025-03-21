
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Upload,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, PieChart as Pie, LineChart as Line } from "recharts";
import { Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie as PieComponent, Sector, Line as LineComponent } from "recharts";

// Dummy data for charts
const bureauScores = [
  { name: "Experian", score: 725, color: "#3498db" },
  { name: "Equifax", score: 710, color: "#2ecc71" },
  { name: "TransUnion", score: 733, color: "#9b59b6" },
  { name: "CIBIL", score: 718, color: "#e67e22" },
];

const riskDistribution = [
  { name: "Low Risk", value: 65, color: "#2ecc71" },
  { name: "Medium Risk", value: 25, color: "#f39c12" },
  { name: "High Risk", value: 10, color: "#e74c3c" },
];

const monthlyActivity = [
  { name: "Jan", reports: 12, avgScore: 720 },
  { name: "Feb", reports: 15, avgScore: 710 },
  { name: "Mar", reports: 18, avgScore: 715 },
  { name: "Apr", reports: 22, avgScore: 725 },
  { name: "May", reports: 25, avgScore: 722 },
  { name: "Jun", reports: 30, avgScore: 730 },
];

const recentReports = [
  {
    id: "REP-1234",
    date: "2023-06-01",
    applicant: "John Smith",
    status: "Approved",
    risk: "Low",
  },
  {
    id: "REP-1235",
    date: "2023-06-02",
    applicant: "Jane Doe",
    status: "Pending",
    risk: "Medium",
  },
  {
    id: "REP-1236",
    date: "2023-06-03",
    applicant: "Bob Johnson",
    status: "Rejected",
    risk: "High",
  },
  {
    id: "REP-1237",
    date: "2023-06-04",
    applicant: "Alice Brown",
    status: "Approved",
    risk: "Low",
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeStatusTab, setActiveStatusTab] = useState<string>("all");

  // Filter reports based on active tab
  const filteredReports = recentReports.filter((report) => {
    if (activeStatusTab === "all") return true;
    if (activeStatusTab === "approved") return report.status === "Approved";
    if (activeStatusTab === "pending") return report.status === "Pending";
    if (activeStatusTab === "rejected") return report.status === "Rejected";
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "Rejected":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Low":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Low
          </span>
        );
      case "Medium":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Medium
          </span>
        );
      case "High":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            High
          </span>
        );
      default:
        return null;
    }
  };

  const averageScore = Math.round(
    bureauScores.reduce((sum, bureau) => sum + bureau.score, 0) / bureauScores.length
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user?.organization}</h1>
          <p className="text-muted-foreground">
            Here's your credit risk analysis overview
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild className="button-hover-effect">
            <Link to="/report-submission">
              <Upload className="mr-2 h-4 w-4" /> Submit New Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Credit Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{averageScore}</div>
              <TrendingUp
                className={`h-4 w-4 ${
                  averageScore > 700 ? "text-green-500" : "text-amber-500"
                }`}
              />
            </div>
            <Progress
              value={(averageScore / 850) * 100}
              className="h-1 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Across all credit bureaus
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">124</div>
              <div className="text-xs text-green-500 flex items-center">
                +12% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
            <Progress value={65} className="h-1 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Last 30 days: 24 new reports
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">72%</div>
              <div className="text-xs text-green-500 flex items-center">
                +4% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
            <Progress value={72} className="h-1 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Based on recent analysis
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">Low</div>
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full px-2 py-1">
                Optimal
              </div>
            </div>
            <Progress value={20} className="h-1 mt-2 bg-red-100 dark:bg-red-900">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "20%" }} />
            </Progress>
            <p className="text-xs text-muted-foreground mt-2">
              System risk assessment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bureau Scores Chart */}
        <Card className="glass-card col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Bureau Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bureauScores}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[600, 850]} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(255,255,255,0.9)", 
                      border: "none", 
                      borderRadius: "8px", 
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "12px"
                    }} 
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {bureauScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution Chart */}
        <Card className="glass-card col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-primary" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <Pie>
                  <PieComponent
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </PieComponent>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(255,255,255,0.9)", 
                      border: "none", 
                      borderRadius: "8px", 
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "12px"
                    }} 
                  />
                  <Legend />
                </Pie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Activity Chart */}
        <Card className="glass-card col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <LineChart className="h-5 w-5 mr-2 text-primary" />
              Monthly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <Line>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis yAxisId="left" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(255,255,255,0.9)", 
                      border: "none", 
                      borderRadius: "8px", 
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "12px"
                    }} 
                  />
                  <Legend />
                  <LineComponent
                    yAxisId="left"
                    type="monotone"
                    dataKey="reports"
                    stroke="#3498db"
                    activeDot={{ r: 8 }}
                  />
                  <LineComponent
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#2ecc71"
                    activeDot={{ r: 8 }}
                  />
                </Line>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports Section */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <CardTitle className="text-lg">Recent Reports</CardTitle>
            <div className="flex space-x-1 mt-2 md:mt-0">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-lg px-3 text-xs ${
                  activeStatusTab === "all"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveStatusTab("all")}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-lg px-3 text-xs ${
                  activeStatusTab === "approved"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveStatusTab("approved")}
              >
                Approved
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-lg px-3 text-xs ${
                  activeStatusTab === "pending"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveStatusTab("pending")}
              >
                Pending
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-lg px-3 text-xs ${
                  activeStatusTab === "rejected"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveStatusTab("rejected")}
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Report ID
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Applicant
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Risk
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{report.id}</td>
                    <td className="py-3 px-4">{report.date}</td>
                    <td className="py-3 px-4">{report.applicant}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(report.status)}
                        <span className="ml-1.5">{report.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRiskBadge(report.risk)}</td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg"
                        asChild
                      >
                        <Link to={`/report-analysis?id=${report.id}`}>
                          View <ArrowRight className="ml-1.5 h-3 w-3" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-muted-foreground">
                      No reports matching the selected filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 text-center border-t border-border">
            <Button variant="ghost" asChild>
              <Link to="/report-history">
                View All Reports <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
