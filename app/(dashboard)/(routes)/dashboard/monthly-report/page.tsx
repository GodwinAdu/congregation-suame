import { Suspense } from "react";
import { MonthlyReportView } from "./_components/monthly-report-view";
import Heading from "@/components/commons/Header";
import { Separator } from "@/components/ui/separator";

interface SearchParams {
    month?: string;
    year?: string;
}

const page = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
    const params = await searchParams;
    const currentDate = new Date();
    const month = params.month ? parseInt(params.month) : currentDate.getMonth() + 1;
    const year = params.year ? parseInt(params.year) : currentDate.getFullYear();

    return (
        <>
            <Heading title="Monthly Congregation Report" />
            <Separator />
            <Suspense fallback={<div>Loading...</div>}>
                <MonthlyReportView month={month} year={year} />
            </Suspense>
        </>
    );
};

export default page;