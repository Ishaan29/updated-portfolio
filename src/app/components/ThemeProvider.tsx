"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem
            themes={["light", "dark", "amber"]}
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}
