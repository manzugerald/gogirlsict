'use client';

type HeroGifProps = {
  src: string;
  alt?: string;
};

export default function HeroGif({ src, alt = 'Animated hero image' }: HeroGifProps) {
  return (
    <div className="w-full h-[40vh] overflow-hidden relative">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}
