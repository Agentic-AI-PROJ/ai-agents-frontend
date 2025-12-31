import { Card, CardBody } from '@heroui/card';
import { Avatar } from '@heroui/avatar';
import { useUser } from '@/contexts/UserContext';
import { GoogleIcon } from '@/components/icons';
import { GithubIcon } from '@/components/icons';
import { MailIcon } from '@/components/icons';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { user } = useUser();
    useEffect(() => {
        document.title = "Profile";
    }, []);
    if (user) {
        return (
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <Card className="max-w-md w-full">
                    <CardBody className="flex flex-col items-center gap-4 p-6">
                        <Avatar
                            src={user.avatar}
                            size="lg"
                        />
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">{user.displayName}</h2>
                            <p className="text-default-500">{user.email}</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <p className="text-sm text-default-600">Connected accounts:</p>
                            {user.providers.map((provider, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                    {provider.provider === 'google' ? (
                                        <GoogleIcon size={20} />
                                    ) : provider.provider === 'github' ? (
                                        <GithubIcon size={20} />
                                    ) : (
                                        <MailIcon size={20} />
                                    )}
                                    <span className="capitalize">{provider.provider}</span>
                                    <span className="text-default-400">({provider.email})</span>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </section>
        );
    }
}
