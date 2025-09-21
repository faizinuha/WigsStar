
"use client"

import * as React from "react"
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Indonesia' },
    { code: 'ja', name: '日本語' },
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language)?.name || 'English';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center">
          <Globe className="mr-2 h-4 w-4" />
          {currentLanguage}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
            <DropdownMenuItem key={lang.code} onClick={() => i18n.changeLanguage(lang.code)}>
                {lang.name}
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
