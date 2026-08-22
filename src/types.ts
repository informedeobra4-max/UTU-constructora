export type Screen = 'splash' | 'dashboard' | 'compras' | 'mano_obra' | 'gastos' | 'varios' | 'login' | 'notifications' | 'obras_list' | 'calendar' | 'pagos_view' | 'presupuestos_view' | 'presupuestos_form' | 'ingresos_view' | 'ingresos_form' | 'ingresos_form_usd' | 'info_obra' | 'archivos_categoria' | 'archivo_form' | 'gasto_edit' | 'back';

export interface AppState {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
}


