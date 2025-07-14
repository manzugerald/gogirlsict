import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { cardHoverClass } from '@/utils/styles/card-hover';
import { LucideIcon, StarIcon } from 'lucide-react';
import Link from 'next/link';

interface CardDogEarProps {
  title: string;
  content: string;
  icon: LucideIcon;
  imgUrl?: string;
  href?: string;
}

const flapKeyframes = `
@keyframes dogEarSequence {
  0% { transform: rotateY(0deg); }
  18% { transform: rotateY(0deg); }
  33% { transform: rotateY(-50deg); }
  48% { transform: rotateY(-50deg); }
  60% { transform: rotateY(-30deg); }
  66% { transform: rotateY(-60deg); }
  72% { transform: rotateY(-30deg); }
  78% { transform: rotateY(-60deg); }
  84% { transform: rotateY(-50deg); }
  100% { transform: rotateY(0deg); }
}
`;

const CardDogEar = ({ title, content, icon: Icon, imgUrl, href }: CardDogEarProps) => {
  const card = (
    <Card className={cn(cardHoverClass, 'p-0 m-0')} style={{ transformStyle: 'preserve-3d' }}>
      <style>{flapKeyframes}</style>

      {/* Dog Ear */}
      <div
        className={cn(
          'absolute top-0 right-0 w-0 h-0 z-30',
          'border-t-[40px] border-l-[40px] border-t-white dark:border-t-zinc-900 border-l-yellow-400',
          'origin-top-right',
          'animate-[dogEarSequence_6s_ease-in-out_infinite]'
        )}
        style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
      />
      <div
        className={cn(
          'absolute z-40 text-yellow-400 pointer-events-none',
          'top-[6px] right-[7px]',
          'origin-top-right',
          'animate-[dogEarSequence_6s_ease-in-out_infinite]'
        )}
        style={{
          animationDelay: '0.03s',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        }}
      >
        <StarIcon className="w-4 h-4" />
      </div>

      {/* Image + Title Group (no gap) */}
      {imgUrl && (
        <div className="w-full relative z-10 m-0 p-0">
          <img
            src={imgUrl}
            alt={title}
            className="w-full h-36 object-cover block m-0 p-0 rounded-none"
          />
          <div className="bg-pink-800 text-white flex justify-between items-center px-4 py-3 m-0">
            <CardTitle className="text-white text-base font-semibold m-0 p-0">{title}</CardTitle>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      )}

      {/* Description */}
      <CardContent className="pt-2 pb-3 px-4 relative z-10 text-justify text-gray-900 dark:text-gray-200">
        <p>{content}</p>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{card}</Link> : card;
};

export default CardDogEar;
