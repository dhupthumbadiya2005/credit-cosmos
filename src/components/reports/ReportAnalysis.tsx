import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "@/lib/toast";
import {
  Download,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  User,
  Calendar,
  BarChart4,
  PieChart,
  AlertCircle,
} from "lucide-react";

interface ReportData {
  id: string;
  date: string;
  applicantName: string;
  loanType: string;
  documentType: string;
  bureauScores: {
    bureau: string;
    score: number;
    color: string;
  }[];
  creditHistory: {
    length: number; // in months
    accounts: number;
    latePayments: number;
    derogatoryMarks: number;
  };
  liabilities: {
    totalBalance: number;
    monthlyPayments: number;
    utilization: number;
  };
  riskAnalysis: {
    overall: "Low" | "Medium" | "High";
    score: number;
    factors: {
      name: string;
      impact: "Positive" | "Negative" | "Neutral";
      description: string;
    }[];
  };
  insights: string[];
}

const generateDummyReport = (reportId: string): ReportData => {
  const bureaus = ["Experian", "Equifax", "TransUnion", "CIBIL"];
  const colors = ["#3498db", "#2ecc71", "#9b59b6", "#e67e22"];
  const loanTypes = ["Personal Loan", "Mortgage", "Auto Loan", "Business Loan"];
  const documentTypes = ["Credit Report", "Bank Statement", "Income Proof"];
  
  const bureauScores = bureaus.map((bureau, index) => ({
    bureau,
    score: Math.floor(Math.random() * 150) + 680,
    color: colors[index],
  }));
  
  const avgScore = Math.floor(
    bureauScores.reduce((sum, b) => sum + b.score, 0) / bureauScores.length
  );
  
  let riskLevel: "Low" | "Medium" | "High";
  let riskScore: number;
  
  if (avgScore > 750) {
    riskLevel = "Low";
    riskScore = Math.floor(Math.random() * 20) + 80;
  } else if (avgScore > 700) {
    riskLevel = "Medium";
    riskScore = Math.floor(Math.random() * 30) + 50;
  } else {
    riskLevel = "High";
    riskScore = Math.floor(Math.random() * 50);
  }
  
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  const formattedDate = date.toISOString().split("T")[0];
  
  return {
    id: reportId,
    date: formattedDate,
    applicantName: ["John Smith", "Jane Doe", "Michael Johnson", "Emma Wilson"][
      Math.floor(Math.random() * 4)
    ],
    loanType: loanTypes[Math.floor(Math.random() * loanTypes.length)],
    documentType: documentTypes[Math.floor(Math.random() * documentTypes.length)],
    bureauScores,
    creditHistory: {
      length: Math.floor(Math.random() * 120) + 24,
      accounts: Math.floor(Math.random() * 10) + 2,
      latePayments: Math.floor(Math.random() * 4),
      derogatoryMarks: Math.floor(Math.random() * 2),
    },
    liabilities: {
      totalBalance: Math.floor(Math.random() * 150000) + 5000,
      monthlyPayments: Math.floor(Math.random() * 2000) + 200,
      utilization: Math.floor(Math.random() * 70) + 10,
    },
    riskAnalysis: {
      overall: riskLevel,
      score: riskScore,
      factors: [
        {
          name: "Length of Credit History",
          impact: Math.random() > 0.3 ? "Positive" : "Neutral",
          description: "Long credit history demonstrates stability.",
        },
        {
          name: "Payment History",
          impact:
            Math.random() > 0.7
              ? "Positive"
              : Math.random() > 0.4
              ? "Neutral"
              : "Negative",
          description:
            Math.random() > 0.7
              ? "Excellent payment history with no late payments."
              : "Some late payments detected in credit history.",
        },
        {
          name: "Credit Utilization",
          impact:
            Math.random() > 0.6
              ? "Positive"
              : Math.random() > 0.3
              ? "Neutral"
              : "Negative",
          description:
            Math.random() > 0.6
              ? "Low credit utilization ratio is favorable."
              : "High credit utilization may indicate financial stress.",
        },
        {
          name: "Recent Credit Inquiries",
          impact:
            Math.random() > 0.8
              ? "Positive"
              : Math.random() > 0.5
              ? "Neutral"
              : "Negative",
          description:
            Math.random() > 0.7
              ? "Few recent credit inquiries."
              : "Multiple recent credit inquiries may indicate credit seeking behavior.",
        },
      ],
    },
    insights: [
      "Overall credit profile indicates good financial management.",
      "The applicant's debt-to-income ratio is within acceptable limits.",
      "Credit history shows consistency in payment patterns.",
      "Additional collateral may strengthen the application for higher loan amounts.",
      "Low credit utilization indicates responsible credit management.",
    ],
  };
};

