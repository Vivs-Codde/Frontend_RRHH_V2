import { create } from 'zustand';
import type { TempUsuarioWizardData } from '../hooks/useUserFormRefs';

interface UserStore {
  // Estado del wizard
  showWizard: boolean;
  currentStep: number;
  
  // Acciones para el wizard
  setShowWizard: (show: boolean) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Resetear el wizard
  resetWizard: () => void;
  
  // Guardar usuario
  saveUser: (formData: TempUsuarioWizardData) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  showWizard: false,
  currentStep: 1,
  
  setShowWizard: (show: boolean) => set({ showWizard: show }),
  
  setCurrentStep: (step: number) => set({ currentStep: step }),
  
  nextStep: () => set((state) => ({ 
    currentStep: state.currentStep < 3 ? state.currentStep + 1 : state.currentStep 
  })),
  
  prevStep: () => set((state) => ({ 
    currentStep: state.currentStep > 1 ? state.currentStep - 1 : state.currentStep 
  })),
  
  resetWizard: () => set({
    currentStep: 1,
    showWizard: false
  }),

  saveUser: async (formData: TempUsuarioWizardData) => {
    try {
      // Aquí iría la lógica para enviar los datos al backend
      // Simulamos una llamada async
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      
      
      // Resetear el wizard después de guardar
      const { resetWizard } = get();
      resetWizard();
      
      // Mostrar mensaje de éxito
      
      
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }
}));
