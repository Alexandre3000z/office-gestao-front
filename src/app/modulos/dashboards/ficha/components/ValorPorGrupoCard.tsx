import Image from "next/image";
import React, { Fragment, useMemo } from "react";
import ValorPorGrupoChart from "./ValorPorGrupoChart";

interface ValorPorGrupoCardProps {
  valorPorGrupoData: Array<{ name: string; value: number }>;
  sectionIcons: Array<{ src: string; alt: string; adjustSize?: boolean }>;
  cairoClassName: string;
  onMaximize: () => void;
}

const ValorPorGrupoCard: React.FC<ValorPorGrupoCardProps> = ({
  valorPorGrupoData,
  sectionIcons,
  cairoClassName,
  onMaximize,
}) => {
  const sortedData = useMemo(
    () => [...valorPorGrupoData].sort((a, b) => b.value - a.value),
    [valorPorGrupoData]
  );

  return (
    <div className="w-full bg-white rounded-lg relative flex flex-col overflow-hidden h-full">
      <div className="w-6 h-0 left-[10px] top-[17px] absolute origin-top-left rotate-90 bg-zinc-300 outline-1 outline-offset-[-0.50px] outline-neutral-700"></div>
      <div className="flex justify-between items-start pt-[14px] px-5 mb-3 flex-shrink-0">
        <div className="flex-grow overflow-hidden mr-3">
          <div title="Valor por Grupo" className={`text-black text-xl font-semibold leading-normal ${cairoClassName} whitespace-nowrap overflow-hidden text-ellipsis`}>
            Valor por Grupo
          </div>
        </div>
        {sectionIcons && sectionIcons.length > 0 && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            {sectionIcons.map((icon, index) => (
              <Fragment key={index}>
                <Image
                  src={icon.src}
                  alt={icon.alt}
                  width={icon.adjustSize ? 14 : 16}
                  height={icon.adjustSize ? (icon.src.includes("lay") ? 16 : 14) : 16}
                  className="cursor-pointer opacity-60 hover:opacity-100"
                  onClick={icon.alt === "Maximize" ? onMaximize : undefined}
                />
                {/* ...separator if needed... */}
              </Fragment>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex-1 px-1 pb-1 min-h-0 overflow-y-auto">
        <ValorPorGrupoChart
          data={sortedData}
        />
      </div>
    </div>
  );
};

export default ValorPorGrupoCard;