const ReportAnalysis: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const reportId = queryParams.get("id") || "REP-0000";
  
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const dummyReport = generateDummyReport(reportId);
        setReport(dummyReport);
      } catch (error) {
        console.error("Error fetching report:", error);
        toast.error("Failed to load report data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReportData();
  }, [reportId]);
  
  const handleDownload = () => {
    toast.success("Report downloaded successfully");
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="space-y-3 text-center">
          <div className="animate-pulse flex space-x-2 justify-center">
            <div className="loading-dot loading-dot-1"></div>
            <div className="loading-dot loading-dot-2"></div>
            <div className="loading-dot"></div>
          </div>
          <p className="text-muted-foreground">Loading report analysis...</p>
        </div>
      </div>
    );
  }
  
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
        <p className="text-muted-foreground mb-4">
          We couldn't find the report you're looking for.
        </p>
        <Button asChild>
          <Link to="/report-history">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Report History
          </Link>
        </Button>
      </div>
    );
  }
  
  const bureauScoreData = report.bureauScores.map((bureau) => ({
    name: bureau.bureau,
    value: bureau.score,
    color: bureau.color,
  }));
  
  const avgScore = Math.floor(
    report.bureauScores.reduce((sum, bureau) => sum + bureau.score, 0) /
      report.bureauScores.length
  );
  
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "Low":
        return <Shield className="h-5 w-5 text-green-500" />;
      case "Medium":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "High":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "Positive":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800">
            Positive
          </Badge>
        );
      case "Negative":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800">
            Negative
          </Badge>
        );
      case "Neutral":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800">
            Neutral
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const getScoreCategory = (score: number) => {
    if (score >= 750) return "Excellent";
    if (score >= 700) return "Good";
    if (score >= 650) return "Fair";
    if (score >= 600) return "Poor";
    return "Very Poor";
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-500";
    if (score >= 700) return "text-green-600";
    if (score >= 650) return "text-amber-500";
    if (score >= 600) return "text-orange-500";
    return "text-red-500";
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Button variant="ghost" size="sm" className="mr-1" asChild>
              <Link to="/report-history">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Link>
            </Button>
            <Badge variant="outline" className="backdrop-blur bg-primary/10 text-primary">
              {report.id}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Credit Report Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive credit analysis for {report.applicantName}
          </p>
        </div>
        <Button onClick={handleDownload} className="button-hover-effect">
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Applicant</p>
              <p className="font-medium">{report.applicantName}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="font-medium">{report.date}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Loan Type</p>
              <p className="font-medium">{report.loanType}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              {getRiskIcon(report.riskAnalysis.overall)}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
              <p
                className={`font-medium ${
                  report.riskAnalysis.overall === "Low"
                    ? "text-green-500"
                    : report.riskAnalysis.overall === "Medium"
                    ? "text-amber-500"
                    : "text-red-500"
                }`}
              >
                {report.riskAnalysis.overall}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 mx-auto max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bureaus">Bureau Scores</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart4 className="h-5 w-5 mr-2 text-primary" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Overall Risk Level
                  </div>
                  <div className="flex items-center">
                    {getRiskIcon(report.riskAnalysis.overall)}
                    <span
                      className={`ml-1.5 font-bold ${
                        report.riskAnalysis.overall === "Low"
                          ? "text-green-500"
                          : report.riskAnalysis.overall === "Medium"
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {report.riskAnalysis.overall} Risk
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Risk Score
                  </div>
                  <div className="text-xl font-bold">{report.riskAnalysis.score}</div>
                </div>
              </div>
              
              <Progress
                value={report.riskAnalysis.score}
                className="h-2 mb-4"
                indicatorClassName={
                  report.riskAnalysis.overall === "Low"
                    ? "bg-green-500"
                    : report.riskAnalysis.overall === "Medium"
                    ? "bg-amber-500"
                    : "bg-red-500"
                }
              />
              
              <div className="space-y-3 mt-6">
                <h4 className="text-sm font-medium">Risk Factors</h4>
                {report.riskAnalysis.factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border flex items-start justify-between"
                  >
                    <div>
                      <div className="font-medium mb-1">{factor.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {factor.description}
                      </div>
                    </div>
                    <div>{getImpactBadge(factor.impact)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Credit History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      Length of Credit History
                    </div>
                    <div className="font-medium">
                      {Math.floor(report.creditHistory.length / 12)} years, {report.creditHistory.length % 12} months
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      Active Accounts
                    </div>
                    <div className="font-medium">{report.creditHistory.accounts}</div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      Late Payments
                    </div>
                    <div className="font-medium">
                      {report.creditHistory.latePayments === 0 ? (
                        <span className="flex items-center text-green-500">
                          <CheckCircle className="h-4 w-4 mr-1" /> None
                        </span>
                      ) : (
                        <span className="text-amber-500">
                          {report.creditHistory.latePayments}
                        </span>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      Derogatory Marks
                    </div>
                    <div className="font-medium">
                      {report.creditHistory.derogatoryMarks === 0 ? (
                        <span className="flex items-center text-green-500">
                          <CheckCircle className="h-4 w-4 mr-1" /> None
                        </span>
                      ) : (
                        <span className="text-red-500">
                          {report.creditHistory.derogatoryMarks}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Financial Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      Total Balance
                    </div>
                    <div className="font-medium">
                      ${report.liabilities.totalBalance.toLocaleString()}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      Monthly Payments
                    </div>
                    <div className="font-medium">
                      ${report.liabilities.monthlyPayments.toLocaleString()}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      Credit Utilization
                    </div>
                    <div className="font-medium">
                      <span
                        className={
                          report.liabilities.utilization <= 30
                            ? "text-green-500"
                            : report.liabilities.utilization <= 50
                            ? "text-amber-500"
                            : "text-red-500"
                        }
                      >
                        {report.liabilities.utilization}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress
                      value={report.liabilities.utilization}
                      className="h-1.5"
                      indicatorClassName={
                        report.liabilities.utilization <= 30
                          ? "bg-green-500"
                          : report.liabilities.utilization <= 50
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">0%</span>
                      <span className="text-xs text-muted-foreground">100%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="bureaus" className="space-y-6">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-primary" />
                  Credit Bureau Scores
                </CardTitle>
                <div className="flex items-center text-muted-foreground text-sm">
                  <span className="font-medium mr-2">Average Score:</span>
                  <span className={`${getScoreColor(avgScore)} font-bold`}>
                    {avgScore}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {getScoreCategory(avgScore)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <Pie>
                      <PieComponent
                        data={bureauScoreData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={{ stroke: "#8884d8", strokeWidth: 1 }}
                        dataKey="value"
                      >
                        {bureauScoreData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                          />
                        ))}
                      </PieComponent>
                    </Pie>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  {report.bureauScores.map((bureau) => (
                    <div key={bureau.bureau} className="p-4 rounded-lg border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{bureau.bureau}</div>
                        <div className="flex items-center">
                          <span
                            className={`${getScoreColor(bureau.score)} font-bold text-lg`}
                          >
                            {bureau.score}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {getScoreCategory(bureau.score)}
                          </Badge>
                        </div>
                      </div>
                      <Progress
                        value={(bureau.score / 850) * 100}
                        className="h-1.5"
                        indicatorClassName={`bg-[${bureau.color}]`}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">300</span>
                        <span className="text-xs text-muted-foreground">850</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-border">
                <h4 className="text-sm font-medium mb-2">Understanding Credit Scores</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium text-foreground">Excellent (750-850):</span> Exceptional creditworthiness, typically qualifies for the best rates.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Good (700-749):</span> Above-average creditworthiness, generally qualifies for favorable rates.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Fair (650-699):</span> Average creditworthiness, may qualify for standard rates.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Poor (600-649):</span> Below-average creditworthiness, may face higher rates.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Very Poor (300-599):</span> Significant credit issues, likely to face high rates or be declined.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border flex items-start"
                  >
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <p>{insight}</p>
                  </div>
                ))}
                
                <div className="p-4 mt-4 rounded-lg bg-primary/5 border border-border">
                  <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Maintain low credit utilization by keeping balances below 30% of limits.
                    </p>
                    <p className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Continue making on-time payments to maintain positive payment history.
                    </p>
                    <p className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Consider consolidating high-interest debt to reduce overall interest costs.
                    </p>
                    <p className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Monitor credit reports regularly to ensure accuracy and detect potential fraud.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>Disclaimer:</strong> This analysis is based on the information provided in the credit report and is intended for informational purposes only.
                </p>
                <p>
                  The recommendations and insights provided should not be considered as financial advice. Please consult with a qualified financial advisor before making any financial decisions.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportAnalysis;

