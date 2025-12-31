import { Link } from "@heroui/link";
import { title } from "@/components/primitives";
import { appRoutes } from "@/config/site";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { useEffect } from "react";

type FlatRoute = {
  name: string;
  path?: string;
  protected: boolean;
  isParent?: boolean; // optional
  parent?: string;    // optional
};

export default function AllLinks() {
  const flatRoutes: FlatRoute[] = [];
  const adminRoute = appRoutes.find((route) => route.name === "Admin")?.children?.find((route) => route.name === "Admin Home");

  useEffect(() => {
    document.title = "All Links";
  }, []);

  for (const route of appRoutes) {
    if ("children" in route && route.children) {
      // parent
      flatRoutes.push({
        name: route.name,
        path: route.path,
        protected: route.protected,
        isParent: true,
      });

      // children
      route.children.forEach((child) => {
        flatRoutes.push({
          name: child.name,
          path: child.path,
          protected: child.protected,
          parent: route.path,
        });
      });
    } else {
      // ignore wildcard route
      if (route.path !== "*") {
        flatRoutes.push({
          name: route.name,
          path: route.path,
          protected: route.protected,
        });
      }
    }
  }

  return (
    <section className="flex flex-col items-center gap-6 py-8 px-8 md:py-10">
      <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
        <h1 className={title()}>All Links</h1>
        <Breadcrumbs>
          <BreadcrumbItem href={adminRoute?.path}>Admin</BreadcrumbItem>
          <BreadcrumbItem>All Links</BreadcrumbItem>
        </Breadcrumbs>
      </div>

      <div className="w-full max-w-6xl px-4 grid grid-cols-1 gap-6">
        <div className="flex flex-col gap-3">
          {flatRoutes.map((route) => (
            <div
              key={route.name}
              className={`flex justify-between items-center border-b border-default-200 pb-2
                  ${route.parent ? "pl-6" : ""}`}
            >
              <span>
                {route.name}{" "}
                <span className="text-sm text-default-500">
                  ({route.protected ? "Protected" : "Public"})
                </span>
              </span>

              <Link href={route.path} underline="hover">
                {route.path}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
