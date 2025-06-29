"use client";

import { Cairo } from "next/font/google";
import { useState, useEffect, useRef } from "react";

const cairo = Cairo({
	weight: ["500", "600", "700"],
	subsets: ["latin"],
});

interface FuncionarioOpcao {
	id_empregado: number;
	nome: string;
}

interface SecaoFiltrosProps {
	selectedEmpresa: string;
	onChangeEmpresa: (empresa: string) => void;
	selectedColaborador: string;
	onChangeColaborador: (colaborador: string) => void;
	empresaOptionsList?: string[];
	empresaOptionsData?: Array<{id_empresa: number; nome_empresa: string}>; // Adicionar dados completos das empresas
	areDatesSelected?: boolean;
	colaboradorOptionsList?: FuncionarioOpcao[];
	isEmpresaSelected?: boolean;
}

export default function SecaoFiltros({
	selectedEmpresa,
	onChangeEmpresa,
	selectedColaborador,
	onChangeColaborador,
	empresaOptionsList = [],
	empresaOptionsData = [], // Receber dados completos
	areDatesSelected = false,
	colaboradorOptionsList = [], 
	isEmpresaSelected = false,   
}: SecaoFiltrosProps) {
	const [isEmpresaOpen, setIsEmpresaOpen] = useState(false);
	const empresaRef = useRef<HTMLDivElement>(null);

	const [isColaboradorOpen, setIsColaboradorOpen] = useState(false);
	const colaboradorRef = useRef<HTMLDivElement>(null);

	// Refs para controlar scroll dos dropdowns
	const empresaListRef = useRef<HTMLDivElement>(null);
	const colaboradorListRef = useRef<HTMLDivElement>(null);
	// States para salvar posição do scroll
	const [empresaScrollPosition, setEmpresaScrollPosition] = useState(0);
	const [colaboradorScrollPosition, setColaboradorScrollPosition] = useState(0);

	// States para navegação por teclado
	const [empresaHighlightedIndex, setEmpresaHighlightedIndex] = useState(-1);
	const [colaboradorHighlightedIndex, setColaboradorHighlightedIndex] = useState(-1);

	const [empresaSearch, setEmpresaSearch] = useState<string>("");           
	const filteredEmpresas = empresaOptionsData.filter(empresa => {
		const searchLower = empresaSearch.toLowerCase();
		const nomeMatch = empresa.nome_empresa.toLowerCase().includes(searchLower);
		const idMatch = empresa.id_empresa.toString().includes(searchLower);
		return nomeMatch || idMatch;
	});                                                                        

	const [colSearch, setColSearch] = useState<string>("");                   
	const filteredColabs = colaboradorOptionsList.filter(c => {
		const searchLower = colSearch.toLowerCase();
		const nomeMatch = c.nome.toLowerCase().includes(searchLower);
		const idMatch = c.id_empregado.toString().includes(searchLower);
		return nomeMatch || idMatch;
	});
	// Refs para os inputs de pesquisa
	const empresaSearchInputRef = useRef<HTMLInputElement>(null);
	const colaboradorSearchInputRef = useRef<HTMLInputElement>(null);

	// Reset highlighted index quando a lista filtrada muda
	useEffect(() => {
		setEmpresaHighlightedIndex(-1);
	}, [empresaSearch]);

	useEffect(() => {
		setColaboradorHighlightedIndex(-1);
	}, [colSearch]);

	// Função para navegar na lista com teclado
	const handleKeyNavigation = (
		e: React.KeyboardEvent,
		isEmpresaDropdown: boolean,
		filteredItems: any[],
		currentHighlightedIndex: number,
		setHighlightedIndex: (index: number) => void,
		onSelect: (item: any) => void,
		onClose: () => void
	) => {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				const nextIndex = currentHighlightedIndex < filteredItems.length - 1 
					? currentHighlightedIndex + 1 
					: 0;
				setHighlightedIndex(nextIndex);
				scrollToHighlightedItem(nextIndex, isEmpresaDropdown);
				break;
			
			case 'ArrowUp':
				e.preventDefault();
				const prevIndex = currentHighlightedIndex > 0 
					? currentHighlightedIndex - 1 
					: filteredItems.length - 1;
				setHighlightedIndex(prevIndex);
				scrollToHighlightedItem(prevIndex, isEmpresaDropdown);
				break;
			
			case 'Enter':
				e.preventDefault();
				if (currentHighlightedIndex >= 0 && filteredItems[currentHighlightedIndex]) {
					onSelect(filteredItems[currentHighlightedIndex]);
					onClose();
				}
				break;
			
			case 'Escape':
				e.preventDefault();
				onClose();
				break;
		}
	};

	// Função para fazer scroll automático do item destacado
	const scrollToHighlightedItem = (index: number, isEmpresaDropdown: boolean) => {
		const listRef = isEmpresaDropdown ? empresaListRef : colaboradorListRef;
		if (listRef.current) {
			const items = listRef.current.querySelectorAll('[data-option-index]');
			const targetItem = items[index] as HTMLElement;
			if (targetItem) {
				targetItem.scrollIntoView({
					block: 'nearest',
					behavior: 'smooth'
				});
			}
		}
	};
	// Focar no input de pesquisa quando abrir dropdowns
	useEffect(() => {
		if (isEmpresaOpen && empresaSearchInputRef.current) {
			// Pequeno delay para garantir que o dropdown foi renderizado
			setTimeout(() => {
				empresaSearchInputRef.current?.focus();
			}, 10);
		}
	}, [isEmpresaOpen]);

	useEffect(() => {
		if (isColaboradorOpen && colaboradorSearchInputRef.current) {
			// Pequeno delay para garantir que o dropdown foi renderizado
			setTimeout(() => {
				colaboradorSearchInputRef.current?.focus();
			}, 10);
		}
	}, [isColaboradorOpen]);
	// Effect para restaurar posição do scroll quando abrir dropdown de empresa
	useEffect(() => {
		if (isEmpresaOpen && empresaListRef.current) {
			setTimeout(() => {
				if (empresaListRef.current) {
					// Se há um item selecionado, fazer scroll para ele
					if (selectedEmpresa) {
						const selectedElement = empresaListRef.current.querySelector(`[data-empresa="${selectedEmpresa}"]`);
						if (selectedElement) {
							// Posicionar o item selecionado próximo ao topo, deixando espaço para ver os itens abaixo
							selectedElement.scrollIntoView({ block: 'start', behavior: 'auto' });
							
							// Ajuste fino: scroll um pouco para cima para mostrar contexto
							const currentScroll = empresaListRef.current.scrollTop;
							const itemHeight = 52; // altura aproximada de cada item (py-3 = 12px top + 12px bottom + texto)
							empresaListRef.current.scrollTop = Math.max(0, currentScroll - itemHeight);
						}
					} else {
						// Caso contrário, restaurar posição salva
						empresaListRef.current.scrollTop = empresaScrollPosition;
					}
				}
			}, 50);
		}
	}, [isEmpresaOpen, selectedEmpresa, empresaScrollPosition]);

	// Effect para restaurar posição do scroll quando abrir dropdown de colaborador
	useEffect(() => {
		if (isColaboradorOpen && colaboradorListRef.current) {
			setTimeout(() => {
				if (colaboradorListRef.current) {
					// Se há um item selecionado, fazer scroll para ele
					if (selectedColaborador) {
						const selectedElement = colaboradorListRef.current.querySelector(`[data-colaborador="${selectedColaborador}"]`);
						if (selectedElement) {
							// Posicionar o item selecionado próximo ao topo, deixando espaço para ver os itens abaixo
							selectedElement.scrollIntoView({ block: 'start', behavior: 'auto' });
							
							// Ajuste fino: scroll um pouco para cima para mostrar contexto
							const currentScroll = colaboradorListRef.current.scrollTop;
							const itemHeight = 52; // altura aproximada de cada item
							colaboradorListRef.current.scrollTop = Math.max(0, currentScroll - itemHeight);
						}
					} else {
						// Caso contrário, restaurar posição salva
						colaboradorListRef.current.scrollTop = colaboradorScrollPosition;
					}
				}
			}, 50);
		}
	}, [isColaboradorOpen, selectedColaborador, colaboradorScrollPosition]);
	// Função para salvar posição do scroll antes de fechar dropdown empresa
	const handleCloseEmpresaDropdown = () => {
		if (empresaListRef.current) {
			setEmpresaScrollPosition(empresaListRef.current.scrollTop);
		}
		setIsEmpresaOpen(false);
		setEmpresaHighlightedIndex(-1);
		setEmpresaSearch("");
	};

	// Função para salvar posição do scroll antes de fechar dropdown colaborador
	const handleCloseColaboradorDropdown = () => {
		if (colaboradorListRef.current) {
			setColaboradorScrollPosition(colaboradorListRef.current.scrollTop);
		}
		setIsColaboradorOpen(false);
		setColaboradorHighlightedIndex(-1);
		setColSearch("");
	};
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (empresaRef.current && !empresaRef.current.contains(event.target as Node)) {
				handleCloseEmpresaDropdown();
			}
			if (colaboradorRef.current && !colaboradorRef.current.contains(event.target as Node)) {
				handleCloseColaboradorDropdown();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);
	return (
		<div className="flex flex-row items-center gap-8">
			<div className="flex items-center gap-4">
				<div className="relative" ref={empresaRef}>
					<div
						role="combobox"
						aria-haspopup="listbox"
						tabIndex={0}
						aria-expanded={isEmpresaOpen}
						aria-label="Empresa"
						onClick={() => setIsEmpresaOpen(!isEmpresaOpen)}
						className={`w-60 px-4 h-[44px] flex items-center justify-between bg-white rounded-md border border-neutral-700 text-gray-500 text-sm font-semibold leading-tight ${cairo.className} hover:bg-[var(--color-neutral-700)] hover:text-white cursor-pointer`}
					>
						<span className="flex-grow whitespace-nowrap overflow-hidden text-ellipsis">
							{selectedEmpresa || "Empresa"}
						</span>
						<svg className="w-5 h-5 ml-2 fill-current" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" clipRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
						</svg>
					</div>
					{isEmpresaOpen && (
						<div className="absolute z-50 mt-1 w-60 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
							{/* Campo de pesquisa aprimorado */}
							<div className="p-3 bg-gray-50 border-b border-gray-200">
								<div className="relative">
									<svg 
										className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
										fill="none" 
										stroke="currentColor" 
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>									<input
										ref={empresaSearchInputRef}
										type="text"
										value={empresaSearch}
										onChange={e => setEmpresaSearch(e.target.value)}
										onKeyDown={e => handleKeyNavigation(
											e,
											true,
											filteredEmpresas,
											empresaHighlightedIndex,
											setEmpresaHighlightedIndex,
											(empresa) => {
												onChangeEmpresa(empresa.nome_empresa);
												setEmpresaSearch("");
											},
											handleCloseEmpresaDropdown
										)}
										placeholder="Buscar empresa..."
										className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
									/>
									{empresaSearch && (
										<button
											onClick={() => setEmpresaSearch("")}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
										>
											<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									)}
								</div>							</div>

							{/* Lista de opções aprimorada */}
							<div ref={empresaListRef} className="max-h-48 overflow-y-auto">
								{ !areDatesSelected ? (
									<div className="px-4 py-8 text-center">
										<svg className="mx-auto w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<p className="text-sm text-gray-500">Selecione as datas para</p>
										<p className="text-sm text-gray-500">carregar as empresas</p>
									</div>
								) : filteredEmpresas.length === 0 ? (
									<div className="px-4 py-8 text-center">
										<div className="relative mx-auto w-12 h-12 mb-3">
											{/* Ícone de empresa com efeito desbotado */}
											<svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
											</svg>
											{/* Linha diagonal sutil */}
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="w-8 h-0.5 bg-gray-300 rotate-45 rounded-full"></div>
											</div>
										</div>
										<p className="text-sm font-medium text-gray-600 mb-1">Nenhuma empresa encontrada</p>
										{empresaSearch ? (
											<p className="text-xs text-gray-400">
												Tente buscar por outro termo
											</p>
										) : (
											<p className="text-xs text-gray-400">
												Refine sua pesquisa
											</p>
										)}
									</div>
								) : (
									<>
										{empresaSearch && (
											<div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
												<p className="text-xs text-blue-600">
													{filteredEmpresas.length} resultado{filteredEmpresas.length !== 1 ? 's' : ''} encontrado{filteredEmpresas.length !== 1 ? 's' : ''}
												</p>
											</div>
										)}										{filteredEmpresas.map((empresa, index) => (
											<div
												key={empresa.id_empresa}
												data-empresa={empresa.nome_empresa}
												data-option-index={index}
												onClick={() => { onChangeEmpresa(empresa.nome_empresa); handleCloseEmpresaDropdown(); setEmpresaSearch(""); }}
												className={`px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between group ${
													selectedEmpresa === empresa.nome_empresa 
														? 'bg-blue-50 text-blue-700' 
														: empresaHighlightedIndex === index
															? 'bg-gray-100 text-gray-900'
															: 'text-gray-700 hover:text-blue-600'
												}`}
											>
												<span className="truncate">{empresa.nome_empresa}</span>
												{selectedEmpresa === empresa.nome_empresa && (
													<svg className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
													</svg>
												)}
											</div>
										))}
									</>
								)}
							</div>
						</div>
					)}
				</div>

				<div className="relative" ref={colaboradorRef}>
					<div
						role="combobox"
						aria-haspopup="listbox"
						tabIndex={0}
						aria-expanded={isColaboradorOpen}
						aria-label="Funcionário"
						onClick={() => setIsColaboradorOpen(!isColaboradorOpen)}
						className={`w-80 px-4 h-[44px] flex items-center justify-between bg-white rounded-md border border-neutral-700 text-gray-500 text-sm font-semibold leading-tight ${cairo.className} hover:bg-[var(--color-neutral-700)] hover:text-white cursor-pointer`}
					>
						<span className="flex-grow whitespace-nowrap overflow-hidden text-ellipsis">
							{selectedColaborador || "Funcionário"}
						</span>
						<svg className="w-5 h-5 ml-2 flex-shrink-0 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
						</svg>
					</div>
					{isColaboradorOpen && (
						<div className="absolute z-50 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
							{/* Campo de pesquisa aprimorado */}
							<div className="p-3 bg-gray-50 border-b border-gray-200">
								<div className="relative">
									<svg 
										className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
										fill="none" 
										stroke="currentColor" 
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>									<input
										ref={colaboradorSearchInputRef}
										type="text"
										value={colSearch}
										onChange={e => setColSearch(e.target.value)}
										onKeyDown={e => handleKeyNavigation(
											e,
											false,
											filteredColabs,
											colaboradorHighlightedIndex,
											setColaboradorHighlightedIndex,
											(colaborador) => {
												const novoColaborador = selectedColaborador === colaborador.nome ? "" : colaborador.nome;
												onChangeColaborador(novoColaborador);
												setColSearch("");
											},
											handleCloseColaboradorDropdown
										)}
										placeholder="Buscar funcionário..."
										className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
									/>
									{colSearch && (
										<button
											onClick={() => setColSearch("")}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
										>
											<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									)}
								</div>
							</div>							{/* Lista de opções aprimorada */}
							<div ref={colaboradorListRef} className="max-h-48 overflow-y-auto">
								{ !isEmpresaSelected ? (
									<div className="px-4 py-8 text-center">
										<svg className="mx-auto w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
										</svg>
										<p className="text-sm text-gray-500">Selecione uma empresa para</p>
										<p className="text-sm text-gray-500">carregar os funcionários</p>
									</div>
								) : filteredColabs.length === 0 ? (
									<div className="px-4 py-8 text-center">
										<div className="relative mx-auto w-12 h-12 mb-3">
											{/* Ícone de funcionário com efeito desbotado */}
											<svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
											</svg>
											{/* Linha diagonal sutil */}
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="w-8 h-0.5 bg-gray-300 rotate-45 rounded-full"></div>
											</div>
										</div>
										<p className="text-sm font-medium text-gray-600 mb-1">Nenhum funcionário encontrado</p>
										{colSearch ? (
											<p className="text-xs text-gray-400">
												Tente buscar por outro nome
											</p>
										) : (
											<p className="text-xs text-gray-400">
												Refine sua pesquisa
											</p>
										)}
									</div>
								) : (
									<>
										{colSearch && (
											<div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
												<p className="text-xs text-blue-600">
													{filteredColabs.length} resultado{filteredColabs.length !== 1 ? 's' : ''} encontrado{filteredColabs.length !== 1 ? 's' : ''}
												</p>
											</div>
										)}										{filteredColabs.map((opt, index) => (
											<div
												key={opt.id_empregado}
												data-colaborador={opt.nome}
												data-option-index={index}
												onClick={() => { 
													// Implementar toggle: se já está selecionado, desseleciona
													const novoColaborador = selectedColaborador === opt.nome ? "" : opt.nome;
													onChangeColaborador(novoColaborador); 
													handleCloseColaboradorDropdown(); 
													setColSearch(""); 
												}}
												className={`px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between group ${
													selectedColaborador === opt.nome 
														? 'bg-blue-50 text-blue-700' 
														: colaboradorHighlightedIndex === index
															? 'bg-gray-100 text-gray-900'
															: 'text-gray-700 hover:text-blue-600'
												}`}
											>
												<span className="truncate">{opt.nome}</span>
												{selectedColaborador === opt.nome && (
													<svg className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												)}
											</div>
										))}
									</>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
