export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden">
                <img
                    src="/images/billinglightlogo.png"
                    alt="Admin Panel"
                    className="size-8 object-contain block dark:hidden"
                />
                <img
                    src="/images/billingdarklogo.png"
                    alt="Admin Panel"
                    className="size-8 object-contain hidden dark:block"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Admin Panel
                </span>
            </div>
        </>
    );
}
