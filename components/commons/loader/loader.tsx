"use client";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const Loader = () => {
    return (
        <>
            <ProgressBar
                height="4px"
                color="#000"
                options={{ showSpinner: false }}
                shallowRouting
            />
        </>
    );
};

export default Loader;
