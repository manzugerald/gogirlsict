import { Card, CardContent } from "@/components/ui/card"
import { QuoteIcon } from "lucide-react"
import Image from "next/image"

interface MessageCardProps {
  message: string
  name: string
  title?: string
  imageUrl: string
}

const MessageCard = ({
  message,
  name,
  title = "Director",
  imageUrl,
}: MessageCardProps) => {
  return (
    <Card className="relative bg-card border shadow-md rounded-xl p-6 max-w-4xl mx-auto">
      <CardContent className="space-y-4 relative z-10">
        {/* Header with image */}
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-pink-600">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>

        {/* Quote Message */}
        <div className="flex items-start space-x-3">
          
          <blockquote className="relative italic font-serif text-muted-foreground text-xl leading-relaxed px-4">
            <span className="text-pink-600 text-5xl leading-none font-bold">“</span>
            {message}
            <br />
            <span className="text-pink-600 text-5xl leading-none font-bold">”</span>
          </blockquote>
        </div>
      </CardContent>
    </Card>
  )
}

export default MessageCard
