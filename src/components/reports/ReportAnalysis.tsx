
import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "@/lib/toast";
import {
  Download,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Chatbot from "@/components/chatbot/Chatbot";
import ReactMarkdown from 'react-markdown';

// Add ReactMarkdown dependency
<lov-add-dependency>react-markdown@latest</lov-add-dependency>

interface ReportData {
  report_id: string;
  initial_context: string;
  text_paragraph_markdown?: string;
  other_json_data?: any;
  created_at?: string;
}

const ReportAnalysis: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const reportId = queryParams.get("id") || "";
  
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (reportId && user) {
      fetchReportData(reportId);
    }
  }, [reportId, user]);
  
  const fetchReportData = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('report_id', id)
        .eq('user_id', user?.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setReport(data as ReportData);
      } else {
        toast.error("Report not found");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    toast.success("Report downloaded successfully");
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="space-y-3 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
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
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Button variant="ghost" size="sm" className="mr-1" asChild>
              <Link to="/report-history">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Credit Report Analysis</h1>
          <p className="text-muted-foreground">
            Report ID: {report.report_id}
          </p>
        </div>
        <Button onClick={handleDownload} className="button-hover-effect">
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>
      
      <div className="space-y-6 mb-20">
        {/* Original Query */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">Original Query</h2>
            <p className="text-muted-foreground">{report.initial_context}</p>
          </CardContent>
        </Card>
        
        {/* Analysis Results (Markdown) */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Analysis Results</h2>
            {report.text_paragraph_markdown ? (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>
                  {report.text_paragraph_markdown}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="p-4 text-center border rounded-lg border-border">
                <p className="text-muted-foreground">No analysis results available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Additional Data Section */}
        {report.other_json_data && Object.keys(report.other_json_data).length > 0 && (
          <Card className="glass-card">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">Additional Data</h2>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(report.other_json_data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Chatbot Component */}
      <Chatbot reportId={report.report_id} />
    </div>
  );
};

export default ReportAnalysis;
