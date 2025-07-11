"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image'; // Import Image

interface Afastamento {
  inicio: string;
  termino: string;
  tipo: string;
  diasAfastados: string | number; // Dias pode ser string ou número
  nomeColaborador?: string; // Add collaborator name
}

interface IconProps {
  src: string;
  alt: string;
  adjustSize?: boolean;
}

interface AfastamentosTableProps {
  afastamentosData: Afastamento[];
  cairoClassName: string;
  headerIcons: IconProps[];
  onMaximize?: () => void;
}

const AfastamentosTable: React.FC<AfastamentosTableProps> = ({ afastamentosData, cairoClassName, headerIcons, onMaximize }) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const [hasScrollbar, setHasScrollbar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
      setVisibleCount(prev => Math.min(prev + 10, afastamentosData.length));
    }
  };

  const checkScrollbar = () => {
    const el = containerRef.current;
    if (el) {
      setHasScrollbar(el.scrollHeight > el.clientHeight);
    }
  };

  React.useEffect(() => {
    checkScrollbar();
    const observer = new ResizeObserver(checkScrollbar);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [afastamentosData, visibleCount]);

  return (
    <div className="w-full bg-white rounded-lg relative flex flex-col overflow-hidden h-full">
      {/* Barra vertical cinza - igual aos outros cards da página de ficha */}
      <div className="w-6 h-0 left-[10px] top-[17px] absolute origin-top-left rotate-90 bg-zinc-300 outline-1 outline-offset-[-0.50px] outline-neutral-700"></div>
      
      {/* Header Section */}
      <div className="flex justify-between items-start pt-[14px] px-5 mb-3 flex-shrink-0">
        <div className="flex-grow overflow-hidden mr-3">
          <div title="Histórico de Afastamentos" className={`text-black text-xl font-semibold leading-normal ${cairoClassName} whitespace-nowrap overflow-hidden text-ellipsis`}>
            Histórico de Afastamentos
          </div>
        </div>
        {/* Icons Area */}
        {headerIcons && headerIcons.length > 0 && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            {headerIcons.map((icon, index) => (
              <div key={index} className="cursor-pointer p-1">
                <Image
                  src={icon.src}
                  alt={icon.alt}
                  width={16}
                  height={16}
                  className="opacity-60 hover:opacity-100"
                  onClick={icon.alt === "Maximize" ? () => onMaximize?.() : undefined} // Add onClick handler for Maximize icon
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto min-h-0 space-y-4 pl-4 pb-4 ${cairoClassName}`}
        style={{ paddingRight: hasScrollbar ? '4px' : '16px' }}
      >
        {afastamentosData.length > 0 ? (
          afastamentosData.slice(0, visibleCount).map((afastamento, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg shadow-md bg-white">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                
                {/* New Collaborator display */}
                <div className="flex flex-col col-span-2">
                  <span 
                    className="text-gray-800 font-medium text-sm truncate" 
                    title={afastamento.nomeColaborador || "-"}
                  >
                    {afastamento.nomeColaborador || "-"}
                  </span>
                  <span className="text-gray-500 font-light text-xs">Funcionário</span>
                </div>
                <div className="col-span-2 h-px bg-gray-200"></div> {/* Separator line after collaborator */}
                
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium text-sm truncate">{afastamento.inicio || "-"}</span>
                  <span className="text-gray-500 font-light text-xs">Início</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium text-sm truncate">{afastamento.termino || "-"}</span>
                  <span className="text-gray-500 font-light text-xs">Término</span>
                </div>

                {/* Horizontal Separator Line */}
                <div className="col-span-2 h-px bg-gray-200"></div>
                
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium text-sm truncate">{afastamento.tipo || "-"}</span>
                  <span className="text-gray-500 font-light text-xs">Tipo</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium text-sm truncate">{String(afastamento.diasAfastados) || "-"}</span>
                  <span className="text-gray-500 font-light text-xs">Dias Afastados</span>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className={`flex items-center justify-center h-full text-gray-500 ${cairoClassName}`}>
            Nenhum afastamento encontrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default AfastamentosTable;
