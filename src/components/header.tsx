
import { UserNav } from "./user-nav";

type HeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="w-10"></div>
      <h1 className="text-lg font-bold font-headline tracking-tight text-center flex-1 truncate">{title}</h1>
      <div className="flex items-center justify-end gap-2 w-10">
        {children}
      </div>
    </header>
  );
}
