import { useEffect, useState } from 'react';
import { ArrowLeft, Briefcase, FileText, Hammer, Search } from 'lucide-react';
import { Screen } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';
import logoUrl from '../assets/logo.jpeg';

interface GastosViewProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
}

export default function GastosView({ navigate, activeObraId }: GastosViewProps) {
  const [filterType, setFilterType] = useState<'todos' | 'materiales' | 'mano_obra' | 'varios'>('todos');
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [activeObraName, setActiveObraName] = useState<string>('General');

  useEffect(() => {
    const savedObras = localStorage.getItem('obras_list');
    if (savedObras && activeObraId !== 'general') {
      const obras = JSON.parse(savedObras);
      const obra = obras.find((o: any) => o.id === activeObraId);
      if (obra) setActiveObraName(obra.name);
    }
    fetchExpenses();
  }, [activeObraId]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching expenses:', error);
    } else {
      setAllExpenses(data || []);
    }
    setIsLoading(false);
  };

  const expenses = allExpenses.filter(exp => {
    const matchesFilter = filterType === 'todos' || exp.type === filterType;
    const expObraName = exp.subtitle?.split(' • ')[0];
    const matchesObra = activeObraId === 'general' ? true : expObraName === activeObraName;
    return matchesFilter && matchesObra;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
  };

  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleExportExcel = () => {
    // Agregamos BOM para que Excel reconozca correctamente los acentos (UTF-8)
    const BOM = '\uFEFF';
    
    // Usamos punto y coma (;) que es el separador estándar para Excel en español
    const separator = ';';
    
    const headers = ['Categoría', 'Concepto', 'Detalle/Fecha', 'Estado', 'Monto'].join(separator);
    
    const rows = expenses.map(exp => {
      const typeName = exp.type === 'materiales' ? 'Materiales' : exp.type === 'mano_obra' ? 'Mano de Obra' : 'Gastos Varios';
      return [
        `"${typeName}"`,
        `"${exp.title}"`,
        `"${exp.subtitle}"`,
        `"${exp.status}"`,
        exp.amount // El monto sin comillas para que Excel lo reconozca como número y permita sumar
      ].join(separator);
    });
    
    const totalRow = ['""', '""', '""', '"TOTAL"', totalAmount].join(separator);
    
    const csvContent = BOM + headers + '\n' + rows.join('\n') + '\n' + totalRow;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `UTU_Control_Gastos_${filterType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const filterOptions = [
    { id: 'todos', label: 'Todos' },
    { id: 'materiales', label: 'Materiales' },
    { id: 'mano_obra', label: 'Mano de Obra' },
    { id: 'varios', label: 'Gastos Varios' },
  ] as const;

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col no-print">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-surface">
          <div className="flex items-center gap-3">
            <Logo onClick={() => navigate('splash')} />
            <button onClick={() => navigate('dashboard')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 ml-3 text-right">
            <h1 className="text-text-main font-semibold text-sm md:text-lg truncate">Control de Gastos</h1>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-32 space-y-6">
          {/* Export Bar */}
          <div className="flex gap-4">
            <button onClick={handleExportExcel} className="flex-1 flex items-center justify-center gap-2 border border-surface-hover rounded-xl py-3 px-4 hover:bg-surface transition-colors">
              <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                <span className="text-[10px] font-bold text-background leading-none">X</span>
              </div>
              <span className="text-xs font-bold tracking-wider text-text-main uppercase">Exportar a Excel</span>
            </button>
            <button onClick={handleExportPDF} className="flex-1 flex items-center justify-center gap-2 border border-surface-hover rounded-xl py-3 px-4 hover:bg-surface transition-colors">
              <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                <span className="text-[10px] font-bold text-background leading-none">P</span>
              </div>
              <span className="text-xs font-bold tracking-wider text-text-main uppercase">Exportar a PDF</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por concepto, proveedor o responsable..."
              className="w-full bg-surface border-b-2 border-surface-hover focus:border-primary text-text-main rounded-t-xl pl-11 pr-4 py-3.5 outline-none transition-colors text-sm placeholder-text-muted/60"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 snap-x">
            {filterOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setFilterType(opt.id)}
                className={`snap-start flex-shrink-0 font-bold text-sm px-5 py-2 rounded-full border transition-colors ${
                  filterType === opt.id
                    ? 'bg-primary text-background border-primary'
                    : 'bg-surface text-text-muted hover:text-text-main border-surface-hover hover:border-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {expenses.map((exp, idx) => (
              <div key={idx} className="bg-surface rounded-2xl p-4 flex items-center gap-4 border border-surface-hover">
                <div className="w-12 h-12 rounded-full bg-background-alt border border-surface-hover flex items-center justify-center flex-shrink-0 text-primary">
                  {exp.type === 'materiales' && <Hammer className="w-6 h-6" />}
                  {exp.type === 'mano_obra' && <Briefcase className="w-6 h-6" />}
                  {exp.type === 'varios' && <FileText className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-main font-bold text-base truncate">
                    {exp.type === 'materiales' ? 'Materiales' : exp.type === 'mano_obra' ? 'Mano de Obra' : 'Gastos Varios'}
                  </h3>
                  <p className="text-text-muted text-sm truncate">{exp.title}</p>
                  <div className="text-xs text-secondary mt-1">{exp.subtitle}</div>
                  
                  {!failedImages[exp.id] && (
                    <div className="mt-3 relative w-20 h-20 rounded-lg overflow-hidden border border-surface-hover">
                      <img 
                        src={supabase.storage.from('comprobantes').getPublicUrl(exp.id).data.publicUrl} 
                        alt="Comprobante" 
                        className="w-full h-full object-cover cursor-pointer"
                        onError={() => setFailedImages(prev => ({ ...prev, [exp.id]: true }))}
                        onClick={() => window.open(supabase.storage.from('comprobantes').getPublicUrl(exp.id).data.publicUrl, '_blank')}
                      />
                    </div>
                  )}
                </div>

                <div className="text-right flex flex-col items-end justify-center">
                  <span className="text-text-main font-bold text-lg">{formatCurrency(exp.amount)}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded mt-1.5 ${
                    exp.status === 'Pagado' 
                      ? 'bg-surface-hover text-text-muted'
                      : 'bg-primary/20 text-primary border border-primary/30'
                  }`}>
                    {exp.status}
                  </span>
                </div>
              </div>
            ))}
            
            {expenses.length === 0 && (
              <div className="text-center py-10 text-text-muted">
                No hay gastos en esta categoría.
              </div>
            )}
          </div>
        </main>

        {/* Sticky Bottom Summary Bar */}
        <div className="fixed bottom-[27px] left-0 w-full z-40 bg-primary p-5 shadow-[0_-10px_30px_rgba(255,107,0,0.2)]">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <span className="text-xs font-bold tracking-widest text-background uppercase">Total Gastos Filtrados</span>
            <span className="text-2xl font-extrabold text-background tracking-tight">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Print Only View */}
      <div className="print-only p-8 max-w-4xl mx-auto bg-white min-h-screen">
        <div className="flex items-center justify-between border-b-2 border-black pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">UTU Constructora</h1>
            <h2 className="text-xl font-medium text-gray-600 mt-1">Reporte de Gastos: Obra Casa 42</h2>
            <p className="text-sm text-gray-500 mt-1">
              Filtro aplicado: {filterOptions.find(o => o.id === filterType)?.label}
            </p>
          </div>
          <div className="w-32">
            <img src={logoUrl} alt="UTU Constructora Logo" className="w-full h-auto object-contain" />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-3 px-2 font-bold uppercase text-xs tracking-wider text-gray-500">Categoría</th>
              <th className="py-3 px-2 font-bold uppercase text-xs tracking-wider text-gray-500">Concepto</th>
              <th className="py-3 px-2 font-bold uppercase text-xs tracking-wider text-gray-500">Detalle / Fecha</th>
              <th className="py-3 px-2 font-bold uppercase text-xs tracking-wider text-gray-500">Estado</th>
              <th className="py-3 px-2 font-bold uppercase text-xs tracking-wider text-gray-500 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-4 px-2 font-semibold">
                  {exp.type === 'materiales' ? 'Materiales' : exp.type === 'mano_obra' ? 'Mano de Obra' : 'Gastos Varios'}
                </td>
                <td className="py-4 px-2">{exp.title}</td>
                <td className="py-4 px-2 text-gray-600 text-sm">{exp.subtitle}</td>
                <td className="py-4 px-2">
                  <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${exp.status === 'Pagado' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
                    {exp.status}
                  </span>
                </td>
                <td className="py-4 px-2 text-right font-bold">{formatCurrency(exp.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="py-6 px-2 text-right font-bold uppercase tracking-widest text-sm">Total General</td>
              <td className="py-6 px-2 text-right font-black text-xl">{formatCurrency(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div className="mt-16 text-center text-gray-400 text-sm border-t border-gray-200 pt-8">
          Reporte generado automáticamente el {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </>
  );
}
