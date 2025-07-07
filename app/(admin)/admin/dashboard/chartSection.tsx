'use client';

import AnimatedStats from "./chart/animatedStats";
import DashboardChart from "./chart/dashboardChart";
import FilesStatsCharts from "./chart/fileStartsCharts";

export default function ChartSection() {
    return (
        <div className="flex flex-col gap-4">
            <AnimatedStats />
            <DashboardChart />
            <FilesStatsCharts />
        </div>
    );
}