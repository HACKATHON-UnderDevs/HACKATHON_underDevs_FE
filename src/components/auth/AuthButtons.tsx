import { SignInButton, SignOutButton, SignUpButton, useAuth } from "@clerk/clerk-react";
import { Button } from "../ui/Button";

export function SignInButtonComponent() {
  return (
    <SignInButton mode="modal">
      <Button variant="outline">Sign In</Button>
    </SignInButton>
  );
}

export function SignUpButtonComponent() {
  return (
    <SignUpButton mode="modal">
      <Button>Sign Up</Button>
    </SignUpButton>
  );
}

export function SignOutButtonComponent() {
  return (
    <SignOutButton>
      <Button variant="ghost">Sign Out</Button>
    </SignOutButton>
  );
}

export function UserButton() {
  const { isSignedIn } = useAuth();
  
  if (isSignedIn) {
    return <SignOutButtonComponent />;
  }
  
  return (
    <div className="flex gap-2">
      <SignInButtonComponent />
      <SignUpButtonComponent />
    </div>
  );
}