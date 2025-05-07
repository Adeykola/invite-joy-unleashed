
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, User, Mail } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface PlusOneProps {
  id: string;
  name: string;
  email: string;
}

export function PlusOneManager() {
  const { control, setValue, getValues, watch } = useFormContext();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  
  const plusOnes = watch("plusOnes") || [];
  
  const addPlusOne = () => {
    if (!newName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your guest",
        variant: "destructive",
      });
      return;
    }
    
    if (!newEmail.trim() || !isValidEmail(newEmail)) {
      toast({
        title: "Valid Email Required",
        description: "Please enter a valid email address for your guest",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate email
    if (plusOnes.some((guest: PlusOneProps) => guest.email.toLowerCase() === newEmail.toLowerCase())) {
      toast({
        title: "Duplicate Email",
        description: "This email is already in your guest list",
        variant: "destructive",
      });
      return;
    }
    
    const newGuest = {
      id: crypto.randomUUID(),
      name: newName,
      email: newEmail,
    };
    
    setValue("plusOnes", [...plusOnes, newGuest]);
    setNewName("");
    setNewEmail("");
  };
  
  const removePlusOne = (id: string) => {
    setValue("plusOnes", plusOnes.filter((guest: PlusOneProps) => guest.id !== id));
  };
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Add Plus-Ones</h3>
      
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <FormItem className="flex-1">
            <FormLabel>Name</FormLabel>
            <FormControl>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Guest Name"
                  className="pl-9"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
            </FormControl>
          </FormItem>
          
          <FormItem className="flex-1">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  type="email"
                  placeholder="guest@example.com"
                  className="pl-9"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
            </FormControl>
          </FormItem>
          
          <Button 
            type="button" 
            onClick={addPlusOne}
            className="mt-auto"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      {plusOnes.length > 0 ? (
        <div className="border rounded-md p-4 space-y-3 bg-gray-50">
          <h4 className="text-sm font-medium">Your Plus-Ones ({plusOnes.length})</h4>
          
          {plusOnes.map((guest: PlusOneProps) => (
            <div key={guest.id} className="flex items-center justify-between bg-white p-3 rounded border">
              <div>
                <p className="font-medium">{guest.name}</p>
                <p className="text-sm text-gray-600">{guest.email}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePlusOne(guest.id)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4 border border-dashed rounded-md">
          No plus-ones added
        </div>
      )}
    </div>
  );
}
