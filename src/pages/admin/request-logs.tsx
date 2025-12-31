import { useEffect, useRef, useState } from "react";
import { title } from "@/components/primitives";
import { Card, CardBody } from "@heroui/card";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Chip } from "@heroui/chip";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { RefreshCcw } from "lucide-react";
import { appRoutes } from "@/config/site";
import { getLogs, getLogStats, RequestLog, LogStats } from "@/api/logs.api";

export default function RequestLogsPage() {
    const [logs, setLogs] = useState<RequestLog[]>([]);
    const [stats, setStats] = useState<LogStats[]>([]);
    const [globalTotals, setGlobalTotals] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [usdToInr, setUsdToInr] = useState(90);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    // Filter s
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Sorting - using HeroUI's SortDescriptor
    const [sortDescriptor, setSortDescriptor] = useState<{ column: string, direction: 'ascending' | 'descending' }>({
        column: "total_requests",
        direction: "descending"
    });

    const effectRan = useRef(false);
    const adminRoute = appRoutes.find((route) => route.name === "Admin")?.children?.find((route) => route.name === "Admin Home");

    useEffect(() => {
        document.title = "Request Logs";
        if (effectRan.current) return;
        effectRan.current = true;
        fetchData();
    }, []);

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchLogs(page),
                fetchStats()
            ]);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async (pageNum: number) => {
        try {
            const params: any = { page: pageNum, limit };
            if (startDate) params.start_date = new Date(startDate).toISOString();
            if (endDate) params.end_date = new Date(endDate).toISOString();

            const res = await getLogs(params);
            setLogs(res.data);
            setTotalPages(res.meta.pages);
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const start = startDate ? new Date(startDate).toISOString() : undefined;
            const end = endDate ? new Date(endDate).toISOString() : undefined;
            const sortOrder = sortDescriptor.direction === "ascending" ? "asc" : "desc";
            const res = await getLogStats(start, end, sortDescriptor.column, sortOrder);
            setStats(res.data);
            setGlobalTotals(res.global_totals);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page on filter
        fetchData();
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num);
    };

    const handleRowClick = (log: RequestLog) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    return (
        <section className="flex flex-col items-center gap-6 py-8 md:py-10">
            <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className={title({ size: "sm" })}>Request Logs & Usage</h1>
                    <Breadcrumbs>
                        <BreadcrumbItem href={adminRoute?.path}>Admin</BreadcrumbItem>
                        <BreadcrumbItem>Request Logs</BreadcrumbItem>
                    </Breadcrumbs>
                </div>

                {/* Filters */}
                <form onSubmit={handleFilterSubmit} className="flex gap-4 items-end flex-wrap bg-content1 p-4 rounded-lg">
                    <div className="flex flex-col gap-1">
                        <label className="text-small text-default-500">Start Date</label>
                        <input
                            type="date"
                            className="px-3 py-2 rounded-lg bg-default-100 outline-none focus:ring-2 focus:ring-primary text-small"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-small text-default-500">End Date</label>
                        <input
                            type="date"
                            className="px-3 py-2 rounded-lg bg-default-100 outline-none focus:ring-2 focus:ring-primary text-small"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <Button type="submit" color="primary" isLoading={loading}>
                        Apply Filters
                    </Button>
                    <Button
                        variant="flat"
                        onPress={() => {
                            setStartDate("");
                            setEndDate("");
                            // We need to trigger a fetch after state clear, but state update is async.
                            // So we pass empty strings directly to a dedicated reset function or just reload page logic.
                            // Simplest here is just clear state and let user click 'Apply' or handle in effect if wanted.
                            // Better UX: clear and fetch.
                            setStartDate("");
                            setEndDate("");
                            setTimeout(() => {
                                // HACK: Quick way to trigger refetch with empty values without massive refactor
                                // Ideally pass params to fetch functions directly instead of reading state
                                const params: any = { page: 1, limit };
                                getLogs(params).then(res => {
                                    setLogs(res.data);
                                    setTotalPages(res.meta.pages);
                                });
                                const sortOrder = sortDescriptor.direction === "ascending" ? "asc" : "desc";
                                getLogStats(undefined, undefined, sortDescriptor.column, sortOrder).then(res => {
                                    setStats(res.data);
                                    setGlobalTotals(res.global_totals);
                                });
                            }, 0);
                        }}
                    >
                        Clear
                    </Button>
                </form>

                {/* Stats Cards */}
                {globalTotals && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardBody className="gap-1">
                                <p className="text-small text-default-500">Total Requests</p>
                                <h4 className="text-2xl font-bold">{formatNumber(globalTotals.total_requests)}</h4>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="gap-1">
                                <p className="text-small text-default-500">Total Tokens</p>
                                <h4 className="text-2xl font-bold">{formatNumber(globalTotals.total_tokens)}</h4>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="gap-1">
                                <p className="text-small text-default-500">Input Tokens</p>
                                <h4 className="text-2xl font-bold">{formatNumber(globalTotals.input_tokens)}</h4>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="gap-1">
                                <p className="text-small text-default-500">Output Tokens</p>
                                <h4 className="text-2xl font-bold">{formatNumber(globalTotals.output_tokens)}</h4>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="gap-1">
                                <p className="text-small text-default-500">Total Cost (USD)</p>
                                <h4 className="text-2xl font-bold">${globalTotals.total_cost.toFixed(4)}</h4>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="gap-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-small text-default-500">Total Cost (INR)</p>
                                    <input
                                        type="number"
                                        className="w-20 px-2 py-1 text-sm border rounded-md text-center"
                                        value={usdToInr}
                                        onChange={(e) => setUsdToInr(Number(e.target.value))}
                                    />
                                </div>

                                <h4 className="text-2xl font-bold">
                                    ₹{(globalTotals.total_cost * usdToInr).toFixed(2)}
                                </h4>
                            </CardBody>
                        </Card>

                    </div>
                )}

                {/* Model Usage Table */}
                {stats.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-semibold">Model Usage</h2>
                        <Table
                            aria-label="Model Usage Stats"
                            sortDescriptor={sortDescriptor}
                            onSortChange={(descriptor: any) => {
                                setSortDescriptor(descriptor);
                                setTimeout(() => fetchStats(), 0);
                            }}
                        >
                            <TableHeader>
                                <TableColumn key="model_name" allowsSorting>MODEL NAME</TableColumn>
                                <TableColumn key="total_requests" allowsSorting>TOTAL REQUESTS</TableColumn>
                                <TableColumn key="total_tokens" allowsSorting>TOTAL TOKENS</TableColumn>
                                <TableColumn key="total_cost" allowsSorting>TOTAL COST</TableColumn>
                                <TableColumn key="avg_response_time" allowsSorting>AVG LATENCY</TableColumn>
                                <TableColumn key="successful_requests" allowsSorting>SUCCESS RATE</TableColumn>
                            </TableHeader>
                            <TableBody items={stats}>
                                {(item) => (
                                    <TableRow key={item.model_id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.model_name || item.model_id}</span>
                                                <span className="text-tiny text-default-400">{item.provider}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatNumber(item.total_requests)}</TableCell>
                                        <TableCell>{formatNumber(item.total_tokens)}</TableCell>
                                        <TableCell>${item.total_cost.toFixed(4)}</TableCell>
                                        <TableCell>{Math.round(item.avg_response_time)}ms</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={item.failed_requests === 0 ? "success" : "warning"}
                                                variant="flat"
                                            >
                                                {Math.round((item.successful_requests / item.total_requests) * 100)}%
                                            </Chip>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="flex justify-between items-center mt-4">
                    <h2 className="text-xl font-semibold">Detailed Logs</h2>
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => fetchData()}
                        isLoading={loading}
                    >
                        <RefreshCcw size={20} />
                    </Button>
                </div>

                <Table aria-label="Request Logs Table">
                    <TableHeader>
                        <TableColumn>TIMESTAMP</TableColumn>
                        <TableColumn>MODEL</TableColumn>
                        <TableColumn>TOKENS (In/Out)</TableColumn>
                        <TableColumn>COST</TableColumn>
                        <TableColumn>LATENCY</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>DETAILS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"No logs found."} items={logs}>
                        {(item) => (
                            <TableRow key={item._id} className="cursor-pointer hover:bg-default-100" onClick={() => handleRowClick(item)}>
                                <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-small">{item.ai_model_id}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-small">
                                        <span>Total: {formatNumber(item.total_tokens)}</span>
                                        <span className="text-default-400 text-tiny">
                                            {formatNumber(item.input_tokens)} / {formatNumber(item.output_tokens)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-small">
                                        {item.cost !== undefined ? `$${item.cost.toFixed(6)}` : '-'}
                                    </span>
                                </TableCell>
                                <TableCell>{Math.round(item.response_time_ms)}ms</TableCell>
                                <TableCell>
                                    <Chip
                                        size="sm"
                                        color={item.success ? "success" : "danger"}
                                        variant="flat"
                                    >
                                        {item.success ? "Success" : "Failed"}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    {item.error_message ? (
                                        <span className="text-danger text-tiny max-w-xs truncate block" title={item.error_message}>
                                            {item.error_message}
                                        </span>
                                    ) : (
                                        <span className="text-default-400">-</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="flex justify-center mt-4">
                    <Pagination
                        total={totalPages}
                        page={page}
                        onChange={setPage}
                        showControls
                    />
                </div>

                {/* Details Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    size="3xl"
                    scrollBehavior="inside"
                >
                    <ModalContent>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">

                                <h3>Request Log Details</h3>
                                {
                                    selectedLog && (
                                        <>
                                            <Chip
                                                size="sm"
                                                color={selectedLog.success ? "success" : "danger"}
                                                variant="flat"
                                            >
                                                {selectedLog.success ? "Success" : "Failed"}
                                            </Chip>
                                            <span className="font-mono text-xs bg-default-100 px-2 py-0.5 rounded">{Math.round(selectedLog.response_time_ms)}ms</span>
                                        </>
                                    )
                                }
                            </div>
                            {selectedLog && (
                                <div className="flex items-center gap-2">
                                    <p className="text-small text-default-500">
                                        {new Date(selectedLog.timestamp).toLocaleString()}
                                    </p>
                                    <span className="font-mono text-xs bg-default-100 px-2 py-0.5 rounded">
                                        {selectedLog.ai_model_id}
                                    </span>
                                </div>
                            )}
                        </ModalHeader>
                        <ModalBody>
                            {selectedLog && (
                                <div className="flex flex-col gap-4">
                                    {/* Overview Section */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-small text-default-500">Input Tokens</span>
                                            <span className="font-medium">{formatNumber(selectedLog.input_tokens)}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-small text-default-500">Output Tokens</span>
                                            <span className="font-medium">{formatNumber(selectedLog.output_tokens)}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-small text-default-500">Total Tokens</span>
                                            <span className="font-medium">{formatNumber(selectedLog.total_tokens)}</span>
                                        </div>
                                        {selectedLog.cost !== undefined && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-small text-default-500">Cost</span>
                                                <span className="font-medium">${selectedLog.cost.toFixed(6)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {selectedLog.error_message && (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-small text-default-500">Error Message</span>
                                            <div className="p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                                                <code className="text-danger text-small">{selectedLog.error_message}</code>
                                            </div>
                                        </div>
                                    )}

                                    {/* Input Text */}
                                    {selectedLog.input_text && (
                                        <div className="flex flex-col gap-2">
                                            <span className="text-small text-default-500">Input Messages</span>
                                            <div className="p-3 bg-default-100 rounded-lg max-h-64 overflow-y-auto">
                                                <pre className="text-small whitespace-pre-wrap break-words">
                                                    {selectedLog.input_text}
                                                </pre>
                                            </div>
                                        </div>
                                    )}

                                    {/* Output Text */}
                                    {selectedLog.output_text && (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-small text-default-500">Output Text</span>
                                            <div className="p-3 bg-default-100 rounded-lg max-h-64 overflow-y-auto">
                                                <pre className="text-small whitespace-pre-wrap break-words">{selectedLog.output_text}</pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </div>
        </section>
    );
}
