import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

type Props = {
  user: any;
  onLogout: () => void;
};

export default function UserPanel({ user, onLogout }: Props) {
  const name = user?.user_metadata?.full_name || "User";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar className="w-10 h-10">
        <AvatarImage
          src={user?.user_metadata?.avatar_url || undefined}
          alt={name}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <p className="text-sm font-medium">Welcome back, {name.split(" ")[0]}!</p>

      <Button
        variant="ghost"
        size="icon"
        onClick={onLogout}
        className="text-muted-foreground hover:text-destructive cursor-pointer"
        title="Log out"
      >
        <LogOut size={18} />
      </Button>
    </div>
  );
}
