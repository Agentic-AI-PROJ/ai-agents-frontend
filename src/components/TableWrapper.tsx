import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Copy, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@heroui/button';
import { Tooltip } from '@heroui/tooltip';

interface TableWrapperProps extends React.HTMLAttributes<HTMLTableElement> {
    children?: React.ReactNode;
}

const TableWrapper: React.FC<TableWrapperProps> = ({ children, className, ...props }) => {
    const tableRef = useRef<HTMLTableElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleCopyTSV = () => {
        if (!tableRef.current) return;
        const wb = XLSX.utils.table_to_book(tableRef.current);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const tsv = XLSX.utils.sheet_to_csv(ws, { FS: "\t" });
        navigator.clipboard.writeText(tsv);
    };

    const handleDownloadCSV = () => {
        if (!tableRef.current) return;
        const wb = XLSX.utils.table_to_book(tableRef.current);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, "table_data.csv");
    };

    const handleDownloadXLS = () => {
        if (!tableRef.current) return;
        const wb = XLSX.utils.table_to_book(tableRef.current);
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "table_data.xlsx");
    };

    return (
        <div
            className="relative group mb-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && (
                <div className="absolute top-0 right-0 -mt-8 flex gap-1 bg-background/80 backdrop-blur-sm p-1 rounded-t-lg border border-b-0 border-default/20 z-10 transition-opacity duration-200">
                    <Tooltip content="Copy TSV (Excel ready)">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={handleCopyTSV}
                            className="h-6 w-6 min-w-6"
                        >
                            <Copy size={14} className="text-foreground/70" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Download CSV">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={handleDownloadCSV}
                            className="h-6 w-6 min-w-6"
                        >
                            <FileSpreadsheet size={14} className="text-foreground/70" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Download Excel">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={handleDownloadXLS}
                            className="h-6 w-6 min-w-6"
                        >
                            <Download size={14} className="text-foreground/70" />
                        </Button>
                    </Tooltip>
                </div>
            )}
            <div className="relative overflow-x-auto rounded-lg border border-default/20">
                <table
                    ref={tableRef}
                    className={`nav-table w-full text-sm text-left rtl:text-right text-foreground ${className || ''}`}
                    {...props}
                >
                    {children}
                </table>
            </div>
        </div>
    );
};

export default TableWrapper;
