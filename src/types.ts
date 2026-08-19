export type Screen = 'splash' | 'dashboard' | 'compras' | 'mano_obra' | 'gastos' | 'varios' | 'login' | 'notifications' | 'obras_list' | 'calendar';

export interface AppState {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
}


