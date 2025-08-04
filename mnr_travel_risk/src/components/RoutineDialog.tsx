import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { AlarmClockCheck, MapPin, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { useSession } from "@/lib/auth-client";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import { Coord } from "@/types/coord";
import { truncate } from "lodash";

interface Routine {
    id: string;
    name: string;
    startLocation: string;
    startCoordinates: any;
    endLocation: string;
    endCoordinates: any;
    startTime: string;
    repeatDays: string[];
    createdAt: string;
    updatedAt: string;
}

export default function RoutineDialog() {
    const { data: session } = useSession();
    const [open, setIsOpen] = useState<boolean>(false);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: '',
        startLocation: '',
        endLocation: '',
        time: '',
        repeatPattern: '',
        customDays: [] as string[]
    });
    
    // Add coordinate state for PlaceAutocomplete
    const [startCoordinates, setStartCoordinates] = useState<Coord>({ lat: 0, lng: 0 });
    const [endCoordinates, setEndCoordinates] = useState<Coord>({ lat: 0, lng: 0 });

    // API Service Functions
    const fetchRoutines = async () => {
        if (!session?.user?.id) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/api/routine?userId=${session.user.id}`);
            if (response.ok) {
                const data = await response.json();
                setRoutines(data.routines || []);
            } else {
                console.error('Failed to fetch routines');
            }
        } catch (error) {
            console.error('Error fetching routines:', error);
        } finally {
            setLoading(false);
        }
    };

    const createRoutine = async (routineData: any) => {
        if (!session?.user?.id) return;

        setLoading(true);
        try {
            const response = await fetch('/api/routine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    ...routineData
                }),
            });

            if (response.ok) {
                const newRoutine = await response.json();
                setRoutines(prev => [...prev, newRoutine]);
                return true;
            } else {
                const error = await response.json();
                console.error('Failed to create routine:', error);
                return false;
            }
        } catch (error) {
            console.error('Error creating routine:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteRoutine = async (routineId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/routine/${routineId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setRoutines(prev => prev.filter(routine => routine.id !== routineId));
                return true;
            } else {
                console.error('Failed to delete routine');
                return false;
            }
        } catch (error) {
            console.error('Error deleting routine:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && session?.user?.id) {
            fetchRoutines();
        }
    }, [open, session?.user?.id]);

    // Helper function to convert day abbreviations to full names
    const mapDaysToFullNames = (days: string[]): string[] => {
        const dayMap: { [key: string]: string } = {
            'Mon': 'monday',
            'Tue': 'tuesday', 
            'Wed': 'wednesday',
            'Thu': 'thursday',
            'Fri': 'friday',
            'Sat': 'saturday',
            'Sun': 'sunday'
        };
        return days.map(day => dayMap[day] || day.toLowerCase());
    };

    const handleCustomDayChange = (day: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            customDays: checked 
                ? [...prev.customDays, day]
                : prev.customDays.filter(d => d !== day)
        }));
    };

    const handleCreateRoutine = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.name || !formData.startLocation || !formData.endLocation || !formData.time || !formData.repeatPattern) {
            alert('Please fill in all required fields');
            return;
        }

        // Convert repeat pattern to repeat days
        let repeatDays: string[] = [];
        switch (formData.repeatPattern) {
            case 'daily':
                repeatDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                break;
            case 'weekdays':
                repeatDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                break;
            case 'weekends':
                repeatDays = ['saturday', 'sunday'];
                break;
            case 'custom':
                repeatDays = mapDaysToFullNames(formData.customDays);
                break;
        }

        if (repeatDays.length === 0) {
            alert('Please select at least one day');
            return;
        }

        // Use actual coordinates from PlaceAutocomplete
        const routineData = {
            name: formData.name,
            startLocation: formData.startLocation,
            startCoordinates: startCoordinates,
            endLocation: formData.endLocation,
            endCoordinates: endCoordinates,
            startTime: formData.time,
            repeatDays
        };

        const success = await createRoutine(routineData);
        if (success) {
            // Reset form
            setFormData({
                name: '',
                startLocation: '',
                endLocation: '',
                time: '',
                repeatPattern: '',
                customDays: []
            });
            // Reset coordinates
            setStartCoordinates({ lat: 0, lng: 0 });
            setEndCoordinates({ lat: 0, lng: 0 });
            setShowForm(false);
        } else {
            alert('Failed to create routine. Please try again.');
        }
    };

    const handleDeleteRoutine = async (routineId: string) => {
        if (confirm('Are you sure you want to delete this routine?')) {
            const success = await deleteRoutine(routineId);
            if (!success) {
                alert('Failed to delete routine. Please try again.');
            }
        }
    };

    if (!session?.user) {
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
                        <DialogTitle>Sign in Required</DialogTitle>
                        <DialogDescription>
                            Please sign in to manage your travel routines.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={"outline"}>
                    <AlarmClockCheck className="h-4 w-4"/>
                    Elevate your daily travel routines
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-auto min-w-5xl">
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
                <div className="space-y-4 w-full">
                    {!showForm ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-left px-4 py-2">Name</TableHead>
                                        <TableHead className="text-left px-4 py-2">From</TableHead>
                                        <TableHead className="text-left px-4 py-2">To</TableHead>
                                        <TableHead className="text-left px-4 py-2">Time</TableHead>
                                        <TableHead className="text-left px-4 py-2">Days</TableHead>
                                        <TableHead className="text-left px-4 py-2">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4">
                                                Loading routines...
                                            </TableCell>
                                        </TableRow>
                                    ) : routines.map((routine) => (
                                        <TableRow key={routine.id}>
                                            <TableCell className="px-4 py-2 truncate" title={routine.name}>
                                                {routine.name}
                                            </TableCell>
                                            <TableCell className="px-4 py-2 truncate" title={routine.startLocation}>
                                                {truncate(routine.startLocation, { length: 20 })}
                                            </TableCell>
                                            <TableCell className="px-4 py-2 truncate" title={routine.endLocation}>
                                                {truncate(routine.endLocation, { length: 20 })}
                                            </TableCell>
                                            <TableCell className="px-4 py-2">
                                                {routine.startTime}
                                            </TableCell>
                                            <TableCell className="px-4 py-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {routine.repeatDays.map((day, index) => (
                                                        <span 
                                                            key={index}
                                                            className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-md"
                                                        >
                                                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteRoutine(routine.id)}
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!loading && routines.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4 text-gray-500">
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
                                    disabled={loading}
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
                        <form className="space-y-4" onSubmit={handleCreateRoutine}>
                            <div className="space-y-2">
                                <Label htmlFor="routine-name">Routine Name</Label>
                                <Input 
                                    id="routine-name" 
                                    placeholder="e.g., Morning Commute"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start-location">Start Location</Label>
                                    <PlaceAutocomplete 
                                        value={formData.startLocation}
                                        setValue={(value) => setFormData(prev => ({...prev, startLocation: value}))}
                                        coordinates={startCoordinates}
                                        setCoordinates={setStartCoordinates}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-location">End Location</Label>
                                    <PlaceAutocomplete 
                                        value={formData.endLocation}
                                        setValue={(value) => setFormData(prev => ({...prev, endLocation: value}))}
                                        coordinates={endCoordinates}
                                        setCoordinates={setEndCoordinates}
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
                                    required
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
                                    disabled={loading}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Create Routine'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}