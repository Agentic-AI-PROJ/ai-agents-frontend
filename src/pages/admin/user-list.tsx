import { useEffect, useRef, useState } from "react";
import { title } from "@/components/primitives";
import { ChevronDownIcon, EllipsisVertical, Search } from "lucide-react";
import { User as UserHerouiComponent } from "@heroui/user";
import { Pagination } from "@heroui/pagination";
import {
  Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell,
} from "@heroui/table";
import {
  Dropdown, DropdownItem,
  DropdownMenu, DropdownTrigger
} from "@heroui/dropdown";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import {
  Modal, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure
} from "@heroui/modal";

import { getAllUsers, updateUserRole } from "@/api/user.api";
import { getRoles } from "@/api/roles.api";

import { User } from "@/types/User";
import { Role } from "@/types/Role";
import { GithubIcon, GoogleIcon, MailIcon } from "@/components/icons";
import { useAlert } from "@/contexts/AlertContext";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { appRoutes } from "@/config/site";

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const adminRoute = appRoutes.find((route) => route.name === "Admin")?.children?.find((route) => route.name === "Admin Home");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const effectRan = useRef(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    document.title = `Users`;

    if (effectRan.current) return;
    effectRan.current = true;

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersData = await getAllUsers();
      const rolesData = await getRoles();
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert({
        title: "Error fetching data",
        description: "Error fetching data",
        variant: "danger",
        timeout: 10000 // 10 seconds
      });
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleId(user.role?._id || "");
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (!selectedUser || !selectedRoleId) return;

      await updateUserRole(selectedUser._id, selectedRoleId);
      await fetchData();
      onOpenChange();
    } catch (error) {
      console.error("Error updating role:", error);
      showAlert({
        title: "Error updating role",
        description: "Error updating role",
        variant: "danger",
        timeout: 10000 // 10 seconds
      });
    }
  };

  return (
    <section className="flex flex-col items-center gap-6 py-8 px-8 md:py-10">
      <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
        <h1 className={title()}>Users</h1>
        <Breadcrumbs>
          <BreadcrumbItem href={adminRoute?.path}>Admin</BreadcrumbItem>
          <BreadcrumbItem>Users</BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full"
          placeholder="Search by name..."
          startContent={<Search />}
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                Status
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectionMode="multiple"
            >
              {["active", "inactive"].map((status) => (
                <DropdownItem key={status} className="capitalize">
                  {status}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                Role
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectionMode="multiple"
            >
              {roles.map((role) => (
                <DropdownItem key={role._id} className="capitalize">
                  {role.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="w-full max-w-6xl px-4">
        <Table aria-label="Users Table">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>ROLE</TableColumn>
            <TableColumn>PROVIDERS</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>LAST UPDATED</TableColumn>
            <TableColumn>CREATED AT</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <UserHerouiComponent
                    avatarProps={{ src: user.avatar }}
                    description={user.email}
                    name={user.displayName}
                  />
                </TableCell>

                <TableCell>{user.role?.name || "No Role"}</TableCell>

                <TableCell>
                  {user.providers.map((provider, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {provider.provider === "google" ? (
                        <GoogleIcon size={20} />
                      ) : provider.provider === "github" ? (
                        <GithubIcon size={20} />
                      ) : (
                        <MailIcon size={20} />
                      )}
                      <span className="text-default-400">{provider.email}</span>
                    </div>
                  ))}
                </TableCell>

                <TableCell><Chip variant="flat" color={user.status === "active" ? "success" : "danger"}>{user.status}</Chip></TableCell>

                <TableCell>{new Date(user.updatedAt).toLocaleString()}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>

                <TableCell>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <EllipsisVertical size={20} />
                      </Button>
                    </DropdownTrigger>

                    <DropdownMenu>
                      <DropdownItem key="edit" onPress={() => openEditModal(user)}>
                        Edit Role
                      </DropdownItem>

                      <DropdownItem key="delete" className="text-danger" color="danger">
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      </div>
      <div className="flex items-center justify-center gap-2">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={1}
          total={10}
          onChange={() => { }}
        />
      </div>

      {/* Edit Role Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit User Role</ModalHeader>
              <ModalBody>
                <Select
                  label="Select Role"
                  selectedKeys={selectedRoleId ? new Set([selectedRoleId]) : new Set()}
                  onSelectionChange={(keys: any) =>
                    setSelectedRoleId(Array.from(keys)[0] as string)
                  }
                >
                  {roles.map((role) => (
                    <SelectItem key={role._id}>{role.name}</SelectItem>
                  ))}
                </Select>
              </ModalBody>

              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>

                <Button color="primary" onPress={handleSave}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}