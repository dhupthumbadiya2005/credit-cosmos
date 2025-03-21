import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "@/lib/toast";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Search,
  CalendarIcon,
  ArrowUpDown,
  ChevronDown,
  Filter,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface Report {
  id: string;
  date: string;
  applicantName: string;
  loanType: string;
  bureau: string[];
  status: "Approved" | "Pending" | "Rejected";
  risk: "Low" | "Medium" | "High";
}

const generateDummyReports = (): Report[] => {
  const statuses: Array<"Approved" | "Pending" | "Rejected"> = [
    "Approved",
    "Pending",
    "Rejected",
  ];
  
  const risks: Array<"Low" | "Medium" | "High"> = ["Low", "Medium", "High"];
  
  const loanTypes: string[] = [
    "Personal Loan",
    "Mortgage",
    "Auto Loan",
    "Business Loan",
    "Credit Card",
    "Student Loan",
  ];
  
  const bureaus: string[] = ["Experian", "Equifax", "TransUnion", "CIBIL"];
  
  const applicants: string[] = [
    "John Smith",
    "Jane Doe",
    "Michael Johnson",
    "Emma Wilson",
    "Robert Brown",
    "Sarah Davis",
    "David Miller",
    "Linda Garcia",
  ];
  
  return Array.from({ length: 20 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 120));
    
    const selectedBureaus: string[] = [];
    const bureauCount = Math.floor(Math.random() * 3) + 1;
    while (selectedBureaus.length < bureauCount) {
      const bureau = bureaus[Math.floor(Math.random() * bureaus.length)];
      if (!selectedBureaus.includes(bureau)) {
        selectedBureaus.push(bureau);
      }
    }
    
    return {
      id: `REP-${1000 + i}`,
      date: date.toISOString().split("T")[0],
      applicantName: applicants[Math.floor(Math.random() * applicants.length)],
      loanType: loanTypes[Math.floor(Math.random() * loanTypes.length)],
      bureau: selectedBureaus,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      risk: risks[Math.floor(Math.random() * risks.length)],
    };
  });
};

