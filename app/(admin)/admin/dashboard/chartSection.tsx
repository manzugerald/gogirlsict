'use client';

import DashboardChart from "./chart/dashboardChart";
import FilesStatsCharts from "./chart/fileStartsCharts";

export default function ChartSection() {
    return (
        <div className="flex flex-col gap-8">
            <DashboardChart />
            <FilesStatsCharts />
        </div>
    );
}