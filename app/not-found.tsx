'use client';
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
    return <div className="flex flex-col items-center justify-center min-h-screen">
        <Image
            src='/images/logo2.svg'
            width={120}
            height={120}
            alt={`${APP_NAME} GoGirls Logo`}
            priority={true}
        />
        <div className="p-6 w-1/3 rounded-lg shadow-md text-center">
            <h1 className="text-3xl font-bold mb-4">Not Found</h1>
            <p className="text-destructive">Could not find the requested page</p>
            <Button variant='ghost' className="mt-4 ml-2 bg-pink-800" onClick={ () => (window.location.href='/')}>Back to Home</Button>
        </div>
    </div>;
};
 
export default NotFoundPage;