"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store";
import {
  Upload,
  X,
  Plus,
  FileText,
  DollarSign,
  Tag,
  Settings,
  Eye,
  Save,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface AgentUploadFormProps {
  onSuccess?: () => void;
}

export default function AgentUploadForm({ onSuccess }: AgentUploadFormProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
    category: "",
    price: "",
    tags: [] as string[],
    requirements: [] as string[],
    integrations: [] as string[],
    version: "1.0.0",
    documentation: "",
    demo: "",
    images: [] as string[],
    features: [] as string[],
  });

  const [currentTag, setCurrentTag] = useState("");
  const [currentRequirement, setCurrentRequirement] = useState("");
  const [currentIntegration, setCurrentIntegration] = useState("");
  const [currentFeature, setCurrentFeature] = useState("");

  const categories = [
    { value: "customer-support", label: "Customer Support" },
    { value: "sales", label: "Sales & Marketing" },
    { value: "analytics", label: "Data Analytics" },
    { value: "content", label: "Content Creation" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "communication", label: "Communication" },
    { value: "scheduling", label: "Scheduling" },
    { value: "database", label: "Database" },
    { value: "chat", label: "Chat & Messaging" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: keyof typeof formData, value: string, setter: (value: string) => void) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field] as string[], value.trim()]
      }));
      setter("");
    }
  };

  const removeFromArray = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.category || !formData.price) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success("Agent uploaded successfully!");
      setIsOpen(false);
      setStep(1);
      setFormData({
        name: "",
        description: "",
        longDescription: "",
        category: "",
        price: "",
        tags: [],
        requirements: [],
        integrations: [],
        version: "1.0.0",
        documentation: "",
        demo: "",
        images: [],
        features: [],
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Failed to upload agent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'seller') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Upload Agent
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seller Account Required</DialogTitle>
            <DialogDescription>
              You need to be signed in as a seller to upload agents.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Please sign in with a seller account to list your AI agents.
            </p>
            <Button onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">Agent Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Advanced Customer Support AI"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Short Description *</Label>
        <Textarea
          id="description"
          placeholder="Brief description of what your agent does..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="longDescription">Detailed Description</Label>
        <Textarea
          id="longDescription"
          placeholder="Detailed explanation of features, capabilities, and benefits..."
          value={formData.longDescription}
          onChange={(e) => handleInputChange("longDescription", e.target.value)}
          className="mt-1"
          rows={6}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price">Price (USD) *</Label>
          <Input
            id="price"
            type="number"
            placeholder="0"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            className="mt-1"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>Tags</Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="Add tag..."
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('tags', currentTag, setCurrentTag);
              }
            }}
          />
          <Button
            type="button"
            onClick={() => addToArray('tags', currentTag, setCurrentTag)}
            size="sm"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag) => (
            <Badge key={`tag-${tag}`} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFromArray('tags', index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Requirements</Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="e.g., n8n workspace"
            value={currentRequirement}
            onChange={(e) => setCurrentRequirement(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('requirements', currentRequirement, setCurrentRequirement);
              }
            }}
          />
          <Button
            type="button"
            onClick={() => addToArray('requirements', currentRequirement, setCurrentRequirement)}
            size="sm"
          >
            Add
          </Button>
        </div>
        <div className="space-y-1 mt-2">
          {formData.requirements.map((req) => (
            <div key={`req-${req}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">{req}</span>
              <X
                className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                onClick={() => removeFromArray('requirements', index)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Integrations</Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="e.g., Slack, Discord"
            value={currentIntegration}
            onChange={(e) => setCurrentIntegration(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('integrations', currentIntegration, setCurrentIntegration);
              }
            }}
          />
          <Button
            type="button"
            onClick={() => addToArray('integrations', currentIntegration, setCurrentIntegration)}
            size="sm"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.integrations.map((integration) => (
            <Badge key={`integration-${integration}`} variant="outline" className="flex items-center gap-1">
              {integration}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFromArray('integrations', index)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            placeholder="1.0.0"
            value={formData.version}
            onChange={(e) => handleInputChange("version", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="documentation">Documentation URL</Label>
        <Input
          id="documentation"
          placeholder="https://docs.example.com/agent"
          value={formData.documentation}
          onChange={(e) => handleInputChange("documentation", e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="demo">Demo URL</Label>
        <Input
          id="demo"
          placeholder="https://demo.example.com/agent"
          value={formData.demo}
          onChange={(e) => handleInputChange("demo", e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Key Features</Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="e.g., Real-time processing"
            value={currentFeature}
            onChange={(e) => setCurrentFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('features', currentFeature, setCurrentFeature);
              }
            }}
          />
          <Button
            type="button"
            onClick={() => addToArray('features', currentFeature, setCurrentFeature)}
            size="sm"
          >
            Add
          </Button>
        </div>
        <div className="space-y-1 mt-2">
          {formData.features.map((feature) => (
            <div key={`feature-${feature}`} className="flex items-center justify-between bg-blue-50 p-2 rounded">
              <span className="text-sm">{feature}</span>
              <X
                className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                onClick={() => removeFromArray('features', index)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Review Your Agent</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Name:</strong> {formData.name || "Not specified"}</p>
          <p><strong>Category:</strong> {categories.find(c => c.value === formData.category)?.label || "Not selected"}</p>
          <p><strong>Price:</strong> ${formData.price || "0"}</p>
          <p><strong>Tags:</strong> {formData.tags.length > 0 ? formData.tags.join(", ") : "None"}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Upload Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Your AI Agent</DialogTitle>
          <DialogDescription>
            List your agent on the marketplace in 3 easy steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > stepNumber ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 3 && (
                <div className={`w-12 h-1 ${step > stepNumber ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Agent
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
