// src/app/authenticate/page.tsx

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);

  const renderLoginForm = () => (
    <>
      <CardHeader>
        <CardTitle className="text-xl">Login</CardTitle>
        <CardDescription>Enter your email below to log into your account</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Login form fields */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" onClick={() =>
            testGeo()
            } className="w-full">
            Login
          </Button>
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
        {/* Sign Up form fields */}
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

const testGeo = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

        // You can add logic here to send the data to a server
      },
      // Error callback
      (error) => {
        console.error("Error getting location:", error.message);
      }
    );
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[380px]">
        {/* Toggle buttons go outside the form content but inside the card */}

        {/* Conditional rendering of the forms */}
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

       {/* <div className="flex justify-center p-6 border-b"> 
          <Button
            variant={isLogin ? "default" : "ghost"}
            onClick={() => setIsLogin(true)}
            className="w-full"
          >
            Login
          </Button>
          <Button
            variant={!isLogin ? "default" : "ghost"}
            onClick={() => setIsLogin(false)}
            className="w-full"
          >
            Sign Up
          </Button>
        </div>  */}

      </Card>
    </div>
  );
}