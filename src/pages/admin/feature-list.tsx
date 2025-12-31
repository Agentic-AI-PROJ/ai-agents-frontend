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
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Switch } from "@heroui/switch";
import {
  getFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
} from "@/api/feature.api";
import { Feature } from "@/types/Feature";
import { getRoles } from "@/api/roles.api";
import { getAllUsers } from "@/api/user.api";
import { Role } from "@/types/Role";
import { User } from "@/types/User";
import { useAlert } from "@/contexts/AlertContext";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { appRoutes } from "@/config/site";

export default function FeatureListPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();
  const [currentFeature, setCurrentFeature] = useState<Partial<Feature>>({});
  const [featureToDelete, setFeatureToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const effectRan = useRef(false);
  const { showAlert } = useAlert();
  const adminRoute = appRoutes.find((route) => route.name === "Admin")?.children?.find((route) => route.name === "Admin Home");

  useEffect(() => {
    document.title = `Feature List`;
    if (effectRan.current) return;
    effectRan.current = true;
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const data = await getFeatures();
      const rolesData = await getRoles();
      const usersData = await getAllUsers();
      setFeatures(data);
      setRoles(rolesData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching features:", error);
      showAlert({
        title: "Error fetching features",
        variant: "danger",
        timeout: 10000 // 10 seconds
      });
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing && currentFeature._id) {
        await updateFeature(currentFeature._id, currentFeature);
      } else {
        await createFeature(currentFeature);
      }
      showAlert({
        title: "Feature saved successfully",
        variant: "success",
        timeout: 10000 // 10 seconds
      });
      fetchFeatures();
      onOpenChange();
    } catch (error) {
      console.error("Error saving feature:", error);
      showAlert({
        title: "Error saving feature",
        variant: "danger",
        timeout: 10000 // 10 seconds
      });
    }
  };

  const handleDelete = (id: string) => {
    setFeatureToDelete(id);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (featureToDelete) {
      try {
        await deleteFeature(featureToDelete);
        showAlert({
          title: "Feature deleted successfully",
          variant: "success",
          timeout: 10000 // 10 seconds
        });
        fetchFeatures();
        onDeleteOpenChange();
      } catch (error) {
        console.error("Error deleting feature:", error);
        showAlert({
          title: "Error deleting feature",
          variant: "danger",
          timeout: 10000 // 10 seconds
        });
      }
    }
  };

  const openModal = (feature?: Feature) => {
    if (feature) {
      setCurrentFeature(feature);
      setIsEditing(true);
    } else {
      setCurrentFeature({ enabledForAll: false });
      setIsEditing(false);
    }
    onOpen();
  };

  return (
    <section className="flex flex-col items-center gap-6 py-8 px-8 md:py-10">
      <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
        <h1 className={title()}>Feature List</h1>
        <Breadcrumbs>
          <BreadcrumbItem href={adminRoute?.path}>Admin</BreadcrumbItem>
          <BreadcrumbItem>Feature List</BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <div className="w-full max-w-6xl px-4">
        <div className="flex justify-end mb-4">
          <Button color="primary" onPress={() => openModal()}>
            Add Feature
          </Button>
        </div>
        <Table aria-label="Feature List Table">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>ENABLED FOR ALL</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {features.map((feature) => (
              <TableRow key={feature._id}>
                <TableCell>{feature.name}</TableCell>
                <TableCell>{feature.description}</TableCell>
                <TableCell>
                  <Switch isSelected={feature.enabledForAll} isDisabled />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onPress={() => openModal(feature)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      onPress={() => handleDelete(feature._id)}
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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? "Edit Feature" : "New Feature"}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  placeholder="Enter feature name"
                  value={currentFeature.name || ""}
                  onChange={(e) =>
                    setCurrentFeature({
                      ...currentFeature,
                      name: e.target.value,
                    })
                  }
                />
                <Textarea
                  label="Description"
                  placeholder="Enter description"
                  value={currentFeature.description || ""}
                  onChange={(e) =>
                    setCurrentFeature({
                      ...currentFeature,
                      description: e.target.value,
                    })
                  }
                />
                <div className="flex items-center justify-between">
                  <span>Enabled For All</span>
                  <Switch
                    isSelected={currentFeature.enabledForAll || false}
                    onValueChange={(value: boolean) =>
                      setCurrentFeature({
                        ...currentFeature,
                        enabledForAll: value,
                      })
                    }
                  />
                </div>
                {!currentFeature.enabledForAll && (
                  <>
                    <Select
                      label="Enabled Roles"
                      placeholder="Select roles"
                      selectionMode="multiple"
                      selectedKeys={new Set(currentFeature.enabledRoles || [])}
                      onSelectionChange={(keys: any) =>
                        setCurrentFeature({
                          ...currentFeature,
                          enabledRoles: Array.from(keys) as string[],
                        })
                      }
                    >
                      {roles.map((role) => (
                        <SelectItem key={role._id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select
                      label="Enabled Users"
                      placeholder="Select users"
                      selectionMode="multiple"
                      selectedKeys={new Set(currentFeature.enabledUsers || [])}
                      onSelectionChange={(keys: any) =>
                        setCurrentFeature({
                          ...currentFeature,
                          enabledUsers: Array.from(keys) as string[],
                        })
                      }
                    >
                      {users.map((user) => (
                        <SelectItem key={user._id}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </Select>
                  </>
                )}
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
                <p>Are you sure you want to delete this feature?</p>
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
