
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "@/lib/toast";
import {
  Download,
  Eye,
  Trash2,
  Search,
  X,
  CalendarIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Report {
  id: string;
  date: string;
}

const ReportHistory: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('reports')
        .select('report_id, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setReports(data.map(report => ({
          id: report.report_id,
          date: new Date(report.created_at).toISOString().split('T')[0]
        })));
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
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
      setReports(reports.filter(report => report.id !== reportId));
      toast.success("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  const handleDownload = (reportId: string) => {
    toast.success(`Report ${reportId} downloaded successfully`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFromDate(undefined);
    setToDate(undefined);
  };

  const filteredReports = reports.filter(report => {
    // Filter by search term
    const matchesSearch = searchTerm
      ? report.id.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    // Filter by date range
    let matchesFromDate = true;
    let matchesToDate = true;
    
    if (fromDate) {
      const reportDate = new Date(report.date);
      matchesFromDate = reportDate >= fromDate;
    }
    
    if (toDate) {
      const reportDate = new Date(report.date);
      // Add one day to include the end date
      const endDate = new Date(toDate);
      endDate.setDate(endDate.getDate() + 1);
      matchesToDate = reportDate <= endDate;
    }
    
    return matchesSearch && matchesFromDate && matchesToDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Report History</h1>
          <p className="text-muted-foreground">View and manage your credit analysis reports</p>
        </div>
        <Button asChild className="button-hover-effect">
          <Link to="/report-submission">
            Create New Report
          </Link>
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "PPP") : "From Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                />
                <div className="flex justify-end gap-2 p-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFromDate(undefined)}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => document.body.click()} // Close the popover
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "PPP") : "To Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                />
                <div className="flex justify-end gap-2 p-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setToDate(undefined)}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => document.body.click()} // Close the popover
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            {(searchTerm || fromDate || toDate) && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">All Reports</CardTitle>
            <span className="text-sm text-muted-foreground">
              {filteredReports.length} {filteredReports.length === 1 ? "report" : "reports"}
            </span>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Report ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-muted-foreground">Loading reports...</p>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8">
                    <p className="text-muted-foreground mb-2">No reports found</p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/report-submission">Create a new report</Link>
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-border hover:bg-accent/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium">{report.id}</span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {report.date}
                    </td>
                    <td className="py-4 px-4">
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirm Deletion
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this report? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReport(report.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ReportHistory;
