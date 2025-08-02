import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { AlarmClockCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";

export default function RoutineDialog () {
    const [open, setIsOpen] = useState<boolean>()
    const [showForm, setShowForm] = useState<boolean>(false)
    const [routines, setRoutines] = useState<any[]>([])
    const [formData, setFormData] = useState({
        startLocation: '',
        endLocation: '',
        time: '',
        repeatPattern: '',
        customDays: [] as string[]
    })

    useEffect(() => {
        const savedRoutines = JSON.parse(localStorage.getItem('travel-routines') || '[]');
        setRoutines(savedRoutines);
    }, []);

    const handleCustomDayChange = (day: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            customDays: checked 
                ? [...prev.customDays, day]
                : prev.customDays.filter(d => d !== day)
        }));
    };

    const handleCreateRoutine = () => {
        const newRoutine = {
            id: Date.now(),
            startLocation: formData.startLocation,
            endLocation: formData.endLocation,
            time: formData.time,
            repeatPattern: formData.repeatPattern,
            days: formData.repeatPattern === 'custom' 
                ? formData.customDays 
                : formData.repeatPattern === 'weekdays' 
                    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                    : formData.repeatPattern === 'weekends'
                        ? ['Sat', 'Sun']
                        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        };

        const updatedRoutines = [...routines, newRoutine];
        setRoutines(updatedRoutines);
        localStorage.setItem('travel-routines', JSON.stringify(updatedRoutines));
        
        // Reset form
        setFormData({
            startLocation: '',
            endLocation: '',
            time: '',
            repeatPattern: '',
            customDays: []
        });
        setShowForm(false);
    };

    return (
        <Dialog open={open} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={"outline"}>
                    <AlarmClockCheck className="h-4 w-4"/>
                    Elevate your daily travel routines
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {showForm ? "Create a routine" : "Your Routines"}
                    </DialogTitle>
                    <DialogDescription>
                        {showForm 
                            ? "Set up a new travel routine with custom alerts and timing."
                            : "Make your commute easier and more predictable with sensible alerts."
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {!showForm ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-left px-4 py-2">Start Location</TableHead>
                                        <TableHead className="text-left px-4 py-2">End Location</TableHead>
                                        <TableHead className="text-left px-4 py-2">Start Time</TableHead>
                                        <TableHead className="text-left px-4 py-2">Repeat</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {routines.map((routine) => (
                                        <TableRow key={routine.id}>
                                            <TableCell className="px-4 py-2">{routine.startLocation}</TableCell>
                                            <TableCell className="px-4 py-2">{routine.endLocation}</TableCell>
                                            <TableCell className="px-4 py-2">{routine.time}</TableCell>
                                            <TableCell className="px-4 py-2">{routine.days.join(', ')}</TableCell>
                                        </TableRow>
                                    ))}
                                    {routines.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                                                No routines created yet
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            
                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(true)}
                                >
                                    Add New Routine
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </>
                    ) : (
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start-location">Start Location</Label>
                                    <Input 
                                        id="start-location" 
                                        placeholder="Enter start location"
                                        value={formData.startLocation}
                                        onChange={(e) => setFormData(prev => ({...prev, startLocation: e.target.value}))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-location">End Location</Label>
                                    <Input 
                                        id="end-location" 
                                        placeholder="Enter destination"
                                        value={formData.endLocation}
                                        onChange={(e) => setFormData(prev => ({...prev, endLocation: e.target.value}))}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="start-time">Start Time</Label>
                                <Input 
                                    id="start-time" 
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Repeat</Label>
                                <Select value={formData.repeatPattern} onValueChange={(value) => setFormData(prev => ({...prev, repeatPattern: value}))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select repeat pattern" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekdays">Weekdays</SelectItem>
                                        <SelectItem value="weekends">Weekends</SelectItem>
                                        <SelectItem value="custom">Custom Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {formData.repeatPattern === 'custom' && (
                                <div className="space-y-2">
                                    <Label>Custom Days</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                            <div key={day} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={day.toLowerCase()} 
                                                    checked={formData.customDays.includes(day)}
                                                    onCheckedChange={(checked) => handleCustomDayChange(day, checked as boolean)}
                                                />
                                                <Label 
                                                    htmlFor={day.toLowerCase()} 
                                                    className="text-sm font-normal"
                                                >
                                                    {day}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="button" onClick={handleCreateRoutine}>
                                    Create Routine
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}