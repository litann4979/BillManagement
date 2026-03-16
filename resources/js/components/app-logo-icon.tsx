import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    const { className, ...rest } = props;
    return (
        <>
            <img
                src="/images/billinglightlogo.png"
                alt="Admin Panel"
                className={`block dark:hidden ${className ?? ''}`}
                {...rest}
            />
            <img
                src="/images/billingdarklogo.png"
                alt="Admin Panel"
                className={`hidden dark:block ${className ?? ''}`}
                {...rest}
            />
        </>
    );
}
