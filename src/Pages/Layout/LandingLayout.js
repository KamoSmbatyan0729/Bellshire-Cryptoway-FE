import { Box } from "@chakra-ui/react";
import Footer from "./Footer";
import Header from "./Header";

export default function LandingLayout({children}){
    return (
        <Box className="flex flex-col min-h-screen h-full">
            <Header/>
            <Box className="grow bg-[#f6f6f6]">
                {children}
            </Box>
            <Footer/>
        </Box>
    );
}