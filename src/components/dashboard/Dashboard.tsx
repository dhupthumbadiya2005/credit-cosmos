
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  Eye,
  Download,
  Trash2,
  ArrowRight,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";

interface Report {
  id: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchRecentReports();
    }
  }, [user]);

  const fetchRecentReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('report_id')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        throw error;
      }

      if (data) {
        setRecentReports(data.map(report => ({ id: report.report_id })));
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (reportId: string) => {
    toast.success(`Report ${reportId} downloaded successfully`);
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('report_id', reportId)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      // Update local state
      setRecentReports(recentReports.filter((report) => report.id !== reportId));
      toast.success("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Section / Landing Page */}
      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Multi-Bureau Credit Risk Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            CrediSphere provides financial institutions with real-time risk insights, 
            dynamic API integration, and seamless credit assessment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Comprehensive Reports</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Analyze credit data from multiple bureaus in one comprehensive report.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Dynamic API Integration</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Seamlessly connect with multiple credit bureaus through our API system.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    <Eye className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Get intelligent analysis and recommendations based on credit data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button asChild size="lg" className="button-hover-effect px-8 py-6 text-lg">
            <Link to="/report-submission">
              <Upload className="mr-2 h-5 w-5" /> Analyze New Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Reports Section */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Report ID
                  </th>
                  <th className="py-3 px-4 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-muted-foreground">
                      Loading reports...
                    </td>
                  </tr>
                ) : recentReports.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-muted-foreground">
                      No reports available
                    </td>
                  </tr>
                ) : (
                  recentReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{report.id}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg"
                            asChild
                          >
                            <Link to={`/report-analysis?id=${report.id}`}>
                              <Eye className="mr-1.5 h-4 w-4" /> View
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg"
                            onClick={() => handleDownload(report.id)}
                          >
                            <Download className="mr-1.5 h-4 w-4" /> Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
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
