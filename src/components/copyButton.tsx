import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";

interface CopyButtonProps {
  onClick: () => void; // copy logic handled outside
  label?: string;
  showLabel?: boolean; // whether to show text label, default true
}

const CopyButton: React.FC<CopyButtonProps> = ({
  onClick,
  label = "Copy Code",
  showLabel = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onClick(); // call external copy logic
    setCopied(true); // show check icon
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip
      content={label}
      placement="bottom"
      isDisabled={showLabel}
      className="text-foreground font-semibold"
    >
      <Button
        size="sm"
        variant="light"
        color="default"
        className="text-foreground"
        isIconOnly={!showLabel}
        startContent={copied ? <Check size={16} /> : <Copy size={16} />}
        onClick={handleClick}
      >
        {showLabel ? (copied ? "Copied" : label) : null}
      </Button>
    </Tooltip>
  );
};

export default CopyButton;
