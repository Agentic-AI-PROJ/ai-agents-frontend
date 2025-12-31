import { title } from '@/components/primitives'
import { appRoutes, Route } from '@/config/site'
import { Link } from '@heroui/link'
import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
    const adminRoutes = appRoutes.find(route => route.name === "Admin")?.children || [];


    const { user, loading } = useUser();
    const navigate = useNavigate();


    useEffect(() => {
        document.title = "Admin Endpoints";
        if (!loading && user?.role?.name !== "admin") {
            navigate("/");
        }
    }, [user, loading]);


    return (
        <section className="flex flex-col items-center gap-6 py-8 px-8 md:py-10">
            <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
                <h1 className={title()}>Admin Endpoints</h1>
            </div>
            <div className="w-full max-w-6xl px-4">
                <div className="flex flex-col gap-3">
                    {
                        adminRoutes.map((route: Route) => (
                            <div
                                key={route.path}
                                className={`flex justify-between items-center border-b border-default-200 pb-2`}
                            >
                                <span>
                                    {route.name}{" "}
                                </span>

                                <Link href={route.path} underline="hover">
                                    {route.path}
                                </Link>
                            </div>
                        ))
                    }
                </div>
            </div>
        </section >
    )
}
