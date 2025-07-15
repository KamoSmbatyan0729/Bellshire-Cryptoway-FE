import { Box } from "@chakra-ui/react";
import Footer from "./Footer";
import Header from "./Header";

export default function LandingLayout({children}){
    return (
        <Box className="flex flex-col min-h-screen h-full text-white bg-gray-700">
            <Header/>
            <Box className="grow bg-gray-600">
                {children}
            </Box>
            <Footer/>
        </Box>
    );
}