
import { useState } from "react";
import { toast } from "@/lib/toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface ApiCall {
  endpoint: string;
  fields: Record<string, string>;
}

export const useReportSubmission = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [analysisQuery, setAnalysisQuery] = useState<string>("");
  const [formFields, setFormFields] = useState<string[]>([]);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [apiCalls, setApiCalls] = useState<string[]>([]);
  const [requestedData, setRequestedData] = useState<string[][]>([]);
  const [reportId, setReportId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to generate unique report ID
  const generateReportId = () => {
    return 'REP-' + Math.floor(Math.random() * 10000);
  };

  // Function to submit initial query
  const submitQuery = async () => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please login to submit a report"
      });
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a new report ID
      const newReportId = generateReportId();
      setReportId(newReportId);
      
      // Save initial query to Supabase
      const { error: dbError } = await supabase
        .from('reports')
        .insert([
          {
            report_id: newReportId,
            user_id: user.id,
            initial_context: analysisQuery,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      // Make API call to get required fields
      const response = await fetch("http://localhost:5000/add_context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          context: analysisQuery,
          report_id: newReportId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API response:", data);
      
      if (!data.api_calls || !data.requested_data || !Array.isArray(data.api_calls) || !Array.isArray(data.requested_data)) {
        throw new Error("Invalid API response format");
      }
      
      setApiCalls(data.api_calls);
      setRequestedData(data.requested_data);
      
      // Extract unique fields from requested_data
      const allFields: string[] = [];
      data.requested_data.forEach((fields: string[]) => {
        fields.forEach(field => {
          if (!allFields.includes(field)) {
            allFields.push(field);
          }
        });
      });
      
      setFormFields(allFields);
      
      // Update report with API response data
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          other_json_data: {
            api_calls: data.api_calls,
            requested_data: data.requested_data
          }
        })
        .eq('report_id', newReportId);
      
      if (updateError) {
        throw new Error(`Database update error: ${updateError.message}`);
      }
      
      setStep(2);
      return true;
    } catch (err) {
      console.error("Error submitting query:", err);
      setError(err instanceof Error ? err.message : "Failed to process your query");
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to process your query"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to submit final data
  const submitFinalData = async () => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please login to submit a report"
      });
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Save user inputs to Supabase
      const { error: dbError } = await supabase
        .from('reports')
        .update({
          other_json_data: {
            ...reportId ? await getExistingJsonData(reportId) : {},
            user_inputs: userInputs
          }
        })
        .eq('report_id', reportId);
      
      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      // Prepare API calls with user inputs
      const preparedApiCalls: ApiCall[] = apiCalls.map((endpoint, index) => {
        // Get the requested fields for this endpoint
        const requiredFields = requestedData[index] || [];
        
        // Prepare fields object with user inputs
        const fields: Record<string, string> = {};
        for (const field of requiredFields) {
          if (userInputs[field]) {
            fields[field] = userInputs[field];
          }
        }
        
        return {
          endpoint,
          fields
        };
      });
      
      // Make final API call
      const response = await fetch("http://localhost:4001/selected-apis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          api_calls: preparedApiCalls,
          report_id: reportId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Save response markdown to Supabase
      if (data.markdown) {
        const { error: updateError } = await supabase
          .from('reports')
          .update({
            text_paragraph_markdown: data.markdown,
            other_json_data: {
              ...reportId ? await getExistingJsonData(reportId) : {},
              user_inputs: userInputs,
              api_response: data
            }
          })
          .eq('report_id', reportId);
        
        if (updateError) {
          throw new Error(`Database update error: ${updateError.message}`);
        }
      }
      
      // If everything is successful, move to final step
      setStep(3);
      return true;
    } catch (err) {
      console.error("Error submitting final data:", err);
      setError(err instanceof Error ? err.message : "Failed to submit your data");
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to submit your data"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get existing JSON data
  const getExistingJsonData = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('other_json_data')
        .eq('report_id', reportId)
        .single();
      
      if (error || !data) {
        console.error("Error fetching existing JSON data:", error);
        return {};
      }
      
      return data.other_json_data || {};
    } catch (err) {
      console.error("Error in getExistingJsonData:", err);
      return {};
    }
  };

  // Function to handle PDF upload
  const uploadPdfs = async (files: File[]) => {
    if (!reportId) {
      toast.error("Report ID missing", {
        description: "Cannot upload PDFs without an active report"
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('report_id', reportId);
      
      // Add files to FormData
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      
      // Make API call to upload PDFs
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload error: ${response.status}`);
      }
      
      toast.success("Files uploaded successfully");
      return true;
    } catch (err) {
      console.error("Error uploading PDFs:", err);
      toast.error("Upload error", {
        description: err instanceof Error ? err.message : "Failed to upload PDFs"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to navigate to report analysis
  const goToReportAnalysis = () => {
    navigate(`/report-analysis?id=${reportId}`);
  };

  return {
    step,
    setStep,
    analysisQuery,
    setAnalysisQuery,
    formFields,
    userInputs,
    setUserInputs,
    apiCalls,
    reportId,
    isLoading,
    error,
    submitQuery,
    submitFinalData,
    uploadPdfs,
    goToReportAnalysis
  };
};
