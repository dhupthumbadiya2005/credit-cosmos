import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { Upload, FileText, AlertCircle, Check, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreditBureau {
  id: string;
  name: string;
}

interface LoanType {
  id: string;
  name: string;
}

interface DocumentType {
  id: string;
  name: string;
}

const bureaus: CreditBureau[] = [
  { id: "experian", name: "Experian" },
  { id: "equifax", name: "Equifax" },
  { id: "transunion", name: "TransUnion" },
  { id: "cibil", name: "CIBIL" },
  { id: "dun-bradstreet", name: "Dun & Bradstreet" },
];

const loanTypes: LoanType[] = [
  { id: "personal", name: "Personal Loan" },
  { id: "mortgage", name: "Mortgage" },
  { id: "auto", name: "Auto Loan" },
  { id: "business", name: "Business Loan" },
  { id: "education", name: "Education Loan" },
  { id: "credit-card", name: "Credit Card" },
];

const documentTypes: DocumentType[] = [
  { id: "credit-report", name: "Credit Report" },
  { id: "bank-statement", name: "Bank Statement" },
  { id: "income-proof", name: "Income Proof" },
  { id: "tax-return", name: "Tax Return" },
  { id: "identity-proof", name: "Identity Proof" },
];

const ReportSubmission: React.FC = () => {
  const [selectedBureaus, setSelectedBureaus] = useState<string[]>([]);
  const [selectedLoanType, setSelectedLoanType] = useState<string>("");
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [applicantName, setApplicantName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const toggleBureau = (bureauId: string) => {
    if (selectedBureaus.includes(bureauId)) {
      setSelectedBureaus(selectedBureaus.filter((id) => id !== bureauId));
    } else {
      setSelectedBureaus([...selectedBureaus, bureauId]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast.error("Invalid file format", {
          description: "Please upload a PDF file.",
        });
      }
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        toast.error("Invalid file format", {
          description: "Please upload a PDF file.",
        });
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
  };

  const simulateUpload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          toast.success("Report uploaded successfully");
          navigate("/report-analysis?id=REP-" + Math.floor(Math.random() * 10000));
        }, 500);
      }
      setUploadProgress(progress);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!file) {
      toast.error("Missing file", {
        description: "Please upload a PDF document.",
      });
      return;
    }
    
    if (selectedBureaus.length === 0) {
      toast.error("No bureaus selected", {
        description: "Please select at least one credit bureau.",
      });
      return;
    }
    
    if (!selectedLoanType) {
      toast.error("Loan type required", {
        description: "Please select a loan type.",
      });
      return;
    }
    
    if (!selectedDocType) {
      toast.error("Document type required", {
        description: "Please select a document type.",
      });
      return;
    }
    
    if (!applicantName.trim()) {
      toast.error("Applicant name required", {
        description: "Please enter the applicant's name.",
      });
      return;
    }
    
    // Proceed with upload
    setIsUploading(true);
    simulateUpload();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Submit New Report</h1>
      <p className="text-muted-foreground mb-6">
        Upload a credit report for analysis and aggregation
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Section */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              } transition-all duration-200 relative`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              
              <div className="py-8 px-4 text-center cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center flex-col">
                    <div className="bg-primary/10 rounded-full p-3 mb-2">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium mb-1">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-xs text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-primary/10 rounded-full p-3 mx-auto mb-3 w-fit">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">
                      Drag and drop your PDF file here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Maximum file size: 10MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Bureau Selection */}
        <div>
          <Label className="form-label mb-2 inline-block">
            Select Credit Bureaus
          </Label>
          <div className="flex flex-wrap gap-2">
            {bureaus.map((bureau) => (
              <button
                key={bureau.id}
                type="button"
                onClick={() => toggleBureau(bureau.id)}
                className={`multi-select-button ${
                  selectedBureaus.includes(bureau.id) ? "selected" : ""
                }`}
              >
                {selectedBureaus.includes(bureau.id) && (
                  <Check className="h-4 w-4" />
                )}
                {bureau.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Select all bureaus that you want to include in the analysis
          </p>
        </div>
        
        {/* Other Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="loanType" className="form-label">
              Loan Type
            </Label>
            <Select value={selectedLoanType} onValueChange={setSelectedLoanType}>
              <SelectTrigger
                id="loanType"
                className="form-input flex items-center"
              >
                <SelectValue placeholder="Select loan type" />
              </SelectTrigger>
              <SelectContent>
                {loanTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="docType" className="form-label">
              Document Type
            </Label>
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger
                id="docType"
                className="form-input flex items-center"
              >
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="applicantName" className="form-label">
            Applicant Name
          </Label>
          <Input
            id="applicantName"
            className="form-input"
            placeholder="Enter applicant's full name"
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes" className="form-label">
            Additional Notes
          </Label>
          <Textarea
            id="notes"
            className="form-input min-h-[120px]"
            placeholder="Add any relevant information about this report..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        {/* Submit Button */}
        {isUploading ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Processing your report. Please wait...
            </p>
          </div>
        ) : (
          <Button
            type="submit"
            className="w-full md:w-auto min-w-[200px] h-12 button-hover-effect"
            disabled={isUploading}
          >
            Submit for Analysis
          </Button>
        )}
      </form>
    </div>
  );
};

export default ReportSubmission;
