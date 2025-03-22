
import React, { useState } from "react";
import { ArrowRight, Loader2, AlertCircle, CheckCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useReportSubmission } from "@/hooks/useReportSubmission";
import { toast } from "@/lib/toast";

const ReportSubmission: React.FC = () => {
  const {
    step,
    setStep,
    analysisQuery,
    setAnalysisQuery,
    formFields,
    userInputs,
    setUserInputs,
    reportId,
    isLoading,
    error,
    submitQuery,
    submitFinalData,
    uploadPdfs,
    goToReportAnalysis
  } = useReportSubmission();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisQuery.trim()) {
      toast.error("Please enter what you want to analyze");
      return;
    }
    
    await submitQuery();
  };

  const handleUserInputsChange = (field: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields are filled
    const missingFields = formFields.filter(field => !userInputs[field] || userInputs[field].trim() === '');
    
    if (missingFields.length > 0) {
      toast.error(`Please fill all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    const success = await submitFinalData();
    if (success) {
      toast.success("Report submitted successfully");
      setStep(3);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 10) {
        toast.error("Maximum 10 files allowed");
        return;
      }
      setSelectedFiles(files);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }
    
    const success = await uploadPdfs(selectedFiles);
    if (success) {
      setSelectedFiles([]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Analyze New Report</h1>
      <p className="text-muted-foreground mb-6">
        Submit a credit analysis request
      </p>
      
      {/* Step Indicator */}
      <div className="mb-8">
        <Progress value={(step / 3) * 100} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span className={step >= 1 ? "text-primary font-medium" : ""}>Analysis Query</span>
          <span className={step >= 2 ? "text-primary font-medium" : ""}>Required Information</span>
          <span className={step >= 3 ? "text-primary font-medium" : ""}>Submission</span>
        </div>
      </div>
      
      {/* Step 1: Analysis Query */}
      {step === 1 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl">What do you want to analyze?</CardTitle>
          </CardHeader>
          <form onSubmit={handleQuerySubmit}>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Describe what you're looking to analyze and we'll determine what information is needed.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="analysisQuery">Analysis Query</Label>
                  <Input
                    id="analysisQuery"
                    placeholder="e.g., I need to check credit scores for a loan application"
                    value={analysisQuery}
                    onChange={(e) => setAnalysisQuery(e.target.value)}
                    className="form-input min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                className="button-hover-effect"
                disabled={isLoading || !analysisQuery.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      
      {/* Step 2: Dynamic Form Fields */}
      {step === 2 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl">Required Information</CardTitle>
          </CardHeader>
          <form onSubmit={handleFinalSubmit}>
            <CardContent>
              {error ? (
                <div className="flex items-center space-x-2 p-4 bg-destructive/10 text-destructive rounded-md">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    Please provide the following information needed for your analysis:
                  </p>
                  
                  {formFields.length === 0 ? (
                    <div className="py-4 text-center">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Loading required fields...</p>
                    </div>
                  ) : (
                    <>
                      {formFields.map((field) => (
                        <div key={field} className="space-y-2">
                          <Label htmlFor={field} className="capitalize">
                            {field.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Input
                            id={field}
                            value={userInputs[field] || ''}
                            onChange={(e) => handleUserInputsChange(field, e.target.value)}
                            placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
                            className="form-input"
                          />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="button-hover-effect"
                disabled={isLoading || formFields.length === 0 || error !== null}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      
      {/* Step 3: Submission Success & PDF Upload */}
      {step === 3 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl">Report Submitted Successfully</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="mb-4 rounded-full bg-green-100 dark:bg-green-900 p-3">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-muted-foreground text-center mb-6">
                Your analysis request has been submitted and is being processed.
              </p>
              
              <div className="w-full p-4 border border-dashed border-border rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-2">Upload Supporting Documents (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You can upload up to 10 PDF files to support your analysis.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="fileUpload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-accent/10 hover:bg-accent/20">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PDF files only (MAX. 10)</p>
                      </div>
                      <Input
                        id="fileUpload"
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length}/10):</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            {file.name}
                          </div>
                        ))}
                      </div>
                      <Button 
                        onClick={handleFileUpload} 
                        variant="outline"
                        className="mt-3"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Files
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={goToReportAnalysis}
                className="button-hover-effect w-full"
              >
                View Report Analysis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportSubmission;
