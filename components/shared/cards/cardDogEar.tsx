import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, StarIcon } from "lucide-react";
import Link from "next/link";

interface CardDogEarProps {
  title: string;
  content: string;
  icon: LucideIcon;
  href?: string; // ✅ Added optional href prop
}

const CardDogEar = ({ title, content, icon: Icon, href }: CardDogEarProps) => {
  const card = (
    <Card
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-300",
        "bg-card text-card-foreground border border-card shadow-md",
        "hover:shadow-lg hover:scale-[1.015] hover:border-pink-700",
        "dark:backdrop-blur-sm dark:bg-zinc-900/70"
      )}
    >
      {/* Dog-ear effect */}
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-l-[40px] border-t-white dark:border-t-zinc-900 border-l-yellow-400 z-30" />

      {/* Star icon on dog-ear */}
      <div className="absolute top-1 right-1 z-40 text-yellow-400">
        <StarIcon className="w-4 h-4" />
      </div>

      <CardHeader className="bg-pink-800 text-white flex items-center justify-between px-4 py-3 relative z-20">
        <CardTitle className="text-white text-base font-semibold">{title}</CardTitle>
        <Icon className="h-5 w-5 text-white" />
      </CardHeader>

      <CardContent className="p-4 text-sm relative z-10">
        <p>{content}</p>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{card}</Link> : card;
};

export default CardDogEar;
