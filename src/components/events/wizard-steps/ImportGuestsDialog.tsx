
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Users } from "lucide-react";
import { Guest } from "./GuestListStep";

interface ImportGuestsDialogProps {
  onImport: (guests: Guest[]) => void;
}

export function ImportGuestsDialog({ onImport }: ImportGuestsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsParsing(true);

    try {
      // Read the file content
      const content = await readFileContent(file);
      
      // Parse CSV
      const lines = content.split('\n');
      const guests: Guest[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        // For simplicity, we expect CSV in format: name,email
        const [name, email] = line.split(',');
        
        // Basic validation
        if (!name || !email || !isValidEmail(email)) {
          console.warn(`Skipping invalid line ${i + 1}: ${line}`);
          continue;
        }
        
        guests.push({
          id: crypto.randomUUID(),
          name: name.trim(),
          email: email.trim(),
        });
      }

      if (guests.length === 0) {
        toast({
          title: "No valid guests found",
          description: "Please check your CSV format and try again",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Guests imported",
        description: `Successfully imported ${guests.length} guests`,
      });
      
      onImport(guests);
      setIsOpen(false);
      
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast({
        title: "Import failed",
        description: "Failed to parse the CSV file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-1" /> Import Guests
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Guest List</DialogTitle>
          <DialogDescription>
            Upload a CSV file with guest information. The CSV should have two columns: name and email.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="guest-csv">CSV File</Label>
            <Input
              id="guest-csv"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Expected format: <code>Name,Email</code></p>
            <p className="mt-1">Example:</p>
            <pre className="bg-muted p-2 rounded mt-1 text-xs">
              John Doe,john@example.com<br/>
              Jane Smith,jane@example.com
            </pre>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={parseCSV} disabled={!file || isParsing}>
            {isParsing ? "Importing..." : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
