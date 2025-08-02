// src/app/authenticate/page.tsx

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter(); // Initialize router

  const handleLogin = () => {
    // A function to get the user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Save the location data to local storage
          localStorage.setItem('userLat', latitude.toString());
          localStorage.setItem('userLng', longitude.toString());

          // After saving, navigate to the landing page
          router.push('/landing');
        },
        (err) => {
          setError('Geolocation error: ' + err.message);
          // Even if there's an error, you can still navigate,
          // but the map will show a default location.
          router.push('/landing');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      // Navigate anyway to avoid blocking the user
      router.push('/landing');
    }
  };

  const renderLoginForm = () => (
    <>
      <CardHeader>
        <CardTitle className="text-xl">Login</CardTitle>
        <CardDescription>Enter your email below to log into your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" onClick={handleLogin} className="w-full">
            Login
          </Button>
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
      </CardContent>
    </>
  );

  const renderSignUpForm = () => (
    <>
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>Enter your information to create an account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" variant={isLogin ? "default" : "ghost"} onClick={() => setIsLogin(true)} className="w-full">
            Create an account
          </Button>
        </div>
      </CardContent>
    </>
  );

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[380px]">
        {isLogin ? renderLoginForm() : renderSignUpForm()}
        <div className="flex justify-center p-6 border-b">
          <Label>
            Don't have an account? Create new account.
            <Button
              variant={!isLogin ? "default" : "ghost"}
              onClick={() => setIsLogin(false)}
              className="w-full"
            >
              Sign Up
            </Button>
          </Label>
        </div>
      </Card>
    </div>
  );
}