
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Utensils, Plus, X, Salad } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

export function MealOptionsStep() {
  const { control, watch, setValue } = useFormContext();
  const [newOption, setNewOption] = useState("");
  const mealOptions = watch("mealOptions") || [];
  const includeMeals = watch("includeMeals") || false;

  const addMealOption = () => {
    if (newOption.trim()) {
      const updatedOptions = [...mealOptions, newOption.trim()];
      setValue("mealOptions", updatedOptions);
      setNewOption("");
    }
  };

  const removeMealOption = (index: number) => {
    const updatedOptions = [...mealOptions];
    updatedOptions.splice(index, 1);
    setValue("mealOptions", updatedOptions);
  };

  const handleIncludeMealsToggle = (value: boolean) => {
    setValue("includeMeals", value);
    if (!value) {
      setValue("mealOptions", []);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Meal Options</h3>
        <p className="text-sm text-muted-foreground">
          Configure meal choices for your event
        </p>
      </div>

      <FormField
        control={control}
        name="includeMeals"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Include Meal Options
              </FormLabel>
              <FormDescription>
                Allow guests to select meal preferences when RSVP'ing
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={handleIncludeMealsToggle}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {includeMeals && (
        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center space-x-2">
            <Utensils className="h-5 w-5 text-green-600" />
            <h4 className="font-medium">Define Meal Options</h4>
          </div>

          <div className="flex items-end gap-3">
            <div className="space-y-2 flex-1">
              <FormLabel htmlFor="newMealOption">Meal Option</FormLabel>
              <Input
                id="newMealOption"
                placeholder="e.g., Chicken, Vegetarian, Vegan"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMealOption();
                  }
                }}
              />
            </div>
            <Button type="button" onClick={addMealOption} className="mb-0.5">
              <Plus className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Salad className="h-4 w-4 mr-2 text-green-600" />
              Available Options ({mealOptions.length})
            </h4>
            
            {mealOptions.length === 0 ? (
              <div className="text-sm text-center py-6 border border-dashed rounded-md bg-muted/30">
                No meal options added yet
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meal Option</TableHead>
                      <TableHead className="w-[100px] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mealOptions.map((option: string, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{option}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeMealOption(index)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 flex items-start mt-4">
            <Utensils className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>
              Guests will be able to select from these meal options when completing their RSVP, and can add dietary restrictions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