const ReportHistory: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const dummyReports = generateDummyReports();
        setReports(dummyReports);
        setFilteredReports(dummyReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, []);
  
  useEffect(() => {
    let result = [...reports];
    
    if (searchTerm) {
      result = result.filter(
        (report) =>
          report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.applicantName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      result = result.filter((report) => report.date === dateStr);
    }
    
    if (statusFilter !== "all") {
      result = result.filter(
        (report) => report.status.toLowerCase() === statusFilter
      );
    }
    
    if (riskFilter !== "all") {
      result = result.filter(
        (report) => report.risk.toLowerCase() === riskFilter
      );
    }
    
    result.sort((a, b) => {
      if (sortField === "date") {
        return sortDirection === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortField === "name") {
        return sortDirection === "asc"
          ? a.applicantName.localeCompare(b.applicantName)
          : b.applicantName.localeCompare(a.applicantName);
      } else if (sortField === "id") {
        return sortDirection === "asc"
          ? a.id.localeCompare(b.id)
          : b.id.localeCompare(a.id);
      }
      return 0;
    });
    
    setFilteredReports(result);
  }, [reports, searchTerm, selectedDate, statusFilter, riskFilter, sortField, sortDirection]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter((report) => report.id !== reportId));
    toast.success("Report deleted successfully");
  };
  
  const handleDownload = (reportId: string) => {
    toast.success(`Report ${reportId} downloaded successfully`);
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDate(undefined);
    setStatusFilter("all");
    setRiskFilter("all");
    setSortField("date");
    setSortDirection("desc");
  };
  
  const hasActiveFilters = () => {
    return (
      searchTerm !== "" ||
      selectedDate !== undefined ||
      statusFilter !== "all" ||
      riskFilter !== "all" ||
      sortField !== "date" ||
      sortDirection !== "desc"
    );
  };
  
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Low":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Low
          </Badge>
        );
      case "Medium":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Medium
          </Badge>
        );
      case "High":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            High
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Approved
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Pending
          </Badge>
        );
      case "Rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Report History</h1>
          <p className="text-muted-foreground">
            View, download, and manage your credit reports
          </p>
        </div>
        <Button asChild className="button-hover-effect">
          <Link to="/report-submission">
            <FileText className="mr-2 h-4 w-4" /> Submit New Report
          </Link>
        </Button>
      </div>
      
      <Card className="glass-card mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or name..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      selectedDate ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      selectedDate.toLocaleDateString()
                    ) : (
                      "Filter by date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                  {selectedDate && (
                    <div className="p-3 border-t border-border">
                      <Button
                        variant="ghost"
                        className="w-full justify-center text-xs"
                        onClick={() => setSelectedDate(undefined)}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-between w-full"
                  >
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <span className="truncate">
                        {hasActiveFilters() ? "Filters Applied" : "Filters"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Status</div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`rounded-lg px-3 text-xs ${
                            statusFilter === "all"
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
                          onClick={() => setStatusFilter("all")}
                        >
                          All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`rounded-lg px-3 text-xs ${
                            statusFilter === "approved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : ""
                          }`}
                          onClick={() => setStatusFilter("approved")}
                        >
                          Approved
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`rounded-lg px-3 text-xs ${
                            statusFilter === "pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                              : ""
                          }`}
                          onClick={() => setStatusFilter("pending")}
                        >
                          Pending
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`rounded-lg px-3 text-xs ${
                            statusFilter === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : ""
                          }`}
                          onClick={() => setStatusFilter("rejected")}
                        >
                          Rejected
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Risk Level</div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`rounded-lg px-3 text-xs ${
                            riskFilter === "all"
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
                          onClick={() => setRiskFilter("all")}
                        >
                          All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`rounded-lg px-3 text-xs ${
                            riskFilter === "low"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : ""
                          }`}
                          onClick={() => setRiskFilter("low")}
                        >
                          Low
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`rounded-lg px-3 text-xs ${
                            riskFilter === "medium"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                              : ""
                          }`}
                          onClick={() => setRiskFilter("medium")}
                        >
                          Medium
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`rounded-lg px-3 text-xs ${
                            riskFilter === "high"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : ""
                          }`}
                          onClick={() => setRiskFilter("high")}
                        >
                          High
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center"
                        onClick={clearFilters}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Clear all filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex justify-between items-center rounded-lg border border-border px-4 py-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Showing </span>
                <strong>{filteredReports.length}</strong>
                <span className="text-muted-foreground"> of </span>
                <strong>{reports.length}</strong>
                <span className="text-muted-foreground"> reports</span>
              </div>
              {hasActiveFilters() && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={clearFilters}
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card overflow-hidden">
        <CardHeader className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-transparent p-0 h-auto font-medium"
                      onClick={() => handleSort("id")}
                    >
                      Report ID
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-transparent p-0 h-auto font-medium"
                      onClick={() => handleSort("date")}
                    >
                      Date
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-transparent p-0 h-auto font-medium"
                      onClick={() => handleSort("name")}
                    >
                      Applicant
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Loan Type
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Risk
                  </th>
                  <th className="py-3 px-4 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="space-x-1 mb-2">
                          <span className="loading-dot loading-dot-1"></span>
                          <span className="loading-dot loading-dot-2"></span>
                          <span className="loading-dot"></span>
                        </div>
                        <p className="text-muted-foreground">Loading reports...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                        <h3 className="text-lg font-medium mb-1">No reports found</h3>
                        <p className="text-muted-foreground mb-4">
                          {hasActiveFilters()
                            ? "Try adjusting your filters"
                            : "No reports have been submitted yet"}
                        </p>
                        {hasActiveFilters() && (
                          <Button variant="outline" onClick={clearFilters}>
                            <X className="mr-2 h-4 w-4" />
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{report.id}</td>
                      <td className="py-3 px-4">{report.date}</td>
                      <td className="py-3 px-4">{report.applicantName}</td>
                      <td className="py-3 px-4">{report.loanType}</td>
                      <td className="py-3 px-4">{getStatusBadge(report.status)}</td>
                      <td className="py-3 px-4">{getRiskBadge(report.risk)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            asChild
                          >
                            <Link to={`/report-analysis?id=${report.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleDownload(report.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Report
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete report {report.id}? This action cannot be undone.
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
        </CardHeader>
      </Card>
    </div>
  );
};

export default ReportHistory;
