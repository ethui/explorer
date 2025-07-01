interface PageContainerProps {
  children: React.ReactNode;
  header?: React.ReactNode | string;
}

function PageContainer({ children, header }: PageContainerProps) {
  return (
    <div className="flex flex-1 flex-col items-center p-10">
      <div className="flex w-full max-w-[1400px] flex-col">
        {header && <h3 className="pb-1 font-bold text-xl">{header}</h3>}
        {children}
      </div>
    </div>
  );
}

export default PageContainer;
