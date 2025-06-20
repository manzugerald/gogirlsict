import { APP_NAME } from "@/lib/constants";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return <footer className="bordr-t bg-[#9f004d]">
        <div className="p-5 flex-center">
            {currentYear} {APP_NAME}. All Rights Reserved
        </div>
    </footer> ;
}
 
export default Footer;