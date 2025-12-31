import { useEffect, useRef, useState } from "react";
import { title } from "@/components/primitives";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { appRoutes } from "@/config/site";
import { useAlert } from "@/contexts/AlertContext";
import { aiModelsApi } from "@/api/aiModels.api";
import { AIModel } from "@/types/AIModel";
import AIModelForm from "@/components/admin/AIModelForm";

export default function AIModelsPage() {
    const [models, setModels] = useState<AIModel[]>([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onOpenChange: onDeleteOpenChange,
    } = useDisclosure();

    const [currentModel, setCurrentModel] = useState<Partial<AIModel>>({});
    const [modelToDelete, setModelToDelete] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const effectRan = useRef(false);
    const { showAlert } = useAlert();

    const adminRoute = appRoutes.find((route) => route.name === "Admin")?.children?.find((route) => route.name === "Admin Home");

    useEffect(() => {
        document.title = `AI Models`;
        if (effectRan.current) return;
        effectRan.current = true;
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const data = await aiModelsApi.getAll();
            setModels(data);
        } catch (error) {
            console.error("Error fetching models:", error);
            showAlert({
                title: "Error fetching models",
                variant: "danger",
                timeout: 5000
            });
        }
    };

    const handleSave = async () => {
        try {
            if (isEditing && currentModel._id) {
                await aiModelsApi.update(currentModel._id, currentModel);
            } else {
                await aiModelsApi.create(currentModel);
            }
            showAlert({
                title: "Model saved successfully",
                variant: "success",
                timeout: 5000
            });
            fetchModels();
            onOpenChange();
        } catch (error) {
            console.error("Error saving model:", error);
            showAlert({
                title: "Error saving model",
                variant: "danger",
                timeout: 5000
            });
        }
    };

    const handleDelete = (id: string) => {
        setModelToDelete(id);
        onDeleteOpen();
    };

    const confirmDelete = async () => {
        if (modelToDelete) {
            try {
                await aiModelsApi.delete(modelToDelete);
                showAlert({
                    title: "Model deleted successfully",
                    variant: "success",
                    timeout: 5000
                });
                fetchModels();
                onDeleteOpenChange();
            } catch (error) {
                console.error("Error deleting model:", error);
                showAlert({
                    title: "Error deleting model",
                    variant: "danger",
                    timeout: 5000
                });
            }
        }
    };

    const openModal = (model?: AIModel) => {
        if (model) {
            // Clone deeply because of nested objects
            setCurrentModel(JSON.parse(JSON.stringify(model)));
            setIsEditing(true);
        } else {
            setCurrentModel({
                isActive: true,
                limits: { input_types: ["text"], output_types: ["text"] } as any,
                cost: { input_per_million: 0, output_per_million: 0 },
                details: { requests_per_minute: null, requests_per_day: null }
            });
            setIsEditing(false);
        }
        onOpen();
    };

    return (
        <section className="flex flex-col items-center gap-6 py-8 px-8 md:py-10">
            <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
                <h1 className={title()}>AI Models</h1>
                <Breadcrumbs>
                    <BreadcrumbItem href={adminRoute?.path}>Admin</BreadcrumbItem>
                    <BreadcrumbItem>AI Models</BreadcrumbItem>
                </Breadcrumbs>
            </div>
            <div className="w-full max-w-6xl px-4">
                <div className="flex justify-end mb-4">
                    <Button color="primary" onPress={() => openModal()}>
                        Add Model
                    </Button>
                </div>
                <Table aria-label="AI Models Table">
                    <TableHeader>
                        <TableColumn>NAME</TableColumn>
                        <TableColumn>MODEL ID</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>RPM/RPD</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"No models found"}>
                        {models.map((model) => (
                            <TableRow key={model._id}>
                                <TableCell>{model.name}</TableCell>
                                <TableCell className="font-mono text-tiny">{model.model_id}</TableCell>
                                <TableCell>
                                    <Chip color={model.isActive ? "success" : "danger"} size="sm" variant="flat">
                                        {model.isActive ? "Active" : "Inactive"}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    {model.details?.requests_per_minute || "∞"} / {model.details?.requests_per_day || "∞"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button size="sm" onPress={() => openModal(model)}>
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            onPress={() => handleDelete(model._id!)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {isEditing ? "Edit Model" : "New Model"}
                            </ModalHeader>
                            <ModalBody>
                                <AIModelForm model={currentModel} onChange={setCurrentModel} />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={handleSave}>
                                    Save
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Confirm Delete
                            </ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to delete this model?</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" onPress={confirmDelete}>
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </section>
    );
}
