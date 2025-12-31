import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgentExecutions, AgentExecution, AgentExecutionFilters } from '@/api/agent_execution.api';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { RotateCcw } from 'lucide-react';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/breadcrumbs';
import { appRoutes } from '@/config/site';
import { title } from '@/components/primitives';

const columns = [
    { key: "executionId", label: "EXECUTION ID" },
    { key: "status", label: "STATUS" },
    { key: "userMessage", label: "USER MESSAGE" },
    { key: "startTime", label: "START TIME" },
    { key: "endTime", label: "END TIME" },
];

const statusOptions = [
    { label: "Success", value: "SUCCESS" },
    { label: "Running", value: "RUNNING" },
    { label: "Failed", value: "FAILED" },
];

export default function AgentExecutionPage() {
    const navigate = useNavigate();
    const [executions, setExecutions] = useState<AgentExecution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const adminRoute = appRoutes.find((route) => route.name === "Admin")?.children?.find((route) => route.name === "Admin Home");

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const fetchExecutions = async () => {
        setIsLoading(true);
        try {
            const skip = (page - 1) * limit;
            const filters: AgentExecutionFilters = {
                limit,
                skip,
            };

            if (statusFilter) filters.status = statusFilter;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const response = await getAgentExecutions(filters);
            setExecutions(response.data);
            setTotalPages(Math.ceil(response.pagination.total / response.pagination.limit));
        } catch (error) {
            console.error("Failed to fetch executions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Agent Executions";
        fetchExecutions();
    }, [page, limit, statusFilter, startDate, endDate]);

    const handleReset = () => {
        setStatusFilter("");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    const renderCell = (item: AgentExecution, columnKey: React.Key) => {
        const cellValue = getKeyValue(item, columnKey as string);

        switch (columnKey) {
            case "status":
                return (
                    <Chip
                        color={cellValue === "SUCCESS" ? "success" : cellValue === "FAILED" ? "danger" : "warning"}
                        variant="flat"
                        size="sm"
                    >
                        {cellValue}
                    </Chip>
                );
            case "startTime":
            case "endTime":
                return cellValue ? new Date(cellValue).toLocaleString() : "-";
            case "userMessage":
                return <span className="truncate max-w-xs block" title={cellValue}>{cellValue}</span>;
            case "executionId":
                return <span className="font-mono text-xs">{cellValue}</span>;
            default:
                return cellValue;
        }
    };

    return (
        <section className="flex flex-col items-center gap-6 py-8 px-8 md:py-10">
            <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
                <h1 className={title()}>Agent Executions</h1>
                <Breadcrumbs>
                    <BreadcrumbItem href={adminRoute?.path}>Admin</BreadcrumbItem>
                    <BreadcrumbItem>All Links</BreadcrumbItem>
                </Breadcrumbs>
            </div>

            <div className="w-full max-w-6xl px-4 flex flex-col gap-4">

                <div className="flex justify-end">
                    <Button
                        color="primary"
                        variant="flat"
                        startContent={<RotateCcw size={16} />}
                        onPress={fetchExecutions}
                        isLoading={isLoading}
                    >
                        Refresh
                    </Button>
                </div>

                <Card>
                    <CardBody className="gap-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <Select
                                label="Status"
                                placeholder="Select status"
                                className="w-full sm:w-48"
                                selectedKeys={statusFilter ? [statusFilter] : []}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                {statusOptions.map((status) => (
                                    <SelectItem key={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                type="date"
                                label="Start Date"
                                className="w-full sm:w-48"
                                value={startDate}
                                onValueChange={(val) => {
                                    setStartDate(val);
                                    setPage(1);
                                }}
                                labelPlacement="inside"
                            />

                            <Input
                                type="date"
                                label="End Date"
                                className="w-full sm:w-48"
                                value={endDate}
                                onValueChange={(val) => {
                                    setEndDate(val);
                                    setPage(1);
                                }}
                                labelPlacement="inside"
                            />

                            <div className="flex-1" />

                            <Button
                                color="default"
                                variant="light"
                                onPress={handleReset}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                <Table
                    aria-label="Agent Executions Table"
                    selectionMode="single"
                    onRowAction={(key) => {
                        const execution = executions.find(e => e._id === key);
                        if (execution) {
                            navigate(`/admin/agent-execution/${execution.executionId}`);
                        }
                    }}
                    bottomContent={
                        totalPages > 0 ? (
                            <div className="flex w-full justify-center">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    page={page}
                                    total={totalPages}
                                    onChange={(page) => setPage(page)}
                                />
                            </div>
                        ) : null
                    }
                >
                    <TableHeader columns={columns}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                    </TableHeader>
                    <TableBody
                        items={executions}
                        isLoading={isLoading}
                        loadingContent={
                            <div className="flex w-full justify-center items-center h-48 backdrop-blur-sm bg-background/50 z-50">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <div className="text-small text-default-500 font-medium">Loading executions...</div>
                                </div>
                            </div>
                        }
                        emptyContent={<div className="text-center p-8 text-default-500">No executions found.</div>}
                    >
                        {(item) => (
                            <TableRow key={item._id} className="cursor-pointer">
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}
