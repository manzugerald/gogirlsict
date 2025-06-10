import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface MessageCardProps {
  message: string;
  name: string;
  title?: string;
  imageUrl?: string;
}

const MessageCard = ({ message, name, title, imageUrl }: MessageCardProps) => {
  return (
    <Card className="bg-card border shadow-md rounded-xl max-w-4xl mx-auto">
      <CardContent className="p-6 space-y-6">

        {/* Title (top-left) */}
        {title && (
          <div className="text-left">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          </div>
        )}

        {/* Image (centered) */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-pink-600 shadow-lg">
            <Image
              src={imageUrl ?? "/assets/images/projects/p1.jpg"}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Bottom Row: Message + Name on left, Title on right */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-4">
          {/* Message + Name */}
          <div className="sm:max-w-[75%]">
            <blockquote className="italic text-muted-foreground text-lg leading-relaxed">
              “{message}”
            </blockquote>
            <p className="mt-2 text-sm font-medium text-foreground">— {name}</p>
          </div>

          {/* Title (again as status in bottom-right) */}
          {title && (
            <div className="text-sm text-right text-muted-foreground">
              {title}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
};

export default MessageCard;
