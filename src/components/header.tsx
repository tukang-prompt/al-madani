type HeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-center border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex-1" />
      <h1 className="text-lg font-bold font-headline tracking-tight text-center">{title}</h1>
      <div className="flex flex-1 items-center justify-end gap-2">
        {children}
      </div>
    </header>
  );
}
